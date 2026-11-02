'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { roomTypes } from '@/content/rooms';
import { bookingCenterUrl, nextDay } from '@/lib/bookingcenter';

function useStayDates() {
  const [today, setToday] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');

  // Set after load so "today" is the guest's day, not the server's.
  useEffect(() => {
    const now = new Date();
    setToday(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`);
  }, []);

  const pickCheckIn = (value: string) => {
    setCheckIn(value);
    if (value && (!checkOut || checkOut <= value)) setCheckOut(nextDay(value));
  };

  return { today, checkIn, checkOut, pickCheckIn, setCheckOut };
}

type StayDatesState = ReturnType<typeof useStayDates>;

function DateFields({ dates, checkInId }: { dates: StayDatesState; checkInId: string }) {
  const checkOutId = useId();
  return (
    <div className="planner__grid">
      <label className="field" htmlFor={checkInId}>
        Check in
        <input id={checkInId} type="date" required min={dates.today || undefined} value={dates.checkIn} onChange={(e) => dates.pickCheckIn(e.target.value)} />
      </label>
      <label className="field" htmlFor={checkOutId}>
        Check out
        <input id={checkOutId} type="date" required min={dates.checkIn ? nextDay(dates.checkIn) : dates.today || undefined} value={dates.checkOut} onChange={(e) => dates.setCheckOut(e.target.value)} />
      </label>
    </div>
  );
}

const NOTE = 'You’ll see rates and open rooms on the next screen. Minimum stays vary by date.';

/** The date picker that opens BookingCenter's results for those dates. */
export function StayDates() {
  const dates = useStayDates();
  const checkInId = useId();
  return (
    <form
      className="planner"
      aria-label="Check room availability"
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = bookingCenterUrl({ checkIn: dates.checkIn, checkOut: dates.checkOut });
      }}
    >
      <DateFields dates={dates} checkInId={checkInId} />
      <button type="submit" className="btn btn--amber">See rooms and rates</button>
      <p className="planner__note">{NOTE}</p>
    </form>
  );
}

/** The room types with one shared date picker; each room's button opens the results with that type on top. */
export function RoomFinder() {
  const dates = useStayDates();
  const checkInId = useId();
  const hasDates = Boolean(dates.checkIn && dates.checkOut);

  const askForDates = () => {
    const input = document.getElementById(checkInId);
    input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    input?.focus({ preventScroll: true });
  };

  return (
    <div className="stack" style={{ gap: 36 }}>
      <div className="planner" style={{ maxWidth: 560 }}>
        <DateFields dates={dates} checkInId={checkInId} />
        <p className="planner__note">{NOTE}</p>
      </div>
      <div className="space-grid">
        {roomTypes.map((r) => (
          <div key={r.code} className="space">
            {r.photo ? (
              <Image src={r.photo} alt={`River Ranch room: ${r.name}`} width={800} height={1000} sizes="(max-width: 600px) 100vw, 300px" />
            ) : (
              <div className="ph" role="img" aria-label={`Photo coming soon: ${r.name}`}>Photo coming soon</div>
            )}
            <h3 className="space__name" style={{ fontSize: 26, lineHeight: 1.1 }}>{r.name}</h3>
            <p className="muted" style={{ margin: 0, fontSize: 15, lineHeight: 1.5 }}>{r.line}</p>
            <p style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>
              {[`Sleeps ${r.sleeps}`, r.dogFriendly && 'Dog-friendly', r.accessible && 'ADA'].filter(Boolean).join(' · ')}
            </p>
            {hasDates ? (
              <a href={bookingCenterUrl({ checkIn: dates.checkIn, checkOut: dates.checkOut, roomType: r.code })} className="btn btn--amber btn--sm" rel="noopener">See rates</a>
            ) : (
              <button type="button" className="btn btn--amber btn--sm" onClick={askForDates}>Choose dates</button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
