import { randomUUID } from 'crypto';
import { ensureSchema, createUser } from '../_lib/db.js';
import { hashPassword, createSessionCookie } from '../_lib/auth.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, password } = req.body || {};
  if (typeof name !== 'string' || !name.trim()) {
    res.status(400).json({ error: 'Name is required' });
    return;
  }
  if (typeof email !== 'string' || !EMAIL_RE.test(email.trim())) {
    res.status(400).json({ error: 'A valid email is required' });
    return;
  }
  if (typeof password !== 'string' || password.length < 8) {
    res.status(400).json({ error: 'Password must be at least 8 characters' });
    return;
  }

  await ensureSchema();

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await createUser({
      id: randomUUID(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: 'user',
    });
  } catch (err) {
    if (err.code === '23505') {
      res.status(409).json({ error: 'An account with that email already exists' });
      return;
    }
    throw err;
  }

  res.setHeader('Set-Cookie', await createSessionCookie(user));
  res.status(201).json({ user });
}
