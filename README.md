# High‑Concurrency Event Ticket Booking System 

[![Node.js](https://img.shields.io/badge/Node-20%2B-success.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4.19-646CFF.svg?logo=vite)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3.1-61DAFB.svg?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-3178C6.svg?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind%20CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-38B2AC.svg?logo=tailwind-css)](https://tailwindcss.com/)

---

## Overview

A **modern, production‑ready** front‑end demo of a high‑concurrency event ticket booking system. The application showcases:

- **Real‑time search & filtering** of events (mock data).
- **Rich event detail pages** with animated UI, venue info, and availability visualisation.
- **Secure booking flow** with seat assignment, optimistic UI updates, and PDF ticket generation.
- **Authentication** (login / signup) and protected user/admin dashboards.
- **State management** via custom hooks (`useAuth`, `useBookingStore`) and **React Query** for data fetching.
- **Premium UI** built with **Radix UI**, **shadcn/ui**, **Tailwind CSS**, and **Framer Motion** for smooth micro‑animations.
- **Responsive design** – works beautifully on desktop and mobile.

> **Note:** Events come from mock data (`src/data/mockData.ts`), but bookings and seat locks are backed by a real (in‑memory) Node server — see below.

---

## Getting Started

```bash
npm install
npm run dev      # starts the Vite dev server AND the booking API together
```

This opens the app at `http://localhost:8080`, with the booking API on
`http://localhost:3001`. `npm run dev` runs both via `concurrently`; use
`npm run dev:client` / `npm run dev:server` if you want them separately
(e.g. in two terminals).

**Why both matter:** the "no double booking" guarantee is enforced by
`server.js`, not the browser. It's a single‑threaded Node handler that
checks-then-writes a seat with no `await` in between, so two concurrent
requests for the same seat can never interleave — the second always gets a
`409`. If the API isn't running, the app falls back to a best‑effort local
mode (seat locks/bookings kept in `localStorage`) so the UI still works, but
that fallback can only serialize bookings within *one* browser — it has no
way to see what another browser or device just booked. A banner appears on
the booking page whenever the API is unreachable, precisely because that
guarantee doesn't hold in that mode. **To see real concurrent-booking
protection, run `npm run dev` (not just `vite`) and try booking the same
seat from two different browser windows.**

---

## Key Features

| Feature | Description |
|---|---|
| **Event Catalog** | Search by title/venue, filter by category, and view featured events on the home page. |
| **Event Details** | Hero banner, formatted date, venue map, ticket availability bar, and description. |
| **Booking Card** | Seat selection, ticket count (max 10), price calculation, and real‑time progress bar. |
| **Concurrency-safe booking** | Node backend rejects a seat the instant it's taken (409), even under many simultaneous requests — see *Getting Started*. |
| **Cross-tab seat locks** | Selecting a seat broadcasts a short-lived "locked" hold via SSE so other viewers see it as unavailable while you're checking out. |
| **PDF Ticket** | Generates a downloadable, QR-coded PDF ticket with event info, seat numbers, and user details. |
| **Authentication** | Simple login/signup flow; protected routes redirect unauthenticated users. |
| **Admin Dashboard** | Create/edit/delete events and browse all bookings. |
| **Light & dark themes** | Toggle in the navbar (sun/moon icon); persisted across visits. |
| **Animations** | Page transitions, staggered item reveals, and hover effects via **Framer Motion**. |
| **Responsive UI** | Tailwind’s utility‑first classes ensure mobile‑first layout. |
| **Testing** | Unit & component tests powered by **Vitest** and **React Testing Library**. |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository.
2. Create a **feature branch**: `git checkout -b feature/awesome-feature`.
3. Write **tests** for your changes.
4. Ensure all existing tests pass: `npm run test && npm run lint`.
5. Open a **Pull Request** with a clear description of the changes.

---

