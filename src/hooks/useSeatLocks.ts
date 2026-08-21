import { useCallback, useRef } from 'react';
import { lockSeats, unlockSeats } from '@/utils/seatLockService';
import { useBookingStore } from '@/hooks/useBookingStore';

/**
 * useSeatLocks Hook
 *
 * Exposes seat locks synchronised either from the Node.js SSE stream or localStorage fallback.
 */
export function useSeatLocks(eventId: string, userId: string) {
  const { locks } = useBookingStore();
  const eventIdRef = useRef(eventId);
  const userIdRef = useRef(userId);

  // Keep refs in sync
  eventIdRef.current = eventId;
  userIdRef.current = userId;

  // Filter seat IDs locked by OTHER users for this event
  const otherLockedSeats = locks
    .filter((lock) => lock.eventId === eventId && lock.userId !== userId)
    .map((lock) => lock.seatId);

  // Broadcast the current user's seat selections as locks
  const broadcastSelections = useCallback(
    (seatIds: string[]) => {
      lockSeats(eventId, userId, seatIds);
    },
    [eventId, userId]
  );

  // Confirm booking — clears locks
  const confirmBooking = useCallback(() => {
    unlockSeats(eventId, userId);
  }, [eventId, userId]);

  return {
    otherLockedSeats,
    broadcastSelections,
    confirmBooking,
  };
}
