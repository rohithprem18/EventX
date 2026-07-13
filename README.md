<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/banner-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/banner-light.svg">
    <img src="docs/banner-light.svg" alt="EventX — Real-time seats. Zero double-bookings." width="100%" />
  </picture>
</p>

<p align="center"><a href="https://high-concurrency-event-ticket-booki.vercel.app">Live Demo</a></p>

## Screenshots

| | |
|---|---|
| **Browse events** ![Homepage](docs/screenshots/01-homepage.jpg) | **Event detail** ![Event detail](docs/screenshots/02-event-detail.jpg) |
| **Sign in** ![Login](docs/screenshots/03-login.jpg) | **Create account** ![Signup](docs/screenshots/04-signup.jpg) |
| **Seat picker** ![Seat picker](docs/screenshots/05-booking-seat-picker.jpg) | **Booking confirmed** ![Booking confirmed](docs/screenshots/06-booking-confirmed.jpg) |
| **User dashboard** ![User dashboard](docs/screenshots/07-user-dashboard.jpg) | **Admin — events** ![Admin dashboard](docs/screenshots/08-admin-dashboard.jpg) |
| **Admin — bookings** ![Admin bookings](docs/screenshots/09-admin-bookings.jpg) | **404** ![Not found](docs/screenshots/10-not-found.jpg) |

## Overview

Event ticket booking system where seat correctness is enforced by the database, not by the UI or by trusting a single server process. A Postgres unique constraint makes double-booking a seat impossible even when many API instances are running behind a load balancer; Redis backs short-lived, self-expiring seat holds and fans real-time updates out across every instance.

