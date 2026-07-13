// Single place that knows where the booking API lives. Falls back to the
// local dev server so `npm run dev` keeps working with zero config; set
// VITE_API_URL to point the built frontend at a deployed backend.
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001';
