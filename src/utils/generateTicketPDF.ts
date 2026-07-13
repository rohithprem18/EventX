import jsPDF, { GState } from 'jspdf';
import QRCode from 'qrcode';

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

type RGB = [number, number, number];

// ─── Color helpers ─────────────────────────────────────────────────────
// Mirrors the app's HSL design tokens (see src/index.css) so the ticket
// feels like it came from the same brand, not a generic PDF export.

function hslToRgb(h: number, s: number, l: number): RGB {
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)];
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpColor = (c1: RGB, c2: RGB, t: number): RGB => [
  lerp(c1[0], c2[0], t),
  lerp(c1[1], c2[1], t),
  lerp(c1[2], c2[2], t),
];

// Deliberately darker/richer than the web brand hues (which run lighter for
// button contrast) — this gradient carries bold WHITE text and a white QR
// panel directly on top of it, so each stop is tuned to hold that contrast.
const PALETTE = {
  primary: hslToRgb(38, 82, 34),
  amber: hslToRgb(44, 80, 40),
  crimson: hslToRgb(350, 68, 38),
  ink: hslToRgb(240, 15, 14),
  slate: hslToRgb(232, 10, 42),
  faint: hslToRgb(235, 12, 90),
  paper: hslToRgb(0, 0, 100),
  page: hslToRgb(235, 16, 95),
  success: hslToRgb(155, 65, 40),
  white: [255, 255, 255] as RGB,
};

/** Fill a rect with a smooth multi-stop gradient (horizontal or vertical). */
function drawGradient(
  doc: jsPDF,
  x: number,
  y: number,
  w: number,
  h: number,
  stops: RGB[],
  direction: 'horizontal' | 'vertical' = 'horizontal'
) {
  const length = direction === 'horizontal' ? w : h;
  const steps = Math.max(30, Math.round(length * 2.5));
  const sliceSize = length / steps;
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    const segT = t * (stops.length - 1);
    const idx = Math.min(stops.length - 2, Math.floor(segT));
    const localT = segT - idx;
    const [r, g, b] = lerpColor(stops[idx], stops[idx + 1], localT);
    doc.setFillColor(r, g, b);
    if (direction === 'horizontal') {
      doc.rect(x + i * sliceSize, y, sliceSize + 0.25, h, 'F');
    } else {
      doc.rect(x, y + i * sliceSize, w, sliceSize + 0.25, 'F');
    }
  }
}

function setFill(doc: jsPDF, c: RGB) {
  doc.setFillColor(c[0], c[1], c[2]);
}
function setText(doc: jsPDF, c: RGB) {
  doc.setTextColor(c[0], c[1], c[2]);
}
function setDraw(doc: jsPDF, c: RGB) {
  doc.setDrawColor(c[0], c[1], c[2]);
}

/** Draw a soft drop shadow by stacking a translucent rect beneath the card. */
function drawShadow(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.16 }));
  setFill(doc, PALETTE.ink);
  doc.rect(x + 1.4, y + 2, w, h, 'F');
  doc.restoreGraphicsState();
}

/** A small rounded pill with centered text — used for badges/labels. */
function drawPill(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  opts: { fg: RGB; bg: RGB; fontSize?: number; padX?: number; height?: number }
) {
  const fontSize = opts.fontSize ?? 7;
  const padX = opts.padX ?? 3;
  const height = opts.height ?? 5.5;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fontSize);
  const textW = doc.getTextWidth(text);
  const w = textW + padX * 2;
  setFill(doc, opts.bg);
  doc.roundedRect(x, y, w, height, height / 2, height / 2, 'F');
  setText(doc, opts.fg);
  doc.text(text, x + padX, y + height / 2 + fontSize * 0.35, { charSpace: 0.2 });
  return w;
}

