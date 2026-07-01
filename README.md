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

> **Note:** The project uses mock data (`src/data/mockData.ts`) for demonstration. The architecture mirrors a real‑world service where a backend API would provide events, bookings, and authentication.

---

## Key Features

| Feature | Description |
|---|---|
| **Event Catalog** | Search by title/venue, filter by category, and view featured events on the home page. |
| **Event Details** | Hero banner, formatted date, venue map, ticket availability bar, and description. |
| **Booking Card** | Seat selection, ticket count (max 10), price calculation, and real‑time progress bar. |
| **PDF Ticket** | Generates a downloadable PDF receipt with event info, seat numbers, and user details. |
| **Authentication** | Simple login/signup flow; protected routes redirect unauthenticated users. |
| **Admin Dashboard** | Placeholder for admin‑only pages (e.g., event creation, analytics). |
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

