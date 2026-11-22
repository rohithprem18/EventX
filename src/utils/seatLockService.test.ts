import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { lockSeats, unlockSeats } from "./seatLockService";
import type { SeatLock } from "@/hooks/useBookingStore";

// The service's contract: the booking API first, localStorage as the fallback
// when the API is unreachable or answers not-ok. These tests pin both paths,
// including which stored locks survive a new lock (expired ones and the same
// user's old ones for the event are replaced; everyone else's stay).

const STORAGE_KEY = "seat-locks";

const readStored = (): SeatLock[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as SeatLock[]) : [];
};

const storedLock = (over: Partial<SeatLock>): SeatLock => ({
  seatId: "A1",
  eventId: "ev1",
  userId: "u1",
  lockedAt: 1_000,
  expiresAt: 2_000,
  ...over,
});

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("lockSeats", () => {
  it("locks through the API when it answers ok, without touching localStorage", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await lockSeats("ev1", "u1", ["A1", "A2"]);
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/lock",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ eventId: "ev1", userId: "u1", seatIds: ["A1", "A2"] }),
      }),
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("falls back to localStorage when the API is unreachable, writing 2-minute locks and a storage event", async () => {
    fetchMock.mockRejectedValue(new Error("network down"));
    const events: StorageEvent[] = [];
    window.addEventListener("storage", (e) => events.push(e as StorageEvent));

    const before = Date.now();
    await lockSeats("ev1", "u1", ["A1", "A2"]);
    const after = Date.now();

    const stored = readStored();
    expect(stored).toHaveLength(2);
    for (const lock of stored) {
      expect(lock).toMatchObject({ eventId: "ev1", userId: "u1" });
      expect(lock.lockedAt).toBeGreaterThanOrEqual(before);
      expect(lock.expiresAt).toBeGreaterThanOrEqual(before + 2 * 60 * 1000);
      expect(lock.expiresAt).toBeLessThanOrEqual(after + 2 * 60 * 1000);
    }
    expect(stored.map((l) => l.seatId).sort()).toEqual(["A1", "A2"]);
    expect(events.some((e) => e.key === STORAGE_KEY)).toBe(true);
  });

  it("falls back when the API answers not-ok", async () => {
    fetchMock.mockResolvedValue({ ok: false, status: 500 });
    await lockSeats("ev1", "u1", ["A1"]);
    expect(readStored().map((l) => l.seatId)).toEqual(["A1"]);
  });

  it("drops expired locks and the same user's old locks for the event, keeps everyone else's", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    const now = Date.now();
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        storedLock({ seatId: "OLD", eventId: "ev1", userId: "u1", expiresAt: now + 60_000 }), // replaced
        storedLock({ seatId: "GONE", eventId: "ev1", userId: "u1", expiresAt: now - 1 }), // expired
        storedLock({ seatId: "KEEP-OTHER-EVENT", eventId: "ev2", userId: "u1", expiresAt: now + 60_000 }),
        storedLock({ seatId: "KEEP-OTHER-USER", eventId: "ev1", userId: "u2", expiresAt: now + 60_000 }),
      ]),
    );
    await lockSeats("ev1", "u1", ["A9"]);
    expect(readStored().map((l) => l.seatId).sort()).toEqual(["A9", "KEEP-OTHER-EVENT", "KEEP-OTHER-USER"]);
  });
});

describe("unlockSeats", () => {
  it("unlocks through the API when it answers ok", async () => {
    fetchMock.mockResolvedValue({ ok: true });
    await unlockSeats("ev1", "u1");
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/unlock",
      expect.objectContaining({ method: "POST", body: JSON.stringify({ eventId: "ev1", userId: "u1" }) }),
    );
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("falls back to localStorage and removes only this user's locks for the event", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        storedLock({ seatId: "MINE-1", eventId: "ev1", userId: "u1" }),
        storedLock({ seatId: "MINE-OTHER-EVENT", eventId: "ev2", userId: "u1" }),
        storedLock({ seatId: "THEIRS", eventId: "ev1", userId: "u2" }),
      ]),
    );
    await unlockSeats("ev1", "u1");
    expect(readStored().map((l) => l.seatId).sort()).toEqual(["MINE-OTHER-EVENT", "THEIRS"]);
  });

  it("does nothing when there is nothing stored", async () => {
    fetchMock.mockRejectedValue(new Error("down"));
    await unlockSeats("ev1", "u1");
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
