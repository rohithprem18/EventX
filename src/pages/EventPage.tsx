import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '@/data/mockData';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin, Ticket, Users, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

const EventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const event = getEventById(id || '');

  if (!event) {
    return (
      <AnimatedPage className="min-h-screen pt-24 px-4 text-center">
        <p className="text-muted-foreground text-lg">Event not found</p>
      </AnimatedPage>
    );
  }

  const availability = event.availableTickets / event.totalTickets;
  const progressColor = availability > 0.3 ? 'bg-emerald-500' : availability > 0.1 ? 'bg-yellow-500' : 'bg-rose-500';

  return (
    <AnimatedPage className="min-h-screen pt-16">
      {/* Banner */}
      <div className="h-64 md:h-80 relative overflow-hidden">
        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-8">
          <button onClick={() => navigate(-1)} className="absolute top-6 left-4 text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-12 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">{event.category}</span>
              <h1 className="font-heading text-3xl md:text-4xl font-bold mt-4">{event.title}</h1>
            </div>

            <div className="flex flex-wrap gap-6 text-muted-foreground">
              <span className="flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" />{format(new Date(event.date), 'EEEE, MMMM dd, yyyy · h:mm a')}</span>
              <span className="flex items-center gap-2"><MapPin className="w-4 h-4 text-accent" />{event.venue}</span>
            </div>

            <div className="glass-card p-6">
              <h2 className="font-heading font-semibold text-lg mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass-card p-6 space-y-6 sticky top-24"
            >
              <div>
                <span className="text-sm text-muted-foreground">Price per ticket</span>
                <p className="font-heading text-3xl font-bold">${event.ticketPrice}</p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground flex items-center gap-1.5"><Ticket className="w-3.5 h-3.5" /> Available</span>
                  <span className="font-medium">{event.availableTickets} / {event.totalTickets}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.availableTickets / event.totalTickets) * 100}%` }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className={`h-full rounded-full ${progressColor}`}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="w-4 h-4" />
                {event.totalTickets - event.availableTickets} people attending
              </div>

              <button
                onClick={() => {
                  if (!user) {
                    navigate('/login');
                  } else {
                    navigate(`/booking/${event.id}`);
                  }
                }}
                className="btn-primary w-full text-center block"
                disabled={event.availableTickets === 0}
              >
                {event.availableTickets === 0 ? 'Sold Out' : 'Book Now'}
              </button>

              {!user && (
                <p className="text-xs text-center text-muted-foreground">Sign in required to book</p>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </AnimatedPage>
  );
};

export default EventPage;
