import { ensureSchema, findUserById } from '../_lib/db.js';
import { readSession } from '../_lib/auth.js';

// Always 200 — "who's logged in, if anyone" is a query, not a thing that
// fails. { user: null } means no valid session, not an error.
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const session = await readSession(req);
  if (!session) {
    res.status(200).json({ user: null });
    return;
  }

  await ensureSchema();
  const user = await findUserById(session.userId);
  res.status(200).json({ user: user || null });
}
