import Link from 'next/link';
import { SiteHeader } from '@/components/SiteHeader';

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <section className="section">
        <div className="container stack" style={{ gap: 24 }}>
          <span className="eyebrow">Page not found</span>
          <h1 className="slash h-l">That trail doesn&apos;t go anywhere.</h1>
          <p className="lede">The page may have moved when we rebuilt the site. Try one of these:</p>
          <div className="btn-row">
            <Link href="/stay" className="btn btn--amber">Stay</Link>
            <Link href="/dine" className="btn btn--navy">Dine</Link>
            <Link href="/celebrate" className="btn btn--navy">Celebrate</Link>
          </div>
        </div>
      </section>
    </>
  );
}
