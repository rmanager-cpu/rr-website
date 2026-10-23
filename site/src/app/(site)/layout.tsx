import { SiteFooter } from '@/components/SiteFooter';

/** Public pages: main content, then the footer. (Staff pages under /admin have their own layout.) */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main id="main">{children}</main>
      <SiteFooter />
    </>
  );
}
