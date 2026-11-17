'use client';

import { useRef, useState, type FormEvent } from 'react';
import { roomTypes } from '@/content/rooms';
import { DEAL, dayNumber, money, packageTotal, type Availability, type PackageTotal, type Search, type Selection } from '@/lib/demo/package';

type Review = { total: PackageTotal; checkedAt: string; source: 'sample' | 'sandbox'; reserved: false };
const names: Record<string, string> = { RIVDD: 'Riverfront · Two queens', RIVQ: 'Riverfront · California king', KVIEW: 'Patio balcony · California king', '2Q': 'Patio view · Two queens', K: 'Patio view · King' };
const name = (code: string) => names[code] ?? roomTypes.find(r => r.code === code)?.name ?? code;

export function GroupPackage({ today, initialCheckIn, initialCheckOut, sandboxConfigured }: { today: string; initialCheckIn: string; initialCheckOut: string; sandboxConfigured: boolean }) {
  const [q, setQ] = useState<Search>({ checkIn: initialCheckIn, checkOut: initialCheckOut, guests: 2, rooms: 5, mode: 'sandbox', scenario: 'normal' });
  const [data, setData] = useState<Availability | null>(null);
  const [selection, setSelection] = useState<Selection>({});
  const [ticketPeople, setTicketPeople] = useState(0), [ticketDays, setTicketDays] = useState(1);
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [review, setReview] = useState<Review | null>(null);
  const [reviewBusy, setReviewBusy] = useState(false);
  const request = useRef(0);
  const results = useRef<HTMLDivElement>(null);
  const reviewBox = useRef<HTMLDivElement>(null);
  const selected = Object.values(selection).reduce((sum, n) => sum + n, 0);
  const available = data?.rooms.reduce((sum, r) => sum + r.available, 0) ?? 0;
  const fits = Boolean(data && available >= q.rooms);
  const nights = Math.max(1, (dayNumber(q.checkOut) ?? 0) - (dayNumber(q.checkIn) ?? 0));
  let total: PackageTotal | null = null;
  if (data) { try { total = packageTotal(data.rooms, selection, q, ticketPeople, ticketDays); } catch {} }

  function change(patch: Partial<Search>) {
    request.current++;
    setQ(old => ({ ...old, ...patch })); setData(null); setSelection({}); setReview(null); setError(''); setBusy(false); setReviewBusy(false); setTicketPeople(0); setTicketDays(1);
  }
  async function search(event: FormEvent) {
    event.preventDefault();
    const id = ++request.current;
    setBusy(true); setError(''); setData(null); setSelection({}); setReview(null); setReviewBusy(false); setTicketPeople(0); setTicketDays(1);
    try {
      const params = new URLSearchParams(Object.entries(q).map(([key, value]) => [key, String(value)]));
      const res = await fetch('/api/demo/availability?' + params, { cache: 'no-store' });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'Availability could not be checked.');
      if (request.current !== id) return;
      setData(payload); setTimeout(() => results.current?.focus(), 0);
    } catch (e) { if (request.current === id) setError(e instanceof Error ? e.message : 'Availability could not be checked.'); }
    finally { if (request.current === id) setBusy(false); }
  }
  function choose(code: string, count: number) {
    request.current++; setSelection(old => ({ ...old, [code]: count })); setReview(null); setError(''); setReviewBusy(false);
  }
  function chooseTickets(people: number, days: number) {
    request.current++; setTicketPeople(people); setTicketDays(days); setReview(null); setError(''); setReviewBusy(false);
  }
  async function reviewPackage() {
    if (!total) return;
    const id = ++request.current;
    setReviewBusy(true); setReview(null); setError('');
    try {
      const res = await fetch('/api/demo/review', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ search: q, selection, ticketPeople, ticketDays }) });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.error || 'The package could not be rechecked.');
      if (request.current !== id) return;
      setReview(payload); setTimeout(() => { reviewBox.current?.focus(); reviewBox.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 0);
    } catch (e) { if (request.current === id) { setData(null); setSelection({}); setError(e instanceof Error ? e.message : 'Please check availability again.'); } }
    finally { if (request.current === id) setReviewBusy(false); }
  }
  return (
    <div className="rd-builder">
      <div className="rd-source-bar"><span className={'rd-source-dot ' + (q.mode === 'sample' ? 'is-sample' : '')} /><strong>{q.mode === 'sample' ? 'Sample walkthrough · Fictional availability' : 'Live API check · BookingCenter sandbox'}</strong><span>Made-up deal & ticket pricing</span></div>
      <details className="rd-controls"><summary>Review controls <span>Change source or test a sold-out stay</span></summary><div><label>Availability source<select value={q.mode} onChange={e => change({ mode: e.target.value as Search['mode'] })}><option value="sandbox">BookingCenter sandbox (real API reads)</option><option value="sample">Sample walkthrough (fictional inventory)</option></select></label>{q.mode === 'sample' && <label>Test scenario<select value={q.scenario} onChange={e => change({ scenario: e.target.value as Search['scenario'] })}><option value="normal">Enough rooms</option><option value="limited">Only two rooms left</option><option value="sold-out">Sold out</option><option value="failure">Availability outage</option></select></label>}</div><p>{q.mode === 'sample' ? 'All room counts and rates in this mode are invented for review. Nothing is held or booked.' : sandboxConfigured ? 'Reads the test property now. Sandbox counts are not production inventory; ticket supply is not connected.' : 'Sandbox credentials are not available in this environment. Search will report unavailable. Choose sample walkthrough explicitly to explore the interface.'}</p></details>
      <form className="rd-search" onSubmit={search}>
        <div className="rd-step-heading"><span>01</span><h3>Pick your mountain days.</h3><small>5–19 rooms · 1–7 nights</small></div>
        <div className="rd-search-grid"><label>Check in<input type="date" value={q.checkIn} min={today} required onChange={e => change({ checkIn: e.target.value })} /></label><label>Check out<input type="date" value={q.checkOut} min={q.checkIn} required onChange={e => change({ checkOut: e.target.value })} /></label><label>Rooms<select value={q.rooms} onChange={e => change({ rooms: Number(e.target.value) })}>{Array.from({ length: 15 }, (_, i) => i + 5).map(n => <option key={n} value={n}>{n} rooms</option>)}</select></label><label>Guests per room<select value={q.guests} onChange={e => change({ guests: Number(e.target.value) })}>{[1, 2, 3, 4].map(n => <option key={n} value={n}>{n} {n === 1 ? 'guest' : 'guests'}</option>)}</select></label><button className="rd-button" disabled={busy}>{busy ? 'Checking every night…' : 'Check available rooms'}<span className="rd-arrow" aria-hidden="true">→</span></button></div>
        <p className="rd-search-foot">Room counts must cover the whole stay. Availability is checked again when you review.</p>
      </form>
      {error && <div className="rd-alert" role="alert"><strong>Availability unavailable</strong><p>{error}</p><span>No package is offered. No rooms or tickets have been reserved.</span></div>}
      {busy && <div className="rd-loading" role="status"><span className="rd-spinner" />Checking your stay and each night with {q.mode === 'sample' ? 'the sample scenario' : 'BookingCenter'}…</div>}
      {!data && !busy && !error && <div className="rd-ready"><span className="rd-mountain" aria-hidden="true" /><h3>The whole crew, under one roof.</h3><p>Start with your dates. Available rooms and your package price will appear here.</p></div>}
      {data && <div ref={results} tabIndex={-1} className="rd-results">
        <div className={'rd-availability ' + (!fits ? 'is-limited' : '')} role="status"><div><span className="rd-eyebrow">{data.source === 'sandbox' ? 'SANDBOX AVAILABILITY' : 'FICTIONAL DEMO AVAILABILITY'}</span><h3>{fits ? `${available} rooms available for your full stay.` : available === 0 ? 'No rooms for the full stay.' : `Only ${available} rooms cover the full stay.`}</h3><p>{fits ? `Choose all ${q.rooms} rooms below to build your package.` : `This deal needs ${q.rooms} rooms. Try different dates${available >= DEAL.minRooms ? ' or a smaller group' : ''}; a partial group cannot continue.`}</p></div><span className="rd-checked">Checked {new Date(data.checkedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles', timeZoneName: 'short' })}<br />{data.nights} {data.nights === 1 ? 'night' : 'nights'} · no hold placed</span></div>
        <div className="rd-workspace"><div className="rd-options">
          <div className="rd-step-heading"><span>02</span><h3>Make room for everyone.</h3><small aria-live="polite">{selected} / {q.rooms} selected</small></div>
          <div className="rd-room-list">{data.rooms.map(room => {
            const info = roomTypes.find(r => r.code === room.code);
            const count = selection[room.code] ?? 0;
            const max = Math.min(room.available, q.rooms - selected + count);
            return <article className={'rd-room ' + (count ? 'is-chosen' : '')} key={room.code}><img src={info?.photo ?? '/photos/room-plaid-quilt-ski-decor.jpg'} alt={name(room.code)} loading="lazy" /><div><p className="rd-room-stock">{room.available} available all {data.nights} nights · sleeps {room.sleeps}</p><h4>{name(room.code)}</h4><p>{money(room.beforeCents)} <span>/ room, entire stay before tax & discount</span></p><label className="rd-quantity">Rooms<select aria-label={`Rooms: ${name(room.code)}`} value={count} disabled={!fits} onChange={e => choose(room.code, Number(e.target.value))}>{Array.from({ length: max + 1 }, (_, i) => <option key={i} value={i}>{i}</option>)}</select></label></div></article>;
          })}</div>
          {fits && <section className="rd-tickets"><div className="rd-step-heading"><span>03</span><h3>Need lift tickets?</h3></div><div className="rd-ticket-intro"><span className="rd-arrow" aria-hidden="true">→</span><div><h4>Rooms + mountain days. One total.</h4><p>Already have a pass? Leave tickets off. Add only the people who need them.</p></div></div><label className="rd-check"><input type="checkbox" checked={ticketPeople > 0} onChange={e => chooseTickets(e.target.checked ? q.rooms * q.guests : 0, ticketDays)} />Add lift tickets to the package</label>{ticketPeople > 0 && <div className="rd-ticket-fields"><label>People needing tickets<select value={ticketPeople} onChange={e => chooseTickets(Number(e.target.value), ticketDays)}>{Array.from({ length: q.rooms * q.guests }, (_, i) => i + 1).map(n => <option value={n} key={n}>{n} {n === 1 ? 'person' : 'people'}</option>)}</select></label><label>Ski days per person<select value={ticketDays} onChange={e => chooseTickets(ticketPeople, Number(e.target.value))}>{Array.from({ length: nights }, (_, i) => i + 1).map(n => <option key={n} value={n}>{n} {n === 1 ? 'day' : 'days'}</option>)}</select></label></div>}<p className="rd-sample-note">Made-up demo price: {money(DEAL.ticketDayCents)} per person, per day, all-in. Resort, dates, age categories, supply and fulfillment are not connected.</p></section>}
        </div><aside className="rd-summary"><p className="rd-eyebrow">YOUR GROUP ESCAPE</p><h3>One trip.<br /><em>One price.</em></h3><p>{q.rooms} rooms · {q.rooms * q.guests} guests · {data.nights} nights</p><div className="rd-deal">{DEAL.percentOff}% off rooms <span>Sample deal at {DEAL.minRooms}+ rooms</span></div>{total ? <><dl><div><dt>Rooms before discount</dt><dd>{money(total.lodging)}</dd></div><div className="rd-saving"><dt>Group savings · {DEAL.percentOff}%</dt><dd>−{money(total.discount)}</dd></div><div><dt>Lodging tax estimate</dt><dd>{money(total.taxes)}</dd></div><div><dt>Lift tickets{ticketPeople > 0 && <small>{ticketPeople} people × {ticketDays} {ticketDays === 1 ? 'day' : 'days'}</small>}</dt><dd>{ticketPeople ? money(total.tickets) : 'No tickets'}</dd></div></dl><div className="rd-grand"><span>Illustrative package total</span><strong>{money(total.total)}</strong><small>USD · Rooms, estimated taxes{ticketPeople > 0 ? ' & tickets' : ''}</small></div></> : <div className="rd-incomplete"><b>{!fits ? 'This group does not fit.' : `Choose ${q.rooms - selected} more ${q.rooms - selected === 1 ? 'room' : 'rooms'}.`}</b><p>A total appears only when your entire group has rooms for every night.</p></div>}<button className="rd-button" disabled={!total || reviewBusy} onClick={reviewPackage}>{reviewBusy ? 'Rechecking availability…' : 'Review this package'}<span className="rd-arrow" aria-hidden="true">→</span></button><p className="rd-summary-foot">Demo only. Review rechecks availability; it does not hold rooms, buy tickets or take payment.</p></aside></div>
      </div>}
      {review && <div ref={reviewBox} tabIndex={-1} className="rd-review-result" role="status"><span className="rd-eyebrow">PACKAGE PREVIEW · NOTHING RESERVED</span><h3>Your group escape, <em>all together.</em></h3><p>{review.total.rooms} rooms · {review.total.people} guests · {nights} nights{ticketPeople > 0 && ` · ${ticketPeople} lift tickets × ${ticketDays} days`}</p><strong>{money(review.total.total)}</strong><p>Rechecked against {review.source === 'sample' ? 'fictional sample inventory' : 'the BookingCenter sandbox'} at {new Date(review.checkedAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'America/Los_Angeles', timeZoneName: 'short' })}. This latest price supersedes the earlier estimate.</p><div><b>This is where real checkout would begin.</b><p>No booking, payment, room hold, or lift ticket has been created. Production requires confirmed inventory protection and ticket fulfillment.</p></div><button className="rd-text-button" onClick={() => setReview(null)}>Back to my package ↑</button></div>}
    </div>
  );
}
