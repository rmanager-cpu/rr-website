import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { VenioWidget } from '@/components/VenioWidget';
import { homePhotos, photos, type Photo } from '@/content/photos';
import { business } from '@/content/site';
import { spaces } from '@/content/spaces';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { Aperture } from './Aperture';
import { SpacePicker, type PickerSpace } from './SpacePicker';
import './celebrate.css';

export const metadata: Metadata = {
  title: 'Private Dining & Weddings in Tahoe City',
  description:
    'Private dinners for 13 to 50 guests, holiday and corporate parties, ski groups and riverside weddings at River Ranch in Tahoe City, minutes from Palisades Tahoe.',
  alternates: { canonical: '/celebrate' },
};

// Pricing terms follow the staff price sheet in the events app (management, 2026-11-10: the sheet is
// the source of truth for pricing). An unmet food & beverage minimum is charged as a site fee.
const FAQ = [
  {
    q: 'What kinds of events do you host?',
    a: 'Corporate dinners, holiday parties, ski groups, rehearsal dinners, receptions, birthdays and weddings.',
  },
  {
    q: 'How many guests can you seat?',
    a: 'Private dinners in our dining rooms are for 13 to 50 guests. For larger groups, buyouts and weddings, start a conversation with our events team and we’ll plan it with you. Buffets are for 30 guests or more; smaller groups get a seated dinner.',
  },
  {
    q: 'Is there a site fee?',
    a: 'Every space has a food and beverage minimum, and some patio and whole-restaurant dates add a flat site fee. If the food and drink come in under the minimum, the difference is charged as a site fee. Prices are before the 22% service charge (paid in full to the staff who work your event), the 1% North Lake Tahoe TBID and tax.',
  },
  {
    q: 'How far ahead do I need to book?',
    a: 'At least 7 days ahead for a private dinner. Your date is held once the deposit is paid.',
  },
  {
    q: 'Can we hold an event on the patio?',
    a: 'Yes, in September, and in spring once the patio opens for the season. From Memorial Day weekend through Labor Day the patio belongs to the rafters, so there are no private events. If the weather turns, we do our best to move everything inside.',
  },
  {
    q: 'Can we bring the dog?',
    a: 'Yes. Dogs are welcome on the patio, ceremonies included, as long as they’re on a leash and well behaved. Nine of the lodge rooms are dog friendly too.',
  },
  {
    q: 'Can you handle dietary needs?',
    a: 'Yes. Tell us about allergies and dietary needs when you plan, and the kitchen will take care of them.',
  },
  {
    q: 'Is River Ranch accessible, and where do guests park?',
    a: 'The restaurant is ADA accessible, and there is a private lot on site. Parking isn’t guaranteed during peak season or storms.',
  },
];

// Capacities come only from content/spaces.ts (management-confirmed); anything else says "ask us".
const fits = (name: string) => spaces.find((s) => s.name === name)?.capacity ?? null;

const SPACES: PickerSpace[] = [
  {
    lead: 'Riverview',
    em: 'room',
    text: 'The round dining room, cantilevered over the Truckee. The river runs right under the party.',
    place: 'Out over the river',
    fits: fits('Riverview room'),
    photo: photos.heroDusk,
  },
  {
    lead: 'Alpine',
    em: 'Dining Room',
    text: 'The one with the big stone fireplace. Light the fire, set a long table, stay late.',
    place: 'By the stone fireplace',
    fits: fits('Alpine Dining Room'),
    photo: photos.fireplaceRoom,
  },
  {
    lead: 'The',
    em: 'Point',
    text: 'The river end of the patio. Book it and it’s yours for the event, river and all. A small section of the patio stays open for our regular diners.',
    place: 'The Half Patio, at the river end',
    fits: fits('The Point'),
    photo: photos.pointCeremony,
  },
  {
    lead: 'Full',
    em: 'Patio',
    text: 'The whole riverside patio, in September and in spring once it opens. Room for a band and everyone you know.',
    place: 'September and spring',
    fits: fits('Full Patio'),
    photo: photos.patioRoundsSails,
  },
];

