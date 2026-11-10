'use client';

import { useEffect, useState } from 'react';

export type Seg = { label: string; start: string; end: string; kind: 'am' | 'hh' | 'pm'; hh?: boolean };
type View = 'weekdays' | 'weekends';

const mins = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const clock = (t: string) => {
  const m = mins(t);
  const h = Math.floor(m / 60) % 12 || 12;
  const mm = m % 60;
  return `${h}${mm ? `:${String(mm).padStart(2, '0')}` : ''} ${m >= 720 ? 'PM' : 'AM'}`;
};

/** The lodge clock (Tahoe time): weekday 1..7 (Monday first), minutes since midnight and the date. */
function tahoeNow() {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles', weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  const wd = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(get('weekday')) + 1;
  return { wd, m: Number(get('hour')) * 60 + Number(get('minute')), iso: `${get('year')}-${get('month')}-${get('day')}` };
}

/**
 * The day line: a strip of sky from the first plate of the morning to the last of the night, with each
 * service drawn on it, a Weekdays/Weekends switch, and a "Now" marker on the lodge clock.
 */
export function DayLine({ views, from, to, holidays }: { views: Record<View, Seg[]>; from: string; to: string; holidays: string[] }) {
  const [view, setView] = useState<View>('weekdays');
  const [now, setNow] = useState<{ wd: number; m: number; iso: string } | null>(null);

  useEffect(() => {
    const tick = () => setNow(tahoeNow());
    const first = tahoeNow();
    setNow(first);
    setView(first.wd >= 6 ? 'weekends' : 'weekdays');
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);

  const a = mins(from);
  const span = mins(to) - a;
  const pct = (t: string) => ((mins(t) - a) / span) * 100;
  const segs = views[view];

  // Ticks at every start and end, dropping any that would crowd the one before it.
  const ticks: { t: string; l: number }[] = [];
  // The day's first and last hour always show, so the line reads the same on both views.
  const marks = [...new Set([from, ...segs.flatMap((s) => [s.start, s.end])])].filter((t) => t !== to).sort();
  for (const t of marks) {
    const l = pct(t);
    if (ticks.length && l - ticks[ticks.length - 1].l < 7) continue;
    ticks.push({ t, l });
  }
  while (ticks.length && 100 - ticks[ticks.length - 1].l < 7) ticks.pop();
  ticks.push({ t: to, l: 100 });

  // What's on right now, for the pill. Happy hour skips holidays.
  const pm = segs.find((s) => s.kind === 'pm');
  let msg = pm ? `${pm.label} nightly, ${clock(pm.start)} to ${clock(pm.end)}.` : '';
  let on = false;
  let marker: number | null = null;
  if (now) {
    const today = views[now.wd >= 6 ? 'weekends' : 'weekdays'].filter((s) => !(s.hh && holidays.includes(now.iso)));
    const cur = today.find((s) => now.m >= mins(s.start) && now.m < mins(s.end));
    const next = today.filter((s) => mins(s.start) > now.m).sort((x, y) => mins(x.start) - mins(y.start))[0];
    if (cur) {
      on = true;
      msg = cur.hh ? 'Right now: happy hour at the round bar.' : `Right now: ${cur.label.toLowerCase()} is on.`;
    } else if (next) {
      msg = `Quiet for now. ${next.label} starts at ${clock(next.start)}.`;
    } else {
      msg = 'Dinner’s done for tonight. Back at it tomorrow.';
    }
    if (now.m >= a && now.m <= mins(to)) marker = ((now.m - a) / span) * 100;
  }
  const showMarker = marker !== null && now && (now.wd >= 6) === (view === 'weekends');

  return (
    <div className="dn-day">
      <div className="dn-day__bar">
        <div className="dn-switch" role="group" aria-label="Show hours for">
          {(['weekdays', 'weekends'] as View[]).map((v) => (
            <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)}>
              {v === 'weekdays' ? 'Weekdays' : 'Weekends'}
            </button>
          ))}
        </div>
        <p className={`dn-now${on ? '' : ' is-off'}`} aria-live="polite">
          <i aria-hidden="true" />
          <span>{msg}</span>
        </p>
      </div>

      <div className="dn-dayline" data-reveal="fade">
        <div className="dn-dayline__sky">
          {segs.map((s, i) => (
            <div key={`${view}-${s.label}`} className={`dn-dayline__seg dn-dayline__seg--${s.kind}`} style={{ ['--l' as string]: `${pct(s.start)}%`, ['--w' as string]: `${pct(s.end) - pct(s.start)}%`, ['--d' as string]: `${i * 260}ms` }}>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
        <div className="dn-dayline__ticks" aria-hidden="true">
          {ticks.map((k) => (
            <span key={k.t} style={{ ['--l' as string]: `${k.l}%` }}>{clock(k.t)}</span>
          ))}
        </div>
        {showMarker && (
          <div className="dn-dayline__now" style={{ ['--now' as string]: `${marker}%` }} aria-hidden="true">
            <b>Now</b>
          </div>
        )}
        <ul className="sr-only">
          {segs.map((s) => (
            <li key={s.label}>{s.label}, {clock(s.start)} to {clock(s.end)}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
