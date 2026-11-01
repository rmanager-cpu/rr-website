// The facts about River Ranch, in one place. Every page, the footer and the structured data Google
// reads all come from here, so the name, address, phone and hours always match each other.
// (When the staff editor exists, these move to the Supabase hub and this file becomes the fallback.)

export const SITE_URL = 'https://www.riverranchlodge.com';

export const business = {
  name: 'River Ranch Lodge & Restaurant',
  shortName: 'River Ranch',
  tagline: 'Lodge & Restaurant · Tahoe City',
  phone: '(530) 583-4264',
  phoneE164: '+15305834264',
  address: {
    street: '2285 River Road',
    city: 'Tahoe City',
    region: 'CA',
    postalCode: '96145',
    country: 'US',
  },
  email: {
    lodge: 'frontdesk@riverranchlodge.com',
    restaurant: 'info@riverranchlodge.com',
    events: 'events@riverranchlodge.com',
  },
  social: {
    facebook: 'https://www.facebook.com/riverranchlodge',
    instagram: 'https://www.instagram.com/riverranchlodge',
  },
  links: {
    // Restaurant reservations (OpenTable listing, restaurant id 27631).
    reserveTable: 'https://www.opentable.com/river-ranch-lodge-and-restaurant',
    // Lodging booking engine: BookingCenter (for now), the same link the old site used.
    bookRoom: 'https://book.bookingcenter.com/02/?site=RIVERR',
    theWall: 'https://the-wall-river-ranch.vercel.app',
    skiButlers: 'https://www.skibutlers.com/portal/riverranchlodge',
    palisades: 'https://www.palisadestahoe.com',
  },
  rooms: 19,
} as const;

export const fullAddress = `${business.address.street}, ${business.address.city}, ${business.address.region} ${business.address.postalCode}`;

/** Restaurant hours. Days use schema.org names so they feed the structured data directly. */
export const hours = {
  dinner: { label: 'Dinner', days: 'Nightly', time: '5–9 PM', opens: '17:00', closes: '21:00', dayList: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'] },
  happyHour: { label: 'Happy hour', days: 'Monday–Friday', time: '3–5 PM', opens: '15:00', closes: '17:00', dayList: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'], note: 'At the bar, dine-in, not on holidays' },
  breakfast: { label: 'Weekend breakfast', days: 'Saturday & Sunday', time: '8–11:30 AM', opens: '08:00', closes: '11:30', dayList: ['Saturday', 'Sunday'] },
} as const;

export const lodging = {
  checkIn: '3 PM',
  checkOut: '11 AM',
} as const;

export type NavItem = { href: string; label: string };
export type SectionKey = 'stay' | 'dine' | 'celebrate';
export type Section = NavItem & { key: SectionKey; tabs: NavItem[]; action: NavItem };

/** The three sections in the header. Inside one, a slim second row shows its tabs and its main
 *  button (docs/SITEMAP.md). */
export const sections: Section[] = [
  {
    key: 'stay',
    href: '/stay',
    label: 'Stay',
    tabs: [
      { href: '/stay/rooms', label: 'Rooms' },
      { href: '/stay/packages', label: 'Packages' },
      { href: '/stay/guest-info', label: 'Guest Info' },
    ],
    action: { href: business.links.bookRoom, label: 'Book a Room' },
  },
  {
    key: 'dine',
    href: '/dine',
    label: 'Dine',
    tabs: [
      { href: '/dine/menus', label: 'Menus' },
      { href: '/dine/wine', label: 'Wine' },
      { href: '/dine/happening', label: 'Happening' },
    ],
    action: { href: business.links.reserveTable, label: 'Reserve a Table' },
  },
  {
    key: 'celebrate',
    href: '/celebrate',
    label: 'Celebrate',
    tabs: [
      { href: '/celebrate/weddings', label: 'Weddings' },
      { href: '/celebrate/spaces', label: 'Spaces' },
      { href: '/celebrate/plan', label: 'Plan' },
    ],
    action: { href: '/celebrate/plan', label: 'Plan Your Event' },
  },
];

/** The shared pages: the header's “More” menu and the footer. */
export const sharedNav: NavItem[] = [
  { href: '/history', label: 'History' },
  { href: '/loyalty-and-gift-cards', label: 'Loyalty & Gift Cards' },
  { href: '/careers', label: 'Careers' },
  { href: '/visit', label: 'Visit' },
];

export function sectionFor(path: string): Section | undefined {
  return sections.find((s) => path === s.href || path.startsWith(`${s.href}/`));
}
