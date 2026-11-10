import { CATEGORY_LABEL, type EventSeries } from '@/lib/events/types';

/** The First Light chip for an event: its colour class and its label. */
export function chipFor(s: Pick<EventSeries, 'category' | 'offsite'>): { cls: string; label: string } {
  if (s.offsite || s.category === 'off-site') return { cls: 'chip chip--offsite', label: 'Off-site' };
  const cls: Record<EventSeries['category'], string> = {
    'happy-hour': 'chip chip--food',
    food: 'chip chip--food',
    music: 'chip chip--music',
    holiday: 'chip chip--holiday',
    community: 'chip chip--community',
    special: 'chip chip--special',
    'off-site': 'chip chip--offsite',
  };
  return { cls: cls[s.category], label: CATEGORY_LABEL[s.category] };
}
