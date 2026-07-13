import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import EventCard from '@/components/EventCard';
import { mockEvents } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Search, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

// Seeded Picsum photograph — see the note in src/data/mockData.ts on why
// this isn't a generated or hand-rolled asset.
const heroImage = 'https://picsum.photos/seed/eventx-hero-crowd-lights/1920/1200';

const trustPoints = [
  { icon: Zap, label: 'Real-time booking', description: 'Seat availability updates live as tickets sell.' },
  { icon: Shield, label: 'Zero double bookings', description: 'Enforced by the server, not left to chance.' },
  { icon: Sparkles, label: 'Instant e-tickets', description: 'QR-coded PDF, ready the moment you check out.' },
];

const HomePage = () => {
  // The footer's category tiles (and anything else navigating in) can pass
  // a starting category via router state, e.g. navigate('/', { state: { category: 'Music' } }).
  const location = useLocation();
  const { user } = useAuth();
  const initialCategory = (location.state as { category?: string } | null)?.category;

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(initialCategory || 'All');
  const gridRef = useRef<HTMLDivElement>(null);

  const categories = ['All', ...Array.from(new Set(mockEvents.map(e => e.category)))];

  // One representative photo + live count per category, derived from the
  // actual event catalog rather than a hardcoded list.
  const categoryTiles = useMemo(() => {
    const byCategory = new Map<string, { image: string; count: number }>();
    mockEvents.forEach(e => {
      const entry = byCategory.get(e.category);
      if (entry) entry.count += 1;
      else byCategory.set(e.category, { image: e.bannerUrl, count: 1 });
    });
    return Array.from(byCategory.entries()).map(([name, v]) => ({ name, ...v }));
  }, []);

  const filtered = useMemo(() => {
    return mockEvents.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || e.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const featured = mockEvents.filter(e => e.featured);

  const goToCategory = (cat: string) => {
    setCategory(cat);
    setSearch('');
    gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <AnimatedPage className="min-h-screen">
      {/* Hero — full-bleed event photo, navbar floats over it */}
      <section className="relative h-[92dvh] min-h-[560px] flex items-end overflow-hidden">
        <img src={heroImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, hsl(225 30% 5% / 0.95) 0%, hsl(225 30% 5% / 0.6) 42%, hsl(225 30% 5% / 0.2) 70%, hsl(225 30% 5% / 0.4) 100%)',
          }}
        />

        <div className="container mx-auto px-4 relative z-10 pb-16 sm:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-2xl"
          >
            <h1 className="font-heading text-4xl sm:text-6xl md:text-7xl font-extrabold leading-[0.95] tracking-tight text-white mb-5">
              Book tickets.
              <br />
              <span className="gradient-text">Lightning fast.</span>
            </h1>
            <p className="text-base sm:text-lg max-w-lg mb-8" style={{ color: 'hsla(220, 20%, 92%, 0.8)' }}>
              Search an event, pick a seat, get a ticket — with a booking guarantee enforced
              server-side, not left to browser luck.
            </p>

            <div className="relative max-w-lg group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60 transition-colors group-focus-within:text-white" />
              <input
                type="text"
                placeholder="Search events, venues..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-base text-white placeholder:text-white/50 transition-all duration-300 focus:outline-none"
                style={{
                  background: 'hsla(225, 25%, 10%, 0.7)',
                  border: '1px solid hsla(0, 0%, 100%, 0.15)',
                  backdropFilter: 'blur(16px)',
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trust bar */}
      <section className="border-b" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 sm:grid-cols-3 gap-8">
          {trustPoints.map(({ icon: Icon, label, description }) => (
            <div key={label} className="flex items-start gap-3.5">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: 'hsl(var(--primary) / 0.1)' }}
              >
                <Icon className="w-4.5 h-4.5 text-primary" />
              </div>
              <div>
                <p className="font-heading font-bold text-sm mb-0.5">{label}</p>
                <p className="text-sm text-muted-foreground leading-snug">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Browse by category — image-led tiles */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-1 h-6 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
          <h2 className="font-heading text-2xl font-bold">Browse by category</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {categoryTiles.map(tile => (
            <button
              key={tile.name}
              onClick={() => goToCategory(tile.name)}
              className="relative aspect-[4/5] rounded-xl overflow-hidden group text-left"
            >
              <img
                src={tile.image}
                alt=""
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div
                className="absolute inset-0 transition-opacity duration-300"
                style={{
                  background: 'linear-gradient(to top, hsl(225 30% 6% / 0.9) 0%, hsl(225 30% 6% / 0.15) 55%, transparent 80%)',
                }}
              />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'hsl(var(--primary) / 0.15)' }} />
              <div className="absolute bottom-3 left-3.5 right-3">
                <p className="font-heading font-bold text-white text-sm sm:text-base">{tile.name}</p>
                <p className="text-xs text-white/70 mt-0.5">
                  {tile.count} event{tile.count > 1 ? 's' : ''}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Featured — one spotlight card, not a row of identical columns */}
      {featured.length > 0 && (
        <section className="container mx-auto px-4 pb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background: 'var(--gradient-accent)' }} />
            <h2 className="font-heading text-2xl font-bold">Featured events</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <EventCard event={featured[0]} index={0} />
            </div>
            {featured.length > 1 && (
              <div className="flex flex-col gap-6">
                {featured.slice(1, 3).map((e, i) => (
                  <EventCard key={e.id} event={e} index={i + 1} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* All Events / Search results */}
      <section ref={gridRef} className="container mx-auto px-4 pb-20 scroll-mt-24">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
            <h2 className="font-heading text-2xl font-bold">
              {search ? 'Search results' : 'Upcoming events'}
            </h2>
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className="text-sm px-4 py-2 rounded-full font-medium transition-all duration-300"
                style={{
                  background: category === cat
                    ? 'hsl(var(--primary) / 0.1)'
                    : 'transparent',
                  border: `1px solid ${
                    category === cat
                      ? 'hsl(var(--primary) / 0.35)'
                      : 'hsl(var(--border))'
                  }`,
                  color: category === cat
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--muted-foreground))',
                  ...(category === cat ? { boxShadow: '0 0 15px -5px hsl(var(--primary) / 0.2)' } : {}),
                }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{
              background: 'hsl(var(--secondary))',
              border: '1px solid hsl(var(--border))',
            }}>
              <Search className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg font-medium">No events found</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Try adjusting your search or filter</p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e, i) => (
              <StaggerItem key={e.id}>
                <EventCard event={e} index={i} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* Closing CTA — guests only */}
      {!user && (
        <section className="border-t" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
          <div className="container mx-auto px-4 py-20 text-center max-w-xl">
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold mb-4">
              Create an account to start booking
            </h2>
            <p className="text-muted-foreground mb-8">
              Sign up in seconds — this is a demo, no payment required.
            </p>
            <Link to="/signup" className="btn-primary inline-flex items-center gap-2">
              Create free account <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      )}
    </AnimatedPage>
  );
};

export default HomePage;
