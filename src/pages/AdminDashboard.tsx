import { AnimatedPage, StaggerContainer, StaggerItem } from '@/components/AnimatedPage';
import { useAuth } from '@/hooks/useAuth';
import { mockEvents as initialEvents, getEventById, Event } from '@/data/mockData';
import { useBookingStore } from '@/hooks/useBookingStore';
import { useNavigate } from 'react-router-dom';
import { Ticket, DollarSign, Calendar, Users, Plus, Pencil, Trash2, MoreVertical, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import CreateEventForm from '@/components/CreateEventForm';
import { toast } from 'sonner';

const statConfig = [
  { icon: Calendar, gradient: 'var(--gradient-primary)', glow: 'hsla(265, 68%, 60%, 0.2)' },
  { icon: Ticket, gradient: 'var(--gradient-accent)', glow: 'hsla(15, 66%, 55%, 0.2)' },
  { icon: DollarSign, gradient: 'var(--gradient-success)', glow: 'hsla(155, 72%, 48%, 0.2)' },
  { icon: Users, gradient: 'linear-gradient(135deg, hsl(45, 70%, 50%), hsl(35, 66%, 42%))', glow: 'hsla(45, 70%, 50%, 0.2)' },
];

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

  const statsData = [
    { label: 'Events', value: events.length },
    { label: 'Sold', value: totalTicketsSold },
    { label: 'Revenue', value: `$${totalRevenue.toLocaleString()}` },
    { label: 'Bookings', value: bookings.length },
  ];

  return (
    <AnimatedPage className="min-h-screen pt-24 pb-20 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-heading text-3xl sm:text-4xl font-extrabold mb-1">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage events and view analytics</p>
          </div>
          <button
            onClick={() => { setEditingEvent(null); setShowCreateForm(true); }}
            className="btn-primary flex items-center gap-2 text-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Create Event
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statsData.map((stat, i) => {
            const { icon: Icon, gradient, glow } = statConfig[i];
            return (
              <div key={stat.label} className="glass-card-static p-4 rounded-xl flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: gradient, boxShadow: `0 0 20px ${glow}` }}>
                  <Icon className="w-4.5 h-4.5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                  <p className="font-heading text-xl font-extrabold truncate">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 p-1 rounded-xl w-fit" style={{
          background: 'hsl(var(--secondary))',
          border: '1px solid hsl(var(--border))',
        }}>
          {(['events', 'bookings'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="relative px-5 py-2.5 rounded-lg text-sm font-semibold capitalize transition-colors duration-200"
              style={{
                color: activeTab === tab ? 'hsl(var(--foreground))' : 'hsl(var(--muted-foreground))',
              }}
            >
              {activeTab === tab && (
                <motion.div
                  layoutId="admin-tab"
                  className="absolute inset-0 rounded-lg -z-10"
                  style={{
                    background: 'hsl(var(--primary) / 0.1)',
                    border: '1px solid hsl(var(--primary) / 0.15)',
                  }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              {tab}
            </button>
          ))}
        </div>

        {/* Events Tab */}
        {activeTab === 'events' && (
          <div className="glass-card-static overflow-hidden rounded-xl">
            <div className="p-4 flex items-center justify-between" style={{
              borderBottom: '1px solid hsl(var(--border))',
            }}>
              <h2 className="font-heading font-bold">All Events</h2>
              <span className="text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-full" style={{
                background: 'hsl(var(--secondary))',
              }}>{events.length} total</span>
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-xs text-muted-foreground uppercase tracking-wider" style={{
                    borderBottom: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--secondary))',
                  }}>
                    <th className="text-left p-3 font-semibold">Event</th>
                    <th className="text-left p-3 font-semibold">Category</th>
                    <th className="text-left p-3 font-semibold">Date</th>
                    <th className="text-left p-3 font-semibold">Venue</th>
                    <th className="text-right p-3 font-semibold">Price</th>
                    <th className="text-right p-3 font-semibold">Available</th>
                    <th className="text-right p-3 font-semibold">Actions</th>
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
                      className="transition-colors duration-200"
                      style={{
                        borderBottom: '1px solid hsl(var(--border))',
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = 'hsl(var(--primary) / 0.05)';
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = '';
                      }}
                    >
                      <td className="p-3 font-semibold text-sm max-w-[200px] truncate">{event.title}</td>
                      <td className="p-3">
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{
                          background: 'hsl(var(--primary) / 0.1)',
                          color: 'hsl(var(--primary))',
                        }}>{event.category}</span>
                      </td>
                      <td className="p-3 text-xs text-muted-foreground">{format(new Date(event.date), 'MMM dd, yyyy')}</td>
                      <td className="p-3 text-xs text-muted-foreground max-w-[150px] truncate">{event.venue}</td>
                      <td className="p-3 text-right text-sm font-semibold">${event.ticketPrice}</td>
                      <td className="p-3 text-right text-sm">{event.availableTickets}/{event.totalTickets}</td>
                      <td className="p-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => navigate(`/event/${event.id}`)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-all" title="View">
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleEdit(event)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all" title="Edit">
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDelete(event.id)} className="w-7 h-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all" title="Delete">
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
            <div className="md:hidden divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
              {events.map(event => (
                <div key={event.id} className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">{format(new Date(event.date), 'MMM dd')} · {event.venue}</p>
                    </div>
                    <div className="relative shrink-0">
                      <button onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
                        <MoreVertical className="w-4 h-4 text-muted-foreground" />
                      </button>
                      {activeMenu === event.id && (
                        <div className="absolute right-0 top-8 z-10 rounded-xl shadow-lg py-1 min-w-[120px]" style={{
                          background: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                        }}>
                          <button onClick={() => { navigate(`/event/${event.id}`); setActiveMenu(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2 transition-colors"><Eye className="w-3.5 h-3.5" /> View</button>
                          <button onClick={() => handleEdit(event)} className="w-full text-left px-3 py-2 text-sm hover:bg-secondary flex items-center gap-2 transition-colors"><Pencil className="w-3.5 h-3.5" /> Edit</button>
                          <button onClick={() => handleDelete(event.id)} className="w-full text-left px-3 py-2 text-sm hover:bg-destructive/10 text-destructive flex items-center gap-2 transition-colors"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-bold px-2 py-0.5 rounded-full" style={{
                      background: 'hsl(var(--primary) / 0.1)',
                      color: 'hsl(var(--primary))',
                    }}>{event.category}</span>
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
          <div className="glass-card-static overflow-hidden rounded-xl">
            <div className="p-4 flex items-center justify-between" style={{
              borderBottom: '1px solid hsl(var(--border))',
            }}>
              <h2 className="font-heading font-bold">All Bookings</h2>
              <span className="text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-full" style={{
                background: 'hsl(var(--secondary))',
              }}>{bookings.length} total</span>
            </div>

            {bookings.length === 0 ? (
              <div className="p-16 text-center">
                <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{
                  background: 'hsl(var(--secondary))',
                  border: '1px solid hsl(var(--border))',
                }}>
                  <Ticket className="w-7 h-7 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium">No bookings yet</p>
              </div>
            ) : (
              <>
                {/* Desktop */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-xs text-muted-foreground uppercase tracking-wider" style={{
                        borderBottom: '1px solid hsl(var(--border))',
                        background: 'hsl(var(--secondary))',
                      }}>
                        <th className="text-left p-3 font-semibold">Ticket ID</th>
                        <th className="text-left p-3 font-semibold">Attendee</th>
                        <th className="text-left p-3 font-semibold">Event</th>
                        <th className="text-left p-3 font-semibold">Seats</th>
                        <th className="text-right p-3 font-semibold">Tickets</th>
                        <th className="text-right p-3 font-semibold">Amount</th>
                        <th className="text-right p-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.map(booking => {
                        const event = getEventById(booking.eventId);
                        return (
                          <tr
                            key={booking.id}
                            className="transition-colors duration-200"
                            style={{ borderBottom: '1px solid hsl(var(--border))' }}
                            onMouseEnter={e => {
                              (e.currentTarget as HTMLElement).style.background = 'hsl(var(--primary) / 0.05)';
                            }}
                            onMouseLeave={e => {
                              (e.currentTarget as HTMLElement).style.background = '';
                            }}
                          >
                            <td className="p-3 font-mono text-xs font-bold text-primary">{booking.ticketId}</td>
                            <td className="p-3 text-sm">
                              <p className="font-semibold">{booking.userName}</p>
                              <p className="text-xs text-muted-foreground">{booking.userEmail}</p>
                            </td>
                            <td className="p-3 text-sm max-w-[180px] truncate">{event?.title || 'Unknown'}</td>
                            <td className="p-3 font-mono text-xs">{booking.seatNumbers.join(', ')}</td>
                            <td className="p-3 text-right text-sm">{booking.ticketCount}</td>
                            <td className="p-3 text-right text-sm font-semibold">${event ? event.ticketPrice * booking.ticketCount : 0}</td>
                            <td className="p-3 text-right">
                              <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize" style={{
                                background: 'hsla(155, 72%, 48%, 0.12)',
                                color: 'hsl(155, 65%, var(--tint-fg-l))',
                              }}>{booking.status}</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile */}
                <div className="md:hidden divide-y" style={{ borderColor: 'hsl(var(--border))' }}>
                  {bookings.map(booking => {
                    const event = getEventById(booking.eventId);
                    return (
                      <div key={booking.id} className="p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate">{event?.title || 'Unknown'}</p>
                            <p className="text-xs text-muted-foreground">{booking.userName} · {booking.userEmail}</p>
                          </div>
                          <span className="text-xs font-bold px-2.5 py-1 rounded-full capitalize shrink-0" style={{
                            background: 'hsla(155, 72%, 48%, 0.12)',
                            color: 'hsl(155, 65%, var(--tint-fg-l))',
                          }}>{booking.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="font-mono font-bold text-primary">{booking.ticketId}</span>
                          <span>{booking.ticketCount} ticket{booking.ticketCount > 1 ? 's' : ''}</span>
                          <span className="font-semibold text-foreground">${event ? event.ticketPrice * booking.ticketCount : 0}</span>
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
