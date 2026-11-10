import type { Metadata } from 'next';
import Image from 'next/image';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { ApplyForm } from './ApplyForm';
import './careers.css';

export const metadata: Metadata = {
  title: 'Careers: Join Our Team in Tahoe City',
  description:
    'Work at River Ranch Lodge & Restaurant on the Truckee River in Tahoe City. We hire for front of house, back of house, lodge staff, maintenance and administration.',
  alternates: { canonical: '/careers' },
};

// The five departments the form offers (DEPARTMENTS in lib/events/types.ts). Lines say what each one
// covers, nothing more: no perks or pay until management writes them.
const TEAMS = [
  { name: 'Front of house', line: 'Servers, bartenders and hosts: the round bar, the dining room and, in summer, the patio.' },
  { name: 'Back of house', line: 'The kitchen: dinner every night and breakfast on weekends.' },
  { name: 'Lodge staff', line: `The front desk and housekeeping for our ${business.rooms} rooms on the river.` },
  { name: 'Maintenance', line: 'Keeping the lodge, the patio and everything in between in shape, winter and summer.' },
  { name: 'Administrative', line: 'The office side of a lodge, a restaurant and a busy events calendar.' },
];

export default function CareersPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Careers', '/careers')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short">
        <div className="page-hero__media">
          <Image src={photos.bartender.src} alt={photos.bartender.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Careers</p>
          <Lines as="h1" className="display-xl" lines={['Work where', <em key="e">everyone else plays.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">A lodge, a restaurant and a round bar on the Truckee, a few minutes from Palisades Tahoe.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#apply" className="btn">Apply now</a>
            <a href="#ca-teams-h" className="btn btn--ghost">See the teams</a>
          </div>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="ca-teams-h">
        <div className="container ca-grid">
          <div className="ca-main">
            <div className="section-head">
              <p className="label label--accent" data-reveal>Join the crew</p>
              <Lines id="ca-teams-h" className="display-l" lines={['Five ways', <em key="e">onto the team.</em>]} />
              <p className="lede" data-reveal data-reveal-delay="150">Pick a department, leave your name and a way to reach you, and we’ll be in touch.</p>
            </div>
            <ul className="rows ca-teams">
              {TEAMS.map((t, i) => (
                <li key={t.name} data-reveal data-reveal-delay={String(i * 80)}>
                  <h3 className="row__title">{t.name}</h3>
                  <p className="row__note">{t.line}</p>
                </li>
              ))}
            </ul>
            <figure className="frame frame--wide ca-photo" data-reveal="clip">
              <Image src={photos.roundBar.src} alt={photos.roundBar.alt} fill sizes="(max-width: 960px) 100vw, 60vw" />
              <figcaption>The round bar</figcaption>
            </figure>
          </div>
          <div className="ca-side" id="apply" data-reveal data-reveal-delay="150">
            <ApplyForm />
            <p className="turbotips">
              Tips here are tracked and shared through
              <Image src="/photos/turbotips-logo.png" alt="TurboTips" width={320} height={105} style={{ width: 72, height: 'auto', display: 'inline-block', verticalAlign: 'middle', margin: '0 0 0 6px', opacity: 0.85 }} />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
