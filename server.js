import http from 'http';
import { URL } from 'url';

const PORT = 3001;

// In-memory data store
let bookings = [
  {
    id: 'b1',
    userId: 'u1',
    eventId: 'e1',
    ticketCount: 2,
    seatNumbers: ['A12', 'A13'],
    ticketId: 'TKT-NNF-001',
    bookedAt: '2026-03-01T14:30:00',
    status: 'confirmed',
    userName: 'Alex Rivera',
    userEmail: 'alex@example.com',
  },
  {
    id: 'b2',
    userId: 'u1',
    eventId: 'e3',
    ticketCount: 1,
    seatNumbers: ['C7'],
    ticketId: 'TKT-SCN-002',
    bookedAt: '2026-03-05T10:15:00',
    status: 'confirmed',
    userName: 'Alex Rivera',
    userEmail: 'alex@example.com',
  }
];

let locks = []; // Array of { eventId, userId, seatId, expiresAt }
let clients = []; // SSE clients

// Helper to broadcast state to all connected SSE clients
function broadcastState() {
  const now = Date.now();
  const activeLocks = locks.filter(l => l.expiresAt > now);
  const data = {
    bookings,
    locks: activeLocks,
    timestamp: now
  };
  const message = `data: ${JSON.stringify(data)}\n\n`;
  clients.forEach(client => {
    try {
      client.write(message);
    } catch (err) {
      // client disconnected
    }
  });
}

// Clean up expired locks every 2 seconds
setInterval(() => {
  const now = Date.now();
  const beforeCount = locks.length;
  locks = locks.filter(l => l.expiresAt > now);
  if (locks.length !== beforeCount) {
    broadcastState();
  }
}, 2000);

// Helper to parse JSON body
function readJsonBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch {
        resolve({});
      }
    });
  });
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Handle Options preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders);
    res.end();
    return;
  }

  // Parse URL path
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  // SSE Stream Endpoint
  if (path === '/api/stream' && req.method === 'GET') {
    res.writeHead(200, {
      ...corsHeaders,
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    // Add client
    clients.push(res);
    
    // Send initial state immediately
    const activeLocks = locks.filter(l => l.expiresAt > Date.now());
    const data = {
      bookings,
      locks: activeLocks,
      timestamp: Date.now()
    };
    res.write(`data: ${JSON.stringify(data)}\n\n`);

    // Clean up on disconnect
    req.on('close', () => {
      clients = clients.filter(c => c !== res);
    });
    return;
  }

  // Get active locks and bookings state
  if (path === '/api/state' && req.method === 'GET') {
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    const activeLocks = locks.filter(l => l.expiresAt > Date.now());
    res.end(JSON.stringify({ bookings, locks: activeLocks }));
    return;
  }

  // Lock seats
  if (path === '/api/lock' && req.method === 'POST') {
    const { eventId, userId, seatIds } = await readJsonBody(req);
    if (!eventId || !userId || !Array.isArray(seatIds)) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing parameters' }));
      return;
    }

    const now = Date.now();
    const ttl = 2 * 60 * 1000; // 2 minutes

    // Clear user's previous locks for this event and any expired locks
    locks = locks.filter(l => l.expiresAt > now && !(l.eventId === eventId && l.userId === userId));

    // Add new locks
    seatIds.forEach(seatId => {
      locks.push({
        eventId,
        userId,
        seatId,
        expiresAt: now + ttl
      });
    });

    broadcastState();
    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, locks }));
    return;
  }

  // Unlock seats
  if (path === '/api/unlock' && req.method === 'POST') {
    const { eventId, userId } = await readJsonBody(req);
    if (!eventId || !userId) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Missing parameters' }));
      return;
    }

    locks = locks.filter(l => !(l.eventId === eventId && l.userId === userId));
    broadcastState();

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true }));
    return;
  }

  // Book seats (Optimistic Transaction check)
  if (path === '/api/book' && req.method === 'POST') {
    const bookingRecord = await readJsonBody(req);
    if (!bookingRecord || !bookingRecord.eventId || !bookingRecord.seatNumbers) {
      res.writeHead(400, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid booking data' }));
      return;
    }

    const eventId = bookingRecord.eventId;
    const requestedSeats = bookingRecord.seatNumbers;

    // Double-check if any seat is already booked
    const alreadyBooked = bookings
      .filter(b => b.eventId === eventId && b.status === 'confirmed')
      .flatMap(b => b.seatNumbers);

    const collidedSeats = requestedSeats.filter(s => alreadyBooked.includes(s));

    if (collidedSeats.length > 0) {
      // Find the collision owner
      const blockingBooking = bookings.find(
        b => b.eventId === eventId && b.seatNumbers.some(s => collidedSeats.includes(s))
      );
      const bookedBy = blockingBooking ? blockingBooking.userName : 'Another User';

      res.writeHead(409, { ...corsHeaders, 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        error: 'Seat Collision',
        seats: collidedSeats,
        bookedBy
      }));
      return;
    }

    // Success: add booking to list
    bookings.unshift(bookingRecord);

    // Release locks for this user on this event
    locks = locks.filter(l => !(l.eventId === eventId && l.userId === bookingRecord.userId));

    broadcastState();

    res.writeHead(200, { ...corsHeaders, 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: true, booking: bookingRecord }));
    return;
  }

  // Default 404
  res.writeHead(404, { ...corsHeaders, 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not Found' }));
});

server.listen(PORT, () => {
  console.log(`High-Concurrency booking server running on port ${PORT}`);
});
