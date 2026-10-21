import Image from 'next/image';
import Link from 'next/link';
import { business, hours, nav } from '@/content/site';
import { photos } from '@/content/photos';

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <a href={business.links.theWall} className="story-link">
          <Image src={photos.theWall.src} alt={photos.theWall.alt} width={720} height={480} sizes="(max-width: 760px) 100vw, 360px" />
          <span className="stack" style={{ gap: 10, maxWidth: 560 }}>
            <span className="eyebrow eyebrow--amber">Our story · The Wall</span>
            <span className="serif" style={{ fontSize: 'clamp(34px, 3.6vw, 52px)', lineHeight: 1.02 }}>
              Decades of River Ranch, one frame at a time. Recognize a face? Tell us the story.
            </span>
          </span>
        </a>

        <div className="footer-cols">
          <div className="stack" style={{ gap: 10 }}>
            <span className="serif" style={{ fontSize: 30 }}>River Ranch</span>
            <address>
              {business.address.street}
              <br />
              {business.address.city}, {business.address.region} {business.address.postalCode}
              <br />
              <a href={`tel:${business.phoneE164}`}>{business.phone}</a>
            </address>
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <span className="footer-label">Hours</span>
            <ul style={{ color: 'var(--sand)' }}>
              <li>{hours.dinner.label}: {hours.dinner.days.toLowerCase()}, {hours.dinner.time}</li>
              <li>{hours.happyHour.label}: Mon–Fri, {hours.happyHour.time}</li>
              <li>{hours.breakfast.label}: Sat & Sun, {hours.breakfast.time}</li>
            </ul>
          </div>
          <nav aria-label="Footer" className="stack" style={{ gap: 10 }}>
            <span className="footer-label">Explore</span>
            <ul>
              {nav.map((n) => (
                <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
              ))}
              <li><Link href="/visit">Visit &amp; directions</Link></li>
              <li><Link href="/visit#gift-cards">Gift cards</Link></li>
              <li><Link href="/visit#jobs">Jobs</Link></li>
            </ul>
          </nav>
          <div className="stack" style={{ gap: 10 }}>
            <span className="footer-label">Follow along</span>
            <ul>
              <li><a href={business.social.instagram} rel="noopener">Instagram</a></li>
              <li><a href={business.social.facebook} rel="noopener">Facebook</a></li>
              <li><a href={business.links.theWall}>The Wall</a></li>
            </ul>
          </div>
        </div>

        <div className="footer-base">
          <span>© {new Date().getFullYear()} {business.name}</span>
          <span>On the Truckee River, Tahoe City, California</span>
        </div>
      </div>
    </footer>
  );
}
