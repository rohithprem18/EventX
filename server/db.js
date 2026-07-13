// Postgres access layer — the durable source of truth for bookings.
//
// The whole double-booking guarantee lives in one place: the composite
// primary key on booked_seats(event_id, seat_id). A second INSERT for a
// seat that's already booked is rejected by Postgres itself (23505 unique
// violation) inside an atomic transaction, so the guarantee holds no matter
// how many server instances are running concurrently — unlike the previous
// single-process in-memory design, which only worked because Node is
// single-threaded and broke the moment you ran more than one instance.
import pg from 'pg';

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is not set. Point it at a Postgres connection string ' +
      '(see .env.example / README "Deployment" section).'
  );
}

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Managed Postgres providers (Neon, Supabase, Render Postgres, ...)
  // terminate TLS but usually present a cert chain node's default CA
  // bundle won't validate. This matches how those providers document
  // connecting from a plain `pg` client.
  ssl: process.env.DATABASE_SSL === 'false' ? false : { rejectUnauthorized: false },
});

// Idempotent — safe to run on every boot. No separate migration step to
// remember before deploying.
export async function runMigrations() {
  await pool.query(`
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
  `);
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
      // Find out exactly which of the requested seats are already taken,
      // and by whom, so the client can show a precise collision message.
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
