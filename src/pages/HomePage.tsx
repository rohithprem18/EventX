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
      {/* Hero */}
      <section className="relative overflow-hidden py-16 sm:py-24 px-4">
        <div className="absolute inset-0 opacity-20" style={{ background: 'radial-gradient(ellipse at 50% 0%, hsl(239 84% 67% / 0.3), transparent 70%)' }} />
        <div className="container mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="font-heading text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6">
              Book Tickets.
              <br />
              <span className="gradient-text">Lightning Fast.</span>
            </h1>
            <p className="text-muted-foreground text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-8 sm:mb-10">
              Secure your seats to the hottest events with our high-concurrency booking engine. No double bookings. No stress.
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="max-w-xl mx-auto relative"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
            />
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 sm:gap-8 mt-8 sm:mt-12 text-xs sm:text-sm"
          >
            {[
              { icon: Zap, label: 'Real-time booking', color: 'text-primary' },
              { icon: Shield, label: 'No double bookings', color: 'text-accent' },
              { icon: Sparkles, label: 'Instant tickets', color: 'text-yellow-400' },
            ].map(({ icon: Icon, label, color }) => (
              <span key={label} className="flex items-center gap-2 text-muted-foreground">
                <Icon className={`w-4 h-4 ${color}`} /> {label}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured */}
      {!search && category === 'All' && (
        <section className="container mx-auto px-4 mb-16">
          <h2 className="font-heading text-2xl font-bold mb-6">Featured Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featured.map((e, i) => (
              <EventCard key={e.id} event={e} index={i} />
            ))}
          </div>
        </section>
      )}

      {/* All Events */}
      <section className="container mx-auto px-4 pb-20">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <h2 className="font-heading text-2xl font-bold">
            {search ? 'Search Results' : 'Upcoming Events'}
          </h2>
          <div className="flex gap-2 flex-wrap">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`text-sm px-3 py-1.5 rounded-full border transition-all ${
                  category === cat
                    ? 'bg-primary/20 border-primary/40 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No events found</p>
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
