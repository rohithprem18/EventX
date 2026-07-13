// No image-generation tool is wired into this environment, and no real
// photography was supplied for these mock events, so per the project's
// image policy each banner is a seeded Picsum photograph rather than a
// hand-rolled placeholder graphic — real photography, deterministic per
// event, sized for a wide banner crop.
const picsum = (seed: string) => `https://picsum.photos/seed/${seed}/1600/1000`;

const eventNeonNights = picsum('eventx-neon-music-festival');
const eventTechSummit = picsum('eventx-tech-summit-keynote');
const eventComedy = picsum('eventx-comedy-night-stage');
const eventCinema = picsum('eventx-outdoor-cinema-rooftop');
const eventFoodWine = picsum('eventx-food-wine-expo');
const eventDjNight = picsum('eventx-dj-warehouse-night');

// ─── Types ───

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  phone?: string;
  joinedAt?: string;
}

export interface TicketTier {
  id: string;
  name: string;
  price: number;
  available: number;
  total: number;
  perks: string[];
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
  organizer: string;
  organizerLogo?: string;
  tags: string[];
  ageRestriction?: string;
  duration: string;
  highlights: string[];
  ticketTiers: TicketTier[];
  rating: number;
  reviewCount: number;
  gallery: string[];
  artists?: string[];
  status: 'upcoming' | 'selling-fast' | 'sold-out' | 'completed';
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
  tierName?: string;
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  eventId: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

export interface PromoCode {
  code: string;
  discount: number;
  validFor: string[];
  expiresAt: string;
  maxUses: number;
  usedCount: number;
}

// ─── Mock Users ───

export const mockUsers: User[] = [
  { id: 'u1', name: 'Alex Rivera', email: 'alex@example.com', role: 'user', joinedAt: '2025-09-15' },
  { id: 'u2', name: 'Admin User', email: 'admin@example.com', role: 'admin', joinedAt: '2025-01-01' },
];

// ─── Mock Events ───

export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'Neon Nights Music Festival',
    description: 'Experience an electrifying evening of live performances from top electronic and indie artists. State-of-the-art sound systems, immersive light shows, and an atmosphere that will keep you dancing until dawn. Featuring artists from across the globe, this is the must-attend music event of the year.',
    date: '2026-08-15T19:00:00',
    venue: 'Skyline Arena, Los Angeles',
    ticketPrice: 89,
    totalTickets: 500,
    availableTickets: 342,
    bannerUrl: eventNeonNights,
    category: 'Music',
    featured: true,
    organizer: 'Neon Events Co.',
    tags: ['electronic', 'festival', 'live-music', 'nightlife'],
    ageRestriction: '18+',
    duration: '6 hours',
    highlights: [
      'World-class electronic & indie artists',
      'State-of-the-art Dolby Atmos sound',
      'Immersive 360° light show',
      'VIP lounge with open bar',
      'Food court with 20+ vendors',
    ],
    ticketTiers: [
      { id: 't1-ga', name: 'General Admission', price: 89, available: 250, total: 300, perks: ['Standing area access', 'Food court access'] },
      { id: 't1-vip', name: 'VIP', price: 199, available: 72, total: 150, perks: ['Front-row standing', 'VIP lounge access', 'Open bar', 'Meet & greet'] },
      { id: 't1-plat', name: 'Platinum', price: 349, available: 20, total: 50, perks: ['Backstage pass', 'Artist dinner', 'VIP lounge', 'Open bar', 'Exclusive merch'] },
    ],
    rating: 4.7,
    reviewCount: 234,
    gallery: [eventNeonNights, eventDjNight],
    artists: ['Nova Pulse', 'DJ Zenith', 'The Echoes', 'Starfall'],
    status: 'selling-fast',
  },
  {
    id: 'e2',
    title: 'Tech Horizon Summit 2026',
    description: 'Join industry leaders and innovators at the premier technology conference. Keynotes on AI, quantum computing, and the future of human-computer interaction. Network with 1000+ professionals and discover the next wave of innovation.',
    date: '2026-09-20T09:00:00',
    venue: 'Convention Center, San Francisco',
    ticketPrice: 199,
    totalTickets: 1000,
    availableTickets: 687,
    bannerUrl: eventTechSummit,
    category: 'Tech',
    featured: true,
    organizer: 'TechVentures Inc.',
    tags: ['technology', 'AI', 'conference', 'networking'],
    duration: '8 hours',
    highlights: [
      'Keynotes from Fortune 500 CTOs',
      'Hands-on AI/ML workshops',
      'Startup pitch competition ($50K prize)',
      'Networking mixer with 1000+ pros',
      'Exhibition hall with 50+ booths',
    ],
    ticketTiers: [
      { id: 't2-early', name: 'Early Bird', price: 149, available: 100, total: 200, perks: ['All sessions access', 'Lunch included', 'Conference swag bag'] },
      { id: 't2-ga', name: 'General', price: 199, available: 487, total: 600, perks: ['All sessions access', 'Lunch included'] },
      { id: 't2-vip', name: 'VIP', price: 499, available: 100, total: 200, perks: ['Front-row seating', 'Speaker dinner', 'Private networking', 'Workshop access'] },
    ],
    rating: 4.9,
    reviewCount: 512,
    gallery: [eventTechSummit],
    artists: ['Dr. Sarah Chen (AI)', 'James Park (Quantum)', 'Lena Wei (Robotics)'],
    status: 'upcoming',
  },
  {
    id: 'e3',
    title: 'Stand-Up Comedy Night',
    description: 'An evening of non-stop laughter featuring five of the hottest comedians on the circuit. Great drinks, great vibes, and guaranteed belly laughs. Perfect for a date night or group outing.',
    date: '2026-08-28T20:00:00',
    venue: 'The Laugh Factory, Chicago',
    ticketPrice: 45,
    totalTickets: 200,
    availableTickets: 23,
    bannerUrl: eventComedy,
    category: 'Comedy',
    featured: false,
    organizer: 'LaughBox Productions',
    tags: ['comedy', 'stand-up', 'nightlife', 'entertainment'],
    ageRestriction: '18+',
    duration: '2.5 hours',
    highlights: [
      '5 top-circuit comedians',
      '2-drink minimum included',
      'Intimate 200-seat venue',
      'Post-show meet & greet',
    ],
    ticketTiers: [
      { id: 't3-ga', name: 'General', price: 45, available: 15, total: 150, perks: ['Standard seating', '2-drink minimum included'] },
      { id: 't3-front', name: 'Front Row', price: 79, available: 8, total: 50, perks: ['Front row seats', '2-drink minimum', 'Meet & greet access'] },
    ],
    rating: 4.5,
    reviewCount: 89,
    gallery: [eventComedy],
    artists: ['Jake Morris', 'Priya Sharma', 'Dave "The Mic" Reynolds', 'Luna Park', 'Carlos Vega'],
    status: 'selling-fast',
  },
  {
    id: 'e4',
    title: 'Midnight Cinema: Classics Under Stars',
    description: 'Watch iconic films projected onto a massive outdoor screen. Bring blankets, enjoy gourmet popcorn, and relive cinema magic under the night sky. This month: The Shawshank Redemption.',
    date: '2026-08-05T21:00:00',
    venue: 'Rooftop Gardens, New York',
    ticketPrice: 35,
    totalTickets: 150,
    availableTickets: 98,
    bannerUrl: eventCinema,
    category: 'Film',
    featured: false,
    organizer: 'Moonlight Films',
    tags: ['cinema', 'outdoor', 'classics', 'rooftop'],
    duration: '3 hours',
    highlights: [
      'Massive 40-ft outdoor screen',
      'Gourmet popcorn & snacks included',
      'Blankets & cushions provided',
      'Pre-show trivia with prizes',
    ],
    ticketTiers: [
      { id: 't4-ga', name: 'General', price: 35, available: 80, total: 120, perks: ['Lawn seating', 'Popcorn included'] },
      { id: 't4-prem', name: 'Premium', price: 59, available: 18, total: 30, perks: ['Bean bag seating', 'Gourmet snack box', 'Drink voucher'] },
    ],
    rating: 4.3,
    reviewCount: 67,
    gallery: [eventCinema],
    status: 'upcoming',
  },
  {
    id: 'e5',
    title: 'Artisan Food & Wine Expo',
    description: 'Discover handcrafted flavors from over 100 artisan vendors. Wine tastings, cooking demos, and exclusive pairings from world-class sommeliers. A paradise for food lovers.',
    date: '2026-10-12T11:00:00',
    venue: 'Grand Pavilion, Napa Valley',
    ticketPrice: 120,
    totalTickets: 800,
    availableTickets: 560,
    bannerUrl: eventFoodWine,
    category: 'Food',
    featured: true,
    organizer: 'Culinary Arts Foundation',
    tags: ['food', 'wine', 'artisan', 'tasting'],
    duration: '7 hours',
    highlights: [
      '100+ artisan food vendors',
      'Unlimited wine tastings',
      'Live cooking demonstrations',
      'Sommelier-led pairing sessions',
      'Take-home artisan gift bag',
    ],
    ticketTiers: [
      { id: 't5-ga', name: 'General', price: 120, available: 400, total: 500, perks: ['All vendor access', '10 wine tasting tokens'] },
      { id: 't5-prem', name: 'Connoisseur', price: 250, available: 120, total: 200, perks: ['Unlimited tastings', 'VIP cooking demo', 'Sommelier session', 'Gift bag'] },
      { id: 't5-vip', name: 'Grand Cru', price: 450, available: 40, total: 100, perks: ['Private vineyard tour', 'Chef\'s table dinner', 'All Connoisseur perks', 'Rare wine bottle'] },
    ],
    rating: 4.8,
    reviewCount: 345,
    gallery: [eventFoodWine],
    status: 'upcoming',
  },
  {
    id: 'e6',
    title: 'Electronic Pulse DJ Night',
    description: 'Feel the bass drop with world-renowned DJs spinning sets that will shake the venue. Immersive visuals and top-tier production. The ultimate nightlife experience.',
    date: '2026-08-22T22:00:00',
    venue: 'Warehouse 9, Miami',
    ticketPrice: 65,
    totalTickets: 400,
    availableTickets: 210,
    bannerUrl: eventDjNight,
    category: 'Music',
    featured: false,
    organizer: 'BassWave Collective',
    tags: ['electronic', 'DJ', 'nightlife', 'dance'],
    ageRestriction: '21+',
    duration: '5 hours',
    highlights: [
      '3 world-renowned DJs',
      'Industrial warehouse setting',
      'Custom LED visual installation',
      'Premium sound system',
    ],
    ticketTiers: [
      { id: 't6-ga', name: 'General', price: 65, available: 160, total: 300, perks: ['Dance floor access'] },
      { id: 't6-vip', name: 'VIP', price: 149, available: 50, total: 100, perks: ['Elevated VIP platform', 'Private bar', 'Skip the line'] },
    ],
    rating: 4.4,
    reviewCount: 178,
    gallery: [eventDjNight, eventNeonNights],
    artists: ['DJ Nexus', 'Synthwave Sally', 'BeatCraft'],
    status: 'upcoming',
  },
  {
    id: 'e7',
    title: 'Championship League Finals',
    description: 'Witness the most anticipated sporting event of the season. Two elite teams battle for the championship trophy in an electrifying atmosphere with 50,000 fans.',
    date: '2026-09-10T18:00:00',
    venue: 'MetLife Stadium, New Jersey',
    ticketPrice: 150,
    totalTickets: 600,
    availableTickets: 45,
    bannerUrl: eventNeonNights,
    category: 'Sports',
    featured: true,
    organizer: 'National Sports League',
    tags: ['sports', 'championship', 'finals', 'live'],
    duration: '4 hours',
    highlights: [
      'Championship finals match',
      'Pre-game fan zone with activities',
      'Halftime live performance',
      'Commemorative merchandise',
      'Fireworks finale',
    ],
    ticketTiers: [
      { id: 't7-upper', name: 'Upper Deck', price: 150, available: 20, total: 300, perks: ['Upper level seating', 'Fan zone access'] },
      { id: 't7-lower', name: 'Lower Bowl', price: 350, available: 15, total: 200, perks: ['Lower level seating', 'Fan zone', 'Food voucher'] },
      { id: 't7-court', name: 'Courtside', price: 750, available: 10, total: 100, perks: ['Courtside seats', 'Locker room tour', 'All perks'] },
    ],
    rating: 4.9,
    reviewCount: 891,
    gallery: [eventNeonNights],
    status: 'selling-fast',
  },
  {
    id: 'e8',
    title: 'Contemporary Art Exhibition',
    description: 'Explore groundbreaking works from 30 emerging artists pushing the boundaries of contemporary art. Interactive installations, live painting sessions, and curator-led tours.',
    date: '2026-09-05T10:00:00',
    venue: 'Modern Gallery, Brooklyn',
    ticketPrice: 40,
    totalTickets: 300,
    availableTickets: 220,
    bannerUrl: eventCinema,
    category: 'Art',
    featured: false,
    organizer: 'Brooklyn Arts Council',
    tags: ['art', 'exhibition', 'contemporary', 'interactive'],
    duration: '5 hours',
    highlights: [
      '30 emerging artist showcases',
      'Interactive digital installations',
      'Live painting sessions',
      'Curator-led guided tours',
      'Artist talk panels',
    ],
    ticketTiers: [
      { id: 't8-ga', name: 'General', price: 40, available: 180, total: 250, perks: ['Gallery access', 'Self-guided tour'] },
      { id: 't8-guided', name: 'Guided Experience', price: 75, available: 40, total: 50, perks: ['Curator-led tour', 'Artist meet', 'Catalog included'] },
    ],
    rating: 4.6,
    reviewCount: 123,
    gallery: [eventCinema],
    status: 'upcoming',
  },
  {
    id: 'e9',
    title: 'Creative Writing Workshop',
    description: 'A full-day immersive workshop led by bestselling authors. Learn storytelling techniques, character development, and get personalized feedback on your work.',
    date: '2026-10-01T09:00:00',
    venue: 'The Writers Room, Portland',
    ticketPrice: 95,
    totalTickets: 50,
    availableTickets: 32,
    bannerUrl: eventTechSummit,
    category: 'Workshop',
    featured: false,
    organizer: 'Literary Guild',
    tags: ['workshop', 'writing', 'creative', 'learning'],
    duration: '6 hours',
    highlights: [
      'Led by 2 NYT bestselling authors',
      'Small group (50 max)',
      'Personalized manuscript feedback',
      'Publishing industry Q&A',
      'Lunch & refreshments included',
    ],
    ticketTiers: [
      { id: 't9-ga', name: 'Workshop Pass', price: 95, available: 25, total: 40, perks: ['All sessions', 'Lunch included', 'Digital materials'] },
      { id: 't9-mentor', name: 'Mentorship', price: 195, available: 7, total: 10, perks: ['All sessions', '1-on-1 manuscript review', 'Author dinner'] },
    ],
    rating: 4.8,
    reviewCount: 56,
    gallery: [eventTechSummit],
    artists: ['Margaret Liu (Author)', 'Robert Hayes (Author)'],
    status: 'upcoming',
  },
  {
    id: 'e10',
    title: 'Yoga & Wellness Retreat',
    description: 'A transformative day of yoga, meditation, and wellness workshops in a beautiful outdoor setting. Disconnect from the hustle and reconnect with yourself.',
    date: '2026-09-15T07:00:00',
    venue: 'Serenity Gardens, Sedona',
    ticketPrice: 80,
    totalTickets: 100,
    availableTickets: 65,
    bannerUrl: eventFoodWine,
    category: 'Workshop',
    featured: false,
    organizer: 'Mindful Events',
    tags: ['wellness', 'yoga', 'meditation', 'retreat'],
    duration: '8 hours',
    highlights: [
      'Morning sunrise yoga session',
      'Guided meditation workshops',
      'Sound healing experience',
      'Organic plant-based lunch',
      'Take-home wellness kit',
    ],
    ticketTiers: [
      { id: 't10-day', name: 'Day Pass', price: 80, available: 50, total: 75, perks: ['All sessions', 'Lunch included'] },
      { id: 't10-full', name: 'Full Experience', price: 150, available: 15, total: 25, perks: ['All sessions', 'Private session', 'Wellness kit', 'Lunch'] },
    ],
    rating: 4.7,
    reviewCount: 98,
    gallery: [eventFoodWine],
    status: 'upcoming',
  },
  {
    id: 'e11',
    title: 'Indie Film Festival',
    description: 'Three days of independent cinema showcasing 20 award-winning short films and 5 feature films. Q&A sessions with directors, industry panels, and an awards ceremony.',
    date: '2026-11-08T10:00:00',
    venue: 'Rialto Theater, Austin',
    ticketPrice: 60,
    totalTickets: 400,
    availableTickets: 380,
    bannerUrl: eventCinema,
    category: 'Film',
    featured: false,
    organizer: 'Austin Film Society',
    tags: ['film', 'indie', 'festival', 'cinema'],
    duration: '10 hours',
    highlights: [
      '25 curated independent films',
      'Director Q&A sessions',
      'Industry networking panels',
      'Awards ceremony & afterparty',
    ],
    ticketTiers: [
      { id: 't11-day', name: 'Day Pass', price: 60, available: 300, total: 350, perks: ['All screenings for one day'] },
      { id: 't11-full', name: 'Festival Pass', price: 150, available: 80, total: 50, perks: ['All 3 days', 'Afterparty access', 'Festival merch'] },
    ],
    rating: 4.4,
    reviewCount: 45,
    gallery: [eventCinema],
    status: 'upcoming',
  },
  {
    id: 'e12',
    title: 'Jazz Under the Bridge',
    description: 'An intimate evening of world-class jazz in a unique urban setting. Local and international jazz artists perform under the iconic Brooklyn Bridge with the Manhattan skyline as backdrop.',
    date: '2026-08-30T19:30:00',
    venue: 'DUMBO Waterfront, Brooklyn',
    ticketPrice: 55,
    totalTickets: 250,
    availableTickets: 0,
    bannerUrl: eventComedy,
    category: 'Music',
    featured: false,
    organizer: 'Brooklyn Jazz Collective',
    tags: ['jazz', 'live-music', 'outdoor', 'intimate'],
    duration: '3 hours',
    highlights: [
      'Waterfront performance space',
      'Manhattan skyline backdrop',
      '4 acclaimed jazz ensembles',
      'Artisan cocktail bar',
    ],
    ticketTiers: [
      { id: 't12-ga', name: 'General', price: 55, available: 0, total: 200, perks: ['Standing area', 'One drink token'] },
      { id: 't12-seated', name: 'Reserved Seating', price: 95, available: 0, total: 50, perks: ['Reserved table', 'Two drink tokens', 'Appetizer plate'] },
    ],
    rating: 4.9,
    reviewCount: 267,
    gallery: [eventComedy],
    artists: ['The Miles Davis Tribute', 'Ella Nova Quartet', 'Brooklyn Brass'],
    status: 'sold-out',
  },
];

