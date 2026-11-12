import { Motion } from '@/components/fl/Motion';
import { SeasonWash } from '@/components/SeasonWash';
import { SiteFooter } from '@/components/SiteFooter';

/** Public pages: main content, the Fireside footer and the scroll motion. SeasonWash renders only on
 *  the home page (the faded Palisades photo the hero's morning fades into). Staff pages under /admin
 *  have their own layout. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeasonWash />
      <main id="main">{children}</main>
      <SiteFooter />
      <Motion />
    </>
  );
}
