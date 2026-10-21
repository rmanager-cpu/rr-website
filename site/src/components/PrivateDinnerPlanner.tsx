'use client';

import { useId, useState } from 'react';
import { business } from '@/content/site';

/*
 * "Plan a private dinner": date, guests and room. For now it opens an email to events@ with the
 * request filled in. Next step (see docs/KICKOFF.md): it posts straight into Leads in the events app,
 * shows live availability per room and the estimate from the pricing engine, and can hold the date.
 * No prices or availability are shown until they come from that engine, so nothing here can be wrong.
 */

const ROOMS = ['Fireplace room', 'Riverview room', 'The Pit', 'The Point', 'Not sure yet'];

export function PrivateDinnerPlanner({ heading = 'Plan a private dinner', headingLevel = 'h3' }: { heading?: string; headingLevel?: 'h2' | 'h3' }) {
  const ids = { date: useId(), guests: useId(), name: useId() };
  const [date, setDate] = useState('');
  const [guests, setGuests] = useState('');
  const [name, setName] = useState('');
  const [room, setRoom] = useState(ROOMS[0]);
  const H = headingLevel;

  const mailto = () => {
    const subject = `Private dinner request${date ? ` · ${date}` : ''}`;
    const body = [`Name: ${name}`, `Date: ${date || 'flexible'}`, `Guests: ${guests || '?'}`, `Room: ${room}`, '', 'Anything else we should know:', ''].join('\n');
    return `mailto:${business.email.events}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <form
      className="planner"
      aria-label={heading}
      onSubmit={(e) => {
        e.preventDefault();
        window.location.href = mailto();
      }}
    >
      <H>{heading}</H>
      <div className="planner__grid">
        <label className="field" htmlFor={ids.date}>
          Date
          <input id={ids.date} type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field" htmlFor={ids.guests}>
          Guests
          <input id={ids.guests} type="number" inputMode="numeric" min={1} max={300} placeholder="24" value={guests} onChange={(e) => setGuests(e.target.value)} />
        </label>
      </div>
      <fieldset className="room-choice">
        <legend>Room</legend>
        {ROOMS.map((r) => (
          <button key={r} type="button" aria-pressed={room === r} onClick={() => setRoom(r)}>
            <span>{r}</span>
            <span>{room === r ? 'Selected' : ''}</span>
          </button>
        ))}
      </fieldset>
      <label className="field" htmlFor={ids.name}>
        Your name
        <input id={ids.name} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button type="submit" className="btn btn--amber">Request this date</button>
      <p className="planner__note">
        Weddings, buyouts or more than 50 guests? Email <a href={`mailto:${business.email.events}`}>{business.email.events}</a> or call {business.phone}.
      </p>
    </form>
  );
}
