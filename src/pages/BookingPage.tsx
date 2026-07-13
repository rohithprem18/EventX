import { useParams, useNavigate } from 'react-router-dom';
import { getEventById, getBookingsForEvent } from '@/data/mockData';
import { AnimatedPage } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { useBookingStore } from '@/hooks/useBookingStore';
import { useSeatLocks } from '@/hooks/useSeatLocks';
import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Loader2, Download, Lock, AlertTriangle, RefreshCw, Ticket, Armchair } from 'lucide-react';
import { generateTicketPDF } from '@/utils/generateTicketPDF';
import { format } from 'date-fns';
import SeatPicker from '@/components/SeatPicker';

const steps = [
  { id: 1, label: 'Select Seats' },
  { id: 2, label: 'Review' },
  { id: 3, label: 'Confirmed' },
];

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addBooking, bookings, backendOnline } = useBookingStore();
  const event = getEventById(id || '');
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [ticketId, setTicketId] = useState('');
  const [collisionError, setCollisionError] = useState<{
    seats: string[];
    bookedBy: string;
  } | null>(null);

  const MAX_SELECTABLE = 10;
  const ticketCount = selectedSeats.length;
  const total = ticketCount * (event?.ticketPrice || 0);

  const currentStep = confirmed ? 3 : ticketCount > 0 && !collisionError ? 2 : 1;

  // Cross-tab seat locking
  const { otherLockedSeats, broadcastSelections, confirmBooking: confirmLocks } = useSeatLocks(
    id || '',
    user?.id || 'anonymous'
  );

  // Wrap seat selection to also broadcast locks to other tabs
  const handleSelectionChange = useCallback(
    (seats: string[]) => {
      setSelectedSeats(seats);
      broadcastSelections(seats);
    },
    [broadcastSelections]
  );

  // Collect all seats already booked for this event (from mock data + live bookings)
  const bookedSeats = useMemo(() => {
    const mockBooked = getBookingsForEvent(id || '')
      .filter(b => b.status === 'confirmed')
      .flatMap(b => b.seatNumbers);
    const liveBooked = bookings
      .filter(b => b.eventId === (id || '') && b.status === 'confirmed')
      .flatMap(b => b.seatNumbers);
    return [...new Set([...mockBooked, ...liveBooked])];
  }, [id, bookings]);

  const handleBook = async () => {
    if (selectedSeats.length === 0 || !user || !event) return;
    setBooking(true);
    setCollisionError(null);

    // Simulate API/payment latency (concurrency window)
    await new Promise(r => setTimeout(r, 2000));

    const tid = `TKT-${event.id.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    setTicketId(tid);

    const bookingRecord = {
      id: `b-${Date.now()}`,
      userId: user.id,
      eventId: event.id,
      ticketCount,
      seatNumbers: selectedSeats,
      ticketId: tid,
      bookedAt: new Date().toISOString(),
      status: 'confirmed' as const,
      userName: user.name,
      userEmail: user.email,
    };

    const result = await addBooking(bookingRecord);

    if (!result.success) {
      setCollisionError({
        seats: result.seats || selectedSeats,
        bookedBy: result.bookedBy || 'Another User'
      });
      setBooking(false);
      return;
    }

    // Release temporary locks (seats are now permanently booked)
    confirmLocks();

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
      seatNumbers: selectedSeats,
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
      <div className="container mx-auto max-w-3xl">
        <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 text-sm mb-8 font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to event
        </button>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-0 mb-10">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-500"
                  style={{
                    background: currentStep >= step.id ? 'var(--gradient-primary)' : 'hsl(var(--secondary))',
                    color: currentStep >= step.id ? 'white' : 'hsl(var(--muted-foreground))',
                    boxShadow: currentStep >= step.id ? '0 0 16px -3px hsl(var(--primary) / 0.4)' : 'none',
                  }}
                >
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${currentStep >= step.id ? 'text-foreground' : 'text-muted-foreground'}`}>
                  {step.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="w-12 sm:w-20 h-[2px] mx-2 rounded-full transition-all duration-500" style={{
                  background: currentStep > step.id
                    ? 'var(--gradient-primary)'
                    : 'hsl(var(--border))',
                }} />
              )}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {confirmed ? (
            <motion.div
              key="confirmed"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card-static p-8 text-center space-y-6 rounded-xl"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2, stiffness: 200 }}
                className="w-20 h-20 rounded-full mx-auto flex items-center justify-center"
                style={{
                  background: 'hsla(155, 72%, 48%, 0.15)',
                  boxShadow: '0 0 40px -5px hsla(155, 72%, 48%, 0.3)',
                }}
              >
                <CheckCircle2 className="w-10 h-10" style={{ color: 'hsl(155, 65%, var(--tint-fg-l))' }} />
              </motion.div>
              <h1 className="font-heading text-3xl font-extrabold">Booking confirmed</h1>
              <div className="glass-card-static p-6 text-left space-y-3 rounded-xl">
                <div className="flex justify-between"><span className="text-muted-foreground">Ticket ID</span><span className="font-mono font-bold text-primary">{ticketId}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Event</span><span className="font-semibold">{event.title}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Tickets</span><span>{ticketCount}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Seats</span><span className="font-mono">{selectedSeats.join(', ')}</span></div>
                <div className="flex justify-between pt-2" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-heading font-extrabold text-xl text-foreground">${total}</span>
                </div>
              </div>

              <div className="flex gap-3 justify-center flex-wrap">
                <button onClick={handleDownloadPDF} className="btn-primary flex items-center gap-2">
                  <Download className="w-4 h-4" /> Download Ticket PDF
                </button>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost flex items-center gap-2">
                  Go to Dashboard
                </button>
              </div>
            </motion.div>
          ) : collisionError ? (
            <motion.div
              key="collision"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="glass-card-static p-8 text-center space-y-6 rounded-xl"
              style={{
                border: '1px solid hsl(var(--destructive) / 0.3)',
                boxShadow: '0 0 40px -10px hsl(var(--destructive) / 0.15)',
              }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.2 }}
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                style={{
                  background: 'hsl(var(--destructive) / 0.1)',
                  boxShadow: '0 0 40px -5px hsl(var(--destructive) / 0.25)',
                }}
              >
                <AlertTriangle className="w-10 h-10 text-destructive animate-pulse" />
              </motion.div>
              <h1 className="font-heading text-2xl font-extrabold text-destructive">Booking collision detected</h1>

              <div className="glass-card-static p-6 text-left space-y-4 rounded-xl" style={{
                border: '1px solid hsl(var(--destructive) / 0.15)',
                background: 'hsl(var(--destructive) / 0.05)',
              }}>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  Under high concurrency, seats are booked on a first-come, first-served basis.
                  Unfortunately, another user completed booking the following seat(s) while you were checking out:
                </p>
                <div className="flex flex-wrap gap-2 py-1">
                  {collisionError.seats.map(seat => (
                    <span key={seat} className="px-3 py-1 rounded-lg text-sm font-bold font-mono" style={{
                      background: 'hsl(var(--destructive) / 0.1)',
                      color: 'hsl(var(--destructive))',
                      border: '1px solid hsl(var(--destructive) / 0.3)',
                    }}>
                      {seat}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Seat(s) were successfully confirmed by <strong className="text-foreground">{collisionError.bookedBy}</strong>.
                </p>
              </div>

              <p className="text-sm text-muted-foreground">
                Your payment process has been rolled back and no charges were made.
              </p>

              <div className="flex gap-3 justify-center flex-wrap pt-2">
                <button 
                  onClick={() => {
                    setSelectedSeats(prev => prev.filter(s => !collisionError.seats.includes(s)));
                    setCollisionError(null);
                  }}
                  className="btn-primary flex items-center gap-2"
                  style={{
                    background: 'linear-gradient(135deg, hsl(0, 72%, 55%), hsl(15, 80%, 50%))',
                    boxShadow: '0 4px 15px -3px hsla(0, 72%, 55%, 0.4)',
                  }}
                >
                  <RefreshCw className="w-4 h-4" /> Go Back & Select Other Seats
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-3 mb-2">
                <Armchair className="w-6 h-6 text-primary" />
                <h1 className="font-heading text-3xl font-extrabold">Select Your Seats</h1>
              </div>
              <p className="text-muted-foreground mb-8 ml-9">{event.title}</p>

              {!backendOnline && (
                <div className="flex items-start gap-2.5 mb-6 px-4 py-3 rounded-xl text-sm" style={{
                  background: 'hsla(0, 72%, 48%, 0.08)',
                  border: '1px solid hsla(0, 72%, 48%, 0.25)',
                  color: 'hsl(0, 72%, 40%)',
                }}>
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <strong>Booking server unreachable.</strong> Running in local demo mode — seat
                    availability won't sync with other browsers or devices until it reconnects.
                  </span>
                </div>
              )}

              {/* Seat Picker */}
              <div className="glass-card-static p-6 mb-6 rounded-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold">Choose up to {MAX_SELECTABLE} seats</p>
                    <p className="text-sm text-muted-foreground">
                      {ticketCount === 0
                        ? 'Click on available seats to select'
                        : `${ticketCount} seat${ticketCount > 1 ? 's' : ''} selected`}
                    </p>
                  </div>
                  {ticketCount > 0 && (
                    <button
                      onClick={() => handleSelectionChange([])}
                      className="text-xs font-bold text-destructive hover:underline"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <SeatPicker
                  maxSelectable={MAX_SELECTABLE}
                  selectedSeats={selectedSeats}
                  onSelectionChange={handleSelectionChange}
                  bookedSeats={bookedSeats}
                  pendingSeats={otherLockedSeats}
                />
                {otherLockedSeats.length > 0 && (
                  <div className="flex items-center gap-2 mt-4 px-3 py-2.5 rounded-lg text-xs font-medium" style={{
                    background: 'hsla(38, 68%, 46%, 0.12)',
                    border: '1px solid hsla(38, 68%, 42%, 0.3)',
                    color: 'hsl(38, 68%, var(--tint-fg-l))',
                  }}>
                    <Lock className="w-3.5 h-3.5" />
                    {otherLockedSeats.length} seat{otherLockedSeats.length > 1 ? 's' : ''} currently held by other users
                  </div>
                )}
              </div>

              {/* Order Summary */}
              <div className="glass-card-static p-6 space-y-6 rounded-xl">
                {ticketCount > 0 && (
                  <div className="flex flex-wrap gap-2">
                    <span className="text-sm text-muted-foreground mr-1">Selected:</span>
                    {selectedSeats.map((seat) => (
                      <motion.span
                        key={seat}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono"
                        style={{
                          background: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                          border: '1px solid hsl(var(--primary) / 0.25)',
                        }}
                      >
                        {seat}
                      </motion.span>
                    ))}
                  </div>
                )}

                <div className="pt-4 space-y-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">{ticketCount}x Ticket @ ${event.ticketPrice}</span>
                    <span>${total}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service fee</span>
                    <span>$0</span>
                  </div>
                  <div className="flex justify-between font-heading font-extrabold text-xl pt-3" style={{ borderTop: '1px solid hsl(var(--border))' }}>
                    <span>Total</span>
                    <span className="text-foreground">${total}</span>
                  </div>
                </div>

                <button
                  onClick={handleBook}
                  disabled={booking || ticketCount === 0}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {booking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                    </>
                  ) : ticketCount === 0 ? (
                    'Select seats to continue'
                  ) : (
                    <>
                      <Ticket className="w-4 h-4" />
                      {`Confirm ${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`}
                    </>
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
