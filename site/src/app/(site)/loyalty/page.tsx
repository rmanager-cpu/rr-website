import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import { SiteHeader } from '@/components/SiteHeader';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

// Placeholder until the program is defined; noindex so a thin page doesn't count against the site.
export const metadata: Metadata = {
  title: 'Loyalty',
  description: 'River Ranch loyalty program, coming soon.',
  alternates: { canonical: '/loyalty' },
  robots: { index: false, follow: true },
};

export default function LoyaltyPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Loyalty', '/loyalty')} />
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 22 }}>
          <span className="eyebrow">Loyalty</span>
          <h1 className="slash h-l">{L.head}</h1>
          <p className="lede">Our loyalty program is on the way. Check back soon.</p>
        </div>
      </section>
    </>
  );
}