const PARTIES = [
  {
    lead: 'Private',
    em: 'dinners',
    line: 'One long table by the fire, for 13 to 50 guests. Tell us the occasion and we come back with a menu.',
    go: 'Plan a dinner',
    href: '/celebrate/plan#request',
  },
  {
    lead: 'Company',
    em: 'parties',
    line: 'Holiday parties, ski groups, team dinners. Take a room or take the whole patio. Monday can wait.',
    go: 'Plan a party',
    href: '/celebrate/plan#request',
  },
  {
    lead: 'Live',
    em: 'shows',
    line: 'Music came back to the patio for good in 2025. Got a show in mind? Bring it.',
    go: 'Pitch us a show',
    href: '/celebrate/plan#request',
  },
];

const bandOnStage: Photo = { src: '/photos/concerts/band-on-patio-stage.jpg', width: 1600, height: 900, alt: 'A band on the patio stage under string lights with the crowd in front' };
const packedPatio: Photo = { src: '/photos/concerts/packed-patio-tables-to-stage.jpg', width: 1600, height: 1200, alt: 'Looking down the patio tables to a packed crowd and the lit stage at night' };
// No captions on these photos (owner, Nov 12). Never describe any part of River Ranch as a dance
// floor in copy, alt text or file names: it isn't a nightclub, and the wording matters to our insurance.
const GALLERY: { photo: Photo; tall?: boolean; focus?: string }[] = [
  { photo: photos.weddingArch },
  { photo: homePhotos.ceremony, tall: true },
  { photo: photos.riverviewRapids },
  { photo: photos.fireplaceTableSet },
  { photo: homePhotos.cake, tall: true, focus: '62% 50%' },
  { photo: packedPatio },
  { photo: homePhotos.dining },
  { photo: photos.patioRoundsHeaters },
  { photo: bandOnStage },
];


