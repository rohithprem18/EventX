import jsPDF from 'jspdf';

interface TicketData {
  ticketId: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  userName: string;
  seatNumbers: string[];
  ticketCount: number;
  totalPrice: number;
}

export const generateTicketPDF = async (data: TicketData) => {
  const { ticketId, eventTitle, eventDate, venue, userName, seatNumbers, ticketCount, totalPrice } = data;

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: [210, 148] });
  const w = 210;

  // Background
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, w, 148, 'F');

  // Header bar
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, w, 32, 'F');

  // Logo text
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.setTextColor(255, 255, 255);
  doc.text('EventX', 14, 14);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(224, 231, 255);
  doc.text('E-TICKET', 14, 22);

  // Ticket ID on header
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(ticketId, w - 14, 14, { align: 'right' });
  doc.text(`${ticketCount} Ticket${ticketCount > 1 ? 's' : ''}`, w - 14, 22, { align: 'right' });

  // Event title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(30, 41, 59);
  doc.text(eventTitle, 14, 46);

  // Details
  const details = [
    { label: 'Date', value: eventDate },
    { label: 'Venue', value: venue },
    { label: 'Attendee', value: userName },
    { label: 'Seats', value: seatNumbers.join(', ') },
    { label: 'Total', value: `$${totalPrice}` },
  ];

  let y = 56;
  details.forEach(({ label, value }) => {
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.text(label.toUpperCase(), 14, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.setFontSize(10);
    doc.text(value, 14, y + 5);
    y += 14;
  });

  // Dashed line separator
  doc.setDrawColor(203, 213, 225);
  doc.setLineDashPattern([2, 2], 0);
  doc.line(14, 125, w - 14, 125);

  // Footer
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text('This is your electronic ticket. Please present this at the venue.', 14, 133);
  doc.text('eventx.app', w - 14, 133, { align: 'right' });

  // Download
  doc.save(`${ticketId}-ticket.pdf`);
};
