'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { roomTypes } from '@/content/rooms';
import { bookingCenterUrl, cleanPromo, nextDay } from '@/lib/bookingcenter';
import { lodging } from '@/content/site';

function useStayDates() {
  const [today, setToday] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [promo, setPromo] = useState('');

  // Set after load so "today" is the guest's day, not the server's. A link like /stay?checkin=2026-12-24#book
  // (the home page's "Stay this night") arrives with that night picked, unless it is in the past. A link with
  // ?promo=staydine (the emails and posts for a deal) carries the code through to BookingCenter.
  useEffect(() => {
    const now = new Date();
    const t = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    setToday(t);
    const q = new URLSearchParams(window.location.search);
    setPromo(cleanPromo(q.get('promo')));
    const asked = q.get('checkin');
    if (asked && /^\d{4}-\d{2}-\d{2}$/.test(asked) && asked >= t) {
      setCheckIn(asked);
      setCheckOut(nextDay(asked));
    }
  }, []);

  const pickCheckIn = (value: string) => {
    setCheckIn(value);
    if (value && (!checkOut || checkOut <= value)) setCheckOut(nextDay(value));
  };

  return { today, checkIn, checkOut, promo, pickCheckIn, setCheckOut };
}

type StayDatesState = ReturnType<typeof useStayDates>;

function DateFields({ dates, checkInId }: { dates: StayDatesState; checkInId: string }) {
  const checkOutId = useId();
  return (
    <div className="form-grid rb-dates">
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

/** "Cal King bed, balcony over river": the part after the comma takes the italic accent. */
function roomName(name: string) {
  const at = name.indexOf(',');
  if (at < 0) return name;
  return (
    <>
      {name.slice(0, at + 1)} <em>{name.slice(at + 1).trim()}</em>
    </>
  );
}

const NOTE = 'You’ll see rates and open rooms on the next screen. Minimum stays vary by date.';

/** The date picker that opens BookingCenter's results for those dates (a Fireside bark panel). */
export function StayDates() {
  const dates = useStayDates();
  const checkInId = useId();
  return (
    <div className="panel rb-panel">
      <form
        className="form"
        aria-label="Check room availability"
        onSubmit={(e) => {
          e.preventDefault();
          window.location.href = bookingCenterUrl({ checkIn: dates.checkIn, checkOut: dates.checkOut, promo: dates.promo });
        }}
      >
        <DateFields dates={dates} checkInId={checkInId} />
        {dates.promo && <p className="planner__note">Promo code <b>{dates.promo.toUpperCase()}</b> is applied.</p>}
        <button type="submit" className="btn rb-panel__go">See rooms and rates</button>
        <p className="planner__note">{NOTE}</p>
        <p className="planner__note">Check-in is {lodging.checkIn}. Check-out is {lodging.checkOut}. Bringing the dog? Tell us ahead.</p>
      </form>
    </div>
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
    <div className="rb-finder">
      <div className="panel rb-finder__dates">
        <h3 className="panel__title">Your dates <em>first</em></h3>
        <DateFields dates={dates} checkInId={checkInId} />
        <p className="planner__note">{NOTE}</p>
      </div>
      <ul className="rb-rooms" aria-label="Room types">
        {roomTypes.map((r) => (
          <li key={r.code} className="card rb-room" data-reveal>
            <div className="card__media">
              {r.photo ? (
                <Image src={r.photo} alt={`River Ranch room: ${r.name}`} fill sizes="(max-width: 600px) 100vw, (max-width: 1000px) 50vw, 420px" />
              ) : (
                <div className="rb-room__ph" role="img" aria-label={`Photo coming soon: ${r.name}`}>Photo coming soon</div>
              )}
            </div>
            <div className="card__body rb-room__body">
              <h3 className="card__title">{roomName(r.name)}</h3>
              <p className="card__line">{r.line}</p>
              <div className="card__meta">
                <span className="chip chip--plain">Sleeps {r.sleeps}</span>
                {r.dogFriendly && <span className="chip chip--lodge">Dog-friendly</span>}
                {r.accessible && <span className="chip chip--plain">ADA</span>}
              </div>
              {hasDates ? (
                <a href={bookingCenterUrl({ checkIn: dates.checkIn, checkOut: dates.checkOut, roomType: r.code, promo: dates.promo })} className="btn btn--sm rb-room__go" rel="noopener">See rates</a>
              ) : (
                <button type="button" className="btn btn--ghost btn--sm rb-room__go" onClick={askForDates}>Choose dates</button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
