import eventNeonNights from '@/assets/event-neon-nights.jpg';
import eventTechSummit from '@/assets/event-tech-summit.jpg';
import eventComedy from '@/assets/event-comedy.jpg';
import eventCinema from '@/assets/event-cinema.jpg';
import eventFoodWine from '@/assets/event-food-wine.jpg';
import eventDjNight from '@/assets/event-dj-night.jpg';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  venue: string;
  ticketPrice: number;
  totalTickets: number;
  availableTickets: number;
  bannerUrl: string;
  category: string;
  featured: boolean;
}

export interface Booking {
  id: string;
  userId: string;
  eventId: string;
  ticketCount: number;
  seatNumbers: string[];
  ticketId: string;
  bookedAt: string;
  status: 'confirmed' | 'pending' | 'cancelled';
}

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', role: 'user' },
  { id: 'u2', name: 'Admin User', email: 'admin@example.com', role: 'admin' },
];

export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'Neon Nights Music Festival',
    description: 'Experience an electrifying evening of live performances from top electronic and indie artists. State-of-the-art sound systems, immersive light shows, and an atmosphere that will keep you dancing until dawn.',
    date: '2026-04-15T19:00:00',
    venue: 'Skyline Arena, Los Angeles',
    ticketPrice: 89,
    totalTickets: 500,
    availableTickets: 342,
    bannerUrl: eventNeonNights,
    category: 'Music',
    featured: true,
  },
  {
    id: 'e2',
    title: 'Tech Horizon Summit 2026',
    description: 'Join industry leaders and innovators at the premier technology conference. Keynotes on AI, quantum computing, and the future of human-computer interaction.',
    date: '2026-05-20T09:00:00',
    venue: 'Convention Center, San Francisco',
    ticketPrice: 199,
    totalTickets: 1000,
    availableTickets: 687,
    bannerUrl: eventTechSummit,
    category: 'Tech',
    featured: true,
  },
  {
    id: 'e3',
    title: 'Stand-Up Comedy Night',
    description: 'An evening of non-stop laughter featuring five of the hottest comedians on the circuit. Great drinks, great vibes, and guaranteed belly laughs.',
    date: '2026-03-28T20:00:00',
    venue: 'The Laugh Factory, Chicago',
    ticketPrice: 45,
    totalTickets: 200,
    availableTickets: 23,
    bannerUrl: eventComedy,
    category: 'Comedy',
    featured: false,
  },
  {
    id: 'e4',
    title: 'Midnight Cinema: Classics Under Stars',
    description: 'Watch iconic films projected onto a massive outdoor screen. Bring blankets, enjoy gourmet popcorn, and relive cinema magic under the night sky.',
    date: '2026-04-05T21:00:00',
    venue: 'Rooftop Gardens, New York',
    ticketPrice: 35,
    totalTickets: 150,
    availableTickets: 98,
    bannerUrl: eventCinema,
    category: 'Film',
    featured: false,
  },
  {
    id: 'e5',
    title: 'Artisan Food & Wine Expo',
    description: 'Discover handcrafted flavors from over 100 artisan vendors. Wine tastings, cooking demos, and exclusive pairings from world-class sommeliers.',
    date: '2026-06-12T11:00:00',
    venue: 'Grand Pavilion, Napa Valley',
    ticketPrice: 120,
    totalTickets: 800,
    availableTickets: 560,
    bannerUrl: eventFoodWine,
    category: 'Food',
    featured: true,
  },
  {
    id: 'e6',
    title: 'Electronic Pulse DJ Night',
    description: 'Feel the bass drop with world-renowned DJs spinning sets that will shake the venue. Immersive visuals and top-tier production.',
    date: '2026-04-22T22:00:00',
    venue: 'Warehouse 9, Miami',
    ticketPrice: 65,
    totalTickets: 400,
    availableTickets: 210,
    bannerUrl: eventDjNight,
    category: 'Music',
    featured: false,
  },
];

export const mockBookings: Booking[] = [
  {
    id: 'b1',
    userId: 'u1',
    eventId: 'e1',
    ticketCount: 2,
    seatNumbers: ['A12', 'A13'],
    ticketId: 'TKT-NNF-001',
    bookedAt: '2026-03-01T14:30:00',
    status: 'confirmed',
  },
  {
    id: 'b2',
    userId: 'u1',
    eventId: 'e3',
    ticketCount: 1,
    seatNumbers: ['C7'],
    ticketId: 'TKT-SCN-002',
    bookedAt: '2026-03-05T10:15:00',
    status: 'confirmed',
  },
];

export const getEventById = (id: string) => mockEvents.find(e => e.id === id);
export const getBookingsForUser = (userId: string) => mockBookings.filter(b => b.userId === userId);
export const getBookingsForEvent = (eventId: string) => mockBookings.filter(b => b.eventId === eventId);
