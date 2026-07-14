import { ensureSchema, findUserByEmailWithHash } from '../_lib/db.js';
import { verifyPassword, createSessionCookie } from '../_lib/auth.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { email, password } = req.body || {};
  if (typeof email !== 'string' || typeof password !== 'string') {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  await ensureSchema();

  const found = await findUserByEmailWithHash(email.trim());
  // Same generic message whether the email doesn't exist or the password
  // is wrong — don't let a login form confirm which emails are registered.
  const invalid = () => res.status(401).json({ error: 'Invalid email or password' });

  if (!found) {
    invalid();
    return;
  }

  const ok = await verifyPassword(password, found.passwordHash);
  if (!ok) {
    invalid();
    return;
  }

  const { passwordHash: _drop, ...user } = found;
  res.setHeader('Set-Cookie', await createSessionCookie(user));
  res.status(200).json({ user });
}
