'use client';

import { useState } from 'react';
import { roomTypes, type RoomType } from '@/content/rooms';

type Filter = '' | 'river' | 'dogs' | 'four' | 'deal';

const FILTERS: { key: Filter; label: string }[] = [
  { key: '', label: 'All rooms' },
  { key: 'river', label: 'On the river' },
  { key: 'dogs', label: 'Dogs welcome' },
  { key: 'four', label: 'Sleeps four' },
  { key: 'deal', label: 'Easy on the wallet' },
];

const has = (text: string, word: string) => text.toLowerCase().includes(word);
const discounted = (r: RoomType) => has(r.line, 'discounted');
const budget = (r: RoomType) => has(r.name, 'budget');

function matches(r: RoomType, f: Filter): boolean {
  if (f === 'river') return has(r.name, 'river');
  if (f === 'dogs') return Boolean(r.dogFriendly);
  if (f === 'four') return r.sleeps >= 4;
  if (f === 'deal') return discounted(r) || budget(r);
  return true;
}

/** Chips drawn from the room's own description in rooms.ts, so they never say more than BookingCenter does. */
function chips(r: RoomType): { label: string; tone: string }[] {
  const out: { label: string; tone: string }[] = [];
  if (has(r.name, 'balcony over river')) out.push({ label: 'River balcony', tone: 'community' });
  else if (has(r.name, 'river view')) out.push({ label: 'River view', tone: 'community' });
  if (has(r.name, 'balcony over patio')) out.push({ label: 'Patio balcony', tone: 'plain' });
  if (has(r.name, 'deck')) out.push({ label: 'Deck', tone: 'plain' });
  if (r.accessible) out.push({ label: 'ADA', tone: 'plain' });
  else if (has(r.name, 'ground floor')) out.push({ label: 'Ground floor', tone: 'plain' });
  if (r.sleeps >= 4) out.push({ label: `Sleeps ${r.sleeps}`, tone: 'plain' });
  if (budget(r)) out.push({ label: 'Budget', tone: 'music' });
  if (discounted(r)) out.push({ label: 'Discounted', tone: 'music' });
  if (has(r.line, 'possible noise')) out.push({ label: 'Possible noise', tone: 'plain' });
  if (r.dogFriendly) out.push({ label: 'Dogs OK', tone: 'lodge' });
  return out;
}

/** "Cal King bed, balcony over river" reads as "Cal King bed," and an italic "balcony over river". */
function RoomName({ name }: { name: string }) {
  const at = name.indexOf(',');
  if (at < 0) return <>{name}</>;
  return (
    <>
      {name.slice(0, at + 1)} <em>{name.slice(at + 1).trim()}</em>
    </>
  );
}

/** The room types on /stay as Fireside rows on the dark band, with filters that dim what doesn't match. */
export function StayRooms() {
  const [filter, setFilter] = useState<Filter>('');

  return (
    <>
      <div className="sty-filters" role="group" aria-label="Filter rooms" data-reveal data-reveal-delay="200">
        {FILTERS.map((f) => (
          <button key={f.key || 'all'} type="button" className="sty-filter" aria-pressed={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>
      <ul className="rows sty-rows" data-filter={filter || undefined}>
        {roomTypes.map((r) => {
          const on = matches(r, filter);
          return (
            <li key={r.code} className={on ? undefined : 'is-out'} data-reveal>
              <h3 className="row__title">
                <RoomName name={r.name} />
                {!on && <span className="sr-only"> (does not match this filter)</span>}
              </h3>
              <span className="row__note">{r.line}</span>
              <span className="sty-rows__chips">
                {chips(r).map((c) => (
                  <span key={c.label} className={`chip chip--${c.tone}`}>{c.label}</span>
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </>
  );
}
