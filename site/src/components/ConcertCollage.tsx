import Image from 'next/image';

// The Summer Concert Series collage: real River Ranch flyers, Instagram posts and phone photos from the
// patio. Only images known to be from River Ranch are used (the flyers carry the address; the photos are
// management's own). Every image has a plain description, which is what Google Images and AI tools read.

type Piece = {
  src: string;
  w: number;
  h: number;
  alt: string;
  /** Size and placement on the desktop grid (12 columns). */
  cls: string;
  kind: 'photo' | 'flyer';
  tilt: number;
  tape?: boolean;
};

const C = '/photos/concerts/';
const PIECES: Piece[] = [
  { src: `${C}aerialist-over-patio-crowd.jpg`, w: 1277, h: 720, alt: 'An aerialist performs on a rig above the packed River Ranch patio as a band plays at dusk', cls: 'cc-hero', kind: 'photo', tilt: -1.2, tape: true },
  { src: `${C}flyer-concert-series.jpg`, w: 1600, h: 1244, alt: 'Bring the Music Back concert series flyer: The Blues Monsters Aug 4, Vice Grip Aug 11, Pipe Down Aug 18, Coburn Station Aug 25, on the River Ranch patio', cls: 'cc-btmb', kind: 'flyer', tilt: 2.4, tape: true },
  { src: `${C}blu-egyptian-patio-evening.jpg`, w: 720, h: 536, alt: 'Blü Egyptian playing a Monday evening show on the River Ranch patio, pines and the lodge behind', cls: 'cc-wide', kind: 'photo', tilt: 1.4, tape: true },
  { src: `${C}pipe-down-banner-by-the-river.jpg`, w: 720, h: 715, alt: 'The Pipe Down banner hung by the Truckee River before a free show', cls: 'cc-sq', kind: 'photo', tilt: -2.2 },
  { src: `${C}packed-patio-tables-to-stage.jpg`, w: 1600, h: 1200, alt: 'Looking down the patio tables to a packed dance floor and the lit stage at night', cls: 'cc-mid', kind: 'photo', tilt: 1.2 },
  { src: `${C}blu-egyptian-patio-crowd.jpg`, w: 720, h: 536, alt: 'The crowd on the patio while Blü Egyptian plays at dusk', cls: 'cc-mid', kind: 'photo', tilt: -1.8 },
  { src: `${C}ig-reel-aerialist-patio.jpg`, w: 640, h: 640, alt: 'The aerialist over the patio crowd, from River Ranch on Instagram', cls: 'cc-sq', kind: 'photo', tilt: -3.2, tape: true },
  { src: `${C}flyer-coburn-station-redux.jpg`, w: 1236, h: 1600, alt: 'Coburn Station Redux flyer: free show, Saturday 9.20.25, 2285 River Road', cls: 'cc-tall', kind: 'flyer', tilt: -2 },
  { src: `${C}flyer-vice-grip-8-11-25.jpg`, w: 1200, h: 1553, alt: "Vice Grip flyer: free show on the River Ranch Patio Bar, August 11, 7 to 9:30 PM, with TINCUP Mountain Whiskey", cls: "cc-tall", kind: "flyer", tilt: -2.2, tape: true },
  { src: `${C}flyer-pipe-down-8-18-25.jpg`, w: 1080, h: 1350, alt: "Pipe Down flyer: free show 6 to 9:59 PM, 8/18/25, 2285 River Road, over the River Ranch patio", cls: "cc-tall", kind: "flyer", tilt: 1.8 },
  { src: `${C}band-on-patio-stage.jpg`, w: 1600, h: 900, alt: 'A band on the patio stage under string lights with the crowd in front', cls: 'cc-wide2', kind: 'photo', tilt: -0.8 },
  { src: `${C}ig-coburn-station-live-on-the-deck.jpg`, w: 512, h: 640, alt: 'Coburn Station live on the deck at River Ranch, Aug 31 flyer', cls: 'cc-small', kind: 'flyer', tilt: 3.4 },
  { src: `${C}vice-grip-dance-floor-from-above.jpg`, w: 1600, h: 1200, alt: 'Vice Grip playing under the shade sail while the patio dances, seen from above', cls: 'cc-mid', kind: 'photo', tilt: 2 , tape: true },
  { src: `${C}flyer-pipe-down-5-25-26.jpg`, w: 1009, h: 1559, alt: 'Pipe Down flyer: free show tonight, 6 to 9:59 PM, May 25, 2026, at 2285 River Road', cls: 'cc-tall', kind: 'flyer', tilt: 1.6, tape: true },
  { src: `${C}ig-wreckords-9-14.jpg`, w: 495, h: 640, alt: 'The Wreckords free show flyer, Monday 9/14, 7 to 10 PM', cls: 'cc-small', kind: 'flyer', tilt: -2.6 },
  { src: `${C}patio-show-under-the-maple.jpg`, w: 1600, h: 1200, alt: 'A show on the patio stage at night, framed by maple leaves', cls: 'cc-mid', kind: 'photo', tilt: -1.6 },
  { src: `${C}ig-rabbit-hole-9-21.jpg`, w: 495, h: 640, alt: 'Down the Rabbit Hole, music under the stars, Monday 9/21/26 flyer', cls: 'cc-small', kind: 'flyer', tilt: 2.8, tape: true },
  { src: `${C}flyer-music-on-the-river.jpg`, w: 1080, h: 1350, alt: 'Music on the River flyer: the first free summer music on the river show, with Vice Grip', cls: 'cc-tall', kind: 'flyer', tilt: -1.4 },
  { src: `${C}ig-get-rich-quick-labor-day.jpg`, w: 480, h: 640, alt: 'The Get Rich Quick at River Ranch Lodge, Labor Day show, free and all ages', cls: 'cc-small', kind: 'flyer', tilt: -3 },
  { src: `${C}server-patio-concert-night.jpg`, w: 1600, h: 1200, alt: 'Drinks headed out to the patio on a concert night', cls: 'cc-mid', kind: 'photo', tilt: 1.8 },
  { src: `${C}flyer-coburn-station-nomads.jpg`, w: 1236, h: 1600, alt: 'Coburn Station 9/20 and Nomads 9/26 flyer', cls: 'cc-small', kind: 'flyer', tilt: 2.2 },
  { src: `${C}aerialist-patio-stage.jpg`, w: 1277, h: 720, alt: 'The aerialist on silks beside the stage, with the lodge behind', cls: 'cc-mid', kind: 'photo', tilt: -2.4, tape: true },
  { src: `${C}flyer-summer-kick-off-nomads.jpg`, w: 1280, h: 1600, alt: 'Summer kick off concert with The Nomads, Thursday June 19, 7:30 PM', cls: 'cc-small', kind: 'flyer', tilt: -1.2 },
  { src: `${C}patio-heaters-night.jpg`, w: 1600, h: 1200, alt: 'Patio heaters glowing along the rail on a cool concert night', cls: 'cc-mid', kind: 'photo', tilt: 1 },
];

