// Postgres access layer — the durable source of truth for bookings.
//
// The whole double-booking guarantee lives in one place: the composite
// primary key on booked_seats(event_id, seat_id). A second INSERT for a
// seat that's already booked is rejected by Postgres itself (23505 unique
// violation) inside an atomic transaction, so the guarantee holds no
// matter how many function invocations are running concurrently.
//
// @neondatabase/serverless is Neon's own driver: a drop-in for node-postgres
// (same Pool/Client/transaction API) that talks to Neon over a WebSocket
// instead of a raw TCP connection, which is what actually makes it safe to
// use from a serverless function — a normal TCP pool doesn't survive a
// function being frozen/recycled between invocations the way this does.
import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// Only strictly required on Node < 22, where a native WebSocket global
// isn't available yet; harmless to set unconditionally.
neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. This is injected automatically once the Neon ' +
      'integration is added to the Vercel project — see README "Deployment".'
  );
}

export const pool = new Pool({ connectionString });

// Cached per warm serverless instance so the CREATE TABLE statements run
// once per cold start, not once per request. If it fails, the cache is
// cleared so the next invocation gets a clean retry instead of being stuck
// on a rejected promise forever.
let migrated = null;
export function ensureSchema() {
  if (!migrated) {
    migrated = pool
      .query(
        `
      CREATE TABLE IF NOT EXISTS bookings (
        id            TEXT PRIMARY KEY,
        event_id      TEXT NOT NULL,
        user_id       TEXT NOT NULL,
        user_name     TEXT NOT NULL,
        user_email    TEXT NOT NULL,
        ticket_id     TEXT NOT NULL UNIQUE,
        ticket_count  INTEGER NOT NULL,
        seat_numbers  TEXT[] NOT NULL,
        status        TEXT NOT NULL DEFAULT 'confirmed',
        booked_at     TIMESTAMPTZ NOT NULL DEFAULT now()
      );

      -- The concurrency guarantee. One row per seat that has ever been
      -- booked for an event; the primary key makes a collision impossible.
      CREATE TABLE IF NOT EXISTS booked_seats (
        event_id   TEXT NOT NULL,
        seat_id    TEXT NOT NULL,
        booking_id TEXT NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
        PRIMARY KEY (event_id, seat_id)
      );

      CREATE INDEX IF NOT EXISTS bookings_event_id_idx ON bookings (event_id);
      CREATE INDEX IF NOT EXISTS bookings_user_id_idx ON bookings (user_id);
    `
      )
      .catch((err) => {
        migrated = null;
        throw err;
      });
  }
  return migrated;
}

const rowToBooking = (r) => ({
  id: r.id,
  eventId: r.event_id,
  userId: r.user_id,
  userName: r.user_name,
  userEmail: r.user_email,
  ticketId: r.ticket_id,
  ticketCount: r.ticket_count,
  seatNumbers: r.seat_numbers,
  status: r.status,
  bookedAt: r.booked_at.toISOString(),
});

export async function listBookings() {
  const { rows } = await pool.query('SELECT * FROM bookings ORDER BY booked_at DESC');
  return rows.map(rowToBooking);
}

/**
 * Attempt to atomically commit a booking. Either every seat is inserted
 * (success) or none are (a colliding seat rolls the whole transaction
 * back) — a partial booking can never be observed by another client.
 *
 * Returns { success: true, booking } or
 *         { success: false, seats: string[], bookedBy: string }.
 */
export async function commitBooking(booking) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    await client.query(
      `INSERT INTO bookings (id, event_id, user_id, user_name, user_email, ticket_id, ticket_count, seat_numbers, status, booked_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        booking.id,
        booking.eventId,
        booking.userId,
        booking.userName,
        booking.userEmail,
        booking.ticketId,
        booking.ticketCount,
        booking.seatNumbers,
        booking.status || 'confirmed',
        booking.bookedAt || new Date().toISOString(),
      ]
    );

    for (const seatId of booking.seatNumbers) {
      await client.query(
        'INSERT INTO booked_seats (event_id, seat_id, booking_id) VALUES ($1,$2,$3)',
        [booking.eventId, seatId, booking.id]
      );
    }

    await client.query('COMMIT');
    return { success: true, booking };
  } catch (err) {
    await client.query('ROLLBACK');

    if (err.code === '23505' && err.table === 'booked_seats') {
      const { rows } = await pool.query(
        `SELECT bs.seat_id, b.user_name
           FROM booked_seats bs
           JOIN bookings b ON b.id = bs.booking_id
          WHERE bs.event_id = $1 AND bs.seat_id = ANY($2)`,
        [booking.eventId, booking.seatNumbers]
      );
      return {
        success: false,
        seats: rows.map((r) => r.seat_id),
        bookedBy: rows[0]?.user_name || 'Another User',
      };
    }

    throw err;
  } finally {
    client.release();
  }
}
