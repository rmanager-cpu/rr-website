import type { Metadata } from 'next';
import { L } from '@/content/lorem';
import { SiteHeader } from '@/components/SiteHeader';
import { business, fullAddress, hours } from '@/content/site';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'Directions & Contact, Tahoe City',
  description: `Find River Ranch at ${fullAddress}, on Highway 89 between Tahoe City and Palisades Tahoe. Hours, phone, email, gift cards and jobs.`,
  alternates: { canonical: '/visit' },
};

const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${business.name}, ${fullAddress}`)}`;

export default function VisitPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Visit', '/visit')} />
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 28 }}>
          <span className="eyebrow">Visit</span>
          <h1 className="slash h-l">{L.head}</h1>
          <p className="lede">On Highway 89 between Tahoe City and Palisades Tahoe, right on the Truckee River. Free parking on site.</p>
          <div className="btn-row">
            <a href={mapsUrl} className="btn btn--amber" rel="noopener">Get directions</a>
            <a href={`tel:${business.phoneE164}`} className="btn btn--navy">{business.phone}</a>
          </div>
        </div>
      </section>

      <section className="section bg-frost">
        <div className="container">
          <dl className="facts">
            <div><dt>Address</dt><dd>{business.address.street}<br />{business.address.city}, {business.address.region} {business.address.postalCode}</dd></div>
            <div><dt>Phone</dt><dd><a href={`tel:${business.phoneE164}`}>{business.phone}</a></dd></div>
            <div><dt>Lodge</dt><dd><a href={`mailto:${business.email.lodge}`}>{business.email.lodge}</a></dd></div>
            <div><dt>Restaurant</dt><dd><a href={`mailto:${business.email.restaurant}`}>{business.email.restaurant}</a></dd></div>
            <div><dt>Events</dt><dd><a href={`mailto:${business.email.events}`}>{business.email.events}</a></dd></div>
            <div><dt>Hours</dt><dd>Dinner nightly, {hours.dinner.time}<br />Happy hour Mon–Fri, {hours.happyHour.time}<br />Breakfast Sat & Sun, {hours.breakfast.time}</dd></div>
          </dl>
        </div>
      </section>

      <section className="section" id="gift-cards">
        <div className="container stack" style={{ gap: 14, maxWidth: 820 }}>
          <h2 className="serif h-s">Gift cards</h2>
          <p className="lede">Restaurant gift cards and lodge gift certificates are available. Call {business.phone} or ask at the front desk.</p>
        </div>
      </section>

      <section className="section bg-frost" id="jobs">
        <div className="container stack" style={{ gap: 14, maxWidth: 820 }}>
          <h2 className="serif h-s">Join our team</h2>
          <p className="lede"><a href="/careers">Apply on our Careers page.</a></p>
        </div>
      </section>
    </>
  );
}