export function ConcertCollage() {
  return (
    <div className="cc" aria-label="Photos and flyers from the Summer Concert Series">
      {PIECES.map((p, i) => (
        <figure key={p.src} className={`cc-piece ${p.cls} cc-${p.kind}`} style={{ ['--tilt' as string]: `${p.tilt}deg`, zIndex: p.cls === 'cc-hero' ? 3 : 1 + (i % 3) }}>
          {p.tape && <span className="cc-tape" aria-hidden="true" />}
          <Image src={p.src} alt={p.alt} width={p.w} height={p.h} sizes={p.cls === 'cc-hero' ? '(max-width: 760px) 100vw, 760px' : '(max-width: 760px) 50vw, 420px'} priority={i < 2} />
        </figure>
      ))}
    </div>
  );
}

/** The recap, in text Google and AI tools can read. Dates as printed on the flyers. */
export const CONCERT_RECAP: { year: string; shows: string[] }[] = [
  { year: '2026', shows: ['Vice Grip, Music on the River (Monday, May 18)', 'Pipe Down, free show on the river (May 25)', 'Blü Egyptian (June 1)', 'Coburn Station, live on the deck (Aug 31)', 'The Get Rich Quick, Labor Day show', 'The Wreckords (Monday, Sep 14)', 'Down the Rabbit Hole (Monday, Sep 21)'] },
  { year: '2025', shows: ['Bring the Music Back series: The Blues Monsters (Aug 4), Vice Grip (Aug 11), Pipe Down (Aug 18), Coburn Station (Aug 25)', 'Coburn Station Redux (Saturday, Sep 20)', 'The Nomads (Sep 26)'] },
];
