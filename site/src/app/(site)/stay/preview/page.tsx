import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import { SiteHeader } from '@/components/SiteHeader';
import { groupDeal } from '@/content/group-deals';
import { roomTypes } from '@/content/rooms';
import { isSignedIn } from '@/lib/admin/session';
import { settingsReport } from '@/lib/bookingcenter-api';
import { bookingCenterUrl, cleanPromo } from '@/lib/bookingcenter';
import {
  addDays,
  previewAvailability,
  previewContent,
  previewNights,
  todayInTahoe,
  type CallResult,
  type PreviewRoom,
} from '@/lib/bookingcenter-preview';
import './preview.css';

// The straight preview: what BookingCenter answers for availability, rate plans and packages, and
// whether a group fits, with no handoff when something fails. Read-only: it never saves a booking.
// Open on preview builds and locally; on the live site only for signed-in staff.

export const metadata: Metadata = { title: 'Lodging preview', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

type Search = Record<string, string | string[] | undefined>;

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? '';
const isDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s) && new Date(`${s}T00:00:00Z`).toISOString().slice(0, 10) === s;
const clampInt = (s: string, lo: number, hi: number, dflt: number) => {
  const n = Number.parseInt(s, 10);
  return Number.isFinite(n) ? Math.min(hi, Math.max(lo, n)) : dflt;
};

function readQuery(sp: Search) {
  const today = todayInTahoe();
  const latest = addDays(today, 730);
  const date = (s: string, dflt: string) => (isDate(s) && s >= today && s <= latest ? s : dflt);
  const checkIn = date(one(sp.checkIn), addDays(today, 7));
  const nights = clampInt(one(sp.nights), 1, 14, 2);
  return {
    today,
    checkIn,
    nights,
    checkOut: addDays(checkIn, nights),
    guests: clampInt(one(sp.guests), 1, 4, 2),
    promo: cleanPromo(one(sp.promo)),
    rooms: clampInt(one(sp.rooms), 1, 19, 6),
    start: date(one(sp.start), today),
    days: clampInt(one(sp.days), 1, 31, 14),
  };
}

type Q = ReturnType<typeof readQuery>;

const money = (n: number | null) =>
  n === null ? '–' : `$${n.toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(n) ? 0 : 2, maximumFractionDigits: 2 })}`;
