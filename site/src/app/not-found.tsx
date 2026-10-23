import Link from 'next/link';
import { L } from '@/content/lorem';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';

export default function NotFound() {
  return (
    <>
      <main id="main">
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 24 }}>
          <span className="eyebrow">Page not found</span>
          <h1 className="slash h-l">Page not found.</h1>
          <p className="lede">{L.line}</p>
          <div className="btn-row">
            <Link href="/stay" className="btn btn--amber">Stay</Link>
            <Link href="/dine" className="btn btn--navy">Dine</Link>
            <Link href="/celebrate" className="btn btn--navy">Celebrate</Link>
          </div>
        </div>
      </section>
      </main>
      <SiteFooter />
    </>
  );
}
