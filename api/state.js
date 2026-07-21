// Polled by the client every ~2s (src/hooks/useBookingStore.tsx) in place
// of a pushed stream — see api/_lib/redis.js for why.
import { ensureSchema, listBookings } from './_lib/db.js';
import { listActiveLocks } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  await ensureSchema();
  const [bookings, locks] = await Promise.all([listBookings(), listActiveLocks()]);
  res.status(200).json({ bookings, locks, timestamp: Date.now() });
}
