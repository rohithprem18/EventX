import { setUserSeatLocks } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { eventId, userId, seatIds } = req.body || {};
  if (!eventId || !userId || !Array.isArray(seatIds)) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  await setUserSeatLocks(eventId, userId, seatIds);
  res.status(200).json({ success: true });
}
