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
  description:
    'Buy a River Ranch restaurant gift card online, get a lodge gift certificate, and join River Ranch Rewards: $10 off for every 200 points at the restaurant and bar in Tahoe City.',
  alternates: { canonical: '/loyalty-and-gift-cards' },
};

// River Ranch Rewards runs on Toast (live 2026-11-10, docs/KICKOFF.md): 1 point per $1 on the pre-tax
// check after discounts (never tips, tax or gift cards), $10 off at 200 points, 50 points for joining,
// $5 off in the birthday month. Only restaurant and bar spending counts: never room stays or event
// deposits (management, 2026-11-10), so the copy must never say "every dollar you spend with us".
const STEPS = [
  { name: 'Join', line: 'Sign up online, or give your phone number when you pay. That’s 50 points just for joining.' },
  { name: 'Earn', line: 'One point for every dollar at the restaurant and bar, before tax and tip.' },
  { name: 'Cash in', line: 'Every 200 points is $10 off your check. And $5 off in your birthday month.' },
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
          <p className="lede" data-reveal data-reveal-delay="300">Give someone dinner by the fire or a night on the river. And if you’re here a lot, you should be earning.</p>
          <div className="btn-row" data-reveal data-reveal-delay="450">
            <a href="#gift-cards" className="btn">Gift cards</a>
            <a href="#loyalty" className="btn btn--ghost">River Ranch Rewards</a>
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
              <p className="lede" data-reveal data-reveal-delay="150">Two kinds: one for the restaurant and bar, one for a stay at the lodge. Restaurant cards go out by email or text in a minute, so they’re never too late.</p>
            </div>
            <ul className="rows lo-rows">
              <li data-reveal>
                <span className="row__title">Restaurant <em>gift cards</em></span>
                <span className="row__note">For the restaurant and bar. Buy online in any amount from $5 to $500.</span>
              </li>
              <li data-reveal data-reveal-delay="100">
                <span className="row__title">Lodge <em>gift certificates</em></span>
                <span className="row__note">For a stay at the lodge. Call <a className="text-link" href={`tel:${business.phoneE164}`}>{business.phone}</a> or ask at the front desk.</span>
              </li>
              <li data-reveal data-reveal-delay="200">
                <span className="row__title">Got <em>one already?</em></span>
                <span className="row__note"><a className="text-link" href={business.links.giftCardBalance}>Check a gift card balance</a></span>
              </li>
            </ul>
            <div className="btn-row lo-gift__btns" data-reveal data-reveal-delay="300">
              <a href={business.links.buyGiftCard} className="btn btn--ink">Buy a gift card</a>
              <a href={`tel:${business.phoneE164}`} className="btn btn--ghost">Call for a lodge certificate</a>
            </div>
          </div>
        </div>
      </section>

      {/* Loyalty, on charcoal */}
      <section className="section section--dark" id="loyalty" aria-labelledby="loyalty-h">
        <div className="container">
          <div className="section-head">
            <p className="label label--accent" data-reveal>River Ranch Rewards</p>
            <Lines id="loyalty-h" className="display-l" lines={['For the regulars.', <em key="e">You earned it.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">Our loyalty program for the restaurant and bar. Dinner by the fire, brunch after a powder day, a night at the bar: it all adds up to money off the next one.</p>
          </div>
          <ol className="lo-steps">
            {STEPS.map((s, i) => (
              <li key={s.name} data-reveal data-reveal-delay={String(i * 120)}>
                <span className="lo-steps__n" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3 className="display-s">{s.name}</h3>
                <p>{s.line}</p>
              </li>
            ))}
          </ol>
          <div className="btn-row lo-join" data-reveal>
            <a href={business.links.rewards} className="btn">Join River Ranch Rewards</a>
            <a href={business.links.rewards} className="btn btn--ghost">Check your points</a>
          </div>
          <p className="small muted lo-note" data-reveal>Points are for the restaurant and bar. Room stays and event deposits don’t earn them.</p>
        </div>
      </section>
    </>
  );
}
