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
  fireplaceRoom: p('fireplace-room-fire', 1800, 1200, 'The Alpine Dining Room with the fire going in its stone fireplace'),
  fireplaceLongTable: p('fireplace-room-long-table', 1800, 1200, 'A long table set for a private dinner in the Alpine Dining Room'),
  fireplacePrivateDinner: p('fireplace-room-private-dinner', 1800, 1200, 'The Alpine Dining Room set for a private dinner'),
  weddingArch: p('patio-wedding-ceremony-arch', 1800, 1350, 'Ceremony chairs and an arch on the riverside patio in summer'),
  balconySnowyRiver: p('room-balcony-snowy-river-view', 1800, 1350, 'The view from a room balcony over the snowy Truckee River'),
  balconyChairs: p('room-balcony-chairs-river', 1800, 1200, 'A room balcony with chairs over the river'),
  kingRoom: p('king-room', 1800, 1200, 'A king room at River Ranch Lodge'),
  breakfast: p('breakfast-scramble-bloody-mary', 1350, 1800, 'A breakfast scramble with a Bloody Mary'),
  lantern: p('table-lantern-fireplace', 1800, 1200, 'A table lantern glowing with the fire behind it'),
  serverWine: p('server-pouring-wine-fireplace', 1200, 1800, 'A server pouring wine by the fireplace'),
  scallops: p('seared-scallops-risotto', 1800, 1200, 'Seared scallops over risotto'),
  ravioli: p('butternut-ravioli', 1800, 1200, 'Butternut squash ravioli with spinach, crispy sage and pepitas'),
  catchOfTheDay: p('catch-of-the-day-swordfish-farro', 1122, 1402, 'Catch of the day: swordfish over farro'),
  cobbler: p('skillet-cobbler-ice-cream', 1800, 1200, 'Skillet cobbler with ice cream'),
  menuWine: p('menu-red-wine-table', 1800, 1200, 'A River Ranch menu and a bottle of red wine on a set table'),
  roundBar: p('round-bar-log-ceiling', 1200, 800, 'The round bar under its spoked log ceiling'),
  bartender: p('bartender-cocktail', 1614, 1076, 'A bartender holding up a cocktail at the River Ranch bar'),
  bartenderIrishCoffee: p('bartender-irish-coffee', 704, 533, 'A River Ranch bartender sliding an Irish coffee across the round bar'),
  theWall: p('the-wall-old-photos', 1800, 1200, 'The wall of old River Ranch photographs by the host stand'),
  roomSnowshoes: p('room-snowshoes-on-the-wall', 1800, 1200, 'Old wooden snowshoes and ski poles hung on a guest room wall'),
  roomBearQuilt: p('room-king-bear-quilt-new-floors', 1200, 800, 'A guest room with a bear quilt, a log bed and vintage skis on the wall'),
  roomPlaidQuilt: p('room-plaid-quilt-ski-decor', 1200, 800, 'A guest room with a pine-tree quilt, a log bed and old skis over the bed'),
  ceremonyAisle: p('patio-ceremony-aisle-empty', 1800, 1350, 'White ceremony chairs and a petal-lined aisle on the riverside patio'),
  fireplaceTableSet: p('fireplace-room-table-set', 1800, 1200, 'A long table set with candles and wine by the stone fireplace'),
  snowyRiverLodge: p('snowy-river-lodge-blue-sky', 1800, 1350, 'The snowy Truckee River running past the lodge under a blue sky'),
  pointCeremony: p('the-point-ceremony-arch', 2400, 1800, 'Ceremony chairs on The Point, facing a flower-topped arch on the river wall'),
  patioRoundsSails: p('patio-reception-rounds-sails', 2400, 1800, 'Round tables set for a reception under the sails on the patio, the Riverview room behind'),
  patioRoundsHeaters: p('patio-reception-rounds-heaters', 2400, 1800, 'Round tables set for a reception among the heaters on the riverside patio'),
  riverviewRapids: p('riverview-room-over-rapids', 2400, 1600, 'The round Riverview room cantilevered over the Truckee River rapids in summer'),
  aerialSpaces: p('aerial-riverview-room-and-patio', 2400, 1800, 'From above: the round Riverview room over the Truckee River, the patio beside it and The Point at its river end'),
} satisfies Record<string, Photo>;

/** The homepage scroll story (Stay, Dine, Celebrate). Files live in /photos/home/. */
const h = (name: string, width: number, height: number, alt: string): Photo => ({ src: `/photos/home/${name}.jpg`, width, height, alt });

export const homePhotos = {
  hero: h('lodge-snow-blue-hour', 2400, 1800, 'River Ranch lodge under deep snow at blue hour, lights glowing along the porch'),
  entrance: h('entrance-after-storm', 1200, 1530, 'The River Ranch lodge entrance after a storm, flags up and icicles on the eaves'),
  panorama: h('tahoe-panorama-winter', 2400, 1016, ''),
  skiRoom: h('room-skis-snowfall', 864, 648, 'A lodge room with skis by the balcony door and snow falling outside'),
  bar: h('round-bar-wagon-wheel', 2400, 1600, 'The round bar at River Ranch under its wagon-wheel timber ceiling'),
  dining: h('dining-room-winter-night', 2000, 1504, 'The River Ranch dining room on a winter night, garland over the windows and candles on white tablecloths'),
  elk: h('elk-chops', 1400, 934, 'Elk chops with roasted potatoes, radish and cherries'),
  ceremony: h('riverside-ceremony-chairs', 1200, 1800, 'Rows of ceremony chairs on the riverside patio, wildflowers along the aisle and the river beyond'),
  couple: h('wedding-couple-embrace', 1599, 1066, 'A bride and groom nose to nose in an embrace at their River Ranch wedding'),
  cake: h('wedding-cake-cutting-night', 1300, 867, 'A couple laughing as they cut their wedding cake on the patio at night'),
} satisfies Record<string, Photo>;
