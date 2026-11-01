import type { Frame, Hotspot, Section, SectionImage } from '../wall/types';
import sectionList from './sections.json';
import images from './images.json';
import frameList from './frames.json';
import closeups from './closeups.json';

// One geometry file per section: src/data/geometry/<sectionId>.json
const geometry = import.meta.glob<{ section: string; hotspots: Hotspot[] }>('./geometry/*.json', {
  eager: true,
  import: 'default',
});

const imageMap = images as Record<string, SectionImage>;

export function loadSections(): Section[] {
  return sectionList.map(({ id, title }) => {
    const image = imageMap[id];
    if (!image) throw new Error(`No image for section "${id}". Add source/${id}.jpg and run npm run images.`);
    return { id, title, image, hotspots: geometry[`./geometry/${id}.json`]?.hotspots ?? [] };
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
  // Generated close-ups (npm run closeups) first; a hand-picked one in frames.json wins.
  for (const [id, closeup] of Object.entries(closeups as Record<string, string>)) if (out[id]) out[id] = { ...out[id], closeup };
  for (const f of frameList as Frame[]) out[f.id] = { ...out[f.id], ...f };
  return out;
}
