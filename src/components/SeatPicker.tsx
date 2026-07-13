import { useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

interface SeatPickerProps {
  maxSelectable: number;
  selectedSeats: string[];
  onSelectionChange: (seats: string[]) => void;
  bookedSeats?: string[];
  pendingSeats?: string[]; // Seats locked by other users
}

// Generate a deterministic venue layout: 8 rows (A-H), varying seats per row
const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const SEATS_PER_ROW: Record<string, number> = {
  A: 8,
  B: 10,
  C: 12,
  D: 14,
  E: 14,
  F: 12,
  G: 10,
  H: 8,
};

const SeatPicker = ({
  maxSelectable,
  selectedSeats,
  onSelectionChange,
  bookedSeats = [],
  pendingSeats = [],
}: SeatPickerProps) => {
  const bookedSet = useMemo(() => new Set(bookedSeats), [bookedSeats]);
  const pendingSet = useMemo(() => new Set(pendingSeats), [pendingSeats]);

  const handleSeatClick = useCallback(
    (seatId: string) => {
      if (bookedSet.has(seatId) || pendingSet.has(seatId)) return;

      if (selectedSeats.includes(seatId)) {
        onSelectionChange(selectedSeats.filter((s) => s !== seatId));
      } else {
        if (selectedSeats.length < maxSelectable) {
          onSelectionChange([...selectedSeats, seatId]);
        }
      }
    },
    [selectedSeats, maxSelectable, bookedSet, pendingSet, onSelectionChange]
  );

  const getSeatStatus = (seatId: string): 'available' | 'selected' | 'booked' | 'pending' => {
    if (bookedSet.has(seatId)) return 'booked';
    if (pendingSet.has(seatId)) return 'pending';
    if (selectedSeats.includes(seatId)) return 'selected';
    return 'available';
  };

  const seatStyles: Record<string, React.CSSProperties> = {
    available: {
      background: 'hsl(var(--secondary))',
      borderColor: 'hsl(var(--border))',
      color: 'hsl(var(--foreground))',
      cursor: 'pointer',
    },
    selected: {
      background: 'var(--gradient-primary)',
      borderColor: 'hsl(var(--primary))',
      color: 'hsl(var(--primary-foreground))',
      cursor: 'pointer',
      boxShadow: '0 0 16px -3px hsl(var(--primary) / 0.5)',
    },
    booked: {
      background: 'hsl(var(--surface-disabled))',
      borderColor: 'hsl(var(--surface-disabled-border))',
      color: 'hsl(var(--muted-foreground))',
      cursor: 'not-allowed',
    },
    pending: {
      background: 'hsla(38, 68%, 46%, 0.1)',
      borderColor: 'hsla(38, 68%, 42%, 0.4)',
      borderStyle: 'dashed',
      color: 'hsl(38, 68%, var(--tint-fg-l))',
      cursor: 'not-allowed',
    },
  };

  return (
    <div className="space-y-4">
      {/* Stage indicator */}
      <div className="relative mx-auto w-3/4 mb-8">
        <div
          className="h-10 rounded-t-[100%] flex items-center justify-center text-xs font-bold tracking-[0.2em] uppercase"
          style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 8px 40px -5px hsla(38, 80%, 50%, 0.35), inset 0 -2px 10px hsla(0, 0%, 0%, 0.2)',
            color: 'hsl(var(--primary-foreground))',
          }}
        >
          STAGE
        </div>
        <div
          className="h-[2px] w-full"
          style={{
            background: 'linear-gradient(90deg, transparent, hsla(38, 80%, 50%, 0.4), hsla(350, 65%, 46%, 0.3), transparent)',
          }}
        />
        {/* Stage glow */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-2/3 h-8 opacity-30 blur-xl"
          style={{ background: 'var(--gradient-primary)' }} />
      </div>

      {/* Seat grid */}
      <div className="space-y-1.5">
        {ROWS.map((row, rowIndex) => {
          const seatCount = SEATS_PER_ROW[row];
          return (
            <motion.div
              key={row}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: rowIndex * 0.04 }}
              className="flex items-center justify-center gap-1"
            >
              <span className="w-6 text-[10px] font-bold text-muted-foreground text-right mr-1.5 select-none">
                {row}
              </span>
              {Array.from({ length: seatCount }, (_, i) => {
                const seatNum = i + 1;
                const seatId = `${row}${seatNum}`;
                const status = getSeatStatus(seatId);
                const isDisabled = status === 'booked' || status === 'pending';
                const style = seatStyles[status];

                return (
                  <motion.button
                    key={seatId}
                    type="button"
                    onClick={() => handleSeatClick(seatId)}
                    disabled={isDisabled}
                    whileTap={!isDisabled ? { scale: 0.85 } : undefined}
                    whileHover={!isDisabled ? { scale: 1.1 } : undefined}
                    className={`
                      w-7 h-7 sm:w-8 sm:h-8 rounded-md border text-[10px] font-bold
                      transition-all duration-200 flex items-center justify-center
                      ${status === 'pending' ? 'animate-pulse' : ''}
                    `}
                    style={style as React.CSSProperties}
                    title={
                      status === 'pending'
                        ? `Seat ${seatId} — Locked by another user`
                        : status === 'booked'
                        ? `Seat ${seatId} — Booked`
                        : `Seat ${seatId}`
                    }
                  >
                    {status === 'booked' ? '✕' : seatNum}
                  </motion.button>
                );
              })}
              <span className="w-6 text-[10px] font-bold text-muted-foreground text-left ml-1.5 select-none">
                {row}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-5 sm:gap-6 pt-4 text-xs text-muted-foreground flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={seatStyles.available} />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{
            background: 'var(--gradient-primary)',
            boxShadow: '0 0 10px -2px hsla(38, 80%, 50%, 0.4)',
          }} />
          <span>Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md" style={{
            ...seatStyles.pending as React.CSSProperties,
            borderWidth: '1px',
          }} />
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md flex items-center justify-center text-[8px]" style={seatStyles.booked}>
            ✕
          </div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
};

export default SeatPicker;
