import { useState } from 'react';
import { Event } from '@/data/mockData';
import { motion } from 'framer-motion';
import { X, Calendar, MapPin, DollarSign, Ticket, Image } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  date: string;
  venue: string;
  ticketPrice: string;
  totalTickets: string;
  category: string;
}

const categories = ['Music', 'Tech', 'Comedy', 'Film', 'Food', 'Sports', 'Art'];

const CreateEventForm = ({
  onClose,
  onCreated,
  editEvent,
}: {
  onClose: () => void;
  onCreated: (event: Event) => void;
  editEvent?: Event | null;
}) => {
  const [form, setForm] = useState<EventFormData>(
    editEvent
      ? {
          title: editEvent.title,
          description: editEvent.description,
          date: editEvent.date.slice(0, 16),
          venue: editEvent.venue,
          ticketPrice: String(editEvent.ticketPrice),
          totalTickets: String(editEvent.totalTickets),
          category: editEvent.category,
        }
      : { title: '', description: '', date: '', venue: '', ticketPrice: '', totalTickets: '', category: 'Music' }
  );
  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  const update = (key: keyof EventFormData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setErrors(prev => ({ ...prev, [key]: '' }));
  };

  const validate = () => {
    const errs: Partial<EventFormData> = {};
    if (!form.title.trim()) errs.title = 'Required';
    if (!form.description.trim()) errs.description = 'Required';
    if (!form.date) errs.date = 'Required';
    if (!form.venue.trim()) errs.venue = 'Required';
    if (!form.ticketPrice || Number(form.ticketPrice) <= 0) errs.ticketPrice = 'Invalid';
    if (!form.totalTickets || Number(form.totalTickets) <= 0) errs.totalTickets = 'Invalid';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const event: Event = {
      id: editEvent?.id || `e${Date.now()}`,
      title: form.title.trim(),
      description: form.description.trim(),
      date: new Date(form.date).toISOString(),
      venue: form.venue.trim(),
      ticketPrice: Number(form.ticketPrice),
      totalTickets: Number(form.totalTickets),
      availableTickets: editEvent?.availableTickets ?? Number(form.totalTickets),
      bannerUrl: editEvent?.bannerUrl || '',
      category: form.category,
      featured: editEvent?.featured ?? false,
    };
    onCreated(event);
  };

  const inputClass = "w-full px-3 py-2.5 rounded-lg bg-secondary border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'hsl(222 47% 11% / 0.4)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto bg-card"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg font-bold">{editEvent ? 'Edit Event' : 'Create New Event'}</h2>
          <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-secondary transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-medium mb-1 block">Event Title</label>
            <input type="text" value={form.title} onChange={e => update('title', e.target.value)} className={inputClass} placeholder="e.g. Summer Music Festival" maxLength={100} />
            {errors.title && <p className="text-xs text-destructive mt-0.5">{errors.title}</p>}
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} className={`${inputClass} resize-none`} placeholder="Describe your event..." maxLength={1000} />
            {errors.description && <p className="text-xs text-destructive mt-0.5">{errors.description}</p>}
          </div>

          <div>
            <label className="text-xs font-medium mb-1 block">Category</label>
            <div className="flex flex-wrap gap-1.5">
              {categories.map(cat => (
                <button key={cat} type="button" onClick={() => update('category', cat)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${form.category === cat ? 'bg-primary/10 border-primary/40 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block flex items-center gap-1"><Calendar className="w-3 h-3 text-primary" /> Date & Time</label>
              <input type="datetime-local" value={form.date} onChange={e => update('date', e.target.value)} className={inputClass} />
              {errors.date && <p className="text-xs text-destructive mt-0.5">{errors.date}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block flex items-center gap-1"><MapPin className="w-3 h-3 text-accent" /> Venue</label>
              <input type="text" value={form.venue} onChange={e => update('venue', e.target.value)} className={inputClass} placeholder="Venue name" maxLength={200} />
              {errors.venue && <p className="text-xs text-destructive mt-0.5">{errors.venue}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium mb-1 block flex items-center gap-1"><DollarSign className="w-3 h-3 text-emerald-500" /> Price ($)</label>
              <input type="number" min="1" step="0.01" value={form.ticketPrice} onChange={e => update('ticketPrice', e.target.value)} className={inputClass} placeholder="49.99" />
              {errors.ticketPrice && <p className="text-xs text-destructive mt-0.5">{errors.ticketPrice}</p>}
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block flex items-center gap-1"><Ticket className="w-3 h-3 text-primary" /> Total Tickets</label>
              <input type="number" min="1" value={form.totalTickets} onChange={e => update('totalTickets', e.target.value)} className={inputClass} placeholder="500" />
              {errors.totalTickets && <p className="text-xs text-destructive mt-0.5">{errors.totalTickets}</p>}
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="submit" className="btn-primary flex-1 !py-2.5 text-sm">{editEvent ? 'Save Changes' : 'Create Event'}</button>
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium border border-border text-foreground hover:bg-secondary transition-colors">Cancel</button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateEventForm;
