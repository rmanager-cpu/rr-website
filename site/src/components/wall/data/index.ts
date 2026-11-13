import type { Frame, Hotspot, Section, SectionImage } from '../types';
import sectionList from './sections.json';
import images from './images.json';
import frameList from './frames.json';
import closeups from './closeups.json';
import corner from './geometry/corner.json';
import poster from './geometry/poster.json';
import wall from './geometry/wall.json';

// The Wall's content, built into the website itself (moved from the history-wall app on 2026-11-12 so
// nothing loads from another address). Its photos are served from /the-wall/ (public/the-wall).

/** One geometry file per section (data/geometry/<sectionId>.json). Add a new section's file here. */
const geometry: Record<string, Hotspot[]> = {
  corner: corner.hotspots as unknown as Hotspot[],
  poster: poster.hotspots as unknown as Hotspot[],
  wall: wall.hotspots as unknown as Hotspot[],
};

const imageMap = images as Record<string, SectionImage>;

/** Where the Wall's photos are served from on this site. */
export const WALL_ASSETS = '/the-wall/';

export function loadSections(): Section[] {
  return sectionList.map(({ id, title }) => {
    const image = imageMap[id];
    if (!image) throw new Error(`No image for section "${id}".`);
    return { id, title, image, hotspots: geometry[id] ?? [] };
  });
}

/** Frame content by id. A tag is inferred from ids like "f41" when not given. */
export function loadFrames(): Record<string, Frame> {
  const out: Record<string, Frame> = {};
  for (const s of loadSections())
    for (const h of s.hotspots) {
      const m = h.frame.match(/^f(\d+)$/);
      out[h.frame] ??= { id: h.frame, ...(m ? { tag: m[1] } : {}) };
    }
  // Generated close-ups first; a hand-picked one in frames.json wins.
  for (const [id, closeup] of Object.entries(closeups as Record<string, string>)) if (out[id]) out[id] = { ...out[id], closeup };
  for (const f of frameList as Frame[]) out[f.id] = { ...out[f.id], ...f };
  return out;
}
