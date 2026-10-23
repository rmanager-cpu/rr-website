import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

// Placeholder until online ordering and delivery launch. Kept out of Google (noindex) until it does
// something; the old Popmenu /order address lands here.
export const metadata: Metadata = {
  title: 'Online Ordering & Delivery',
  description: 'Online ordering and delivery from River Ranch in Tahoe City, coming soon.',
  alternates: { canonical: '/order' },
  robots: { index: false, follow: true },
};

export default function OrderPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Order online', '/order')} />
      <SiteHeader />
      <section className="section">
        <div className="container media-row" style={{ gap: 48, alignItems: 'center' }}>
          <div className="grow stack" style={{ gap: 22 }}>
            <span className="eyebrow">Order online</span>
            <h1 className="slash h-l">Online ordering &amp; delivery.</h1>
            <p className="serif" style={{ margin: 0, fontSize: 'clamp(30px, 3.4vw, 46px)', color: 'var(--amber)' }}>Coming soon.</p>
            <p className="lede">Pickup and delivery from the River Ranch kitchen are on the way. Until then, come see us, or call ahead.</p>
            <div className="btn-row">
              <Link href="/menus" className="btn btn--amber">See the menus</Link>
              <a href={`tel:${business.phoneE164}`} className="btn btn--navy">{business.phone}</a>
            </div>
          </div>
          <div className="side">
            <Image src={photos.scallops.src} alt={photos.scallops.alt} width={photos.scallops.width} height={photos.scallops.height} sizes="(max-width: 900px) 100vw, 420px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
        </div>
      </section>
    </>
  );
}