export default function CelebratePage() {
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <JsonLd data={breadcrumbSchema('Celebrate', '/celebrate')} />
      <JsonLd data={faqSchema} />
      <SiteHeader variant="overlay" />

      {/* HERO */}
      <section className="page-hero cel-hero">
        <div className="page-hero__media">
          <Image src={homePhotos.cake.src} alt={homePhotos.cake.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Celebrate</p>
          <Lines as="h1" className="display-xl" lines={['Throw it', <em key="e">at the Ranch.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">
            Weddings, private dinners, company parties and live shows, right on the river. Loud toasts welcome.
          </p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <Link href="/celebrate/plan" className="btn">Plan an event</Link>
            <a href="#spaces" className="btn btn--ghost">See the spaces</a>
          </div>
        </div>
      </section>

      {/* PLAN: Venio's booking widget right under the hero (the same frame as /celebrate/plan; every request lands in Venio) */}
      <section className="section section--dark" id="plan" aria-labelledby="plan-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Plan an event</p>
            <Lines id="plan-h" className="display-l" lines={['Let’s get it', <em key="e">on the calendar.</em>]} />
          </div>
          <p className="lede cel-plan__lede" data-reveal>Pick a night in the Alpine Dining Room and send a request. Easy enough to do on a chairlift.</p>
          <div className="cel-plan__widget">
            <VenioWidget />
          </div>
          <p className="small cel-contact cel-plan__call">
            Planning a wedding, a buyout or the patio? Use “Planning something bigger?” in the calendar, email{' '}
            <a href={`mailto:${business.email.events}`}>{business.email.events}</a> or call <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
          </p>
        </div>
      </section>

      {/* A VENUE AS MUCH AS A LODGE */}
      <Aperture photo={photos.aerialSpaces} id="venue" labelledBy="venue-h">
        <p className="label label--accent" data-reveal>The venue</p>
        <Lines id="venue-h" className="display-l" lines={['A venue as much', <>as <em>a lodge.</em></>]} />
        <p className="lede" data-reveal data-reveal-delay="150">
          Four spaces on the Truckee, dinner from our kitchen, and {business.rooms} rooms upstairs for whoever isn’t driving home.
        </p>
        <div className="chip-row" data-reveal data-reveal-delay="250">
          <span className="chip chip--plain">Weddings</span>
          <span className="chip chip--plain">Rehearsal dinners</span>
          <span className="chip chip--plain">Private dinners</span>
          <span className="chip chip--plain">Company parties</span>
          <span className="chip chip--music">Live shows</span>
        </div>
        <p data-reveal data-reveal-delay="350">
          <Link href="/stay" className="link-arrow">The rooms upstairs</Link>
        </p>
      </Aperture>

      {/* THE FOUR SPACES */}
      <section className="section section--snow" id="spaces" aria-labelledby="spaces-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>The four spaces</p>
            <Lines id="spaces-h" className="display-l" lines={[<>Pick <em>your room.</em></>]} />
          </div>
          <SpacePicker items={SPACES} />
        </div>
      </section>

      {/* WEDDINGS */}
      <section className="section section--dark cel-wed" id="weddings" aria-labelledby="weddings-h">
        <div className="container split">
          <figure className="frame frame--tall frame--arch" data-reveal="clip">
            <Image src={homePhotos.couple.src} alt={homePhotos.couple.alt} fill sizes="(max-width: 860px) 180vw, 1040px" />
          </figure>
          <div className="stack cel-stack">
            <p className="label label--accent" data-reveal>Weddings</p>
            <Lines id="weddings-h" className="display-l" lines={['Say it by', <em key="e">the river.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">
              Ceremony on The Point. Dinner on the patio. Cake after dark, with the Truckee doing the background music.
            </p>
            <ul className="rows cel-rows2" data-reveal data-reveal-delay="250">
              <li><span className="row__title">The <em>ceremony</em></span><span className="row__note">On The Point, with the Truckee right behind you.</span></li>
              <li><span className="row__title">The <em>party</em></span><span className="row__note">Dinner on the patio and cake after dark.</span></li>
              <li><span className="row__title">The <em>night before</em></span><span className="row__note">Rehearsal dinner in a room of your own.</span></li>
              <li><span className="row__title">The <em>end of the night</em></span><span className="row__note">A room upstairs. We do the whole weekend.</span></li>
            </ul>
            <div className="btn-row" data-reveal data-reveal-delay="300">
              <Link href="/celebrate/weddings" className="btn">Weddings at River Ranch</Link>
              <Link href="/celebrate/plan#request" className="btn btn--ghost">Plan a wedding</Link>
            </div>
          </div>
        </div>
      </section>

      {/* PRIVATE DINNERS AND PARTIES */}
      <section className="section section--ember" id="parties" aria-labelledby="parties-h">
        <div className="container split split--flip">
          <figure className="frame frame--zoom" data-reveal="clip">
            <Image src={photos.fireplaceLongTable.src} alt={photos.fireplaceLongTable.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
          </figure>
          <div className="stack cel-stack">
            <p className="label label--accent" data-reveal>Dinners and parties</p>
            <Lines id="parties-h" className="display-l" lines={[<>Take <em>the room.</em></>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Long tables, good wine, and a guest list that knows how to have fun.</p>
            <ul className="rows cel-parties" data-reveal data-reveal-delay="250">
              {PARTIES.map((p) => (
                <li key={p.href}>
                  <span className="row__title">{p.lead} <em>{p.em}</em></span>
                  <span className="cel-party__body">
                    <span className="row__note">{p.line}</span>
                    <Link href={p.href} className="link-arrow">{p.go}</Link>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* GALLERY */}
      <section className="section section--dark cel-gallery" id="gallery" aria-labelledby="gallery-h">
        <div className="container">
          <div className="cel-gal-head">
            <div>
              <p className="label label--accent" data-reveal>A look around</p>
              <Lines id="gallery-h" className="display-l" lines={[<>Proof it <em>happened.</em></>]} />
            </div>
            <p className="label cel-gal-hint" data-reveal data-reveal-delay="200" aria-hidden="true">Drag</p>
          </div>
        </div>
        <div className="drag-gallery" tabIndex={0} aria-label="Event photos (scrolls sideways)" data-reveal="fade">
          <div className="drag-gallery__track">
            {GALLERY.map((g) => (
              <figure key={g.photo.src} className={`frame${g.tall ? ' frame--tall is-tall' : ''}`}>
                <Image src={g.photo.src} alt={g.photo.alt} fill sizes={g.tall ? '(max-width: 860px) 108vw, 760px' : '(max-width: 860px) 72vw, 560px'} style={g.focus ? { objectPosition: g.focus } : undefined} />
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section section--snow" id="faq" aria-labelledby="faq-h">
        <div className="container split split--top cel-faq">
          <div className="stack cel-stack">
            <p className="label label--accent" data-reveal>Good to know</p>
            <Lines id="faq-h" className="display-l" lines={['Questions,', <em key="e">answered.</em>]} />
          </div>
          <div className="faq" data-reveal data-reveal-delay="150">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
