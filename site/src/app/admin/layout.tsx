import type { Metadata } from 'next';
import { Bricolage_Grotesque } from 'next/font/google';
import './admin.css';
import './admin-alpenglow.css';

export const metadata: Metadata = { title: 'Staff', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

// Alpenglow dressing (admin-alpenglow.css). To go back to the plain staff pages, take "adm--alpenglow" off
// the class below. next/font serves the typeface from this site, so staff browsers never call Google.
const alpen = Bricolage_Grotesque({ subsets: ['latin'], display: 'swap', variable: '--font-alpen' });

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className={`adm adm--alpenglow ${alpen.variable}`}>{children}</div>;
}
