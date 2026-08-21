import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import EventCard from '@/components/EventCard';
import { mockEvents } from '@/data/mockData';
import { Search, Sparkles, Zap, Shield, ArrowRight } from 'lucide-react';
import { useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const trustPoints = [
  { icon: Zap, label: 'Real-time booking' },
  { icon: Shield, label: 'Zero double bookings' },
  { icon: Sparkles, label: 'Instant e-tickets' },
];

const EventsPage = () => {
  // The hero search and the footer's category links both navigate in with
  // state, e.g. navigate('/events', { state: { category: 'Music' } }) or
  // { state: { search: 'jazz' } }.
  const location = useLocation();
  const { user } = useAuth();
  const routerState = location.state as { category?: string; search?: string } | null;

  const [search, setSearch] = useState(routerState?.search || '');
  const [category, setCategory] = useState(routerState?.category || 'All');

  // One thumbnail + live count per category, derived from the actual event
  // catalog rather than a hardcoded list — same single source of truth the
  // grid below filters against, so there is exactly one place to pick a
  // category instead of two disconnected controls.
  const categoryChips = useMemo(() => {
    const byCategory = new Map<string, { image: string; count: number }>();
    mockEvents.forEach(e => {
      const entry = byCategory.get(e.category);
      if (entry) entry.count += 1;
      else byCategory.set(e.category, { image: e.bannerUrl, count: 1 });
    });
    return [
      { name: 'All', image: null, count: mockEvents.length },
      ...Array.from(byCategory.entries()).map(([name, v]) => ({ name, ...v })),
    ];
  }, []);

  // Featured events sort first within one consistent grid — a dedicated
  // spotlight badge (see EventCard) does the emphasis instead of a second,
  // differently-shaped layout bolted on above it.
  const filtered = useMemo(() => {
    return mockEvents
      .filter(e => {
        const matchSearch = e.title.toLowerCase().includes(search.toLowerCase()) || e.venue.toLowerCase().includes(search.toLowerCase());
        const matchCat = category === 'All' || e.category === category;
        return matchSearch && matchCat;
      })
      .sort((a, b) => Number(b.featured) - Number(a.featured));
  }, [search, category]);

  const selectCategory = (cat: string) => {
    setCategory(cat);
    setSearch('');
    // No programmatic scroll here: the chip strip is sticky and the grid
    // sits directly beneath it, so the filtered results are already in
    // view the moment you tap a chip — forcing a scrollIntoView on top of
    // that just produced an extra, unwanted jump.
  };

  return (
    <AnimatedPage className="min-h-screen pt-16">
      {/* Filter bar — search + category chips, one control surface that the
          grid directly beneath it reacts to live. Sticky so the category
          you're in stays visible while scrolling a long result list. */}
      <section
        className="sticky top-16 z-30 border-b backdrop-blur-xl"
        style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--background) / 0.92)' }}
      >
        <div className="container mx-auto px-4 pt-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
            <h1 className="font-display text-3xl shrink-0">
              {search ? 'Search results' : category === 'All' ? 'All events' : category}
            </h1>
            <div className="relative sm:ml-auto w-full sm:w-72">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search events, venues..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="input-glass !py-2.5 !pl-10 !pr-4 text-sm"
              />
            </div>
          </div>

          {/* Category chips — horizontal scroll, thumbnail + name + count */}
          <div className="flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 scrollbar-none">
            {categoryChips.map(chip => {
              const isActive = category === chip.name;
              return (
                <button
                  key={chip.name}
                  onClick={() => selectCategory(chip.name)}
                  className="shrink-0 flex items-center gap-2 pl-1.5 pr-4 py-1.5 rounded-full transition-all duration-200"
                  style={{
                    background: isActive ? 'hsl(var(--primary) / 0.12)' : 'hsl(var(--secondary))',
                    border: `1px solid ${isActive ? 'hsl(var(--primary) / 0.4)' : 'hsl(var(--border))'}`,
                    boxShadow: isActive ? '0 0 14px -6px hsl(var(--primary) / 0.35)' : 'none',
                  }}
                >
                  <span
                    className="w-7 h-7 rounded-full overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: 'hsl(var(--muted))' }}
                  >
                    {chip.image ? (
                      <img src={chip.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="w-2 h-2 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
                    )}
                  </span>
                  <span
                    className="text-sm font-medium whitespace-nowrap"
                    style={{ color: isActive ? 'hsl(var(--primary))' : 'hsl(var(--foreground))' }}
                  >
                    {chip.name}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    {chip.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Results grid — directly under the filter bar, every card the same shape */}
      <section className="container mx-auto px-4 py-10">
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
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((e, i) => (
              <StaggerItem key={e.id}>
                <EventCard event={e} index={i} />
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* Trust strip — a single quiet line, not a 3-column feature section
          competing with the grid above for attention. */}
      <section className="border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="container mx-auto px-4 py-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
          {trustPoints.map(({ icon: Icon, label }) => (
            <span key={label} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Icon className="w-3.5 h-3.5 text-primary" />
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Closing CTA — guests only */}
      {!user && (
        <section className="border-t" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--secondary))' }}>
          <div className="container mx-auto px-4 py-20 text-center max-w-xl">
            <h2 className="font-display text-3xl sm:text-4xl mb-4">
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

export default EventsPage;
