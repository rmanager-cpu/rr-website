import { SeasonWash } from '@/components/SeasonWash';
import { SiteFooter } from '@/components/SiteFooter';

/** Public pages: main content, then the footer. (Staff pages under /admin have their own layout.) */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SeasonWash />
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
