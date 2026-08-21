// Redis access layer — seat locks (soft holds, not the correctness
// mechanism — see db.js for that).
//
// Why Redis for locks: SET ... NX PX gives an atomic "acquire only if
// free, auto-expire in N ms" primitive. That auto-expiry is what makes an
// abandoned lock self-healing — if a tab is closed or a serverless
// invocation dies mid-flow before calling unlock, the key simply times out
// on its own. There is no cleanup job to forget to run and no way for a
// seat to end up "stuck" locked forever, which is the practical failure
// mode people mean by "seat lock deadlock" in a booking system.
//
// @upstash/redis talks to Redis over plain HTTPS (REST) instead of a
// persistent TCP connection, which is what makes it usable from a
// serverless function at all — a function invocation can't hold a socket
// open between requests. The tradeoff: no SUBSCRIBE/pub-sub (that needs a
// live connection to push over), which is why real-time sync here is
// short-interval polling (src/hooks/useBookingStore.tsx) rather than a
// server-pushed stream. Every acquisition is still a single non-blocking
// atomic command, so there's no lock ordering for two holders to deadlock
// over in the first place.
import { Redis } from '@upstash/redis';

const LOCK_TTL_MS = 2 * 60 * 1000; // 2 minutes, matches the seat-picker UX copy

// Reads UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN, which is exactly
// what the Upstash integration in the Vercel dashboard sets automatically.
const redis = Redis.fromEnv();

const RELEASE_IF_OWNER_SCRIPT = `
  if redis.call('GET', KEYS[1]) == ARGV[1] then
    return redis.call('DEL', KEYS[1])
  else
    return 0
  end
`;

const lockKey = (eventId, seatId) => `lock:${eventId}:${seatId}`;
const userSeatsKey = (eventId, userId) => `userseats:${eventId}:${userId}`;

function releaseIfOwner(key, userId) {
  return redis.eval(RELEASE_IF_OWNER_SCRIPT, [key], [userId]);
}

/**
 * Replace a user's held seats for an event with exactly `seatIds` —
 * releasing whatever they no longer want, acquiring whatever's new (best
 * effort; a seat someone else already holds is silently skipped, the
 * caller finds out for certain at booking time via the Postgres
 * constraint), and refreshing the TTL on everything they keep holding.
 */
export async function setUserSeatLocks(eventId, userId, seatIds) {
  const uKey = userSeatsKey(eventId, userId);
  const held = await redis.smembers(uKey);
  const wanted = new Set(seatIds);
  const heldSet = new Set(held);

  const toRelease = held.filter((s) => !wanted.has(s));
  const toAcquire = seatIds.filter((s) => !heldSet.has(s));
  const toRefresh = seatIds.filter((s) => heldSet.has(s));

  await Promise.all(toRelease.map((s) => releaseIfOwner(lockKey(eventId, s), userId)));

  const acquired = [];
  for (const seatId of toAcquire) {
    // NX = only if absent, PX = auto-expire. Single atomic command — no
    // separate check-then-set race window.
    const ok = await redis.set(lockKey(eventId, seatId), userId, { nx: true, px: LOCK_TTL_MS });
    if (ok === 'OK') acquired.push(seatId);
  }

  await Promise.all(toRefresh.map((s) => redis.pexpire(lockKey(eventId, s), LOCK_TTL_MS)));

  const nowHeld = [...toRefresh, ...acquired];
  if (toRelease.length) await redis.srem(uKey, ...toRelease);
  if (nowHeld.length) {
    await redis.sadd(uKey, ...nowHeld);
    await redis.pexpire(uKey, LOCK_TTL_MS);
  } else {
    await redis.del(uKey);
  }

  return nowHeld;
}

/** Release every seat a user currently holds for an event. */
export async function releaseUserSeatLocks(eventId, userId) {
  const uKey = userSeatsKey(eventId, userId);
  const held = await redis.smembers(uKey);
  if (held.length) {
    await Promise.all(held.map((s) => releaseIfOwner(lockKey(eventId, s), userId)));
  }
  await redis.del(uKey);
}

/**
 * All currently-active locks, across every event. SCAN (not KEYS) — a
 * non-blocking cursor walk, safe to run against a shared production Redis
 * even though at this app's scale (a couple hundred seats, tops) either
 * would be instant.
 */
export async function listActiveLocks() {
  const keys = [];
  let cursor = '0';
  do {
    const [next, batch] = await redis.scan(cursor, { match: 'lock:*', count: 200 });
    cursor = next;
    keys.push(...batch);
  } while (cursor !== '0');

  if (keys.length === 0) return [];

  const values = await redis.mget(...keys);
  return keys
    .map((key, i) => {
      const [, eventId, seatId] = key.split(':');
      return { eventId, seatId, userId: values[i] };
    })
    .filter((l) => l.userId !== null); // expired between SCAN and MGET
}
