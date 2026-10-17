import type { Frame } from './types';

export const isAsk = (f: Frame) => !f.action || f.action.type === 'ask';

/** Accessible name for a frame's hotspot. */
export function frameLabel(f: Frame, sectionTitle: string) {
  const name = f.title ?? (f.tag ? `Photo number ${f.tag}` : 'Unnumbered photo');
  return isAsk(f) ? `${name}, ${sectionTitle}. Tell us what you know.` : `${name}, ${sectionTitle}.`;
}
