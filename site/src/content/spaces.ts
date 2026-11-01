import { photos, type Photo } from './photos';

// The spaces events can book. Capacities and layouts are still to come from management, so pages say
// "ask us" rather than guess. A `null` photo shows a "Photo coming soon" tile.
export type Space = { name: string; line: string; photo: Photo | null; focus?: string };

export const spaces: Space[] = [
  { name: 'Riverview room', line: 'The round dining room, cantilevered over the Truckee.', photo: photos.riverviewRapids, focus: '0% 50%' },
  { name: 'Fireplace room', line: 'The dining room with the big stone fireplace.', photo: photos.fireplaceRoom },
  { name: 'The Point', line: 'The river end of the patio. It’s yours for the event; a small section of the patio stays open for our regular diners.', photo: photos.pointCeremony },
  { name: 'Full Patio', line: 'The whole riverside patio, in the warmer months.', photo: photos.patioRoundsHeaters },
];
