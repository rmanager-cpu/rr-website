import { Analytics } from '@vercel/analytics/next';
import { Motion } from '@/components/fl/Motion';
import { SeasonWash } from '@/components/SeasonWash';
import { SiteFooter } from '@/components/SiteFooter';
import { redirect } from 'next/navigation';
import { isBookingDemo } from '@/lib/demo/mode';
import { hasDemoAccess } from '@/lib/demo/access';

/** Public pages: main content, the Fireside footer and the scroll motion. SeasonWash renders only on
 *  the home page (the faded Palisades photo the hero's morning fades into). Staff pages under /admin
 *  have their own layout. Vercel Web Analytics counts visits to these pages only (no cookies; staff pages
 *  aren't counted); its numbers are on the river-ranch-site project's Analytics tab in Vercel. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  const demo = isBookingDemo();
  if (demo && !hasDemoAccess()) redirect('/demo');
  return (
    <>
      <SeasonWash />
      <main id="main">{children}</main>
      <SiteFooter />
      <Motion />
      {!demo && <Analytics />}
    </>
  );
}
