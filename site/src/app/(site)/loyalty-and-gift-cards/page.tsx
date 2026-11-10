import type { Metadata } from 'next';
import Image from 'next/image';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import './loyalty.css';

export const metadata: Metadata = {
  title: 'Loyalty & Gift Cards',
  description: 'River Ranch restaurant gift cards and lodge gift certificates, and our loyalty program for the lodge and restaurant, coming soon.',
  alternates: { canonical: '/loyalty-and-gift-cards' },
};

// Loyalty: one program for the lodge and the restaurant (docs/KICKOFF.md, 2026-10-23). Nothing about it
// is public yet, so the details stay in brackets until management fills them in.
const STEPS = [
  { name: 'Join', line: '[How to sign up]' },
  { name: 'Earn', line: '[How points add up on dinners and stays]' },
  { name: 'Cash in', line: '[What the points turn into]' },
];

export default function LoyaltyAndGiftCardsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Loyalty & Gift Cards', '/loyalty-and-gift-cards')} />
      <SiteHeader variant="overlay" />

      <section className="page-hero page-hero--short">
        <div className="page-hero__media">
          <Image src={photos.lantern.src} alt={photos.lantern.alt} fill priority sizes="100vw" data-parallax="0.15" />
        </div>
        <div className="page-hero__inner container">
          <p className="label label--accent">Loyalty &amp; Gift Cards</p>
          <Lines as="h1" className="display-xl" lines={['Gifts, and a reason', <em key="e">to come back.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="300">Give someone dinner by the fire or a night on the river. A loyalty program for regulars is on the way.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#gift-cards" className="btn">Gift cards</a>
            <a href="#loyalty" className="btn btn--ghost">Loyalty</a>
          </div>
        </div>
      </section>

      {/* Gift cards, on snow white */}
      <section className="section section--snow" id="gift-cards" aria-labelledby="gift-h">
        <div className="container split lo-gift">
          <figure className="frame frame--tall lo-gift__photo" data-reveal="clip">
            <Image src={photos.fireplaceTableSet.src} alt={photos.fireplaceTableSet.alt} fill sizes="(max-width: 860px) 100vw, 50vw" />
          </figure>
          <div>
            <div className="section-head">
              <p className="label label--accent" data-reveal>Gift cards</p>
              <Lines id="gift-h" className="display-l lo-gift__title" lines={['Hand someone', <>a <em>good night out.</em></>]} />
              <p className="lede" data-reveal data-reveal-delay="150">Two kinds: one for the restaurant and bar, one for a stay at the lodge.</p>
            </div>
            <ul className="rows lo-rows">
              <li data-reveal>
                <span className="row__title">Restaurant <em>gift cards</em></span>
                <span className="row__note">For the restaurant and bar</span>
              </li>
              <li data-reveal data-reveal-delay="100">
                <span className="row__title">Lodge <em>gift certificates</em></span>
                <span className="row__note">For a stay at the lodge</span>
              </li>
              <li data-reveal data-reveal-delay="200">
                <span className="row__title">How <em>to buy</em></span>
                <span className="row__note">Call <a className="text-link" href={`tel:${business.phoneE164}`}>{business.phone}</a> or ask at the front desk</span>
              </li>
            </ul>
            <div className="btn-row lo-gift__btns" data-reveal data-reveal-delay="300">
              <a href={`tel:${business.phoneE164}`} className="btn btn--ink">Call {business.phone}</a>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty, on charcoal */}
      <section className="section section--dark" id="loyalty" aria-labelledby="loyalty-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>Loyalty</p>
            <Lines id="loyalty-h" className="display-l" lines={['For the regulars.', <em key="e">Coming soon.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">One program for the lodge and the restaurant, so the dinners and the stays all count.</p>
          </div>
          <ol className="lo-steps">
            {STEPS.map((s, i) => (
              <li key={s.name} data-reveal data-reveal-delay={String(i * 120)}>
                <span className="lo-steps__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display-s">{s.name}</h3>
                <p className="placeholder">{s.line}</p>
              </li>
            ))}
          </ol>
          <p className="placeholder lo-note" data-reveal>[When it starts, and how to hear about it first]</p>
        </div>
      </section>
    </>
  );
}
