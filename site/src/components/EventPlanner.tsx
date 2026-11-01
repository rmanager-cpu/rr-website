'use client';

import { useEffect, useId, useState } from 'react';
import { business } from '@/content/site';
import { spaces } from '@/content/spaces';

/*
 * "Plan your event": pick a date, then "What are you planning?". For now it opens an email to
 * events@ with the request filled in. Next step (docs/SITEMAP.md): it posts straight into Venio's
 * Leads, shows live availability, and later books set dates instantly. No prices or availability are
 * shown until they come from that engine, so nothing here can be wrong.
 * Links can preselect the occasion with a hash: /celebrate/plan#wedding, #private, #corporate.
 */

const KINDS = [
  { id: 'wedding', label: 'Wedding' },
  { id: 'private', label: 'Private dinner or party' },
  { id: 'corporate', label: 'Corporate or group' },
  { id: 'other', label: 'Other' },
];
const SPACES = [...spaces.map((s) => s.name), 'Not sure yet'];

export function EventPlanner({ heading = 'Plan your event' }: { heading?: string }) {
  const ids = { date: useId(), guests: useId(), name: useId() };
  const [date, setDate] = useState('');
  const [kind, setKind] = useState('');
  const [guests, setGuests] = useState('');
  const [space, setSpace] = useState(SPACES[SPACES.length - 1]);
  const [name, setName] = useState('');

  useEffect(() => {
    const fromHash = window.location.hash.slice(1);
    if (KINDS.some((k) => k.id === fromHash)) setKind(fromHash);
  }, []);

  const mailto = () => {
    const what = KINDS.find((k) => k.id === kind)?.label ?? 'Event';
    const subject = `${what} inquiry${date ? ` · ${date}` : ''}`;
    const body = [`Name: ${name}`, `Date: ${date || 'flexible'}`, `Planning: ${what}`, `Guests: ${guests || '?'}`, `Space: ${space}`, '', 'Anything else we should know:', ''].join('\n');
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
      <h2 className="serif" style={{ fontSize: 30, lineHeight: 1.1 }}>{heading}</h2>
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
        <legend>What are you planning?</legend>
        {KINDS.map((k) => (
          <button key={k.id} type="button" aria-pressed={kind === k.id} onClick={() => setKind(k.id)}>
            <span>{k.label}</span>
            <span>{kind === k.id ? 'Selected' : ''}</span>
          </button>
        ))}
      </fieldset>
      <label className="field">
        Space
        <select value={space} onChange={(e) => setSpace(e.target.value)}>
          {SPACES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </label>
      <label className="field" htmlFor={ids.name}>
        Your name
        <input id={ids.name} type="text" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
      </label>
      <button type="submit" className="btn btn--amber">Send my request</button>
      <p className="planner__note">
        Rather talk it through? Email <a href={`mailto:${business.email.events}`}>{business.email.events}</a> or call {business.phone}.
      </p>
    </form>
  );
}
