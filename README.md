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

Event ticket booking system where seat correctness is enforced server-side, not by the UI. A single-threaded Node HTTP server performs an atomic check-then-write on every booking request, so two concurrent requests for the same seat cannot both succeed — the loser receives a `409`.

- Seat holds propagate to all connected clients in real time over Server-Sent Events.
- If the API is unreachable, the client falls back to a `localStorage`-backed mode (Web Locks API) and surfaces a banner stating the double-booking guarantee no longer holds — it does not fail silently.
- Event data is mocked (`src/data/mockData.ts`); bookings, locks, and the concurrency guarantee run against a real server (`server.js`).

## Key Features

| Feature | Description |
|---|---|
| Concurrency-safe booking | Server rejects a seat the instant it's taken (`409`), even under simultaneous requests. |
| Real-time seat locks | Seat selection broadcasts a short-lived hold via SSE to every connected client. |
| Booking flow | Seat picker, ticket count limit, live price calculation, optimistic UI with server reconciliation. |
| PDF e-ticket | Boarding-pass-style PDF with a scannable QR code, seat numbers, and attendee details. |
| Auth & roles | Login/signup, protected routes, separate user and admin dashboards. |
| Admin dashboard | Create, edit, delete events; view all bookings. |
| Offline fallback | `localStorage`-backed booking when the API is unreachable, with an explicit reduced-guarantee banner. |
| Light / dark theme | Toggle in the navbar, persisted across sessions. |
| Tests | Unit and component tests via Vitest and React Testing Library. |

## Architecture: the Concurrency Guarantee

`server.js` keeps bookings in memory and performs a synchronous check-then-write with no `await` between the two steps, so Node's single-threaded event loop cannot interleave two requests mid-check.

```mermaid
sequenceDiagram
    participant A as Browser A
    participant B as Browser B
    participant S as Node server (server.js)

    A->>S: POST /api/lock  (hold seat A12)
    S-->>A: locks broadcast via SSE
    S-->>B: locks broadcast via SSE (seat A12 shown as held)

    par Both users submit at nearly the same instant
        A->>S: POST /api/book  (seat A12)
        B->>S: POST /api/book  (seat A12)
    end

    Note over S: Synchronous check-then-write,<br/>no await between them —<br/>requests can't interleave.

    S-->>A: 200 OK — booking confirmed
    S-->>B: 409 Conflict — seat already booked
```

Run `npm run dev` (client + API together) and attempt to book the same seat from two browser windows to observe this directly.

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, TypeScript, Vite, React Router |
| UI | Tailwind CSS (hand-owned components, no external UI kit), Framer Motion, self-hosted Outfit / JetBrains Mono |
| Backend | Node.js `http` server, Server-Sent Events |
| Tickets | jsPDF, `qrcode` |
| Testing | Vitest, React Testing Library |

## Getting Started

Requires Node.js 20+.

```bash
npm install
npm run dev      # Vite client (:8080) + booking API (:3001)
```

| Command | Description |
|---|---|
| `npm run dev` | Client + API together |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Booking API only |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run test` | Run tests |
| `npm run lint` | Lint |

## Project Structure

```
EventX/
├── server.js              # Atomic booking API + SSE seat-lock broadcaster
├── src/
│   ├── pages/              # Route-level pages
│   ├── components/         # Navbar, EventCard, SeatPicker, CreateEventForm
│   ├── hooks/               # useAuth, useBookingStore, useSeatLocks
│   ├── utils/               # generateTicketPDF, seatLockService
│   └── data/                 # Mock event data
└── docs/                   # README assets
```

---

<p align="center">
  <a href="https://github.com/rohithprem18">@rohithprem18</a>
</p>