- Seat holds propagate to all connected clients in real time over Server-Sent Events, regardless of which backend instance served them — see [Architecture](#architecture-why-this-cant-double-book-or-deadlock) below.
- An abandoned hold (closed tab, crashed client, dead server instance) expires on its own within 2 minutes. Nothing can get permanently stuck "locked."
- If the API is unreachable at all, the client falls back to a `localStorage`-backed mode (Web Locks API) and surfaces a banner stating the double-booking guarantee no longer holds — it does not fail silently.
- Event data is mocked (`src/data/mockData.ts`); bookings, seat locks, and the concurrency guarantee run against a real Postgres + Redis backed API (`server/`).

## Key Features

| Feature | Description |
|---|---|
| Concurrency-safe booking | A Postgres unique constraint rejects a seat the instant it's taken (`409`), even across many API instances handling simultaneous requests. |
| Real-time seat locks | Seat selection broadcasts a short-lived, auto-expiring hold via Redis + SSE to every connected client, on every instance. |
| Booking flow | Seat picker, ticket count limit, live price calculation, optimistic UI with server reconciliation. |
| PDF e-ticket | Boarding-pass-style PDF with a scannable QR code, seat numbers, and attendee details. |
| Auth & roles | Login/signup, protected routes, separate user and admin dashboards. |
| Admin dashboard | Create, edit, delete events; view all bookings. |
| Offline fallback | `localStorage`-backed booking when the API is unreachable, with an explicit reduced-guarantee banner. |
| Light / dark theme | Toggle in the navbar, persisted across sessions. |
| Tests | Unit and component tests via Vitest and React Testing Library. |

## Architecture: why this can't double-book or deadlock

Two separate guarantees, deliberately kept apart:

- **Correctness** — a Postgres unique constraint on `booked_seats(event_id, seat_id)` (`server/db.js`). A second `INSERT` for an already-booked seat is rejected by the database itself, inside a transaction, no matter how many API instances are running. This is the actual source of truth; nothing else in the system is trusted to prevent a double-booking.
- **UX** — Redis seat locks (`server/redis.js`) give near-instant "someone else is looking at this seat" feedback. They're a courtesy, not a guarantee: `SET key value NX PX 120000` acquires a hold *only if free* and auto-expires it in 2 minutes, atomically, in one command. There's no separate cleanup job and no way for a hold to survive a crashed tab or a killed server instance — Redis expires it regardless of what happened to whoever created it.

```mermaid
sequenceDiagram
    participant A as Browser A
    participant B as Browser B
    participant S1 as API instance 1
    participant S2 as API instance 2
    participant R as Redis (locks + pub/sub)
    participant PG as Postgres (bookings)

    A->>S1: POST /api/lock  (hold seat A12)
    S1->>R: SET lock:e1:A12 NX PX 120000
    R-->>S1: OK
    S1->>R: PUBLISH eventx:updates
    R-->>S2: relayed to every instance
    S2-->>B: seat A12 shown as held (SSE)

    par Both users submit at nearly the same instant, to different instances
        A->>S1: POST /api/book  (seat A12)
        B->>S2: POST /api/book  (seat A12)
    end

    S1->>PG: BEGIN; INSERT booked_seats(e1, A12); COMMIT
    S2->>PG: BEGIN; INSERT booked_seats(e1, A12); COMMIT

    Note over PG: Composite primary key (event_id, seat_id).<br/>The second INSERT hits a unique-violation —<br/>Postgres itself decides the winner, not either process.

    PG-->>S1: OK
    PG-->>S2: 23505 unique_violation
    S1-->>A: 200 confirmed
    S2-->>B: 409 seat already booked (with who booked it)
```

Why an abandoned hold can't cause a "stuck" seat: Redis TTLs expire on their own, independent of the process that created them, so a crashed instance or a browser tab closed mid-booking self-heals in under 2 minutes with zero intervention. Why there's no deadlock: every lock acquisition is a single non-blocking atomic command (no process ever waits *on* another lock while holding one), and every seat insert in a multi-seat booking is committed as one all-or-nothing transaction — there is no ordering for two holders to deadlock over.

This was verified directly, not just reasoned about: two separate `server/index.js` processes fired truly concurrent `/api/book` requests at the same seat and the same Postgres database — exactly one instance returned `200`, the other `409`, with an accurate `bookedBy`. Run `npm run dev` (client + API together) and attempt to book the same seat from two browser windows to see it yourself.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router |
| UI | Tailwind CSS (hand-owned components, no external UI kit), Framer Motion, self-hosted Outfit / JetBrains Mono |
| Backend | Node.js `http` server, Server-Sent Events |
| Data | Postgres (`pg`) — bookings, the double-booking constraint · Redis (`ioredis`) — seat locks, cross-instance pub/sub |
| Tickets | jsPDF, `qrcode` |
| Testing | Vitest, React Testing Library |

## Getting Started

Requires Node.js 20+ and Docker (for local Postgres/Redis — the API needs both to start; see [Architecture](#architecture-why-this-cant-double-book-or-deadlock)).

```bash
npm install
docker compose -f docker-compose.dev.yml up -d   # local Postgres + Redis
cp .env.example .env
# edit .env — for the local containers:
#   DATABASE_URL=postgres://eventx:eventx@localhost:5433/eventx
#   DATABASE_SSL=false
#   REDIS_URL=redis://localhost:6380
npm run dev      # Vite client (:8080) + booking API (:3001)
```

Non-standard local ports (5433/6380) on purpose, to avoid colliding with a Postgres/Redis you might already have installed natively.

Without a `.env`, `npm run dev:client` alone still works — the UI falls back to `localStorage`-backed booking with a visible "server unreachable" banner (see Overview above), which is enough to browse, book, and preview every screen without Docker.

| Command | Description |
|---|---|
| `npm run dev` | Client + API together |
| `npm run dev:client` | Vite dev server only (works with no backend — local-fallback mode) |
| `npm run dev:server` | Booking API only (needs `.env`, see above) |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint |

## Deployment

Frontend (static) and backend (a long-lived Node process — SSE needs a persistent connection, so it can't run as a serverless function) deploy separately.

1. **Postgres — [Neon](https://neon.tech)** (free tier, no expiry). Create a project, copy the connection string into `DATABASE_URL`.
2. **Redis — [Upstash](https://upstash.com)** (free tier). Create a Redis database, copy the `rediss://` connection string into `REDIS_URL`.
3. **Backend — [Render](https://render.com)**. New → Blueprint → point at this repo (`render.yaml` is already checked in). Set `DATABASE_URL` and `REDIS_URL` from steps 1-2 in the Render dashboard (they're marked `sync: false` in the blueprint on purpose — real secrets never belong in a committed file). Render builds with `npm install`, runs `npm start` (`server/index.js`, which applies the Postgres schema on boot), and health-checks `/healthz`. Note the deployed URL, e.g. `https://eventx-api.onrender.com`.
4. **Frontend — Vercel/Netlify** (already deployed, see the demo link at the top). Set `VITE_API_URL` to the Render URL from step 3 as a build-time environment variable, then redeploy.
5. Back in Render, set `CORS_ORIGIN` to your frontend's exact origin (e.g. `https://your-app.vercel.app`) once you have it, instead of leaving it open.

Because correctness lives in Postgres and locks live in Redis rather than in any one process's memory, you can freely scale the Render service to multiple instances (or just let a rolling deploy briefly run two versions side by side) without reintroducing double-booking — that's the whole point of the redesign in [Architecture](#architecture-why-this-cant-double-book-or-deadlock).

## Project Structure

```
EventX/
├── server/
│   ├── index.js            # HTTP routes, SSE fan-out, graceful shutdown
│   ├── db.js                # Postgres: schema, migrations, commitBooking (the guarantee)
│   └── redis.js             # Redis: seat locks (TTL), pub/sub
├── render.yaml              # Render Blueprint for the backend
├── docker-compose.dev.yml   # Local Postgres + Redis for development
├── src/
│   ├── pages/              # Route-level pages
│   ├── components/         # Navbar, EventCard, SeatPicker, CreateEventForm
│   ├── hooks/               # useAuth, useBookingStore, useSeatLocks
│   ├── utils/               # generateTicketPDF, seatLockService
│   ├── lib/                  # api.ts — deployed backend URL, one place
│   └── data/                 # Mock event data
└── docs/                   # README assets
```

---

<p align="center">
  <a href="https://github.com/rohithprem18">@rohithprem18</a>
</p>
