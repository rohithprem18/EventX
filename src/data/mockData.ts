// Banner art: hand-built SVG illustrations (public/banners/), one per
// category, in the app's own gold/crimson brand palette — not stock
// photography. No image-generation tool is wired into this environment and
// Unsplash's old keyword-search endpoint (source.unsplash.com) has been
// dead since 2023, so a seeded-photo approach couldn't guarantee India-
// relevant imagery; hand-drawn category art sidesteps that entirely and
// reuses the same technique as docs/banner-*.svg.
const banner = (category: string) => `/banners/${category}.svg`;

const bannerMusic = banner('music');
const bannerTech = banner('tech');
const bannerComedy = banner('comedy');
const bannerFilm = banner('film');
const bannerFood = banner('food');
const bannerSports = banner('sports');
const bannerArt = banner('art');
const bannerWorkshop = banner('workshop');

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
  { id: 'u1', name: 'Aarav Mehta', email: 'aarav@example.com', role: 'user', joinedAt: '2025-09-15' },
  { id: 'u2', name: 'Admin User', email: 'admin@example.com', role: 'admin', joinedAt: '2025-01-01' },
];

// ─── Mock Events ───

export const mockEvents: Event[] = [
  {
    id: 'e1',
    title: 'Neon Nights Music Festival',
    description: 'Experience an electrifying evening of live performances from top electronic and indie artists, under a canopy of marigold lights and diyas. State-of-the-art sound systems, immersive light shows, and an atmosphere that will keep you dancing until dawn. Featuring artists from across the country, this is the must-attend music event of the year.',
    date: '2026-08-15T19:00:00',
    venue: 'Jio World Garden, Mumbai',
    ticketPrice: 2999,
    totalTickets: 500,
    availableTickets: 342,
    bannerUrl: bannerMusic,
    category: 'Music',
    featured: true,
    organizer: 'Bombay Nights Entertainment',
    tags: ['electronic', 'festival', 'live-music', 'nightlife'],
    ageRestriction: '18+',
    duration: '6 hours',
    highlights: [
      'India\'s top electronic & indie artists',
      'State-of-the-art Dolby Atmos sound',
      'Immersive 360° light show',
      'VIP lounge with premium bar',
      'Street-food court with 20+ stalls',
    ],
    ticketTiers: [
      { id: 't1-ga', name: 'General Admission', price: 2999, available: 250, total: 300, perks: ['Standing area access', 'Food court access'] },
      { id: 't1-vip', name: 'VIP', price: 6999, available: 72, total: 150, perks: ['Front-row standing', 'VIP lounge access', 'Premium bar', 'Meet & greet'] },
      { id: 't1-plat', name: 'Platinum', price: 12999, available: 20, total: 50, perks: ['Backstage pass', 'Artist dinner', 'VIP lounge', 'Premium bar', 'Exclusive merch'] },
    ],
    rating: 4.7,
    reviewCount: 234,
    gallery: [bannerMusic],
    artists: ['DJ Kranti', 'Meher Kaur', 'The Deccan Beats', 'Starlight Bhangra'],
    status: 'selling-fast',
  },
  {
    id: 'e2',
    title: 'Tech Horizon Summit 2026',
    description: 'Join industry leaders and innovators at India\'s premier technology conference. Keynotes on AI, quantum computing, and the future of human-computer interaction. Network with 1000+ professionals and discover the next wave of innovation coming out of India\'s tech hubs.',
    date: '2026-09-20T09:00:00',
    venue: 'Bangalore International Exhibition Centre, Bengaluru',
    ticketPrice: 6999,
    totalTickets: 1000,
    availableTickets: 687,
    bannerUrl: bannerTech,
    category: 'Tech',
    featured: true,
    organizer: 'TechVerse India',
    tags: ['technology', 'AI', 'conference', 'networking'],
    duration: '8 hours',
    highlights: [
      'Keynotes from unicorn-startup CTOs',
      'Hands-on AI/ML workshops',
      'Startup pitch competition (₹40L prize pool)',
      'Networking mixer with 1000+ pros',
      'Exhibition hall with 50+ booths',
    ],
    ticketTiers: [
      { id: 't2-early', name: 'Early Bird', price: 4999, available: 100, total: 200, perks: ['All sessions access', 'Lunch included', 'Conference swag bag'] },
      { id: 't2-ga', name: 'General', price: 6999, available: 487, total: 600, perks: ['All sessions access', 'Lunch included'] },
      { id: 't2-vip', name: 'VIP', price: 17999, available: 100, total: 200, perks: ['Front-row seating', 'Speaker dinner', 'Private networking', 'Workshop access'] },
    ],
    rating: 4.9,
    reviewCount: 512,
    gallery: [bannerTech],
    artists: ['Dr. Ananya Krishnan (AI)', 'Rohan Mehta (Quantum)', 'Priya Nair (Robotics)'],
    status: 'upcoming',
  },
  {
    id: 'e3',
    title: 'Stand-Up Comedy Night',
    description: 'An evening of non-stop laughter featuring five of the hottest comedians on the circuit. Great chai and snacks, great vibes, and guaranteed belly laughs. Perfect for a date night or group outing.',
    date: '2026-08-28T20:00:00',
    venue: 'Canvas Laugh Club, Mumbai',
    ticketPrice: 799,
    totalTickets: 200,
    availableTickets: 23,
    bannerUrl: bannerComedy,
    category: 'Comedy',
    featured: false,
    organizer: 'Canvas Comedy Productions',
    tags: ['comedy', 'stand-up', 'nightlife', 'entertainment'],
    ageRestriction: '18+',
    duration: '2.5 hours',
    highlights: [
      '5 top-circuit comedians',
      'One beverage included',
      'Intimate 200-seat venue',
      'Post-show meet & greet',
    ],
    ticketTiers: [
      { id: 't3-ga', name: 'General', price: 799, available: 15, total: 150, perks: ['Standard seating', 'One beverage included'] },
      { id: 't3-front', name: 'Front Row', price: 1499, available: 8, total: 50, perks: ['Front row seats', 'Two beverages', 'Meet & greet access'] },
    ],
    rating: 4.5,
    reviewCount: 89,
    gallery: [bannerComedy],
    artists: ['Rohan Desai', 'Priya Sharma', 'Aditya Mehta', 'Kavya Iyer', 'Farhan Ali'],
    status: 'selling-fast',
  },
  {
    id: 'e4',
    title: 'Midnight Cinema: Classics Under Stars',
    description: 'Watch iconic films projected onto a massive outdoor screen. Bring blankets, enjoy gourmet popcorn, and relive cinema magic under the night sky. This month: Sholay (1975 restored print).',
    date: '2026-08-05T21:00:00',
    venue: 'Phoenix Palladium Rooftop, Mumbai',
    ticketPrice: 499,
    totalTickets: 150,
    availableTickets: 98,
    bannerUrl: bannerFilm,
    category: 'Film',
    featured: false,
    organizer: 'Moonlight Cinema India',
    tags: ['cinema', 'outdoor', 'classics', 'rooftop'],
    duration: '3 hours',
    highlights: [
      'Massive 40-ft outdoor screen',
      'Gourmet popcorn & snacks included',
      'Blankets & cushions provided',
      'Pre-show trivia with prizes',
    ],
    ticketTiers: [
      { id: 't4-ga', name: 'General', price: 499, available: 80, total: 120, perks: ['Lawn seating', 'Popcorn included'] },
      { id: 't4-prem', name: 'Premium', price: 999, available: 18, total: 30, perks: ['Bean bag seating', 'Gourmet snack box', 'Drink voucher'] },
    ],
    rating: 4.3,
    reviewCount: 67,
    gallery: [bannerFilm],
    status: 'upcoming',
  },
  {
    id: 'e5',
    title: 'Artisan Food & Wine Expo',
    description: 'Discover handcrafted flavors from over 100 artisan vendors. Wine tastings, cooking demos, and exclusive pairings from India\'s finest sommeliers, set among the vineyards. A paradise for food lovers.',
    date: '2026-10-12T11:00:00',
    venue: 'Sula Vineyards, Nashik',
    ticketPrice: 2499,
    totalTickets: 800,
    availableTickets: 560,
    bannerUrl: bannerFood,
    category: 'Food',
    featured: true,
    organizer: 'Sula Culinary Collective',
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
      { id: 't5-ga', name: 'General', price: 2499, available: 400, total: 500, perks: ['All vendor access', '10 wine tasting tokens'] },
      { id: 't5-prem', name: 'Connoisseur', price: 5999, available: 120, total: 200, perks: ['Unlimited tastings', 'VIP cooking demo', 'Sommelier session', 'Gift bag'] },
      { id: 't5-vip', name: 'Grand Cru', price: 9999, available: 40, total: 100, perks: ['Private vineyard tour', 'Chef\'s table dinner', 'All Connoisseur perks', 'Rare wine bottle'] },
    ],
    rating: 4.8,
    reviewCount: 345,
    gallery: [bannerFood],
    status: 'upcoming',
  },
  {
    id: 'e6',
    title: 'Electronic Pulse DJ Night',
    description: 'Feel the bass drop with the country\'s most in-demand DJs spinning sets that will shake the venue. Immersive visuals and top-tier production. The ultimate beachside nightlife experience.',
    date: '2026-08-22T22:00:00',
    venue: 'Sunburn Arena, Goa',
    ticketPrice: 1499,
    totalTickets: 400,
    availableTickets: 210,
    bannerUrl: bannerMusic,
    category: 'Music',
    featured: false,
    organizer: 'Sunburn Collective',
    tags: ['electronic', 'DJ', 'nightlife', 'dance'],
    ageRestriction: '21+',
    duration: '5 hours',
    highlights: [
      '3 nationally touring DJs',
      'Beachside open-air setting',
      'Custom LED visual installation',
      'Premium sound system',
    ],
    ticketTiers: [
      { id: 't6-ga', name: 'General', price: 1499, available: 160, total: 300, perks: ['Dance floor access'] },
      { id: 't6-vip', name: 'VIP', price: 3999, available: 50, total: 100, perks: ['Elevated VIP platform', 'Private bar', 'Skip the line'] },
    ],
    rating: 4.4,
    reviewCount: 178,
    gallery: [bannerMusic],
    artists: ['DJ Nexus India', 'Tanvi Kapoor', 'BeatCraft Collective'],
    status: 'upcoming',
  },
  {
    id: 'e7',
    title: 'Championship League Finals',
    description: 'Witness the most anticipated cricket match of the season. Two elite teams battle for the championship trophy in an electrifying atmosphere with over 80,000 fans inside India\'s largest stadium.',
    date: '2026-09-10T18:00:00',
    venue: 'Narendra Modi Stadium, Ahmedabad',
    ticketPrice: 2999,
    totalTickets: 600,
    availableTickets: 45,
    bannerUrl: bannerSports,
    category: 'Sports',
    featured: true,
    organizer: 'Premier Cricket League',
    tags: ['sports', 'cricket', 'championship', 'finals'],
    duration: '4 hours',
    highlights: [
      'Championship finals match',
      'Pre-match fan zone with activities',
      'Innings-break live performance',
      'Commemorative merchandise',
      'Fireworks finale',
    ],
    ticketTiers: [
      { id: 't7-upper', name: 'Upper Stand', price: 2999, available: 20, total: 300, perks: ['Upper level seating', 'Fan zone access'] },
      { id: 't7-lower', name: 'Lower Stand', price: 7999, available: 15, total: 200, perks: ['Lower level seating', 'Fan zone', 'Food voucher'] },
      { id: 't7-pitch', name: 'Pitch View Pavilion', price: 24999, available: 10, total: 100, perks: ['Pitch-view seats', 'Nets session tour', 'All perks'] },
    ],
    rating: 4.9,
    reviewCount: 891,
    gallery: [bannerSports],
    status: 'selling-fast',
  },
  {
    id: 'e8',
    title: 'Contemporary Art Exhibition',
    description: 'Explore groundbreaking works from 30 emerging artists pushing the boundaries of contemporary Indian art. Interactive installations, live painting sessions, and curator-led tours.',
    date: '2026-09-05T10:00:00',
    venue: 'Jehangir Art Gallery, Mumbai',
    ticketPrice: 599,
    totalTickets: 300,
    availableTickets: 220,
    bannerUrl: bannerArt,
    category: 'Art',
    featured: false,
    organizer: 'Mumbai Arts Council',
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
      { id: 't8-ga', name: 'General', price: 599, available: 180, total: 250, perks: ['Gallery access', 'Self-guided tour'] },
      { id: 't8-guided', name: 'Guided Experience', price: 1299, available: 40, total: 50, perks: ['Curator-led tour', 'Artist meet', 'Catalog included'] },
    ],
    rating: 4.6,
    reviewCount: 123,
    gallery: [bannerArt],
    status: 'upcoming',
  },
  {
    id: 'e9',
    title: 'Creative Writing Workshop',
    description: 'A full-day immersive workshop led by bestselling Indian authors. Learn storytelling techniques, character development, and get personalized feedback on your work.',
    date: '2026-10-01T09:00:00',
    venue: 'India Habitat Centre, New Delhi',
    ticketPrice: 1999,
    totalTickets: 50,
    availableTickets: 32,
    bannerUrl: bannerWorkshop,
    category: 'Workshop',
    featured: false,
    organizer: 'Indian Literary Guild',
    tags: ['workshop', 'writing', 'creative', 'learning'],
    duration: '6 hours',
    highlights: [
      'Led by 2 bestselling Indian authors',
      'Small group (50 max)',
      'Personalized manuscript feedback',
      'Publishing industry Q&A',
      'Lunch & refreshments included',
    ],
    ticketTiers: [
      { id: 't9-ga', name: 'Workshop Pass', price: 1999, available: 25, total: 40, perks: ['All sessions', 'Lunch included', 'Digital materials'] },
      { id: 't9-mentor', name: 'Mentorship', price: 4999, available: 7, total: 10, perks: ['All sessions', '1-on-1 manuscript review', 'Author dinner'] },
    ],
    rating: 4.8,
    reviewCount: 56,
    gallery: [bannerWorkshop],
    artists: ['Anjali Rao (Author)', 'Vikram Sethi (Author)'],
    status: 'upcoming',
  },
  {
    id: 'e10',
    title: 'Yoga & Wellness Retreat',
    description: 'A transformative day of yoga, meditation, and wellness workshops on the banks of the Ganges, in the world\'s yoga capital. Disconnect from the hustle and reconnect with yourself.',
    date: '2026-09-15T07:00:00',
    venue: 'Parmarth Niketan Ashram, Rishikesh',
    ticketPrice: 1499,
    totalTickets: 100,
    availableTickets: 65,
    bannerUrl: bannerWorkshop,
    category: 'Workshop',
    featured: false,
    organizer: 'Rishikesh Wellness Collective',
    tags: ['wellness', 'yoga', 'meditation', 'retreat'],
    duration: '8 hours',
    highlights: [
      'Morning sunrise yoga session on the ghats',
      'Guided meditation workshops',
      'Sound healing experience',
      'Organic plant-based lunch',
      'Take-home wellness kit',
    ],
    ticketTiers: [
      { id: 't10-day', name: 'Day Pass', price: 1499, available: 50, total: 75, perks: ['All sessions', 'Lunch included'] },
      { id: 't10-full', name: 'Full Experience', price: 3499, available: 15, total: 25, perks: ['All sessions', 'Private session', 'Wellness kit', 'Lunch'] },
    ],
    rating: 4.7,
    reviewCount: 98,
    gallery: [bannerWorkshop],
    status: 'upcoming',
  },
  {
    id: 'e11',
    title: 'Indie Film Festival',
    description: 'Three days of independent cinema showcasing 20 award-winning short films and 5 feature films. Q&A sessions with directors, industry panels, and an awards ceremony.',
    date: '2026-11-08T10:00:00',
    venue: 'Siri Fort Auditorium, New Delhi',
    ticketPrice: 999,
    totalTickets: 400,
    availableTickets: 380,
    bannerUrl: bannerFilm,
    category: 'Film',
    featured: false,
    organizer: 'Delhi Independent Film Society',
    tags: ['film', 'indie', 'festival', 'cinema'],
    duration: '10 hours',
    highlights: [
      '25 curated independent films',
      'Director Q&A sessions',
      'Industry networking panels',
      'Awards ceremony & afterparty',
    ],
    ticketTiers: [
      { id: 't11-day', name: 'Day Pass', price: 999, available: 300, total: 350, perks: ['All screenings for one day'] },
      { id: 't11-full', name: 'Festival Pass', price: 2999, available: 80, total: 50, perks: ['All 3 days', 'Afterparty access', 'Festival merch'] },
    ],
    rating: 4.4,
    reviewCount: 45,
    gallery: [bannerFilm],
    status: 'upcoming',
  },
  {
    id: 'e12',
    title: 'Jazz Under the Sea Link',
    description: 'An intimate evening of world-class jazz in a unique waterfront setting. Local and international jazz artists perform beneath the Bandra-Worli Sea Link with the Mumbai skyline as backdrop.',
    date: '2026-08-30T19:30:00',
    venue: 'Mahim Bay Amphitheatre, Mumbai',
    ticketPrice: 999,
    totalTickets: 250,
    availableTickets: 0,
    bannerUrl: bannerMusic,
    category: 'Music',
    featured: false,
    organizer: 'Mumbai Jazz Collective',
    tags: ['jazz', 'live-music', 'outdoor', 'intimate'],
    duration: '3 hours',
    highlights: [
      'Waterfront performance space',
      'Mumbai skyline backdrop',
      '4 acclaimed jazz ensembles',
      'Artisan cocktail bar',
    ],
    ticketTiers: [
      { id: 't12-ga', name: 'General', price: 999, available: 0, total: 200, perks: ['Standing area', 'One drink token'] },
      { id: 't12-seated', name: 'Reserved Seating', price: 2499, available: 0, total: 50, perks: ['Reserved table', 'Two drink tokens', 'Appetizer plate'] },
    ],
    rating: 4.9,
    reviewCount: 267,
    gallery: [bannerMusic],
    artists: ['The Konkan Quartet', 'Meera & the Ragas', 'Bombay Brass Ensemble'],
    status: 'sold-out',
  },
];

