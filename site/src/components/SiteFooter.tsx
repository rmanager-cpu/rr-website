import Image from 'next/image';
import Link from 'next/link';
import { business, hours, lodging, sections, sharedNav } from '@/content/site';

/** "5–9 PM" reads "5 to 9 PM" in the site's copy. */
const to = (s: string) => s.replace(/\s*–\s*/g, ' to ');

/** The Fireside footer: charcoal, a huge wordmark, then where we are, the hours, the way around and the
 *  ways in. Every fact comes from content/site.ts. */
export function SiteFooter() {
  const { address } = business;
  return (
    <footer className="site-footer">
      <div className="container">
        <Link href="/" className="site-footer__name" aria-label={`${business.name}, home`}>
          River <em>Ranch</em>
        </Link>

        <div className="site-footer__grid">
          <div>
            <h2 className="footer-label">Find us</h2>
            <address>
              {business.name}
              <br />
              {address.street}
              <br />
              {address.city}, {address.region} {address.postalCode}
            </address>
            <ul>
              <li><a href={`tel:${business.phoneE164}`}>{business.phone}</a></li>
              <li><Link href="/visit">Directions and contact</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="footer-label">Hours</h2>
            <ul>
              <li>{hours.dinner.label} {hours.dinner.days.toLowerCase()}, {to(hours.dinner.time)}</li>
              <li>{hours.happyHour.label} {to(hours.happyHour.days)}, {to(hours.happyHour.time)}</li>
              <li>{hours.breakfast.label}, {to(hours.breakfast.time)}</li>
              <li>Check-in {lodging.checkIn}, check-out {lodging.checkOut}</li>
            </ul>
          </div>

          <div>
            <h2 className="footer-label">The lodge</h2>
            <ul>
              {[...sections, ...sharedNav].map((n) => (
                <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="footer-label">Come by</h2>
            <ul>
              <li><Link href={business.links.bookRoom}>Book a room</Link></li>
              <li><a href={business.links.reserveTable} rel="noopener">Reserve a table</a></li>
              <li><Link href="/celebrate/plan">Plan an event</Link></li>
              <li><Link href="/dine/happening">What&rsquo;s on</Link></li>
              <li><a href={`mailto:${business.email.events}`}>{business.email.events}</a></li>
            </ul>
          </div>
        </div>

        <p className="site-footer__fine">On the Truckee River, at the bottom of Alpine Meadows Road. Since 1964.</p>

        <div className="site-footer__base">
          <span>© {new Date().getFullYear()} {business.name}</span>
          <span className="site-footer__social">
            <a href={business.social.instagram} rel="noopener">Instagram</a>
            <a href={business.social.facebook} rel="noopener">Facebook</a>
            <a href={business.links.theWall}>The Wall</a>
            <Link href="/privacy">Privacy</Link>
          </span>
          {/* Builder credit. Becomes a link once turbodevs has its own site. */}
          <span className="credit">
            Custom site by
            <Image src="/photos/turbodevs-logo.png" alt="TurboDevs" width={480} height={127} loading="eager" style={{ width: 96, height: 'auto' }} />
          </span>
        </div>
      </div>
    </footer>
  );
}
