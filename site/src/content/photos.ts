// Every photo the site uses, with its real size (so pages never jump as images load) and a plain
// description (what Google Images and screen readers get). File names describe the photo too.

export type Photo = { src: string; width: number; height: number; alt: string };

const p = (name: string, width: number, height: number, alt: string): Photo => ({ src: `/photos/${name}.jpg`, width, height, alt });

export const photos = {
  heroDawn: p('patio-string-lights-dawn-sky', 1440, 1080, 'The River Ranch patio under string lights with a pink and purple dawn sky'),
  heroDay: p('front-entrance-deep-snow-blue-sky', 1412, 1800, 'The River Ranch Lodge front entrance in deep snow under a blue sky'),
  heroDusk: p('round-dining-room-dusk-snow', 1800, 1350, 'The round dining room glowing at dusk, buried in snow'),
  heroNight: p('snowy-deck-pines-night', 1536, 2048, 'The snowy deck and pines lit up at night'),
  frontEntranceNight: p('front-entrance-night', 1200, 900, 'The front entrance lit up after dark'),
  patioNight: p('patio-string-lights-night', 2400, 1800, 'The empty patio under string lights at night'),
  fireplaceRoom: p('fireplace-room-fire', 1800, 1200, 'The Fireplace room with the fire going'),
  fireplaceLongTable: p('fireplace-room-long-table', 1800, 1200, 'A long table set for a private dinner in the Fireplace room'),
  fireplacePrivateDinner: p('fireplace-room-private-dinner', 1800, 1200, 'The Fireplace room set for a private dinner'),
  weddingArch: p('patio-wedding-ceremony-arch', 1800, 1350, 'Ceremony chairs and an arch on the riverside patio in summer'),
  balconySnowyRiver: p('room-balcony-snowy-river-view', 1800, 1350, 'The view from a room balcony over the snowy Truckee River'),
  balconyChairs: p('room-balcony-chairs-river', 1800, 1200, 'A room balcony with chairs over the river'),
  kingRoom: p('king-room', 1800, 1200, 'A king room at River Ranch Lodge'),
  breakfast: p('breakfast-scramble-bloody-mary', 1350, 1800, 'A breakfast scramble with a Bloody Mary'),
  lantern: p('table-lantern-fireplace', 1800, 1200, 'A table lantern glowing with the fire behind it'),
  serverWine: p('server-pouring-wine-fireplace', 1200, 1800, 'A server pouring wine by the fireplace'),
  scallops: p('seared-scallops-risotto', 1800, 1200, 'Seared scallops over risotto'),
  lamb: p('herb-crusted-lamb', 1800, 1200, 'Herb-crusted lamb'),
  halibut: p('halibut-chickpeas-zucchini', 1122, 1402, 'Halibut over chickpeas and grilled zucchini'),
  cobbler: p('skillet-cobbler-ice-cream', 1800, 1200, 'Skillet cobbler with ice cream'),
  menuWine: p('menu-red-wine-table', 1800, 1200, 'A River Ranch menu and a bottle of red wine on a set table'),
  roundBar: p('round-bar-log-ceiling', 1200, 800, 'The round bar under its spoked log ceiling'),
  bartender: p('bartender-cocktail', 1614, 1076, 'A bartender holding up a cocktail at the River Ranch bar'),
  theWall: p('the-wall-old-photos', 1800, 1200, 'The wall of old River Ranch photographs by the host stand'),
} satisfies Record<string, Photo>;
