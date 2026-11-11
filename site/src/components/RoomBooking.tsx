'use client';

import { useEffect, useId, useState } from 'react';
import Image from 'next/image';
import { roomTypes } from '@/content/rooms';
import { business, lodging } from '@/content/site';
import { bookingCenterUrl, cleanPromo, nextDay } from '@/lib/bookingcenter';

const MAX_GUESTS = 4; // The most any one room sleeps.
const SEARCH_TIMEOUT_MS = 15_000;

type LiveRoom = {
  code: string;
  name: string;
  unitsLeft: number;
  beforeTax: number;
  afterTax: number;
  deposit: number | null;
  policy: string | null;
};
type LiveRates = { rooms: LiveRoom[]; test: boolean; nights: number };

/** Live rooms for a stay, or null for "use the handoff": not set up, or BookingCenter can't be reached. */
async function searchRates(q: { checkIn: string; checkOut: string; guests: number }, signal?: AbortSignal): Promise<LiveRates | null> {
  try {
    const params = new URLSearchParams({ checkIn: q.checkIn, checkOut: q.checkOut, guests: String(q.guests) });
    const timeout = AbortSignal.timeout(SEARCH_TIMEOUT_MS);
    const res = await fetch(`/api/stay/availability?${params}`, { signal: signal ? AbortSignal.any([signal, timeout]) : timeout });
    const data = await res.json();
    return data.status === 'ok' ? data : null;
  } catch {
    return null;
  }
}

function useStayDates() {
  const [today, setToday] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [promo, setPromo] = useState('');
  const [guests, setGuests] = useState(2);

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

  return { today, checkIn, checkOut, guests, promo, pickCheckIn, setCheckOut, setGuests };
}

type StayDatesState = ReturnType<typeof useStayDates>;

