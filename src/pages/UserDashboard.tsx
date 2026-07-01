import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { mockBookings, getEventById } from '@/data/mockData';
import { useNavigate } from 'react-router-dom';
import { Ticket, Calendar, Download } from 'lucide-react';
import { format } from 'date-fns';
import { generateTicketPDF } from '@/utils/generateTicketPDF';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    navigate('/login');
    return null;
  }

  const bookings = mockBookings.filter(b => b.userId === 'u1'); // demo bookings

  return (
    <AnimatedPage className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-4xl">
        <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">My Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6 sm:mb-8">Welcome back, {user.name}</p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, color: 'text-primary' },
            { label: 'Tickets Purchased', value: bookings.reduce((s, b) => s + b.ticketCount, 0), color: 'text-accent' },
            { label: 'Total Spent', value: `$${bookings.reduce((s, b) => { const e = getEventById(b.eventId); return s + (e ? e.ticketPrice * b.ticketCount : 0); }, 0)}`, color: 'text-emerald-400' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`font-heading text-xl sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        <h2 className="font-heading text-xl font-semibold mb-4">My Tickets</h2>

        {bookings.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No bookings yet</p>
          </div>
        ) : (
          <StaggerContainer className="space-y-4">
            {bookings.map(booking => {
              const event = getEventById(booking.eventId);
              if (!event) return null;
              return (
                <StaggerItem key={booking.id}>
                  <div className="glass-card p-5 flex flex-col md:flex-row md:items-center gap-4">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-heading font-semibold">{event.title}</h3>
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        {format(new Date(event.date), 'MMM dd, yyyy · h:mm a')}
                      </p>
                      <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm">
                        <span className="text-muted-foreground">ID: <span className="font-mono text-primary">{booking.ticketId}</span></span>
                        <span className="text-muted-foreground">Seats: <span className="font-mono">{booking.seatNumbers.join(', ')}</span></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 capitalize">{booking.status}</span>
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
                        className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
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