// ─── Mock Reviews ───

export const mockReviews: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'Alex Rivera', eventId: 'e1', rating: 5, comment: 'Absolutely incredible experience! The light show was out of this world and the sound quality was perfect. Will definitely attend again next year.', date: '2026-04-20', helpful: 24 },
  { id: 'r2', userId: 'u3', userName: 'Sarah Chen', eventId: 'e1', rating: 4, comment: 'Great lineup and amazing atmosphere. Only docked one star because the food lines were quite long during peak hours.', date: '2026-04-18', helpful: 12 },
  { id: 'r3', userId: 'u4', userName: 'Marcus Johnson', eventId: 'e1', rating: 5, comment: 'The VIP experience was worth every penny. Backstage access was a dream come true. Production quality was top-notch.', date: '2026-04-21', helpful: 31 },
  { id: 'r4', userId: 'u5', userName: 'Emily Park', eventId: 'e2', rating: 5, comment: 'Best tech conference I\'ve ever attended. The AI workshops were incredibly hands-on and the networking opportunities were invaluable.', date: '2026-05-25', helpful: 45 },
  { id: 'r5', userId: 'u6', userName: 'David Kim', eventId: 'e2', rating: 5, comment: 'The keynote speakers were world-class. Dr. Chen\'s talk on AGI was mind-blowing. Already bought my ticket for next year.', date: '2026-05-22', helpful: 38 },
  { id: 'r6', userId: 'u7', userName: 'Lisa Thompson', eventId: 'e3', rating: 4, comment: 'Laughed non-stop for 2 hours straight. Jake Morris was hilarious! The venue was cozy and the drinks were reasonably priced.', date: '2026-03-30', helpful: 8 },
  { id: 'r7', userId: 'u8', userName: 'Tom Wilson', eventId: 'e5', rating: 5, comment: 'A foodie\'s paradise. The wine pairings were exceptional and I discovered so many new artisan brands. The sommelier session was the highlight.', date: '2026-06-15', helpful: 19 },
  { id: 'r8', userId: 'u9', userName: 'Nina Patel', eventId: 'e7', rating: 5, comment: 'What an atmosphere! 50,000 fans all cheering together. The fireworks finale was spectacular. Once-in-a-lifetime experience.', date: '2026-09-12', helpful: 67 },
  { id: 'r9', userId: 'u10', userName: 'Chris Lee', eventId: 'e12', rating: 5, comment: 'The most magical evening. Jazz under the Brooklyn Bridge with the Manhattan skyline... doesn\'t get more New York than this. Pure perfection.', date: '2026-09-01', helpful: 52 },
  { id: 'r10', userId: 'u11', userName: 'Anna Schmidt', eventId: 'e10', rating: 5, comment: 'Truly transformative. The sound healing session brought me to tears. Left feeling completely recharged and at peace. The organic lunch was delicious too.', date: '2026-09-18', helpful: 23 },
];