const day = (iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', month: 'short', day: 'numeric' }) =>
  new Date(`${iso}T12:00:00Z`).toLocaleDateString('en-US', { ...opts, timeZone: 'UTC' });
const siteName = (code: string, fallback?: string) => roomTypes.find((r) => r.code === code)?.name ?? fallback ?? code;
const lowest = (room: PreviewRoom) => {
  const totals = room.rates.map((r) => r.afterTax).filter((n): n is number => n !== null);
  return totals.length ? Math.min(...totals) : null;
};

export default function PreviewPage({ searchParams }: { searchParams: Search }) {
  if (process.env.VERCEL_ENV === 'production' && !isSignedIn()) notFound();
  const q = readQuery(searchParams);
  const s = settingsReport();

  return (
    <>
      <SiteHeader />
      <section className="section section--snow pv-top">
        <div className="container stack-l">
          <div className="stack">
            <p className="label label--accent">Preview</p>
            <h1 className="display-m">Live from <em>BookingCenter.</em></h1>
          </div>

          <dl className="pv-settings">
            <div><dt>System</dt><dd>{s.host ? `${s.test ? 'Test' : 'Live'} · ${s.host}` : '–'}</dd></div>
            <div><dt>Site</dt><dd>{s.site ?? '–'}</dd></div>
            <div><dt>Key</dt><dd>{s.keySet ? 'Set' : 'Missing'}</dd></div>
            <div><dt>Stay pages</dt><dd>{s.guestPages ? 'Live rates on' : 'Handing off to BookingCenter'}</dd></div>
          </dl>
          {s.problem && <p className="pv-problem" role="status">{s.problem}</p>}

          <form className="form pv-form" method="get" action="/stay/preview">
            <div className="form-grid pv-form__grid">
              <label className="field">Check in<input type="date" name="checkIn" defaultValue={q.checkIn} min={q.today} /></label>
              <label className="field">Nights<input type="number" name="nights" defaultValue={q.nights} min={1} max={14} /></label>
              <label className="field">Guests per room
                <select name="guests" defaultValue={q.guests}>{[1, 2, 3, 4].map((n) => <option key={n}>{n}</option>)}</select>
              </label>
              <label className="field">Promo code<input type="text" name="promo" defaultValue={q.promo.toUpperCase()} maxLength={20} autoCapitalize="characters" /></label>
              <label className="field">Rooms for a group<input type="number" name="rooms" defaultValue={q.rooms} min={1} max={19} /></label>
              <label className="field">Grid from<input type="date" name="start" defaultValue={q.start} min={q.today} /></label>
              <label className="field">Grid nights
                <select name="days" defaultValue={q.days}>{[7, 14, 21, 31].map((n) => <option key={n}>{n}</option>)}</select>
              </label>
            </div>
            <button type="submit" className="btn">Ask BookingCenter</button>
          </form>
        </div>
      </section>

      {s.preview ? (
        <>
          <Suspense fallback={<Waiting title="Your dates" />}><StaySection q={q} /></Suspense>
          <Suspense fallback={<Waiting title="Night by night" />}><NightsSection q={q} /></Suspense>
          <Suspense fallback={<Waiting title="Packages" />}><PackagesSection q={q} /></Suspense>
          <Suspense fallback={<Waiting title="Groups" />}><GroupSection q={q} /></Suspense>
        </>
      ) : null}
    </>
  );
}

function Waiting({ title }: { title: string }) {
  return (
    <section className="section section--tight pv-sec">
      <div className="container"><h2 className="display-m">{title}</h2><p className="muted">Asking BookingCenter…</p></div>
    </section>
  );
}

function CallLine({ r }: { r: CallResult<unknown> }) {
  return (
    <p className={`pv-call${r.ok ? '' : ' pv-call--bad'}`}>
      {r.name} · {r.ok ? 'answered' : 'failed'} · {r.ms} ms{r.error && <> · <b>{r.error}</b></>}
    </p>
  );
}

function Raw({ r }: { r: CallResult<unknown> }) {
  if (!r.raw && r.tags.length === 0) return null;
  return (
    <details className="pv-raw">
      <summary>What came back</summary>
      {r.tags.length > 0 && <p className="pv-tags">{r.tags.slice(0, 40).map((t) => `${t.tag} ×${t.count}`).join('  ·  ')}</p>}
      {r.raw && <pre>{r.raw.replace(/></g, '>\n<')}</pre>}
    </details>
  );
}

// ---------- your dates: every room type and every rate plan BookingCenter returns ----------

async function StaySection({ q }: { q: Q }) {
  const base = (await previewAvailability({ checkIn: q.checkIn, checkOut: q.checkOut, guests: q.guests }))!;
  const promo = q.promo ? await previewAvailability({ checkIn: q.checkIn, checkOut: q.checkOut, guests: q.guests, promo: q.promo }) : null;
  const rooms = base.data ?? [];
  const promoRooms = promo?.data ?? [];
  const promoLowest = (code: string) => {
    const r = promoRooms.find((x) => x.code === code);
    return r ? lowest(r) : null;
  };

  return (
    <section className="section section--frost section--tight pv-sec" aria-labelledby="pv-stay">
      <div className="container stack">
        <h2 id="pv-stay" className="display-m">
          {day(q.checkIn)} to {day(q.checkOut)} <em>· {q.nights} {q.nights === 1 ? 'night' : 'nights'}, {q.guests} {q.guests === 1 ? 'guest' : 'guests'}</em>
        </h2>
        <CallLine r={base} />
        {promo && <CallLine r={promo} />}
        {base.ok && rooms.length === 0 && <p>No rooms open for these dates.</p>}
        <div className="pv-rooms">
          {rooms.map((room) => {
            const withPromo = promo?.ok ? promoLowest(room.code) : null;
            const plain = lowest(room);
            return (
              <article key={room.code} className="card pv-room">
                <div className="card__body">
                  <h3 className="card__title">{siteName(room.code, room.name)}</h3>
                  <p className="card__line">{room.code} · {room.unitsLeft} left{room.maxGuests ? ` · sleeps ${room.maxGuests}` : ''}</p>
                  <ul className="pv-rates">
                    {room.rates.map((r, i) => (
                      <li key={`${r.plan}-${i}`}>
                        <span>{r.planName || r.plan || 'Rate'}{r.plan && r.planName ? <span className="muted"> · {r.plan}</span> : null}</span>
                        <b>{money(r.afterTax)}</b>
                      </li>
                    ))}
                  </ul>
                  {promo?.ok && (
                    <p className="pv-promo">
                      {q.promo.toUpperCase()}: {withPromo === null ? 'not offered' : money(withPromo)}
                      {withPromo !== null && plain !== null && withPromo === plain && <span className="muted"> · same as without</span>}
                    </p>
                  )}
                  {room.rates[0]?.deposit !== null && room.rates[0]?.deposit !== undefined && <p className="small">{money(room.rates[0].deposit)} deposit</p>}
                  {room.rates[0]?.policy && <details className="small"><summary>Deposit and cancellation</summary><p>{room.rates[0].policy}</p></details>}
                  <a className="link-arrow small" href={bookingCenterUrl({ checkIn: q.checkIn, checkOut: q.checkOut, roomType: room.code, promo: q.promo })} rel="noopener" target="_blank">
                    On BookingCenter
                  </a>
                </div>
              </article>
            );
          })}
        </div>
        <Raw r={base} />
      </div>
    </section>
  );
}

// ---------- night by night: rooms left per type, from one-night searches ----------

async function NightsSection({ q }: { q: Q }) {
  const nights = (await previewNights(q.start, q.days))!;
  const codes = new Set<string>(roomTypes.map((r) => r.code));
  for (const n of nights) for (const r of n.result.data ?? []) codes.add(r.code);
  const failed = nights.filter((n) => !n.result.ok);
  const units = (night: (typeof nights)[number], code: string) => night.result.data?.find((r) => r.code === code)?.unitsLeft ?? 0;
  const ms = Math.max(...nights.map((n) => n.result.ms));

  return (
    <section className="section section--snow section--tight pv-sec" aria-labelledby="pv-nights">
      <div className="container stack">
        <h2 id="pv-nights" className="display-m">Night by night</h2>
        <p className={`pv-call${failed.length ? ' pv-call--bad' : ''}`}>
          OTA_HotelAvailRQ × {nights.length} · {nights.length - failed.length} answered · slowest {ms} ms
          {failed[0] && <> · <b>{day(failed[0].night)}: {failed[0].result.error}</b></>}
        </p>
        <div className="pv-scroll">
          <table className="pv-grid">
            <thead>
              <tr>
                <th scope="col">Room</th>
                {nights.map((n) => <th key={n.night} scope="col">{day(n.night, { weekday: 'short' })}<br />{day(n.night, { month: 'numeric', day: 'numeric' })}</th>)}
              </tr>
            </thead>
            <tbody>
              {[...codes].map((code) => (
                <tr key={code}>
                  <th scope="row">{siteName(code)}</th>
                  {nights.map((n) => {
                    const u = units(n, code);
                    return <td key={n.night} className={!n.result.ok ? 'pv-x' : u ? 'pv-open' : ''}>{!n.result.ok ? '!' : u || ''}</td>;
                  })}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <th scope="row">Open</th>
                {nights.map((n) => <td key={n.night}>{n.result.ok ? (n.result.data ?? []).reduce((t, r) => t + r.unitsLeft, 0) : '!'}</td>)}
              </tr>
              <tr>
                <th scope="row">From</th>
                {nights.map((n) => {
                  const all = (n.result.data ?? []).map(lowest).filter((x): x is number => x !== null);
                  return <td key={n.night}>{all.length ? money(Math.min(...all)) : ''}</td>;
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}

// ---------- packages: rate plans seen for the stay, and what the site-content message lists ----------

async function PackagesSection({ q }: { q: Q }) {
  const [stay, content] = await Promise.all([
    previewAvailability({ checkIn: q.checkIn, checkOut: q.checkOut, guests: q.guests })!,
    previewContent(),
  ]);
  const plans = new Map<string, { name: string | null; from: number | null; rooms: number }>();
  for (const room of stay.data ?? []) {
    for (const r of room.rates) {
      const key = r.plan || r.planName || 'Rate';
      const p = plans.get(key) ?? { name: r.planName, from: null, rooms: 0 };
      p.rooms += 1;
      if (r.afterTax !== null) p.from = p.from === null ? r.afterTax : Math.min(p.from, r.afterTax);
      plans.set(key, p);
    }
  }
  const entries = content?.data ?? [];
  const packages = entries.filter((e) => /Package/.test(e.kind));
  const items = entries.filter((e) => /Item|Service/.test(e.kind));
  const policies = entries.filter((e) => e.kind === 'Policy' || e.kind === 'MarketingMessage');

  return (
    <section className="section section--frost section--tight pv-sec" aria-labelledby="pv-packages">
      <div className="container stack">
        <h2 id="pv-packages" className="display-m">Packages</h2>
        <CallLine r={stay} />
        {content && <CallLine r={content} />}

        <h3 className="display-s">Rate plans for {day(q.checkIn)}, {q.nights} {q.nights === 1 ? 'night' : 'nights'}</h3>
        {plans.size === 0 ? (
          <p className="muted">None returned.</p>
        ) : (
          <ul className="pv-list">
            {[...plans].map(([code, p]) => (
              <li key={code}><span>{p.name || code}{p.name ? <span className="muted"> · {code}</span> : null}</span><span>{p.rooms} room {p.rooms === 1 ? 'type' : 'types'} · from <b>{money(p.from)}</b></span></li>
            ))}
          </ul>
        )}

        <h3 className="display-s">Packages and items in BookingCenter</h3>
        {content?.ok && packages.length === 0 && items.length === 0 && <p className="muted">The site-content reply has no package or item entries.</p>}
        {[...packages, ...items].map((e, i) => (
          <article key={`${e.kind}-${e.code}-${i}`} className="card pv-entry">
            <div className="card__body">
              <p className="label">{e.kind}{e.code ? ` · ${e.code}` : ''}</p>
              {e.name && <h4 className="card__title">{e.name}</h4>}
              {e.text && e.text !== e.name && <p className="small">{e.text}</p>}
              <p className="pv-attrs">{Object.entries(e.attrs).map(([k, v]) => `${k}: ${v}`).join('  ·  ')}</p>
            </div>
          </article>
        ))}
        {policies.length > 0 && (
          <details className="pv-raw"><summary>Policies and messages ({policies.length})</summary>
            {policies.map((e, i) => <p key={i} className="small">{e.name ? <b>{e.name}: </b> : null}{e.text}</p>)}
          </details>
        )}
        {content && <Raw r={content} />}
      </div>
    </section>
  );
}

// ---------- groups: does a block of N rooms fit every night, and what would it cost ----------

async function GroupSection({ q }: { q: Q }) {
  const nightDates = Array.from({ length: q.nights }, (_, i) => addDays(q.checkIn, i));
  const [stay, perNight, multi] = await Promise.all([
    previewAvailability({ checkIn: q.checkIn, checkOut: q.checkOut, guests: q.guests })!,
    Promise.all(nightDates.map((n) => previewAvailability({ checkIn: n, checkOut: addDays(n, 1), guests: 1 })!)),
    q.rooms > 1 ? previewAvailability({ checkIn: q.checkIn, checkOut: q.checkOut, guests: q.guests, quantity: q.rooms }) : Promise.resolve(null),
  ]);
  const nightFailed = perNight.find((r) => !r.ok);

  // Rooms of each type open on every night of the stay, priced from the full-stay search for this many guests.
  const priced = (stay.data ?? [])
    .map((room) => ({
      code: room.code,
      price: lowest(room),
      open: Math.min(...perNight.map((r) => r.data?.find((x) => x.code === room.code)?.unitsLeft ?? 0)),
    }))
    .filter((r) => r.open > 0)
    .sort((a, b) => (a.price ?? Infinity) - (b.price ?? Infinity));
  const openEveryNight = priced.reduce((t, r) => t + r.open, 0);

  let left = q.rooms;
  const mix: { code: string; count: number; price: number | null }[] = [];
  for (const r of priced) {
    if (left <= 0) break;
    const count = Math.min(r.open, left);
    mix.push({ code: r.code, count, price: r.price });
    left -= count;
  }
  const total = mix.every((m) => m.price !== null) ? mix.reduce((t, m) => t + m.count * (m.price ?? 0), 0) : null;
  const dealApplies = q.rooms >= groupDeal.minRooms && total !== null;
  const dealTotal = dealApplies ? Math.round(total * (100 - groupDeal.percentOff)) / 100 : null;

  const sameAsSingle = multi?.ok && stay.ok && JSON.stringify(multi.data) === JSON.stringify(stay.data);

  return (
    <section className="section section--snow section--tight pv-sec" aria-labelledby="pv-group">
      <div className="container stack">
        <h2 id="pv-group" className="display-m">{q.rooms} {q.rooms === 1 ? 'room' : 'rooms'}, <em>{day(q.checkIn)} to {day(q.checkOut)}</em></h2>
        <CallLine r={stay} />
        {nightFailed && <CallLine r={nightFailed} />}

        <p className="pv-fit">
          {!stay.ok || nightFailed ? (
            <>Couldn’t check: BookingCenter didn’t answer every search.</>
          ) : openEveryNight >= q.rooms ? (
            <>Fits. <b>{openEveryNight}</b> rooms open every night for {q.guests} {q.guests === 1 ? 'guest' : 'guests'} a room.</>
          ) : (
            <>Doesn’t fit. <b>{openEveryNight}</b> open every night, {q.rooms - openEveryNight} short.</>
          )}
        </p>

        {mix.length > 0 && (
          <table className="pv-mix">
            <tbody>
              {mix.map((m) => (
                <tr key={m.code}><th scope="row">{m.count} × {siteName(m.code)}</th><td>{money(m.price)}</td><td>{m.price === null ? '–' : money(m.count * m.price)}</td></tr>
              ))}
            </tbody>
            <tfoot>
              <tr><th scope="row">Live rates</th><td /><td><b>{money(total)}</b></td></tr>
              {dealApplies && <tr><th scope="row">Sample deal, {groupDeal.percentOff}% off at {groupDeal.minRooms}+ rooms</th><td /><td><b>{money(dealTotal)}</b></td></tr>}
            </tfoot>
          </table>
        )}

        {multi && (
          <p className={`pv-call${multi.ok ? '' : ' pv-call--bad'}`}>
            Multi-room search (Quantity {q.rooms}) · {multi.ok ? (sameAsSingle ? 'same answer as a one-room search' : 'a different answer from a one-room search') : 'failed'} · {multi.ms} ms
            {multi.error && <> · <b>{multi.error}</b></>}
          </p>
        )}
        <p className="small muted">Holding the rooms is a group booking that management creates in BookingCenter (Group Booking Wizard); guests then book inside it at groups.bookingcenter.com.</p>
      </div>
    </section>
  );
}