// ─── Mock Reviews ───

export const mockReviews: Review[] = [
  { id: 'r1', userId: 'u1', userName: 'Aarav Mehta', eventId: 'e1', rating: 5, comment: 'Absolutely incredible experience! The light show was out of this world and the sound quality was perfect. Will definitely attend again next year.', date: '2026-04-20', helpful: 24 },
  { id: 'r2', userId: 'u3', userName: 'Sneha Reddy', eventId: 'e1', rating: 4, comment: 'Great lineup and amazing atmosphere. Only docked one star because the food lines were quite long during peak hours.', date: '2026-04-18', helpful: 12 },
  { id: 'r3', userId: 'u4', userName: 'Rohan Kapoor', eventId: 'e1', rating: 5, comment: 'The VIP experience was worth every rupee. Backstage access was a dream come true. Production quality was top-notch.', date: '2026-04-21', helpful: 31 },
  { id: 'r4', userId: 'u5', userName: 'Ishita Verma', eventId: 'e2', rating: 5, comment: 'Best tech conference I\'ve ever attended. The AI workshops were incredibly hands-on and the networking opportunities were invaluable.', date: '2026-05-25', helpful: 45 },
  { id: 'r5', userId: 'u6', userName: 'Karan Malhotra', eventId: 'e2', rating: 5, comment: 'The keynote speakers were world-class. Dr. Krishnan\'s talk on AGI was mind-blowing. Already bought my ticket for next year.', date: '2026-05-22', helpful: 38 },
  { id: 'r6', userId: 'u7', userName: 'Divya Nair', eventId: 'e3', rating: 4, comment: 'Laughed non-stop for 2 hours straight. Rohan Desai was hilarious! The venue was cozy and the drinks were reasonably priced.', date: '2026-03-30', helpful: 8 },
  { id: 'r7', userId: 'u8', userName: 'Aditya Joshi', eventId: 'e5', rating: 5, comment: 'A foodie\'s paradise. The wine pairings were exceptional and I discovered so many new artisan brands. The sommelier session was the highlight.', date: '2026-06-15', helpful: 19 },
  { id: 'r8', userId: 'u9', userName: 'Nina Patel', eventId: 'e7', rating: 5, comment: 'What an atmosphere! 80,000 fans all cheering together. The fireworks finale was spectacular. Once-in-a-lifetime experience.', date: '2026-09-12', helpful: 67 },
  { id: 'r9', userId: 'u10', userName: 'Kabir Chatterjee', eventId: 'e12', rating: 5, comment: 'The most magical evening. Jazz beneath the Sea Link with the Mumbai skyline... doesn\'t get more Bombay than this. Pure perfection.', date: '2026-09-01', helpful: 52 },
  { id: 'r10', userId: 'u11', userName: 'Ananya Bhatt', eventId: 'e10', rating: 5, comment: 'Truly transformative. The sound healing session brought me to tears. Left feeling completely recharged and at peace. The organic lunch was delicious too.', date: '2026-09-18', helpful: 23 },
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
  { name: 'Sports', icon: '🏏', color: 'hsl(15, 66%, 55%)' },
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
