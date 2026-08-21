import { AnimatedPage } from '@/components/AnimatedPage';
import { Search, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Muted, looping crowd/stage footage for the hero backdrop — the same
// treatment a venue's own site would use, not a stock "hero video" cliché.
const heroVideo = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260314_131748_f2ca2a28-fed7-44c8-b9a9-bd9acdd5ec31.mp4';

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  const goToEvents = () => {
    navigate('/events', search.trim() ? { state: { search: search.trim() } } : undefined);
  };

  return (
    <AnimatedPage className="min-h-screen">
      {/* Hero — fullscreen looping video, single viewport. Every path off
          this page (search, CTA) leads to /events, the real browsing
          surface, instead of stacking that content underneath a scroll. */}
      <section className="relative h-[100dvh] min-h-[640px] flex flex-col items-center justify-center overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        {/* Legibility scrim — one consistent navy tint, darkest at the edges
            where text and nav sit, not a decorative gradient. */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to top, hsl(201 55% 6% / 0.92) 0%, hsl(201 55% 6% / 0.35) 45%, hsl(201 55% 6% / 0.55) 100%)',
          }}
        />

        <div className="relative z-10 flex flex-col items-center text-center px-6 pt-32 pb-24 max-w-4xl mx-auto">
          <h1
            className="animate-fade-rise text-5xl sm:text-7xl md:text-8xl leading-[0.95] tracking-[-2px] text-white font-normal"
            style={{ fontFamily: "'Instrument Serif', Georgia, serif" }}
          >
            The seat you pick<br />
            is <em className="not-italic text-white/55">the seat you get.</em>
          </h1>
          <p className="animate-fade-rise-delay text-white/70 text-base sm:text-lg max-w-xl mt-8 leading-relaxed">
            Every seat is locked server-side the instant you select it — real venues,
            real-time availability, and a ticket in hand before the page even reloads.
          </p>

          <div className="animate-fade-rise-delay-2 relative w-full max-w-lg mt-12 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-white/50 transition-colors group-focus-within:text-white" />
            <input
              type="text"
              placeholder="Search events, venues..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') goToEvents(); }}
              className="liquid-glass w-full pl-12 pr-5 py-4 rounded-full text-base text-white placeholder:text-white/45 focus:outline-none"
            />
          </div>

          <button
            onClick={goToEvents}
            className="animate-fade-rise-delay-2 liquid-glass rounded-full px-8 py-3.5 mt-6 text-sm text-white inline-flex items-center gap-2 transition-transform duration-300 hover:scale-[1.03]"
          >
            Explore all events <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </AnimatedPage>
  );
};

export default HomePage;
