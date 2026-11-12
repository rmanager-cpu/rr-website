import type { Photo } from './photos';

// The Weddings page tells one real River Ranch wedding as a short story, in ten photos: one Saturday
// in September, from the morning to the first dance. Management's family; the couple, the family and the
// photographer all said yes (2026-11-10). The story surrounds Venio's open-date calendar for wedding
// season and "Get the packet". Never name anyone, alt text included:
// "the bride", "the groom", "Mom". Files live in /photos/wedding/, resized and stripped of camera data.

const w = (name: string, width: number, height: number, alt: string): Photo => ({ src: `/photos/wedding/wedding-${name}.jpg`, width, height, alt });
const L = (name: string, alt: string) => w(name, 1800, 1200, alt);
const P = (name: string, alt: string) => w(name, 1200, 1800, alt);

export const weddingPhotos = {
  rollers: L('bride-rollers-deck-laughing', 'The bride in hair rollers, laughing on the lodge deck'),
  dress: P('dress-hanging-pines', 'The wedding dress hanging from a pine branch over the deck'),
  earrings: P('earrings-dog', 'The bride putting in her earrings with her white dog at her knee'),
  laughing: P('bride-laughing-lodge-room', 'The bride in her dress, laughing in a lodge room'),
  momHug: L('mother-hug', 'The bride’s mother, eyes closed, holding her daughter tight'),
  greetsDog: L('bride-greets-dog', 'The bride in her dress crouching to greet the dog among the pines'),
  partyWalks: L('party-walks-past-patio', 'The wedding party walking past the patio umbrellas and the lodge’s teal doors'),
  lodgeDoors: L('bride-mother-lodge-doors', 'The bride and her mother stepping out of the lodge doors with the bouquet'),
  groomSees: L('groom-sees-bride', 'Over the bride’s shoulder, the groom beaming as she reaches the arch'),
  aisle: L('aisle-wide', 'Guests seated down the aisle on the patio, facing the arch under the pines and paper lanterns'),
  dogAisle: P('dog-in-aisle', 'The dog sitting in the aisle during the ceremony, guests and the arch behind'),
  vowsLaugh: P('bride-laughing-vows', 'The bride laughing out loud during the vows'),
  dogCeremony: P('dog-at-ceremony', 'Mid-ceremony, the bride and groom crouch at the sunflower arch to greet their dog'),
  kiss: P('first-kiss-arch', 'The first kiss under the sunflower arch'),
  married: P('married-arms-up', 'The bride and groom throwing their arms up, just married'),
  leap: L('groom-leaps-patio', 'The groom leaping in the air on the walk back across the patio'),
  family: L('family-river-rocks', 'The family on the river rocks, the dog sitting in front'),
  bridesmaids: L('bridesmaids-cheer-river', 'The bridesmaids kicking and cheering on the rocks by the Truckee'),
  boulderDog: P('couple-boulder-dog', 'The couple on a river boulder while the dog walks toward the camera'),
  riverKiss: P('kiss-river-rocks', 'The couple kissing on the river rocks among the pines'),
  steps: L('couple-dog-steps', 'The couple and their dog sitting on wooden steps by the river'),
  valley: L('couple-river-valley', 'The couple small on the riverbank, the forested Truckee valley around them'),
  groomBike: L('groom-bike-cake', 'The groom riding in on a bike past the cake table, waving'),
  brideBike: L('bride-bike-tables', 'The bride riding in on a sunflower-basket bike, guests cheering at the tables'),
  toast: L('toast-river', 'The couple raising their arms for a toast at the river’s edge'),
  toastsLaugh: L('couple-laughing-toasts', 'The couple cracking up during the toasts'),
  firstDance: L('first-dance-hug', 'The first dance, her arms around his neck'),
  patioDancing: w('patio-dancing-lodge', 2400, 1600, 'The patio packed with dancers in front of the lodge under paper lanterns'),
  spinning: L('couple-dancing-lights', 'The couple dancing, the lodge lights streaking behind them'),
  band: L('band-patio-stage', 'The band playing on the patio stage under a glowing lantern'),
  jenga: L('giant-jenga', 'A giant Jenga tower about to fall, a guest crawling underneath'),
  cake: L('cake-cutting-laughing', 'The couple shrieking with laughter as they cut the cake'),
  blueHour: w('patio-bar-blue-hour', 2400, 1600, 'The patio bar at blue hour under paper lanterns and string lights'),
  lanterns: w('patio-lanterns-night', 2400, 1600, 'The patio at night under paper lanterns and string lights, the lodge balconies lit'),
} satisfies Record<string, Photo>;

/** night: the chapter sits on a dark band (the after-party). */
export type Chapter = { id: string; name: string; title: [string, string]; line: string; photos: Photo[]; night?: boolean };

const s = weddingPhotos;

/** The opening and closing photos: the patio at blue hour, and the same patio after dark. */
export const storyOpen = s.blueHour;
export const storyClose = s.lanterns;

/** Beside the calendar: the dog crashing the vows. */
export const besideCalendar = s.dogCeremony;

/** The short story: two chapters before the calendar, the rest after. Each chapter's photos run as one row.
 *  (The mother-and-daughter hug was taken at a house that isn't River Ranch, so it stays out.) */
export const chapters: Chapter[] = [
  {
    id: 'morning',
    name: 'The morning',
    title: ['Get ready', 'by the river.'],
    line: 'A lodge room upstairs, the dress in the pines and the Truckee running below the deck. Then roll in on two wheels.',
    photos: [s.dress, s.brideBike, s.groomBike],
  },
  {
    id: 'ceremony',
    name: 'The ceremony',
    title: ['Vows under', 'the pines.'],
    line: 'Chairs down the riverside patio, an arch at the end and the river for music.',
    photos: [s.groomSees, s.kiss],
  },
  {
    id: 'river',
    name: 'Portraits',
    title: ['A minute', 'to the water.'],
    line: 'From the arch to the river rocks in a few steps, with the whole Truckee valley behind you.',
    photos: [s.valley],
  },
  {
    id: 'evening',
    name: 'The evening',
    title: ['Dinner, toasts,', 'a first dance.'],
    line: 'Dinner on the patio, toasts by the water, then the first dance under the lanterns.',
    photos: [s.toast, s.firstDance],
  },
  {
    id: 'after-party',
    name: 'The after-party',
    title: ['Then the band', 'takes the patio.'],
    line: 'Live music on the patio stage, giant Jenga, and everybody dancing until the last song.',
    photos: [s.band, s.jenga, s.spinning],
    night: true,
  },
];
