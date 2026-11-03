'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

// Each section of the site has its own ski photo; anything else falls back to the slopes.
const washFor = (path: string) => {
  if (path.startsWith('/dine')) return '/photos/home/wash-gondola.jpg';
  if (path.startsWith('/celebrate')) return '/photos/home/wash-skier.jpg';
  return '/photos/home/wash-slopes.jpg';
};

/** The faint full-page photo behind the public pages, in the style of the homepage's Stay section. */
export function SeasonWash() {
  return (
    <div className="season-wash" aria-hidden="true">
      <Image src={washFor(usePathname())} alt="" fill sizes="100vw" />
    </div>
  );
}
