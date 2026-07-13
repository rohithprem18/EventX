import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { useBookingStore } from '@/hooks/useBookingStore';
import { getEventById } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Download, ShoppingBag, CreditCard, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { generateTicketPDF } from '@/utils/generateTicketPDF';

const statIcons = [
  { icon: ShoppingBag, gradient: 'var(--gradient-primary)', glow: 'hsla(265, 68%, 60%, 0.2)' },
  { icon: CreditCard, gradient: 'var(--gradient-accent)', glow: 'hsla(15, 66%, 55%, 0.2)' },
  { icon: TrendingUp, gradient: 'var(--gradient-success)', glow: 'hsla(155, 72%, 48%, 0.2)' },
];

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookings: storeBookings } = useBookingStore();

  if (!user) {
    navigate('/login');
    return null;
  }

  const bookings = storeBookings.filter(b => b.userId === user.id);

  const stats = [
    { label: 'Total Bookings', value: bookings.length },
    { label: 'Tickets Purchased', value: bookings.reduce((s, b) => s + b.ticketCount, 0) },
    { label: 'Total Spent', value: `$${bookings.reduce((s, b) => { const e = getEventById(b.eventId); return s + (e ? e.ticketPrice * b.ticketCount : 0); }, 0)}` },
  ];

  return (
    <AnimatedPage className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-heading text-3xl sm:text-4xl font-extrabold mb-2">My Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, <span className="text-foreground font-medium">{user.name}</span></p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {stats.map((stat, i) => {
            const { icon: Icon, gradient, glow } = statIcons[i];
            return (
              <div key={stat.label} className="glass-card-static p-5 rounded-xl flex items-center gap-4">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: gradient, boxShadow: `0 0 20px ${glow}` }}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="font-heading text-2xl font-extrabold mt-0.5">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tickets Section */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-6 rounded-full" style={{ background: 'var(--gradient-primary)' }} />
          <h2 className="font-heading text-xl font-bold">My Tickets</h2>
        </div>

        {bookings.length === 0 ? (
          <div className="glass-card-static p-16 text-center rounded-xl">
            <div className="w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center" style={{
              background: 'hsl(var(--secondary))',
              border: '1px solid hsl(var(--border))',
            }}>
              <Ticket className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium text-lg">No bookings yet</p>
            <p className="text-muted-foreground/60 text-sm mt-1">Browse events and book your first ticket!</p>
          </div>
        ) : (
          <StaggerContainer className="space-y-4">
            {bookings.map(booking => {
              const event = getEventById(booking.eventId);
              if (!event) return null;
              return (
                <StaggerItem key={booking.id}>
                  <div className="glass-card-static p-5 rounded-xl flex flex-col md:flex-row md:items-center gap-4">
                    {/* Event thumbnail */}
                    <div className="w-full md:w-20 h-20 rounded-lg overflow-hidden shrink-0">
                      <img src={event.bannerUrl} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 space-y-1.5 min-w-0">
                      <h3 className="font-heading font-bold text-base truncate">{event.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-primary/70" />
                        {format(new Date(event.date), 'MMM dd, yyyy · h:mm a')}
                      </p>
                      <div className="flex flex-wrap gap-3 sm:gap-4 text-xs sm:text-sm">
                        <span className="text-muted-foreground">
                          ID: <span className="font-mono font-bold text-primary">{booking.ticketId}</span>
                        </span>
                        <span className="text-muted-foreground">
                          Seats: <span className="font-mono font-semibold">{booking.seatNumbers.join(', ')}</span>
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-xs font-bold px-3 py-1.5 rounded-full" style={{
                        background: 'hsla(155, 65%, 38%, 0.12)',
                        color: 'hsl(155, 65%, var(--tint-fg-l))',
                        textTransform: 'capitalize',
                      }}>
                        {booking.status}
                      </span>
                      <button
                        onClick={() => {
                          if (!event || !user) return;
                          generateTicketPDF({
                            ticketId: booking.ticketId,
                            eventTitle: event.title,
                            eventDate: format(new Date(event.date), 'EEEE, MMMM dd, yyyy · h:mm a'),
                            venue: event.venue,
                            userName: user.name,
                            seatNumbers: booking.seatNumbers,
                            ticketCount: booking.ticketCount,
                            totalPrice: event.ticketPrice * booking.ticketCount,
                          });
                        }}
                        className="w-9 h-9 rounded-lg flex items-center justify-center text-muted-foreground hover:text-white transition-all duration-200"
                        style={{
                          border: '1px solid hsl(var(--border))',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = 'var(--gradient-primary)';
                          (e.currentTarget as HTMLElement).style.borderColor = 'transparent';
                          (e.currentTarget as HTMLElement).style.boxShadow = '0 0 15px -3px hsl(var(--primary) / 0.3)';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = '';
                          (e.currentTarget as HTMLElement).style.borderColor = 'hsl(var(--border))';
                          (e.currentTarget as HTMLElement).style.boxShadow = '';
                        }}
                        title="Download ticket PDF"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        )}
      </div>
    </AnimatedPage>
  );
};

export default UserDashboard;
