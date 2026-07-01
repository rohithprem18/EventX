import { Event } from '@/data/mockData';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Ticket } from 'lucide-react';
import { format } from 'date-fns';

const categoryColors: Record<string, string> = {
  Music: 'bg-primary/20 text-primary',
  Tech: 'bg-accent/20 text-accent',
  Comedy: 'bg-yellow-500/20 text-yellow-400',
  Film: 'bg-rose-500/20 text-rose-400',
  Food: 'bg-emerald-500/20 text-emerald-400',
};

const EventCard = ({ event, index = 0 }: { event: Event; index?: number }) => {
  const availability = event.availableTickets / event.totalTickets;
  const availColor = availability > 0.3 ? 'text-emerald-400' : availability > 0.1 ? 'text-yellow-400' : 'text-rose-400';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
    >
      <Link to={`/event/${event.id}`} className="block glass-card overflow-hidden group">
        <div className="h-48 relative overflow-hidden">
          <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-card/60 to-transparent" />
          <div className="absolute bottom-3 left-3">
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${categoryColors[event.category] || 'bg-muted text-muted-foreground'}`}>
              {event.category}
            </span>
          </div>
          {event.featured && (
            <div className="absolute top-3 right-3 text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30">
              Featured
            </div>
          )}
        </div>
        <div className="p-5 space-y-3">
          <h3 className="font-heading font-semibold text-lg text-foreground group-hover:text-primary transition-colors line-clamp-1">
            {event.title}
          </h3>
          <div className="flex flex-col gap-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(event.date), 'MMM dd, yyyy · h:mm a')}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              {event.venue}
            </span>
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <span className="font-heading font-bold text-lg text-foreground">${event.ticketPrice}</span>
            <span className={`text-xs font-medium flex items-center gap-1 ${availColor}`}>
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