// ─── Mock Promo Codes ───

export const mockPromoCodes: PromoCode[] = [
  { code: 'WELCOME20', discount: 20, validFor: ['all'], expiresAt: '2027-12-31', maxUses: 1000, usedCount: 342 },
  { code: 'EARLYBIRD', discount: 15, validFor: ['e2', 'e5', 'e7'], expiresAt: '2026-08-01', maxUses: 200, usedCount: 89 },
  { code: 'VIP30', discount: 30, validFor: ['e1', 'e6'], expiresAt: '2026-09-30', maxUses: 50, usedCount: 12 },
  { code: 'STUDENT10', discount: 10, validFor: ['all'], expiresAt: '2027-06-30', maxUses: 500, usedCount: 201 },
  { code: 'FESTIVALFUN', discount: 25, validFor: ['e1', 'e11'], expiresAt: '2026-11-30', maxUses: 100, usedCount: 33 },
];

// ─── Mock Bookings ───

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
    tierName: 'VIP',
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
    tierName: 'Front Row',
  },
];

// ─── Category Config ───

export const categories = [
  { name: 'Music', icon: '🎵', color: 'hsl(265, 68%, 60%)' },
  { name: 'Tech', icon: '💻', color: 'hsl(200, 68%, 46%)' },
  { name: 'Comedy', icon: '😂', color: 'hsl(45, 70%, 50%)' },
  { name: 'Film', icon: '🎬', color: 'hsl(340, 62%, 52%)' },
  { name: 'Food', icon: '🍷', color: 'hsl(155, 62%, 44%)' },
  { name: 'Sports', icon: '⚽', color: 'hsl(15, 66%, 55%)' },
  { name: 'Art', icon: '🎨', color: 'hsl(290, 60%, 55%)' },
  { name: 'Workshop', icon: '📚', color: 'hsl(170, 60%, 40%)' },
];

