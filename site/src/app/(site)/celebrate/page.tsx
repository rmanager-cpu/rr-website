import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from '@/components/Icons';
import { SiteHeader } from '@/components/SiteHeader';
import { SpaceGrid } from '@/components/SpaceGrid';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Private Dining & Weddings in Tahoe City',
  description:
    'Private dinners for 13 to 50 guests, holiday and corporate parties, ski groups and riverside weddings at River Ranch in Tahoe City, minutes from Palisades Tahoe.',
  alternates: { canonical: '/celebrate' },
};

// Facts from the private-dining terms already published on rrbanquets.com. Pricing and cancellation
// terms are left out on purpose until the one current policy is confirmed (three versions exist).
const FAQ = [
  {
    q: 'What kinds of events do you host?',
    a: 'Corporate dinners, holiday parties, ski groups, rehearsal dinners, receptions, birthdays and weddings.',
  },
  {
    q: 'How many guests can you seat?',
    a: 'Private dinners in our dining rooms are for 13 to 50 guests. For larger groups, buyouts and weddings, start a conversation with our events team and we’ll plan it with you.',
  },
  {
    q: 'Is there a room or site fee for private dining?',
    a: 'No room or site fees for private dining. There is a food and beverage minimum, plus tax and a 22% gratuity shared across the whole team.',
  },
  {
    q: 'How far ahead do I need to book?',
    a: 'At least 7 days ahead for a private dinner. Your date is held once the deposit is paid.',
  },
  {
    q: 'Can we hold an event on the patio?',
    a: 'Yes, in the warmer months. Patio dates depend on the weather and are released in late winter or early spring, with an indoor room as the backup.',
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
      <SiteHeader />

      <section className="page-hero">
        <div className="page-hero__bg">
          <Image src={photos.fireplaceLongTable.src} alt={photos.fireplaceLongTable.alt} fill priority sizes="100vw" style={{ objectFit: 'cover', objectPosition: 'center 60%' }} />
        </div>
        <div className="page-hero__shade" aria-hidden="true" />
        <div className="container page-hero__body">
          <h1 className="serif" style={{ fontSize: 'clamp(56px, 9vw, 144px)', lineHeight: 0.92 }}>
            <span className="write">Private dinners,</span>
            <span className="write write--2">parties &amp; weddings.</span>
          </h1>
          <p>{L.line}</p>
        </div>
      </section>

      <section className="section" aria-label="Ways to celebrate">
        <div className="container stack" style={{ gap: 40 }}>
          <span className="eyebrow">Choose your occasion</span>
          <div className="occasions">
            <Link href="/celebrate/plan#private" className="occasion" id="private-dining">
              <span className="occasion__name">Private dining &amp; parties</span>
              <span className="occasion__line">{L.line2}</span>
              <span className="occasion__go"><span className="pill">Plan a dinner</span><ArrowRight size={26} /></span>
            </Link>
            <Link href="/celebrate/plan#corporate" className="occasion" id="groups">
              <span className="occasion__name">Corporate &amp; groups</span>
              <span className="occasion__line">{L.line3}</span>
              <span className="occasion__go"><span className="pill">Plan an event</span><ArrowRight size={26} /></span>
            </Link>
            <Link href="/celebrate/weddings" className="occasion">
              <span className="occasion__name">Weddings</span>
              <span className="occasion__line">{L.line2}</span>
              <span className="occasion__go"><span className="pill pill--line">See weddings</span><ArrowRight size={26} /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="section bg-frost" aria-labelledby="spaces-h">
        <div className="container stack" style={{ gap: 44 }}>
          <div className="row-split">
            <h2 id="spaces-h" className="serif h-m">The spaces</h2>
            <p className="lede" style={{ maxWidth: 420 }}>{L.line}</p>
          </div>
          <SpaceGrid />
          <Link href="/celebrate/spaces" className="arrow-link" style={{ alignSelf: 'flex-start' }}>All the spaces <ArrowRight size={18} /></Link>
        </div>
      </section>

      <section className="section" id="plan" aria-labelledby="plan-h">
        <div className="container stack" style={{ gap: 22, maxWidth: 900 }}>
          <span className="eyebrow">Plan it</span>
          <h2 id="plan-h" className="serif h-m">{L.head}</h2>
          <p className="lede">{L.line3}</p>
          <div className="btn-row">
            <Link href="/celebrate/plan" className="btn btn--amber">Plan your event</Link>
          </div>
        </div>
      </section>

      <section className="band" id="weddings" aria-labelledby="weddings-h">
        <div className="band__bg">
          <Image src={photos.weddingArch.src} alt={photos.weddingArch.alt} fill sizes="100vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="container" style={{ width: '100%', paddingBlock: 80 }}>
          <div className="band__card">
            <span className="eyebrow">Weddings</span>
            <h2 id="weddings-h" className="serif" style={{ fontSize: 'clamp(40px, 4.6vw, 64px)', lineHeight: 0.98 }}>{L.head2}</h2>
            <p className="lede">{L.line}</p>
            <Link href="/celebrate/weddings" className="btn btn--amber" style={{ alignSelf: 'flex-start' }}>Weddings at River Ranch</Link>
          </div>
        </div>
      </section>

      <section className="section" aria-labelledby="faq-h">
        <div className="container stack" style={{ gap: 32 }}>
          <h2 id="faq-h" className="serif h-m">Questions, answered</h2>
          <div className="faq">
            {FAQ.map((f) => (
              <details key={f.q}>
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section style={{ background: 'var(--navy)', color: 'var(--ice)' }}>
        <Link href="/stay" className="container next-door">
          <span className="stack" style={{ gap: 14 }}>
            <span className="eyebrow eyebrow--amber">Next door · Stay</span>
            <span className="serif" style={{ fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 0.98 }}>{L.head3}</span>
          </span>
          <Image src={photos.balconyChairs.src} alt={photos.balconyChairs.alt} width={photos.balconyChairs.width} height={photos.balconyChairs.height} sizes="440px" className="rounded" style={{ width: 'min(440px, 100%)', aspectRatio: '3 / 2', objectFit: 'cover' }} />
        </Link>
      </section>
    </>
  );
}
