/**
 * Seat Lock Service
 *
 * Coordinates seat locks with the local Node.js backend.
 * Automatically falls back to local storage locking if the backend is down.
 */

export const lockSeats = async (
  eventId: string,
  userId: string,
  seatIds: string[]
): Promise<void> => {
  try {
    const response = await fetch('http://localhost:3001/api/lock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, userId, seatIds }),
    });
    if (response.ok) return;
  } catch (err) {
    // Ignore server error and fall back to local storage
  }

  // LocalStorage Fallback lock
  const now = Date.now();
  try {
    const raw = localStorage.getItem('seat-locks');
    const allLocks = raw ? JSON.parse(raw) : [];
    
    // Filter out expired locks and this user's old locks for the event
    const cleaned = allLocks.filter(
      (lock: any) =>
        lock.expiresAt > now &&
        !(lock.eventId === eventId && lock.userId === userId)
    );

    // Add new locks
    const newLocks = seatIds.map((seatId) => ({
      seatId,
      eventId,
      userId,
      lockedAt: now,
      expiresAt: now + 2 * 60 * 1000, // 2-minute lock expiry
    }));

    const nextLocks = [...cleaned, ...newLocks];
    localStorage.setItem('seat-locks', JSON.stringify(nextLocks));
    // Trigger storage event manually for same window if needed (not standard, but good)
    window.dispatchEvent(new StorageEvent('storage', { key: 'seat-locks', newValue: JSON.stringify(nextLocks) }));
  } catch (e) {
    // Graceful degradation
  }
};

export const unlockSeats = async (eventId: string, userId: string): Promise<void> => {
  try {
    const response = await fetch('http://localhost:3001/api/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventId, userId }),
    });
    if (response.ok) return;
  } catch (err) {
    // Ignore server error and fall back to local storage
  }

  // LocalStorage Fallback unlock
  try {
    const raw = localStorage.getItem('seat-locks');
    if (!raw) return;
    const allLocks = JSON.parse(raw);
    const filtered = allLocks.filter(
      (lock: any) => !(lock.eventId === eventId && lock.userId === userId)
    );
    localStorage.setItem('seat-locks', JSON.stringify(filtered));
    window.dispatchEvent(new StorageEvent('storage', { key: 'seat-locks', newValue: JSON.stringify(filtered) }));
  } catch (e) {
    // Ignore
  }
};
