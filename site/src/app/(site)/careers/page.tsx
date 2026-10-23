import type { Metadata } from 'next';
import Image from 'next/image';
import { SiteHeader } from '@/components/SiteHeader';
import { photos } from '@/content/photos';
import { breadcrumbSchema, JsonLd } from '@/lib/schema';
import { ApplyForm } from './ApplyForm';

export const metadata: Metadata = {
  title: 'Careers: Join Our Team in Tahoe City',
  description:
    'Work at River Ranch Lodge & Restaurant on the Truckee River in Tahoe City. We hire for front of house, back of house, lodge staff, maintenance and administration.',
  alternates: { canonical: '/careers' },
};

const TEAMS = [
  { name: 'Front of house', line: 'Servers, bartenders, hosts and bussers for the dining room, the round bar and the patio.' },
  { name: 'Back of house', line: 'Cooks, prep and dish, for dinner nightly, weekend breakfast and patio lunch.' },
  { name: 'Lodge staff', line: 'Front desk and housekeeping for our 19 rooms on the river.' },
  { name: 'Maintenance', line: 'Keeping a historic lodge, the patio and the grounds in shape, through every season.' },
  { name: 'Administrative', line: 'Events, office and management support.' },
];

export default function CareersPage() {
  return (
    <>
      <JsonLd data={breadcrumbSchema('Careers', '/careers')} />
      <SiteHeader />
      <section className="section">
        <div className="container media-row" style={{ gap: 48, alignItems: 'flex-start' }}>
          <div className="grow stack" style={{ gap: 26 }}>
            <span className="eyebrow">Careers</span>
            <h1 className="slash h-l">Join our team.</h1>
            <p className="lede">Work on the Truckee River, minutes from Palisades Tahoe, with a crew that’s been doing this a long time. Winter and summer seasons, and year-round roles.</p>
            <dl className="facts" style={{ gridTemplateColumns: '1fr' }}>
              {TEAMS.map((t) => (
                <div key={t.name}>
                  <dt>{t.name}</dt>
                  <dd>{t.line}</dd>
                </div>
              ))}
            </dl>
            <Image src={photos.bartender.src} alt={photos.bartender.alt} width={photos.bartender.width} height={photos.bartender.height} sizes="(max-width: 900px) 100vw, 760px" className="rounded" style={{ width: '100%', height: 'auto' }} />
          </div>
          <div className="side" style={{ flexBasis: 380, position: 'sticky', top: 24 }}>
            <ApplyForm />
            <p className="turbotips">
              Tips here are tracked and shared through
              <Image src="/photos/turbotips-logo.png" alt="TurboTips" width={320} height={105} style={{ width: 72, height: 'auto', display: 'inline-block', verticalAlign: 'middle', margin: '0 0 0 6px', opacity: 0.85 }} />
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
