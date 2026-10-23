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

/** Everything else, under “More” in the header (the footer no longer carries a sitemap). */
export const moreNav: NavItem[] = [
  { href: '/menus', label: 'Menus' },
  { href: '/events/summer-concert-series', label: 'Summer Concert Series' },
  { href: '/history', label: 'History' },
  { href: 'https://the-wall-river-ranch.vercel.app', label: 'The Wall' },
  { href: '/johanson-family-wine', label: 'Johanson Family Wine' },
  { href: '/loyalty', label: 'Loyalty' },
  { href: '/order', label: 'Order online' },
  { href: '/visit#gift-cards', label: 'Gift cards' },
  { href: '/careers', label: 'Careers' },
  { href: '/visit', label: 'Visit & directions' },
];
export const nav: NavItem[] = [
  { href: '/stay', label: 'Stay' },
  { href: '/dine', label: 'Dine' },
  { href: '/celebrate', label: 'Celebrate' },
  { href: '/events', label: 'Events' },
];