export const generateTicketPDF = async (data: TicketData) => {
  const { ticketId, eventTitle, eventDate, venue, userName, seatNumbers, ticketCount, totalPrice } = data;

  const PAGE_W = 250;
  const PAGE_H = 100;
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [PAGE_W, PAGE_H] });

  doc.setProperties({
    title: `${ticketId} — ${eventTitle}`,
    subject: 'EventX E-Ticket',
    creator: 'EventX',
  });

  // ─── Page background ───────────────────────────────────────────────
  setFill(doc, PALETTE.page);
  doc.rect(0, 0, PAGE_W, PAGE_H, 'F');

  // ─── Ticket card geometry ───────────────────────────────────────────
  const cardX = 10;
  const cardY = 10;
  const cardW = PAGE_W - cardX * 2; // 230
  const cardH = PAGE_H - cardY * 2; // 80
  const stubW = 58;
  const seamX = cardX + cardW - stubW; // split between main stub & tear-off

  drawShadow(doc, cardX, cardY, cardW, cardH);

  // Main card base (white)
  setFill(doc, PALETTE.paper);
  setDraw(doc, PALETTE.faint);
  doc.setLineWidth(0.3);
  doc.rect(cardX, cardY, cardW, cardH, 'FD');

  // ─── Right stub: gradient "admit one" ticket tear-off ───────────────
  drawGradient(
    doc,
    seamX,
    cardY,
    stubW,
    cardH,
    [PALETTE.primary, PALETTE.amber, PALETTE.crimson],
    'vertical'
  );

  // Perforation notches cut into the seam (top + bottom), colored to match
  // the page so they read as circular bites taken out of the ticket edge.
  setFill(doc, PALETTE.page);
  doc.circle(seamX, cardY, 3.4, 'F');
  doc.circle(seamX, cardY + cardH, 3.4, 'F');

  // Dashed tear line along the seam
  setDraw(doc, PALETTE.white);
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.55 }));
  doc.setLineWidth(0.4);
  doc.setLineDashPattern([1.4, 1.4], 0);
  doc.line(seamX, cardY + 5.5, seamX, cardY + cardH - 5.5);
  doc.restoreGraphicsState();
  doc.setLineDashPattern([], 0);

  // ─── Right stub content ─────────────────────────────────────────────
  const stubCenterX = seamX + stubW / 2;

  setText(doc, PALETTE.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.text('E - T I C K E T', stubCenterX, cardY + 9, { align: 'center', charSpace: 0.4 });

  // White quiet-zone panel behind the QR so it stays scannable on the gradient
  const qrPanel = 38;
  const qrPanelX = stubCenterX - qrPanel / 2;
  const qrPanelY = cardY + 13;
  setFill(doc, PALETTE.white);
  doc.roundedRect(qrPanelX, qrPanelY, qrPanel, qrPanel, 2.5, 2.5, 'F');

  const verifyPayload = JSON.stringify({
    ticket: ticketId,
    event: eventTitle,
    seats: seatNumbers,
    name: userName,
  });
  try {
    const qrDataUrl = await QRCode.toDataURL(verifyPayload, {
      margin: 0,
      width: 320,
      color: { dark: '#1a1533', light: '#ffffff' },
    });
    const qrSize = qrPanel - 6;
    doc.addImage(qrDataUrl, 'PNG', stubCenterX - qrSize / 2, qrPanelY + 3, qrSize, qrSize);
  } catch {
    // If QR generation fails for any reason, degrade gracefully — the
    // ticket is still fully valid via the printed Ticket ID below.
    setText(doc, PALETTE.slate);
    doc.setFontSize(7);
    doc.text('QR unavailable', stubCenterX, qrPanelY + qrPanel / 2, { align: 'center' });
  }

  setText(doc, PALETTE.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text(ticketId, stubCenterX, qrPanelY + qrPanel + 7, { align: 'center', charSpace: 0.3 });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.85 }));
  doc.text(
    `${ticketCount} SEAT${ticketCount > 1 ? 'S' : ''} · $${totalPrice}`,
    stubCenterX,
    qrPanelY + qrPanel + 12.5,
    { align: 'center', charSpace: 0.2 }
  );
  doc.restoreGraphicsState();

  doc.setFontSize(6);
  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.7 }));
  doc.text('Scan to verify at entry', stubCenterX, cardY + cardH - 5, { align: 'center' });
  doc.restoreGraphicsState();

  // ─── Left stub: main ticket details ──────────────────────────────────
  const padX = 9;
  const leftX = cardX + padX;
  const rightBound = seamX - padX;
  const contentW = rightBound - leftX;

  // Brand mark
  setFill(doc, PALETTE.primary);
  doc.roundedRect(leftX, cardY + 7, 7, 7, 1.8, 1.8, 'F');
  setText(doc, PALETTE.white);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('E', leftX + 3.5, cardY + 12, { align: 'center' });

  setText(doc, PALETTE.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('EventX', leftX + 10, cardY + 12.3);

  // Confirmed badge, right-aligned within the left stub
  doc.setFontSize(7);
  const badgeText = 'CONFIRMED';
  doc.setFont('helvetica', 'bold');
  const badgeW = doc.getTextWidth(badgeText) + 6;
  drawPill(doc, badgeText, rightBound - badgeW, cardY + 6.2, {
    fg: PALETTE.success,
    bg: hslToRgb(155, 65, 92),
  });

  setDraw(doc, PALETTE.faint);
  doc.setLineWidth(0.25);
  doc.line(leftX, cardY + 18, rightBound, cardY + 18);

  // Event title
  setText(doc, PALETTE.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(19);
  const titleLines: string[] = doc.splitTextToSize(eventTitle, contentW);
  let cursorY = cardY + 27;
  titleLines.slice(0, 2).forEach((line: string, i: number) => {
    doc.text(line, leftX, cursorY + i * 8);
  });
  cursorY += (Math.min(titleLines.length, 2) - 1) * 8;

  // Info grid: Date, Venue, Attendee — the date column gets a larger share
  // since formatted dates ("Friday, March 06, 2026 · 8:00 PM") run long.
  const infoY = cursorY + 12;
  const colRatios = [0.4, 0.32, 0.28];
  const infoFields: [string, string][] = [
    ['DATE & TIME', eventDate],
    ['VENUE', venue],
    ['ATTENDEE', userName],
  ];
  let colCursor = leftX;
  infoFields.forEach(([label, value], i) => {
    const colW = contentW * colRatios[i];
    const x = colCursor;
    colCursor += colW;

    setText(doc, PALETTE.slate);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(6.5);
    doc.text(label, x, infoY, { charSpace: 0.3 });

    setText(doc, PALETTE.ink);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.5);
    const valueLines: string[] = doc.splitTextToSize(value, colW - 5);
    doc.text(valueLines.slice(0, 2), x, infoY + 5.5);
  });

  // Seat chips
  const seatsY = infoY + 20;
  setText(doc, PALETTE.slate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.text('SEATS', leftX, seatsY, { charSpace: 0.3 });

  let chipX = leftX;
  let chipY = seatsY + 3;
  const chipRowLimit = rightBound;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const visibleSeats = seatNumbers.slice(0, 14);
  const overflowCount = seatNumbers.length - visibleSeats.length;
  visibleSeats.forEach(seat => {
    const w = doc.getTextWidth(seat) + 5;
    if (chipX + w > chipRowLimit) {
      chipX = leftX;
      chipY += 7;
    }
    setFill(doc, hslToRgb(38, 85, 94));
    setDraw(doc, hslToRgb(38, 60, 78));
    doc.setLineWidth(0.2);
    doc.roundedRect(chipX, chipY, w, 6, 1.5, 1.5, 'FD');
    setText(doc, PALETTE.primary);
    doc.text(seat, chipX + w / 2, chipY + 4.1, { align: 'center' });
    chipX += w + 2.5;
  });
  if (overflowCount > 0) {
    setText(doc, PALETTE.slate);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(`+${overflowCount} more`, chipX + 1, chipY + 4.1);
  }

  // Footer: divider + total + fine print
  const footerY = cardY + cardH - 10;
  setDraw(doc, PALETTE.faint);
  doc.setLineWidth(0.25);
  doc.line(leftX, footerY, rightBound, footerY);

  setText(doc, PALETTE.slate);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.text('Present this ticket (digital or printed) at the venue entrance. Non-transferable.', leftX, footerY + 5.5);

  setText(doc, PALETTE.slate);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text('TOTAL PAID', rightBound, footerY + 2, { align: 'right' });
  setText(doc, PALETTE.ink);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(`$${totalPrice}`, rightBound, footerY + 8, { align: 'right' });

  doc.save(`${ticketId}-ticket.pdf`);
};
