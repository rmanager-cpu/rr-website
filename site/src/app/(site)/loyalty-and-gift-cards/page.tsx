import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Loyalty & Gift Cards',
  description: 'River Ranch restaurant gift cards and lodge gift certificates, and our loyalty program for the lodge and restaurant, coming soon.',
  alternates: { canonical: '/loyalty-and-gift-cards' },
};

export default function LoyaltyAndGiftCardsPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Loyalty & Gift Cards', '/loyalty-and-gift-cards')} />
      <SiteHeader />

      <section className="section">
        <div className="container media-row" style={{ gap: 48, alignItems: 'center' }}>
          <div className="grow stack" style={{ gap: 24 }}>
            <h1 className="slash h-l">Loyalty &amp; Gift Cards</h1>
            <p className="lede">{L.line}</p>
          </div>
          <div className="side">
            <Image src={photos.lantern.src} alt={photos.lantern.alt} width={photos.lantern.width} height={photos.lantern.height} sizes="(max-width: 900px) 100vw, 400px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>

      <section className="section bg-frost" id="gift-cards" aria-labelledby="gift-h">
        <div className="container stack" style={{ gap: 32 }}>
          <h2 id="gift-h" className="serif h-m">Gift cards</h2>
          <dl className="facts">
            <div><dt>Restaurant gift cards</dt><dd>For the restaurant and bar</dd></div>
            <div><dt>Lodge gift certificates</dt><dd>For a stay at the lodge</dd></div>
            <div><dt>How to buy</dt><dd>Call <a href={`tel:${business.phoneE164}`}>{business.phone}</a> or ask at the front desk</dd></div>
          </dl>
        </div>
      </section>

      <section className="section" id="loyalty" aria-labelledby="loyalty-h">
        <div className="container stack" style={{ gap: 22, maxWidth: 900 }}>
          <h2 id="loyalty-h" className="serif h-m">Loyalty</h2>
          <p className="lede">One program for the lodge and the restaurant is on the way. Check back soon.</p>
        </div>
      </section>
    </>
  );
}