// ─── Helpers ───

export const getEventById = (id: string) => mockEvents.find(e => e.id === id);
export const getBookingsForUser = (userId: string) => mockBookings.filter(b => b.userId === userId);
export const getBookingsForEvent = (eventId: string) => mockBookings.filter(b => b.eventId === eventId);
export const getReviewsForEvent = (eventId: string) => mockReviews.filter(r => r.eventId === eventId);
export const getEventsByCategory = (category: string) => mockEvents.filter(e => e.category === category);
export const getEventsCount = (category: string) => mockEvents.filter(e => e.category === category).length;
export const validatePromoCode = (code: string, eventId: string): { valid: boolean; discount: number; error?: string } => {
  const promo = mockPromoCodes.find(p => p.code === code.toUpperCase());
  if (!promo) return { valid: false, discount: 0, error: 'Invalid promo code' };
  if (new Date(promo.expiresAt) < new Date()) return { valid: false, discount: 0, error: 'Promo code expired' };
  if (promo.usedCount >= promo.maxUses) return { valid: false, discount: 0, error: 'Promo code limit reached' };
  if (!promo.validFor.includes('all') && !promo.validFor.includes(eventId)) return { valid: false, discount: 0, error: 'Code not valid for this event' };
  return { valid: true, discount: promo.discount };
};
