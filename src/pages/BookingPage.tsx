import { useParams, useNavigate } from 'react-router-dom';
import { getEventById } from '@/data/mockData';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { useBookingStore } from '@/hooks/useBookingStore';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus, ArrowLeft, CheckCircle2, Loader2, Download } from 'lucide-react';
import { generateTicketPDF } from '@/utils/generateTicketPDF';
import { format } from 'date-fns';


const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking } = useBookingStore();
  const event = getEventById(id || '');
  const [ticketCount, setTicketCount] = useState(1);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [ticketId, setTicketId] = useState('');

  const max = event ? Math.min(event.availableTickets, 10) : 1;
  const total = ticketCount * (event?.ticketPrice || 0);

  const seats = useMemo(() => Array.from({ length: ticketCount }, () => {
    const row = String.fromCharCode(65 + Math.floor(Math.random() * 8));
    const num = Math.floor(Math.random() * 30) + 1;
    return `${row}${num}`;
  }), [ticketCount]);

  const handleBook = async () => {
    setBooking(true);
    await new Promise(r => setTimeout(r, 2000));
    const tid = `TKT-${(event?.id || '').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    setTicketId(tid);

    // Save booking to store so verify page can find it
    if (user && event) {
      addBooking({
        id: `b-${Date.now()}`,
        userId: user.id,
        eventId: event.id,
        ticketCount,
        seatNumbers: seats,
        ticketId: tid,
        bookedAt: new Date().toISOString(),
        status: 'confirmed',
        userName: user.name,
        userEmail: user.email,
      });
    }

    setBooking(false);
    setConfirmed(true);
  };

  const handleDownloadPDF = async () => {
    if (!event || !user) return;
    await generateTicketPDF({
      ticketId,
      eventTitle: event.title,
      eventDate: format(new Date(event.date), 'EEEE, MMMM dd, yyyy · h:mm a'),
      venue: event.venue,
      userName: user.name,
      seatNumbers: seats,
      ticketCount,
      totalPrice: total,
    });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  if (!event) {
    return (
      <AnimatedPage className="min-h-screen pt-24 px-4 text-center">
        <p className="text-muted-foreground">Event not found</p>
      </AnimatedPage>
    );
  }

  return (
    <AnimatedPage className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-2xl">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to event
        </button>

        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-8 text-center space-y-6"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
              >
                <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
              </motion.div>
              <h1 className="font-heading text-2xl font-bold">Booking Confirmed!</h1>
              <div className="glass-card p-6 text-left space-y-3">
                <div className="flex justify-between"><span className="text-muted-foreground">Ticket ID</span><span className="font-mono text-primary font-semibold">{ticketId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-medium">{event.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tickets</span><span>{ticketCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span className="font-mono">{seats.join(', ')}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-heading font-bold text-lg">${total}</span></div>
              </div>


              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Ticket PDF
                </button>
                <button onClick={() => navigate('/dashboard')} className="px-6 py-3 rounded-lg font-semibold border border-border text-foreground hover:bg-secondary transition-colors">
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h1 className="font-heading text-3xl font-bold mb-2">Book Tickets</h1>
              <p className="text-muted-foreground mb-8">{event.title}</p>

              <div className="glass-card p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Number of Tickets</p>
                    <p className="text-sm text-muted-foreground">Max {max} per order</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setTicketCount(Math.max(1, ticketCount - 1))}
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="font-heading text-xl font-bold w-8 text-center">{ticketCount}</span>
                    <button
                      onClick={() => setTicketCount(Math.min(max, ticketCount + 1))}
                      className="w-9 h-9 rounded-lg border border-border flex items-center justify-center hover:bg-secondary transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-border pt-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{ticketCount}x Ticket @ ${event.ticketPrice}</span>
                    <span>${total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between font-heading font-bold text-lg pt-2 border-t border-border">
                    <span>Total</span>
                    <span>${total}</span>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={booking}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  Payment is simulated. No real charges.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatedPage>
  );
};

export default BookingPage;
