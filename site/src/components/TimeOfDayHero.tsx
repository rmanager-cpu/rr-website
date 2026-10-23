'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { photos, type Photo } from '@/content/photos';
import { business } from '@/content/site';
import { TIMES, timeOfDayAt, type TimeOfDay } from '@/lib/timeOfDay';
import { Moon, Sun, Sunrise } from './Icons';
import { SiteHeader } from './SiteHeader';

/*
 * The homepage hero follows the time of day at Tahoe City: dawn, day, dusk and night each have their
 * own photo, line, button and highlighted pillar. The choice is made before first paint by the inline
 * script in <head> (sets <html data-tod>), so CSS shows the right layer at once and the browser only
 * downloads that one photo (the others are display:none and lazy). Everything time-dependent is
 * switched by CSS, so the server's HTML and the browser agree. Visitors can also pick a time; "Auto"
 * goes back to the clock, which is rechecked every minute.
 */

type Mode = {
  label: string;
  photo: Photo;
  position: string;
  /** Framing on a phone, where the hero is tall and narrow. */
  positionPhone: string;
  eyebrow: string;
  icon: 'sunrise' | 'sun' | 'moon';
  cta: { label: string; href: string; external?: boolean };
};

const MODES: Record<TimeOfDay, Mode> = {
  dawn: { label: 'Dawn', photo: photos.heroDawn, position: 'center 38%', positionPhone: '32% center', eyebrow: 'Morning on the Truckee River', icon: 'sunrise', cta: { label: 'Book a room', href: business.links.bookRoom } },
  day: { label: 'Day', photo: photos.heroDay, position: 'center 58%', positionPhone: 'center 40%', eyebrow: 'Minutes from Palisades Tahoe', icon: 'sun', cta: { label: 'Plan an event', href: '/celebrate' } },
  dusk: { label: 'Dusk', photo: photos.heroDusk, position: 'center 50%', positionPhone: '48% center', eyebrow: 'Happy hour at the round bar', icon: 'moon', cta: { label: 'Happy hour menu', href: '/menus/happy-hour' } },
  night: { label: 'Night', photo: photos.heroNight, position: 'center 62%', positionPhone: 'center 55%', eyebrow: 'Dinner by the fire, nightly', icon: 'moon', cta: { label: 'Reserve a table', href: business.links.reserveTable, external: true } },
};

const PILLARS = [
  { key: 'stay', name: 'Stay', href: '/stay', line: `${business.rooms} rooms over the Truckee River, minutes from Palisades Tahoe.` },
  { key: 'dine', name: 'Dine', href: '/dine', line: 'Dinner nightly by the stone fireplace, and a round bar for après.' },
  { key: 'celebrate', name: 'Celebrate', href: '/celebrate', line: 'Private dinners, parties and weddings by the river.' },
];

const ICONS = { sunrise: Sunrise, sun: Sun, moon: Moon };

export function TimeOfDayHero() {
  const [pick, setPick] = useState<'auto' | TimeOfDay>('auto');
  // While a newly chosen photo loads, the previous one stays underneath so the hero never goes blank.
  const [prev, setPrev] = useState<TimeOfDay | null>(null);

  useEffect(() => {
    const apply = () => {
      const root = document.documentElement;
      const next = pick === 'auto' ? timeOfDayAt(Date.now()) : pick;
      const cur = root.dataset.tod as TimeOfDay | undefined;
      if (cur && cur !== next) setPrev(cur);
      root.dataset.tod = next;
    };
    apply();
    if (pick !== 'auto') return;
    const t = window.setInterval(apply, 60_000);
    return () => window.clearInterval(t);
  }, [pick]);

  useEffect(() => {
    if (!prev) return;
    const img = document.querySelector<HTMLImageElement>(`.tod-layer--${document.documentElement.dataset.tod} img`);
    if (img?.complete && img.naturalWidth > 0) setPrev(null);
  }, [prev]);

  const loaded = (t: TimeOfDay) => {
    if (document.documentElement.dataset.tod === t) setPrev(null);
  };

  const switcher = (where: 'desktop' | 'mobile') => (
    <div role="group" aria-label="Time of day" className={`tod-switch tod-switch--${where}`}>
      {(['auto', ...TIMES] as const).map((id) => (
        <button key={id} type="button" aria-pressed={pick === id} onClick={() => setPick(id)}>
          {id === 'auto' ? 'Auto' : MODES[id].label}
        </button>
      ))}
    </div>
  );

  return (
    <section className="tod-hero" aria-label="Welcome">
      {TIMES.map((t) => (
        <div key={t} className={`tod-layer tod-layer--${t}${prev === t ? ' is-prev' : ''}`} style={{ ['--pos' as string]: MODES[t].position, ['--pos-phone' as string]: MODES[t].positionPhone }}>
          <Image
            src={MODES[t].photo.src}
            alt={MODES[t].photo.alt}
            fill
            sizes="100vw"
            loading="lazy"
            onLoad={() => loaded(t)}
          />
        </div>
      ))}
      <div className="snow snow--far" aria-hidden="true" />
      <div className="snow" aria-hidden="true" />
      <div className="tod-scrim" aria-hidden="true" />

      <SiteHeader variant="overlay" extra={switcher('desktop')} />
      <div className="tod-spacer" aria-hidden="true" />

      <div className="container tod-body">
        {TIMES.map((t) => {
          const Icon = ICONS[MODES[t].icon];
          return (
            <span key={t} className={`tod-only tod-only--${t} tod-eyebrow`}>
              <Icon size={16} />
              {MODES[t].eyebrow}
            </span>
          );
        })}
        <div className="tod-headline">
          <h1 className="slash h-xl">Lodge, dinner &amp; après on the Truckee.</h1>
          <div className="btn-row">
            {TIMES.map((t) => {
              const c = MODES[t].cta;
              return c.external ? (
                <a key={t} href={c.href} className={`btn btn--amber tod-only tod-only--${t}`} rel="noopener">
                  {c.label}
                </a>
              ) : (
                <Link key={t} href={c.href} className={`btn btn--amber tod-only tod-only--${t}`}>
                  {c.label}
                </Link>
              );
            })}
          </div>
        </div>
        {switcher('mobile')}
        <nav aria-label="Stay, Dine, Celebrate" className="pillars">
          {PILLARS.map((p) => (
            <Link key={p.key} href={p.href} className={`pillar pillar--${p.key}`}>
              <span className="pillar__name slash">{p.name}</span>
              <span className="pillar__line">{p.line}</span>
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
