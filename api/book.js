import { ensureSchema, commitBooking } from './_lib/db.js';
import { releaseUserSeatLocks } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const booking = req.body || {};
  if (!booking.eventId || !Array.isArray(booking.seatNumbers) || booking.seatNumbers.length === 0) {
    res.status(400).json({ error: 'Invalid booking data' });
    return;
  }

  await ensureSchema();
  const result = await commitBooking(booking);

  if (!result.success) {
    res.status(409).json({ error: 'Seat Collision', seats: result.seats, bookedBy: result.bookedBy });
    return;
  }

  // Seats are permanently booked now — release the soft holds server-side
  // rather than depending solely on the client's follow-up /api/unlock
  // call (which could be lost to a dropped connection).
  await releaseUserSeatLocks(booking.eventId, booking.userId);

  res.status(200).json({ success: true, booking: result.booking });
}
