import { photos, type Photo } from './photos';

// The spaces events can book. A capacity shows only once management has confirmed it; until then pages
// say "ask us" rather than guess. A `null` photo shows a "Photo coming soon" tile.
export type Space = { name: string; line: string; photo: Photo | null; focus?: string; capacity?: string };

export const spaces: Space[] = [
  { name: 'Riverview room', line: 'The round dining room, cantilevered over the Truckee.', photo: photos.riverviewRapids, focus: '0% 50%' },
  { name: 'Alpine Dining Room', line: 'The dining room with the big stone fireplace.', photo: photos.fireplaceRoom },
  { name: 'The Point', line: 'The river end of the patio, also called the Half Patio. It’s yours for the event; a small section of the patio stays open for our regular diners.', photo: photos.pointCeremony, capacity: 'Up to 50 seated, 200 standing' },
  { name: 'Full Patio', line: 'The whole riverside patio, in September and in spring once it opens.', photo: photos.patioRoundsHeaters, capacity: 'Up to 250 seated, 400 standing' },
];
