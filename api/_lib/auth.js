// Password hashing + session cookies. Sessions are a signed, stateless JWT
// in an httpOnly cookie rather than a server-side session table — that's
// the natural fit for serverless (no session store to provision, no
// cleanup job for expired sessions; verification is just "is this
// signature valid and not expired", no database round-trip required on
// every request).
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SESSION_COOKIE = 'eventx_session';
const SESSION_TTL = '30d';

if (!process.env.JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is not set. Generate one (e.g. `openssl rand -base64 32`) and set it in ' +
      'your Vercel project env vars and .env — see README "Deployment".'
  );
}
const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export const hashPassword = (password) => bcrypt.hash(password, 10);
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export async function createSessionCookie(user) {
  const token = await new SignJWT({ role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(user.id)
    .setIssuedAt()
    .setExpirationTime(SESSION_TTL)
    .sign(secret);

  const maxAge = 30 * 24 * 60 * 60;
  return `${SESSION_COOKIE}=${token}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax`;
}

/** Returns { userId, role } from a valid session cookie, or null. */
export async function readSession(req) {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!match) return null;

  try {
    const { payload } = await jwtVerify(match[1], secret);
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null; // expired or tampered — treat exactly like "not logged in"
  }
}
