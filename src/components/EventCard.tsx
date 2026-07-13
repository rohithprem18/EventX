import { Event } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';

// Text lightness rides on the shared --tint-fg-l token so every category tag
// stays readable in both themes (darker on light, brighter on dark).
const categoryColors: Record<string, { bg: string; text: string; glow: string }> = {
  Music: { bg: 'hsla(265, 68%, 60%, 0.15)', text: 'hsl(265, 68%, var(--tint-fg-l))', glow: 'hsla(265, 68%, 60%, 0.2)' },
  Tech: { bg: 'hsla(200, 68%, 46%, 0.15)', text: 'hsl(200, 68%, var(--tint-fg-l))', glow: 'hsla(200, 68%, 46%, 0.2)' },
  Comedy: { bg: 'hsla(45, 70%, 50%, 0.15)', text: 'hsl(45, 70%, var(--tint-fg-l))', glow: 'hsla(45, 70%, 50%, 0.2)' },
  Film: { bg: 'hsla(340, 62%, 52%, 0.15)', text: 'hsl(340, 62%, var(--tint-fg-l))', glow: 'hsla(340, 62%, 52%, 0.2)' },
  Food: { bg: 'hsla(155, 62%, 44%, 0.15)', text: 'hsl(155, 62%, var(--tint-fg-l))', glow: 'hsla(155, 62%, 44%, 0.2)' },
};

const defaultCategoryColor = { bg: 'hsla(var(--muted))', text: 'hsl(var(--muted-foreground))', glow: 'transparent' };

const EventCard = ({ event, index = 0 }: { event: Event; index?: number }) => {
  const availability = event.availableTickets / event.totalTickets;
  const availColor = availability > 0.3
    ? { text: 'hsl(155, 62%, var(--tint-fg-l))', bg: 'hsla(155, 62%, 44%, 0.12)' }
    : availability > 0.1
    ? { text: 'hsl(45, 70%, var(--tint-fg-l))', bg: 'hsla(45, 70%, 50%, 0.14)' }
    : { text: 'hsl(0, 62%, var(--tint-fg-l))', bg: 'hsla(0, 62%, 50%, 0.12)' };

  const catColor = categoryColors[event.category] || defaultCategoryColor;
  const isLowStock = availability <= 0.15 && availability > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
      whileHover={{ y: -6, transition: { duration: 0.25, ease: 'easeOut' } }}
      className="group"
    >
      <Link to={`/event/${event.id}`} className="block rounded-xl overflow-hidden transition-all duration-300" style={{
        background: 'hsl(var(--card))',
        border: '1px solid hsl(var(--border))',
        boxShadow: 'var(--shadow-card)',
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--primary) / 0.35)';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-elevated), 0 0 0 1px hsl(var(--primary) / 0.08)';
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))';
        (e.currentTarget as HTMLElement).style.boxShadow = 'var(--shadow-card)';
      }}
      >
        {/* Image */}
        <div className="h-48 relative overflow-hidden">
          <img
            src={event.bannerUrl}
            alt={event.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0" style={{
            background: 'linear-gradient(to top, hsla(225, 30%, 6%, 0.85) 0%, hsla(225, 30%, 6%, 0.2) 50%, transparent 100%)',
          }} />

          {/* Category badge */}
          <div className="absolute bottom-3 left-3">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{
              background: catColor.bg,
              color: catColor.text,
              backdropFilter: 'blur(8px)',
              boxShadow: `0 0 12px ${catColor.glow}`,
            }}>
              {event.category}
            </span>
          </div>

          {/* Featured badge */}
          {event.featured && (
            <div className="absolute top-3 right-3 text-xs font-bold px-3 py-1 rounded-full text-white"
              style={{
                background: 'var(--gradient-primary)',
                boxShadow: 'var(--shadow-glow)',
              }}>
              Featured
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-5 space-y-3">
          <h3 className="font-heading font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-1">
            {event.title}
          </h3>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-primary/70" />
              {format(new Date(event.date), 'MMM dd, yyyy · h:mm a')}
            </span>
            <span className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-accent/70" />
              {event.venue}
            </span>
          </div>
          <div className="flex items-center justify-between pt-3" style={{
            borderTop: '1px solid hsl(var(--border))',
          }}>
            <span className="font-heading font-bold text-xl text-foreground">
              ${event.ticketPrice}
            </span>
            <span className="text-xs font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{
              color: availColor.text,
              background: availColor.bg,
            }}>
              {isLowStock && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: availColor.text }} />
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: availColor.text }} />
                </span>
              )}
              <Ticket className="w-3.5 h-3.5" />
              {event.availableTickets} left
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default EventCard;
