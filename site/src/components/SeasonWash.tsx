'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

/** The faded Palisades photo behind the home page only, under snow white at 85% (globals.css
 *  .season-wash). The First Light hero's morning fades into it. Fireside inner pages are solid dark and
 *  snow bands, so everywhere else this renders nothing. */
export function SeasonWash() {
  if (usePathname() !== '/') return null;
  return (
    <div className="season-wash" aria-hidden="true">
      <Image src="/photos/home/wash-slopes.jpg" alt="" fill sizes="100vw" quality={60} />
    </div>
  );
}
