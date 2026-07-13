import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import EventCard from '@/components/EventCard';
import { mockEvents } from '@/data/mockData';
import { motion } from 'framer-motion';
import { Search, Sparkles, Zap, Shield } from 'lucide-react';
import { useState, useMemo } from 'react';

const HomePage = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  const categories = ['All', ...Array.from(new Set(mockEvents.map(e => e.category)))];

  const filtered = useMemo(() => {
    return mockEvents.filter(e => {
      const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase());
      const matchCat = category === 'All' || e.category === category;
      return matchSearch && matchCat;
    });
  }, [search, category]);

  const featured = mockEvents.filter(e => e.featured);

  return (
    <AnimatedPage className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32 px-4">
        {/* Animated mesh background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.07] animate-pulse-glow blur-3xl"
            style={{ background: 'hsl(265, 90%, 65%)' }} />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.05] animate-pulse-glow blur-3xl"
            style={{ background: 'hsl(15, 90%, 62%)', animationDelay: '1.5s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full opacity-[0.04] animate-pulse-glow blur-3xl"
            style={{ background: 'hsl(290, 85%, 55%)', animationDelay: '3s' }} />
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: 'radial-gradient(circle, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-heading text-4xl sm:text-6xl md:text-8xl font-extrabold mb-6 leading-[0.95] tracking-tight">
              Book Tickets.
              <br />
              <span className="gradient-text">Lightning Fast.</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
              Secure your seats to the hottest events with our high-concurrency booking engine. 
              No double bookings. No stress. Just unforgettable experiences.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="max-w-xl mx-auto relative group"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground transition-colors group-focus-within:text-primary" />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-glass w-full pl-12 pr-4 py-4 rounded-xl text-base"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-6 mt-10 sm:mt-14"
          >
            {[
              { icon: Zap, label: 'Real-time booking', color: 'hsl(265, 90%, 65%)' },
              { icon: Shield, label: 'No double bookings', color: 'hsl(15, 90%, 62%)' },
              { icon: Sparkles, label: 'Instant tickets', color: 'hsl(45, 95%, 55%)' },
            ].map(({ icon: Icon, label, color }) => (
              <span
                key={label}
                className="flex items-center gap-2.5 text-sm text-muted-foreground px-4 py-2 rounded-lg"
                style={{
                  background: 'hsla(var(--glass-bg))',
                  border: '1px solid hsl(var(--border))',
                }}
              >
                <Icon className="w-4 h-4" style={{ color }} /> {label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {!search && category === 'All' && (
        <section className="container mx-auto px-4 mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-1 h-6 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
            <h2 className="font-heading text-2xl font-bold">Featured Events</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All Events */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 rounded-full" style={{ background: 'var(--gradient-accent)' }} />
            <h2 className="font-heading text-2xl font-bold">
              {search ? 'Search Results' : 'Upcoming Events'}
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
    </AnimatedPage>
  );
};

export default HomePage;