function DateFields({ dates, checkInId }: { dates: StayDatesState; checkInId: string }) {
  const checkOutId = useId();
  const guestsId = useId();
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
      <label className="field" htmlFor={guestsId}>
        Guests per room
        <select id={guestsId} value={dates.guests} onChange={(e) => dates.setGuests(Number(e.target.value))}>
          {Array.from({ length: MAX_GUESTS }, (_, i) => i + 1).map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
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

const NOTE = 'Minimum stays vary by date. Booking more than one room? Call the front desk.';
const money = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const nightsWord = (n: number) => `${n} ${n === 1 ? 'night' : 'nights'}`;

function TestNotice({ show }: { show: boolean }) {
  return show ? <p className="live-test" role="status">BookingCenter test system: these are not real rates.</p> : null;
}

function NoRooms() {
  return (
    <p className="planner__note" role="status">
      No rooms are showing online for those dates and guests. Try other dates, or call the front desk at{' '}
      <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
    </p>
  );
}

/** A room's price, deposit and policy for the stay. */
function RateLines({ room, nights }: { room: LiveRoom; nights: number }) {
  return (
    <div className="live-rate">
      <p className="live-rate__price"><b>{money(room.afterTax)}</b> with tax, {nightsWord(nights)}</p>
      {room.deposit !== null && <p className="live-rate__sub">{money(room.deposit)} deposit to book</p>}
      {room.policy && (
        <details className="live-rate__policy">
          <summary>Deposit and cancellation</summary>
          <p>{room.policy}</p>
        </details>
      )}
    </div>
  );
}

const siteName = (room: LiveRoom) => roomTypes.find((r) => r.code === room.code)?.name ?? room.name;

/** The date picker (a Fireside bark panel). It lists live rooms when it can, and otherwise opens BookingCenter's
 *  results for those dates. A promo code skips the live list: only BookingCenter's page applies the code. */
export function StayDates() {
  const dates = useStayDates();
  const checkInId = useId();
  const [searching, setSearching] = useState(false);
  const [found, setFound] = useState<(LiveRates & { checkIn: string; checkOut: string }) | null>(null);

  return (
    <div className="panel rb-panel">
      <form
        className="form"
        aria-label="Check room availability"
        onSubmit={async (e) => {
          e.preventDefault();
          const { checkIn, checkOut, guests, promo } = dates;
          if (promo) {
            window.location.href = bookingCenterUrl({ checkIn, checkOut, promo });
            return;
          }
          setSearching(true);
          const rates = await searchRates({ checkIn, checkOut, guests });
          setSearching(false);
          if (rates) setFound({ ...rates, checkIn, checkOut });
          else window.location.href = bookingCenterUrl({ checkIn, checkOut });
        }}
      >
        <DateFields dates={dates} checkInId={checkInId} />
        {dates.promo && <p className="planner__note">Promo code <b>{dates.promo.toUpperCase()}</b> is applied.</p>}
        <button type="submit" className="btn rb-panel__go" disabled={searching}>{searching ? 'Checking…' : 'See rooms and rates'}</button>
        <p className="planner__note">{NOTE}</p>
        <p className="planner__note">Check-in is {lodging.checkIn}. Check-out is {lodging.checkOut}. Bringing the dog? Tell us ahead.</p>
        {found && (
          <div className="live-list" aria-live="polite">
            <TestNotice show={found.test} />
            {found.rooms.length === 0 && <NoRooms />}
            {found.rooms.map((room) => (
              <div key={room.code} className="live-list__room">
                <p className="live-list__name">{roomName(siteName(room))}</p>
                <RateLines room={room} nights={found.nights} />
                <a href={bookingCenterUrl({ checkIn: found.checkIn, checkOut: found.checkOut, roomType: room.code })} className="btn btn--sm" rel="noopener">Book this room</a>
              </div>
            ))}
            <a href={bookingCenterUrl({ checkIn: found.checkIn, checkOut: found.checkOut })} className="link-arrow live-list__all" rel="noopener">See all rooms on our booking page</a>
          </div>
        )}
      </form>
    </div>
  );
}

function MorePhotos({ name, primary, urls }: { name: string; primary: string | null; urls: string[] }) {
  const more = urls.filter((u) => u !== primary);
  if (more.length === 0) return null;
  return (
    <details className="room-photos">
      <summary>More photos ({more.length})</summary>
      <div className="room-photos__strip">
        {more.map((src, i) => (
          <Image key={src} src={src} alt={`River Ranch room: ${name}, photo ${i + 1}`} width={600} height={450} sizes="240px" loading="lazy" />
        ))}
      </div>
    </details>
  );
}

/**
 * The room types with one shared date picker. Once dates are in, rooms with a live rate show it and every
 * room's button opens the results with that type on top. A room with no live rate isn't called sold out:
 * BookingCenter's page has the last word.
 */
export function RoomFinder({ photos = {} }: { photos?: Record<string, string[]> }) {
  const dates = useStayDates();
  const checkInId = useId();
  const { checkIn, checkOut, guests } = dates;
  const hasDates = Boolean(checkIn && checkOut && checkOut > checkIn);
  const [rates, setRates] = useState<LiveRates | null>(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    setRates(null);
    if (!hasDates || dates.promo) return;
    const stop = new AbortController();
    setSearching(true);
    // A short wait, so typing a date doesn't send a search for each keystroke.
    const wait = setTimeout(async () => {
      const found = await searchRates({ checkIn, checkOut, guests }, stop.signal);
      if (!stop.signal.aborted) {
        setRates(found);
        setSearching(false);
      }
    }, 350);
    return () => {
      stop.abort();
      clearTimeout(wait);
    };
  }, [checkIn, checkOut, guests, hasDates, dates.promo]);

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
        <p className="planner__note">{hasDates && searching ? 'Checking rooms and rates…' : NOTE}</p>
        {rates && <TestNotice show={rates.test} />}
        {rates?.rooms.length === 0 && <NoRooms />}
      </div>
      <ul className="rb-rooms" aria-label="Room types">
        {roomTypes.map((r) => {
          const live = rates?.rooms.find((x) => x.code === r.code);
          return (
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
                <MorePhotos name={r.name} primary={r.photo} urls={photos[r.code] ?? []} />
                {live && rates && <RateLines room={live} nights={rates.nights} />}
                {hasDates ? (
                  <a href={bookingCenterUrl({ checkIn, checkOut, roomType: r.code, promo: dates.promo })} className="btn btn--sm rb-room__go" rel="noopener">{live ? 'Book this room' : 'See rates'}</a>
                ) : (
                  <button type="button" className="btn btn--ghost btn--sm rb-room__go" onClick={askForDates}>Choose dates</button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
