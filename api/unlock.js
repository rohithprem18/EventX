import { releaseUserSeatLocks } from './_lib/redis.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { eventId, userId } = req.body || {};
  if (!eventId || !userId) {
    res.status(400).json({ error: 'Missing parameters' });
    return;
  }

  await releaseUserSeatLocks(eventId, userId);
  res.status(200).json({ success: true });
}
