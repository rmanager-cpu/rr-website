import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Lines } from '@/components/fl/Lines';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { business } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

// Placeholder until online ordering and delivery launch. Kept out of Google (noindex) until it does
// something; the old Popmenu /order address lands here.
export const metadata: Metadata = {
  title: 'Online Ordering & Delivery',
  description: 'Online ordering and delivery from River Ranch in Tahoe City, coming soon.',
  alternates: { canonical: '/dine/menus/order' },
  robots: { index: false, follow: true },
};

export default function OrderPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Order online', '/dine/menus/order')} />
      <SiteHeader />
      <section className="section section--snow">
        <div className="container split">
          <div className="stack">
            <p className="label label--accent" data-reveal>Order online</p>
            <Lines as="h1" className="display-l" lines={['Online ordering', <em key="w">is on its way.</em>]} />
            <p className="lede" data-reveal data-reveal-delay="150">It isn’t ready yet. Until it is, every menu is here, and there’s a table by the river with your name on it.</p>
            <p className="placeholder" data-reveal data-reveal-delay="200">[One line about takeout: can guests call in an order today?]</p>
            <div className="btn-row" data-reveal data-reveal-delay="300">
              <Link href="/dine/menus" className="btn">See the menus</Link>
              <a href={`tel:${business.phoneE164}`} className="btn btn--ghost">{business.phone}</a>
            </div>
          </div>
          <figure className="frame frame--tall frame--arch" style={{ width: '100%', maxWidth: 480, justifySelf: 'center' }} data-reveal="clip">
            <Image src={photos.scallops.src} alt={photos.scallops.alt} fill priority sizes="(max-width: 860px) 100vw, 45vw" />
          </figure>
        </div>
      </section>
    </>
  );
}
