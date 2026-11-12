import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { business } from '@/content/site';
import type { Photo } from '@/content/photos';
import { besideCalendar, chapters, storyClose, storyOpen, type Chapter } from '@/content/wedding-story';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import '../celebrate.css';

// One real wedding as a short story, in ten photos, around the open-date calendar for wedding season
// and "Get the packet". Both are Venio's, displayed here. Until Venio serves the calendar,
// NEXT_PUBLIC_VENIO_WEDDING_CALENDAR_URL stays unset and a marked slot shows. "Get the packet" is the
// way into Venio's forms: for now it opens the wedding inquiry; once Venio's packet form is embedded it
// becomes that form (fill it in, get the packet, land in Leads).

export const metadata: Metadata = {
  title: 'Riverside Weddings in Tahoe City',
  description:
    'Riverside weddings at River Ranch in Tahoe City: get ready at the lodge, say your vows on the patio under the pines, portraits on the Truckee, then dinner and dancing under the lanterns. See open dates and get the wedding packet.',
  alternates: { canonical: '/celebrate/weddings' },
};

const CALENDAR_URL = process.env.NEXT_PUBLIC_VENIO_WEDDING_CALENDAR_URL;
const PACKET_HREF = '/celebrate/plan#wedding';

function Shot({ photo, sizes }: { photo: Photo; sizes: string }) {
  return (
    <figure className="cel-shot" data-reveal style={{ '--ar': (photo.width / photo.height).toFixed(3) } as React.CSSProperties}>
      <Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} sizes={sizes} />
    </figure>
  );
}

function ChapterBand({ ch, flip }: { ch: Chapter; flip: boolean }) {
  const wide = ch.photos.length === 1;
  return (
    <section className={`section ${ch.night ? 'section--dark' : 'section--snow'} cel-wch`} id={ch.id} aria-labelledby={`${ch.id}-h`}>
      <div className={`container cel-wch__grid${flip ? ' cel-wch__grid--flip' : ''}${wide ? ' cel-wch__grid--wide' : ''}`}>
        <div className="stack cel-wch__words">
          <p className="label label--accent" data-reveal>{ch.name}</p>
          <Lines id={`${ch.id}-h`} className="display-l" lines={[ch.title[0], <em key="e">{ch.title[1]}</em>]} />
          <p className="lede" data-reveal data-reveal-delay="150">{ch.line}</p>
        </div>
        <div className="cel-row">
          {ch.photos.map((p) => (
            <Shot key={p.src} photo={p} sizes={wide ? '(max-width: 1400px) 100vw, 1400px' : '(max-width: 860px) 50vw, 33vw'} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function WeddingsPage() {
  const before = chapters.slice(0, 2);
  const after = chapters.slice(2);
  return (
    <>
      <JsonLd data={breadcrumbSchema('Weddings', '/celebrate/weddings')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero cel-hero--night">
        <div className="page-hero__media">
          <Image src={storyOpen.src} alt={storyOpen.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Weddings</p>
          <Lines as="h1" className="display-xl" lines={['Say it by', <em key="e">the river.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">
            Vows under the pines, dinner on the patio and dancing under the lanterns, with the Truckee running past all evening.
          </p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <Link href={PACKET_HREF} className="btn">Get the packet</Link>
            <a href="#dates" className="btn btn--ghost-cream">See open dates</a>
          </div>
        </div>
      </section>

      {before.map((ch, i) => <ChapterBand key={ch.id} ch={ch} flip={i % 2 === 1} />)}

      {/* OPEN DATES: the dog crashing the vows, Venio's calendar, and the way in */}
      <section className="section section--ember cel-dates" id="dates" aria-labelledby="dates-h">
        <div className="container">
          <div className="cel-dates__head stack">
            <p className="label label--accent" data-reveal>Open dates</p>
            <Lines id="dates-h" className="display-l" lines={['Find your', <em key="e">date.</em>]} />
          </div>
          <div className="cel-dates__grid">
            <figure className="cel-beside" data-reveal="clip">
              <Image src={besideCalendar.src} alt={besideCalendar.alt} fill sizes="(max-width: 860px) 100vw, 25vw" />
              <figcaption>Leashed dogs welcome on the patio, ceremonies included.</figcaption>
            </figure>
            <div className="cel-cal__slot">
              {CALENDAR_URL ? (
                <iframe src={CALENDAR_URL} title="Open wedding dates" loading="lazy" />
              ) : (
                <p className="placeholder">[Venio open-date calendar for wedding season]</p>
              )}
            </div>
            <div className="cel-packet stack" data-reveal data-reveal-delay="150">
              <p className="label label--accent">The wedding packet</p>
              <h3 className="cel-packet__title">Get the packet</h3>
              <p>Spaces, menus and pricing, all in one place. Tell us a little about your day and it’s yours.</p>
              <Link href={PACKET_HREF} className="btn">Get the packet</Link>
              <p className="small">
                Or call <a href={`tel:${business.phoneE164}`}>{business.phone}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {after.map((ch, i) => <ChapterBand key={ch.id} ch={ch} flip={i % 2 === 1} />)}

      {/* YOUR TURN: the patio after dark */}
      <section className="page-hero page-hero--short cel-end" aria-labelledby="end-h">
        <div className="page-hero__media">
          <Image src={storyClose.src} alt={storyClose.alt} fill sizes="100vw" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent" data-reveal>Your turn</p>
          <Lines id="end-h" className="display-l" lines={['Tell us', <em key="e">your date.</em>]} />
          <div className="btn-row" data-reveal data-reveal-delay="200">
            <Link href={PACKET_HREF} className="btn">Get the packet</Link>
            <a href="#dates" className="btn btn--ghost-cream">See open dates</a>
          </div>
        </div>
      </section>
    </>
  );
}
