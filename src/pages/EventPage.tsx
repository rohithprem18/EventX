import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '@/data/mockData';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, MapPin, Ticket, Users, ArrowLeft, Clock } from 'lucide-react';
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
  const progressColor = availability > 0.3
    ? 'hsl(155, 72%, 48%)'
    : availability > 0.1
    ? 'hsl(45, 70%, 50%)'
    : 'hsl(0, 72%, 55%)';

  const progressGlow = availability > 0.3
    ? 'hsla(155, 72%, 48%, 0.3)'
    : availability > 0.1
    ? 'hsla(45, 70%, 50%, 0.3)'
    : 'hsla(0, 72%, 55%, 0.3)';

  return (
    <AnimatedPage className="min-h-screen pt-16">
      {/* Hero Banner */}
      <div className="h-72 md:h-96 relative overflow-hidden">
        <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
        <div className="absolute inset-0" style={{
          background: `linear-gradient(to top, hsl(225, 30%, 6%) 0%, hsla(225, 30%, 6%, 0.7) 40%, hsla(225, 30%, 6%, 0.3) 70%, transparent 100%)`,
        }} />
        <div className="container mx-auto px-4 relative z-10 h-full flex items-end pb-8">
          <button
            onClick={() => navigate(-1)}
            className="absolute top-6 left-4 flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg transition-all duration-200"
            style={{
              // Always white — this button floats over the banner photo,
              // independent of the app's light/dark surface colors.
              color: '#fff',
              background: 'hsla(225, 30%, 6%, 0.45)',
              backdropFilter: 'blur(12px)',
              border: '1px solid hsla(0, 0%, 100%, 0.15)',
            }}
          >
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 mt-6 relative z-10 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Details */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-bold px-3 py-1 rounded-full" style={{
                background: 'hsl(var(--primary) / 0.1)',
                color: 'hsl(var(--primary))',
              }}>
                {event.category}
              </span>
              <h1 className="font-heading text-3xl md:text-5xl font-extrabold mt-4 leading-tight">{event.title}</h1>
            </div>

            <div className="flex flex-wrap gap-5 text-muted-foreground text-sm">
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                  background: 'hsl(var(--primary) / 0.1)',
                }}>
                  <Calendar className="w-4 h-4 text-primary" />
                </span>
                {format(new Date(event.date), 'EEEE, MMMM dd, yyyy')}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                  background: 'hsl(var(--accent) / 0.1)',
                }}>
                  <Clock className="w-4 h-4 text-accent" />
                </span>
                {format(new Date(event.date), 'h:mm a')}
              </span>
              <span className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{
                  background: 'hsl(var(--accent) / 0.1)',
                }}>
                  <MapPin className="w-4 h-4 text-accent" />
                </span>
                {event.venue}
              </span>
            </div>

            <div className="glass-card-static p-6 rounded-xl">
              <h2 className="font-heading font-bold text-lg mb-3">About this event</h2>
              <p className="text-muted-foreground leading-relaxed">{event.description}</p>
            </div>
          </div>

          {/* Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="glass-card-static p-6 space-y-6 sticky top-24 rounded-xl"
              style={{
                boxShadow: 'var(--shadow-elevated), 0 0 40px -18px hsl(var(--primary) / 0.15)',
              }}
            >
              <div>
                <span className="text-sm text-muted-foreground">Price per ticket</span>
                <p className="font-heading text-4xl font-extrabold mt-1 text-foreground">
                  ${event.ticketPrice}
                </p>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2.5">
                  <span className="text-muted-foreground flex items-center gap-1.5">
                    <Ticket className="w-3.5 h-3.5" /> Available
                  </span>
                  <span className="font-semibold">{event.availableTickets} / {event.totalTickets}</span>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{
                  background: 'hsl(var(--secondary))',
                }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(event.availableTickets / event.totalTickets) * 100}%` }}
                    transition={{ delay: 0.6, duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-full rounded-full"
                    style={{
                      background: progressColor,
                      boxShadow: `0 0 12px ${progressGlow}`,
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2.5 text-sm text-muted-foreground px-3 py-2.5 rounded-lg" style={{
                background: 'hsl(var(--secondary))',
              }}>
                <Users className="w-4 h-4 text-primary" />
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
                className="btn-primary w-full text-center block text-base"
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
