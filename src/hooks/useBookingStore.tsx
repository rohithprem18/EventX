import { createContext, useContext, useState, ReactNode } from 'react';
import { Booking, mockBookings, User } from '@/data/mockData';

interface BookingRecord extends Booking {
  userName: string;
  userEmail: string;
}

interface BookingStoreContextType {
  bookings: BookingRecord[];
  addBooking: (booking: BookingRecord) => void;
  getByTicketId: (ticketId: string) => BookingRecord | undefined;
}

const BookingStoreContext = createContext<BookingStoreContextType | undefined>(undefined);

// Seed with mock bookings
const seedBookings: BookingRecord[] = mockBookings.map(b => ({
  ...b,
  userName: 'Alex Rivera',
  userEmail: 'alex@example.com',
}));

export const BookingStoreProvider = ({ children }: { children: ReactNode }) => {
  const [bookings, setBookings] = useState<BookingRecord[]>(seedBookings);

  const addBooking = (booking: BookingRecord) => {
    setBookings(prev => [booking, ...prev]);
  };

  const getByTicketId = (ticketId: string) => {
    return bookings.find(b => b.ticketId === ticketId);
  };

  return (
    <BookingStoreContext.Provider value={{ bookings, addBooking, getByTicketId }}>
      {children}
    </BookingStoreContext.Provider>
  );
};

export const useBookingStore = () => {
  const ctx = useContext(BookingStoreContext);
  if (!ctx) throw new Error('useBookingStore must be used within BookingStoreProvider');
  return ctx;
};
