// Booking API — the only source of truth for seat correctness in
// production is the Postgres unique constraint in server/db.js. Redis
// locks (server/redis.js) are a soft, self-expiring UX hint layered on
// top so users see seats go "held" in near-real-time; they are never
// trusted to make the actual booking decision.
//
// Horizontal-scaling note: this file holds no booking/lock state itself.
// Every request reads from / writes to Postgres or Redis, and cross-instance
// notification happens over Redis pub/sub (see onUpdate below) — so running
// N copies of this process behind a load balancer is safe, including during
// a rolling deploy where old and new instances briefly run side by side.
import 'dotenv/config';
import http from 'http';
import { URL } from 'url';
import { pool, runMigrations, listBookings, commitBooking } from './db.js';
import { setUserSeatLocks, releaseUserSeatLocks, listActiveLocks, onUpdate, publish } from './redis.js';

const PORT = process.env.PORT || 3001;
const MAX_BODY_BYTES = 1_000_000; // 1MB — generous for a booking payload, small enough to bound abuse
const allowedOrigins = (process.env.CORS_ORIGIN || '*')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

function corsHeaders(req) {
  const origin = req.headers.origin;
  const allowOrigin =
    allowedOrigins.includes('*') ? '*' : allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowOrigin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    let bytes = 0;
    req.on('data', (chunk) => {
      bytes += chunk.length;
      if (bytes > MAX_BODY_BYTES) {
        reject(Object.assign(new Error('Payload too large'), { statusCode: 413 }));
        req.destroy();
        return;
      }
      body += chunk;
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res, status, headers, payload) {
  res.writeHead(status, { ...headers, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

// ── SSE fan-out ──────────────────────────────────────────────────────────
// Clients connected to *this* process only. State changes originating on
// another instance arrive via Redis pub/sub (onUpdate, wired at the bottom)
// and are broadcast here exactly the same way as a local change.
const sseClients = new Set();

async function currentState() {
  const [bookings, locks] = await Promise.all([listBookings(), listActiveLocks()]);
  return { bookings, locks, timestamp: Date.now() };
}

async function broadcastState() {
  const state = await currentState();
  const payload = `data: ${JSON.stringify(state)}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch {
      sseClients.delete(client);
    }
  }
}

// Coalesce bursts of pub/sub messages (e.g. several seat clicks in a row)
// into a single state refresh instead of hammering Postgres/Redis per event.
let broadcastTimer = null;
function scheduleBroadcast() {
  if (broadcastTimer) return;
  broadcastTimer = setTimeout(() => {
    broadcastTimer = null;
    broadcastState().catch((err) => console.error('broadcast failed:', err));
  }, 50);
}

onUpdate(() => scheduleBroadcast());

// ── Routes ───────────────────────────────────────────────────────────────
const server = http.createServer(async (req, res) => {
  const cors = corsHeaders(req);

  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  try {
    if (path === '/healthz' && req.method === 'GET') {
      res.writeHead(200, cors);
      res.end('ok');
      return;
    }

    if (path === '/api/stream' && req.method === 'GET') {
      res.writeHead(200, {
        ...cors,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      });
      sseClients.add(res);

      const state = await currentState();
      res.write(`data: ${JSON.stringify(state)}\n\n`);

      // Keep intermediaries (proxies/load balancers) from closing an
      // apparently-idle connection.
      const heartbeat = setInterval(() => {
        try {
          res.write(': ping\n\n');
        } catch {
          clearInterval(heartbeat);
        }
      }, 25000);

      req.on('close', () => {
        clearInterval(heartbeat);
        sseClients.delete(res);
      });
      return;
    }

    if (path === '/api/state' && req.method === 'GET') {
      sendJson(res, 200, cors, await currentState());
      return;
    }

    if (path === '/api/lock' && req.method === 'POST') {
      const { eventId, userId, seatIds } = await readJsonBody(req);
      if (!eventId || !userId || !Array.isArray(seatIds)) {
        sendJson(res, 400, cors, { error: 'Missing parameters' });
        return;
      }
      await setUserSeatLocks(eventId, userId, seatIds);
      sendJson(res, 200, cors, { success: true });
      return;
    }

    if (path === '/api/unlock' && req.method === 'POST') {
      const { eventId, userId } = await readJsonBody(req);
      if (!eventId || !userId) {
        sendJson(res, 400, cors, { error: 'Missing parameters' });
        return;
      }
      await releaseUserSeatLocks(eventId, userId);
      sendJson(res, 200, cors, { success: true });
      return;
    }

    if (path === '/api/book' && req.method === 'POST') {
      const booking = await readJsonBody(req);
      if (!booking?.eventId || !Array.isArray(booking?.seatNumbers) || booking.seatNumbers.length === 0) {
        sendJson(res, 400, cors, { error: 'Invalid booking data' });
        return;
      }

      const result = await commitBooking(booking);

      if (!result.success) {
        sendJson(res, 409, cors, {
          error: 'Seat Collision',
          seats: result.seats,
          bookedBy: result.bookedBy,
        });
        return;
      }

      // Seats are permanently booked now — release the soft holds
      // server-side rather than depending solely on the client's follow-up
      // /api/unlock call (which could be lost to a dropped connection).
      await releaseUserSeatLocks(booking.eventId, booking.userId);
      await publish({ type: 'booking', eventId: booking.eventId });

      sendJson(res, 200, cors, { success: true, booking: result.booking });
      return;
    }

    sendJson(res, 404, cors, { error: 'Not Found' });
  } catch (err) {
    console.error('Request failed:', err);
    sendJson(res, err.statusCode || 500, cors, { error: 'Internal Server Error' });
  }
});

async function start() {
  await runMigrations();
  server.listen(PORT, () => {
    console.log(`Booking API listening on :${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});

async function shutdown(signal) {
  console.log(`${signal} received, shutting down...`);
  server.close();
  for (const client of sseClients) client.end();
  await pool.end().catch(() => {});
  process.exit(0);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
