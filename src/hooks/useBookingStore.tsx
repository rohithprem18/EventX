import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Booking, mockBookings } from '@/data/mockData';

export interface BookingRecord extends Booking {
  userName: string;
  userEmail: string;
}

export interface SeatLock {
  seatId: string;
  eventId: string;
  userId: string;
  lockedAt?: number;
  expiresAt?: number;
}

export interface AddBookingResult {
  success: boolean;
  error?: 'collision' | 'network' | 'unknown';
  seats?: string[];
  bookedBy?: string;
}

interface BookingStoreContextType {
  bookings: BookingRecord[];
  locks: SeatLock[];
  addBooking: (booking: BookingRecord) => Promise<AddBookingResult>;
  getByTicketId: (ticketId: string) => BookingRecord | undefined;
  // Whether the shared booking API is reachable. Only while this is true
  // is "no double booking" guaranteed across different browsers/devices —
  // the local fallback can only serialize bookings within one browser.
  backendOnline: boolean;
}

const BookingStoreContext = createContext<BookingStoreContextType | undefined>(undefined);

const BOOKINGS_STORAGE_KEY = 'event-bookings';
const LOCKS_STORAGE_KEY = 'seat-locks';

// The backend is Vercel serverless functions (api/), which can't hold a
// persistent SSE connection open between requests, so real-time sync here
// is short-interval polling rather than a pushed stream. 2s keeps updates
// feeling immediate without spamming the API — see api/_lib/redis.js for
// the fuller explanation of that tradeoff.
const POLL_INTERVAL_MS = 2000;

// Seed with mock bookings
const seedBookings: BookingRecord[] = mockBookings.map(b => ({
  ...b,
  userName: 'Alex Rivera',
  userEmail: 'alex@example.com',
}));

const getInitialBookings = (): BookingRecord[] => {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return seedBookings;
};

