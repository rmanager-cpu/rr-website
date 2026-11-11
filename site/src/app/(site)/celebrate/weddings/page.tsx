import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { homePhotos, photos, type Photo } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import '../celebrate.css';

export const metadata: Metadata = {
  title: 'Riverside Weddings in Tahoe City',
  description:
    'Ceremonies on the riverside patio, receptions, rehearsal dinners and welcome parties at River Ranch on the Truckee River, with 19 lodge rooms upstairs for your guests.',
  alternates: { canonical: '/celebrate/weddings' },
};

const DAY = [
  {
    label: 'The night before',
    lead: 'Rehearsal',
    em: 'dinner',
    line: 'One long table by the stone fireplace, for the people who got you here.',
    photo: photos.fireplaceLongTable,
  },
  {
    label: 'The ceremony',
    lead: 'On',
    em: 'the river',
    line: 'Vows on The Point or the patio, with the Truckee right behind you. If the weather turns, we do our best to move everything inside.',
    photo: photos.pointCeremony,
  },
  {
    label: 'The reception',
    lead: 'Dinner',
    em: 'under the sails',
    line: 'Round tables on the patio, dinner from our kitchen, and cake after dark.',
    photo: photos.patioRoundsSails,
  },
];

const FACTS: [string, string][] = [
  ['Ceremonies', 'On the riverside patio. If the weather turns, we do our best to move everything inside'],
  ['Patio dates', 'September, and spring once the patio opens. Summer belongs to the rafters: no private events Memorial Day to Labor Day'],
  ['Around the day', 'Rehearsal dinners, welcome parties and receptions'],
  ['Your guests', `${business.rooms} lodge rooms upstairs`],
  ['Getting here', 'ADA accessible, with a private lot on site'],
];

const GALLERY: { photo: Photo; cap: string; tall?: boolean; focus?: string }[] = [
  { photo: homePhotos.cake, cap: 'The cake' },
  { photo: homePhotos.couple, cap: 'The two of you', tall: true, focus: '42% 50%' },
  { photo: photos.weddingArch, cap: 'The arch' },
  { photo: photos.patioNight, cap: 'The patio at night' },
  { photo: photos.heroDusk, cap: 'The Riverview room at dusk', tall: true },
  { photo: photos.balconyChairs, cap: 'The morning after' },
];

export default function WeddingsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Weddings', '/celebrate/weddings')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero cel-hero--bright">
        <div className="page-hero__media">
          <Image src={photos.ceremonyAisle.src} alt={photos.ceremonyAisle.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Weddings</p>
          <Lines as="h1" className="display-xl" lines={['Say it by', <em key="e">the river.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">
            A ceremony on the Truckee, dinner on the patio, and {business.rooms} rooms upstairs for the people you love most.
          </p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <Link href="/celebrate/plan#wedding" className="btn">Start a wedding inquiry</Link>
            <Link href="/celebrate/spaces" className="btn btn--ghost">See the spaces</Link>
          </div>
        </div>
      </section>

      <section className="section section--snow" aria-labelledby="day-h">
        <div className="container split">
          <div className="stack cel-stack">
            <p className="label label--accent" data-reveal>On the river</p>
            <Lines id="day-h" className="display-l" lines={['The whole weekend,', <em key="e">in one place.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">
              Welcome party, ceremony, dinner and dancing, all in one spot on the river, with a room upstairs at the end of the night.
            </p>
            <p className="placeholder" data-reveal data-reveal-delay="200">[One line about wedding packages goes here]</p>
            <ul className="rows cel-rows2" data-reveal data-reveal-delay="250">
              {FACTS.map(([k, v]) => (
                <li key={k}><span className="row__title">{k}</span><span className="row__note">{v}</span></li>
              ))}
            </ul>
          </div>
          <figure className="frame frame--tall frame--arch" data-reveal="clip" style={{ maxWidth: 520, width: '100%', justifySelf: 'center' }}>
            <Image src={homePhotos.ceremony.src} alt={homePhotos.ceremony.alt} fill sizes="(max-width: 860px) 90vw, 520px" />
          </figure>
        </div>
      </section>

      <section className="section section--ember" aria-labelledby="around-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Around the day</p>
            <Lines id="around-h" className="display-l" lines={['From the toast', <>to <em>the last dance.</em></>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Tell us how big and how fancy. We plan the rest with you.</p>
          </div>
          <div className="grid-3 cel-day">
            {DAY.map((d, i) => (
              <article key={d.label} className="card" data-reveal data-reveal-delay={i ? String(i * 150) : undefined}>
                <div className="card__media">
                  <Image src={d.photo.src} alt={d.photo.alt} fill sizes="(max-width: 860px) 100vw, 33vw" />
                </div>
                <div className="card__body">
                  <p className="label">{d.label}</p>
                  <h3 className="card__title">{d.lead} <em>{d.em}</em></h3>
                  <p className="muted">{d.line}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--snow cel-gallery" aria-labelledby="wgal-h">
        <div className="container">
          <div className="cel-gal-head">
            <div>
              <p className="label label--accent" data-reveal>A look around</p>
              <Lines id="wgal-h" className="display-l" lines={[<>Cake <em>after dark.</em></>]} />
            </div>
            <p className="label cel-gal-hint" data-reveal data-reveal-delay="200" aria-hidden="true">Drag</p>
          </div>
        </div>
        <div className="drag-gallery" tabIndex={0} aria-label="Wedding photos (scrolls sideways)" data-reveal="fade">
          <div className="drag-gallery__track">
            {GALLERY.map((g) => (
              <figure key={g.photo.src} className={`frame${g.tall ? ' frame--tall is-tall' : ''}`}>
                <Image src={g.photo.src} alt={g.photo.alt} fill sizes={g.tall ? '(max-width: 860px) 108vw, 760px' : '(max-width: 860px) 72vw, 560px'} style={g.focus ? { objectPosition: g.focus } : undefined} />
                <figcaption>{g.cap}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section section--dark" aria-labelledby="inquire-h">
        <div className="container split">
          <div className="stack cel-stack">
            <p className="label label--accent" data-reveal>Start planning</p>
            <Lines id="inquire-h" className="display-l" lines={['Tell us', <em key="e">your date.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">
              A rough date and a headcount is plenty to start. We come back with spaces and a menu.
            </p>
            <div className="btn-row" data-reveal data-reveal-delay="250">
              <Link href="/celebrate/plan#wedding" className="btn">Start a wedding inquiry</Link>
              <Link href="/celebrate/spaces" className="btn btn--ghost">See the spaces</Link>
            </div>
            <p className="small cel-contact" data-reveal data-reveal-delay="300">
              Rather talk? Write <a href={`mailto:${business.email.events}`}>{business.email.events}</a> or call{' '}
              <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
            </p>
          </div>
          <figure className="frame frame--tall frame--arch" data-reveal style={{ maxWidth: 440, width: '100%', justifySelf: 'center' }}>
            <Image src={photos.patioRoundsHeaters.src} alt={photos.patioRoundsHeaters.alt} fill sizes="(max-width: 860px) 160vw, 800px" data-parallax="0.08" />
          </figure>
        </div>
      </section>
    </>
  );
}
