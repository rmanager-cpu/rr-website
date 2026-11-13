import { Analytics } from '@vercel/analytics/next';
import { Motion } from '@/components/fl/Motion';
import { SeasonWash } from '@/components/SeasonWash';
import { SiteFooter } from '@/components/SiteFooter';

/** Public pages: main content, the Fireside footer and the scroll motion. SeasonWash renders only on
 *  the home page (the faded Palisades photo the hero's morning fades into). Staff pages under /admin
 *  have their own layout. Vercel Web Analytics counts visits to these pages only (no cookies; staff pages
 *  aren't counted); its numbers are on the river-ranch-site project's Analytics tab in Vercel. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeasonWash />
      <main id="main">{children}</main>
      <SiteFooter />
      <Motion />
      <Analytics />
    </>
  );
}