const getInitialLocks = (): SeatLock[] => {
  try {
    const raw = localStorage.getItem(LOCKS_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
};

export const BookingStoreProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<BookingRecord[]>(getInitialBookings);
  const [locks, setLocks] = useState<SeatLock[]>(getInitialLocks);
  const [backendOnline, setBackendOnline] = useState(false);

  // Poll the shared state from the API (or fall back to local tab sync)
  useEffect(() => {
    let cancelled = false;
    let pollTimer: ReturnType<typeof setTimeout> | null = null;

    const poll = async () => {
      try {
        const res = await fetch('/api/state');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (cancelled) return;

        setBackendOnline(true);
        if (data.bookings) {
          setBookings(data.bookings);
          localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(data.bookings));
        }
        if (data.locks) {
          setLocks(data.locks);
          localStorage.setItem(LOCKS_STORAGE_KEY, JSON.stringify(data.locks));
        }
      } catch (err) {
        // API unreachable — failover to the local fallback path below, and
        // keep polling so it recovers automatically once the API is back.
        if (!cancelled) setBackendOnline(false);
      } finally {
        if (!cancelled) pollTimer = setTimeout(poll, POLL_INTERVAL_MS);
      }
    };

    poll();

    // Fallback storage sync for tabs on same browser profile
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === BOOKINGS_STORAGE_KEY) {
        try {
          const updated = e.newValue ? JSON.parse(e.newValue) : getInitialBookings();
          setBookings(updated);
        } catch {}
      } else if (e.key === LOCKS_STORAGE_KEY) {
        try {
          const updatedLocks = e.newValue ? JSON.parse(e.newValue) : getInitialLocks();
          setLocks(updatedLocks);
        } catch {}
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      cancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const addBooking = async (booking: BookingRecord): Promise<AddBookingResult> => {
    // The API is the single source of truth: booked_seats has a composite
    // primary key on (event_id, seat_id), so a colliding INSERT is
    // rejected by Postgres itself, atomically, no matter how many function
    // invocations are running concurrently. That guarantee only holds
    // while the API is actually reachable, so a real network failure is
    // the ONLY reason to fall back to the (best-effort, same-browser-only)
    // local path below. Any other response — success, collision, or an
    // unexpected error — must return here and must NOT fall through, or a
    // reachable API's rejection could get silently overridden by an
    // optimistic local "success".
    try {
      const response = await fetch('/api/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(booking),
      });

      if (response.ok) {
        const resData = await response.json();
        // Next poll will pick this up too, but update optimistically now.
        if (resData.booking) {
          setBookings(prev => [resData.booking, ...prev]);
        }
        return { success: true };
      }

      if (response.status === 409) {
        const errorData = await response.json();
        return {
          success: false,
          error: 'collision',
          seats: errorData.seats,
          bookedBy: errorData.bookedBy,
        };
      }

      // API is reachable but rejected the request for some other reason
      // (400/500/etc) — this is a definite failure, not a cue to fall back.
      return { success: false, error: 'unknown' };
    } catch (err) {
      console.warn('Booking API offline. Performing local fallback transaction.', err);
    }

    return addBookingLocalFallback(booking);
  };

  // Best-effort fallback used only when the API cannot be reached at all.
  // It can only ever serialize bookings within THIS browser (across its own
  // tabs, via the Web Locks API + a fresh localStorage read at write time).
  // It has no way to see bookings made in a different browser or device —
  // that cross-client guarantee requires the API above. Two people on two
  // different machines both offline from the API can still double-book;
  // there is no way around that without a shared authority.
  const addBookingLocalFallback = async (booking: BookingRecord): Promise<AddBookingResult> => {
    const runCriticalSection = async (): Promise<AddBookingResult> => {
      // Re-read from localStorage right now instead of trusting the `bookings`
      // React state closure, which can be stale relative to another tab that
      // just wrote (React state updates aren't synchronous/immediate).
      const rawBookings = localStorage.getItem(BOOKINGS_STORAGE_KEY);
      const currentBookings: BookingRecord[] = rawBookings ? JSON.parse(rawBookings) : bookings;

      const conflicted = booking.seatNumbers.filter(seat =>
        currentBookings.some(b => b.eventId === booking.eventId && b.status === 'confirmed' && b.seatNumbers.includes(seat))
      );

      if (conflicted.length > 0) {
        const owner = currentBookings.find(b => b.eventId === booking.eventId && b.seatNumbers.some(s => conflicted.includes(s)))?.userName || 'Another User';
        return { success: false, error: 'collision', seats: conflicted, bookedBy: owner };
      }

      const next = [booking, ...currentBookings];
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(next));
      setBookings(next);

      const rawLocks = localStorage.getItem(LOCKS_STORAGE_KEY);
      const localLocks = rawLocks ? JSON.parse(rawLocks) : [];
      const remainingLocks = localLocks.filter((l: SeatLock) => !(l.eventId === booking.eventId && l.userId === booking.userId));
      localStorage.setItem(LOCKS_STORAGE_KEY, JSON.stringify(remainingLocks));
      setLocks(remainingLocks);

      return { success: true };
    };

    // navigator.locks provides real mutual exclusion across tabs/documents of
    // the same origin — without it, two tabs can both read localStorage
    // before either writes back, and both "win". Fall back to running the
    // section unlocked (best-effort) on browsers that lack the API.
    if (typeof navigator !== 'undefined' && navigator.locks) {
      return navigator.locks.request(`booking-lock:${booking.eventId}`, runCriticalSection);
    }
    return runCriticalSection();
  };

  const getByTicketId = (ticketId: string) => {
    return bookings.find(b => b.ticketId === ticketId);
  };

  return (
    <BookingStoreContext.Provider value={{ bookings, locks, addBooking, getByTicketId, backendOnline }}>
      {children}
    </BookingStoreContext.Provider>
  );
};

export const useBookingStore = () => {
  const ctx = useContext(BookingStoreContext);
  if (!ctx) throw new Error('useBookingStore must be used within BookingStoreProvider');
  return ctx;
};
