import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { mockEvents as initialEvents, mockBookings, getEventById, Event, Booking } from '@/data/mockData';
import { useBookingStore } from '@/hooks/useBookingStore';
import { useNavigate } from 'react-router-dom';
import { Ticket, DollarSign, Calendar, Users, Plus, Pencil, Trash2, MoreVertical, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CreateEventForm from '@/components/CreateEventForm';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { bookings } = useBookingStore();
  const [events, setEvents] = useState<Event[]>(initialEvents);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'events' | 'bookings'>('events');

  if (!user) { navigate('/login'); return null; }

  const totalRevenue = bookings.reduce((s, b) => {
    const e = getEventById(b.eventId);
    return s + (e ? e.ticketPrice * b.ticketCount : 0);
  }, 0);
  const totalTicketsSold = bookings.reduce((s, b) => s + b.ticketCount, 0);

  const handleEventCreated = (newEvent: Event) => {
    if (editingEvent) {
      setEvents(prev => prev.map(e => e.id === newEvent.id ? newEvent : e));
      toast.success('Event updated!');
    } else {
      setEvents(prev => [newEvent, ...prev]);
      toast.success('Event created!');
    }
    setShowCreateForm(false);
    setEditingEvent(null);
  };

  const handleDelete = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
    setActiveMenu(null);
    toast.success('Event deleted');
  };

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setShowCreateForm(true);
    setActiveMenu(null);
  };

  return (
    <AnimatedPage className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold mb-1">Admin Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage events and view analytics</p>
          </div>
          <button onClick={() => { setEditingEvent(null); setShowCreateForm(true); }} className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto">
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {[
            { icon: Calendar, label: 'Events', value: events.length, color: 'text-primary' },
            { icon: Ticket, label: 'Sold', value: totalTicketsSold, color: 'text-accent' },
            { icon: DollarSign, label: 'Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'text-emerald-500' },
            { icon: Users, label: 'Bookings', value: bookings.length, color: 'text-amber-500' },
          ].map(stat => (
            <div key={stat.label} className="glass-card p-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{stat.label}</p>
                <p className={`font-heading text-lg font-bold ${stat.color} truncate`}>{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-secondary rounded-lg p-1 w-fit">
          {(['events', 'bookings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-all ${
                activeTab === tab ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-heading font-semibold">All Events</h2>
              <span className="text-xs text-muted-foreground">{events.length} total</span>
            </div>

            {/* Mobile cards / Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                    <th className="text-left p-3 font-medium">Event</th>
                    <th className="text-left p-3 font-medium">Category</th>
                    <th className="text-left p-3 font-medium">Date</th>
                    <th className="text-left p-3 font-medium">Venue</th>
                    <th className="text-right p-3 font-medium">Price</th>
                    <th className="text-right p-3 font-medium">Available</th>
                    <th className="text-right p-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(event => (
                    <motion.tr
                      key={event.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
                    >
                      <td className="p-3 font-medium text-sm max-w-[200px] truncate">{event.title}</td>
                      <td className="p-3">
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{event.category}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{format(new Date(event.date), 'MMM dd, yyyy')}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[150px] truncate">{event.venue}</td>
                      <td className="p-3 text-right text-sm">${event.ticketPrice}</td>
                      <td className="p-3 text-right text-sm">{event.availableTickets}/{event.totalTickets}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/event/${event.id}`)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleEdit(event)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors text-muted-foreground hover:text-primary" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile event cards */}
            <div className="md:hidden divide-y divide-border/50">
              {events.map(event => (
                <div key={event.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(event.date), 'MMM dd')} · {event.venue}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)} className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-secondary transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {activeMenu === event.id && (
                        <div className="absolute right-0 top-8 z-10 bg-card border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                          <button onClick={() => { navigate(`/event/${event.id}`); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2"><Eye className="w-3.5 h-3.5" /> View</button>
                          <button onClick={() => handleEdit(event)} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                          <button onClick={() => handleDelete(event.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">{event.category}</span>
                    <span className="text-muted-foreground">${event.ticketPrice}</span>
                    <span className="text-muted-foreground">{event.availableTickets} avail</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="glass-card overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-heading font-semibold">All Bookings</h2>
              <span className="text-xs text-muted-foreground">{bookings.length} total</span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">
                <Ticket className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No bookings yet</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border text-xs text-muted-foreground uppercase tracking-wide">
                        <th className="text-left p-3 font-medium">Ticket ID</th>
                        <th className="text-left p-3 font-medium">Attendee</th>
                        <th className="text-left p-3 font-medium">Event</th>
                        <th className="text-left p-3 font-medium">Seats</th>
                        <th className="text-right p-3 font-medium">Tickets</th>
                        <th className="text-right p-3 font-medium">Amount</th>
                        <th className="text-right p-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => {
                        const event = getEventById(booking.eventId);
                        return (
                          <tr key={booking.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                            <td className="p-3 font-mono text-xs text-primary">{booking.ticketId}</td>
                            <td className="p-3 text-sm">
                              <p className="font-medium">{booking.userName}</p>
                              <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                            </td>
                            <td className="p-3 text-sm max-w-[180px] truncate">{event?.title || 'Unknown'}</td>
                            <td className="p-3 font-mono text-xs">{booking.seatNumbers.join(', ')}</td>
                            <td className="p-3 text-right text-sm">{booking.ticketCount}</td>
                            <td className="p-3 text-right text-sm font-medium">${event ? event.ticketPrice * booking.ticketCount : 0}</td>
                            <td className="p-3 text-right">
                              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 capitalize">{booking.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y divide-border/50">
                  {bookings.map(booking => {
                    const event = getEventById(booking.eventId);
                    return (
                      <div key={booking.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="font-medium text-sm truncate">{event?.title || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{booking.userName} · {booking.userEmail}</p>
                          </div>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 capitalize shrink-0">{booking.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono text-primary">{booking.ticketId}</span>
                          <span>{booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}</span>
                          <span className="font-medium text-foreground">${event ? event.ticketPrice * booking.ticketCount : 0}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Event Modal */}
      <AnimatePresence>
        {showCreateForm && (
          <CreateEventForm
            onClose={() => { setShowCreateForm(false); setEditingEvent(null); }}
            onCreated={handleEventCreated}
            editEvent={editingEvent}
          />
        )}
      </AnimatePresence>
    </AnimatedPage>
  );
};

export default AdminDashboard;
