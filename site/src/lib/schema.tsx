// Structured data (schema.org JSON-LD): tells Google and AI tools the facts directly — this is a
// lodge with a restaurant, here are the address, phone, hours, menu and reservation links.
import { business, hours, SITE_URL } from '@/content/site';
import { photos } from '@/content/photos';

const address = {
  '@type': 'PostalAddress',
  streetAddress: business.address.street,
  addressLocality: business.address.city,
  addressRegion: business.address.region,
  postalCode: business.address.postalCode,
  addressCountry: business.address.country,
};

const abs = (path: string) => new URL(path, SITE_URL).toString();

function openingHours() {
  return Object.values(hours).map((h) => ({
    '@type': 'OpeningHoursSpecification',
    name: h.label,
    dayOfWeek: h.dayList.map((d) => `https://schema.org/${d}`),
    opens: h.opens,
    closes: h.closes,
  }));
}

/** The lodge, with the restaurant inside it. Goes on every page (root layout). */
export function organizationSchema() {
  const restaurant = {
    '@type': 'Restaurant',
    '@id': `${SITE_URL}/#restaurant`,
    name: business.name,
    url: abs('/dine'),
    telephone: business.phoneE164,
    address,
    servesCuisine: ['American', 'Steakhouse', 'Seafood'],
    priceRange: '$$$',
    acceptsReservations: business.links.reserveTable,
    menu: abs('/menus'),
    hasMenu: ['dinner', 'happy-hour', 'weekend-breakfast', 'weekend-lunch', 'wine-list'].map((s) => abs(`/menus/${s}`)),
    openingHoursSpecification: openingHours(),
    image: [abs(photos.fireplaceRoom.src), abs(photos.roundBar.src)],
  };
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['LodgingBusiness', 'Hotel'],
        '@id': `${SITE_URL}/#lodge`,
        name: business.name,
        alternateName: business.shortName,
        url: SITE_URL,
        telephone: business.phoneE164,
        email: business.email.lodge,
        address,
        numberOfRooms: business.rooms,
        checkinTime: '15:00',
        checkoutTime: '11:00',
        petsAllowed: true,
        image: [abs(photos.heroDay.src), abs(photos.balconySnowyRiver.src), abs(photos.heroDusk.src)],
        sameAs: [business.social.facebook, business.social.instagram],
        containsPlace: { '@id': `${SITE_URL}/#restaurant` },
      },
      restaurant,
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        url: SITE_URL,
        name: business.name,
      },
    ],
  };
}

/** Breadcrumbs for an inner page (Home › Page). */
export function breadcrumbSchema(name: string, path: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name, item: abs(path) },
    ],
  };
}

/**
 * Events Google may show as event rich results. Promotions (happy hour, nightly specials) and holidays
 * are deliberately left out: Google's event guidelines say not to mark up promotions as events, and
 * doing so risks a manual penalty. Those stay in openingHoursSpecification / on their pages instead.
 */
export const MARKABLE_EVENT_CATEGORIES = new Set(['music', 'community', 'special', 'off-site']);

export function eventSchema(e: {
  title: string;
  slug: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  description: string | null;
  image: string | null;
  offsite: boolean;
  location: string | null;
  ticketUrl: string | null;
}) {
  const at = (t: string | null) => (t ? `${e.date}T${t}:00` : e.date);
  const place = e.offsite
    ? { '@type': 'Place', name: e.location ?? 'Off-site', address: e.location ?? undefined }
    : { '@type': 'Place', name: business.name, address };
  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: e.title,
    url: abs(`/events/${e.slug}`),
    startDate: at(e.startTime),
    ...(e.endTime ? { endDate: at(e.endTime === '23:59' ? '23:59' : e.endTime) } : {}),
    eventStatus: 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: place,
    ...(e.description ? { description: e.description } : {}),
    image: [abs(e.image ?? photos.heroDusk.src)],
    organizer: { '@type': 'Organization', name: business.name, url: SITE_URL },
    ...(e.ticketUrl ? { offers: { '@type': 'Offer', url: e.ticketUrl, availability: 'https://schema.org/InStock' } } : {}),
  };
}

/** One menu as schema.org Menu → MenuSection → MenuItem, each price an Offer (sizes kept). */
export function menuSchema(m: {
  slug: string;
  name: string;
  sections: { name: string; items: { hidden: boolean; description: string | null; prices: { label: string | null; price: number }[]; dish: { name: string; description: string | null; tags: string[] } }[] }[];
}) {
  const diet: Record<string, string> = { GF: 'https://schema.org/GlutenFreeDiet', V: 'https://schema.org/VegetarianDiet', VG: 'https://schema.org/VeganDiet' };
  return {
    '@context': 'https://schema.org',
    '@type': 'Menu',
    '@id': `${SITE_URL}/menus/${m.slug}#menu`,
    name: `${m.name} · ${business.shortName}`,
    url: abs(`/menus/${m.slug}`),
    inLanguage: 'en-US',
    hasMenuSection: m.sections.map((s) => ({
      '@type': 'MenuSection',
      name: s.name,
      hasMenuItem: s.items
        .filter((i) => !i.hidden)
        .map((i) => {
          const d = i.description ?? i.dish.description;
          const diets = i.dish.tags.filter((t) => diet[t]).map((t) => diet[t]);
          return {
            '@type': 'MenuItem',
            name: i.dish.name,
            ...(d ? { description: d } : {}),
            ...(i.prices.length ? { offers: i.prices.filter((p) => typeof p.price === 'number').map((p) => ({ '@type': 'Offer', price: p.price.toFixed(2), priceCurrency: 'USD', ...(p.label ? { name: p.label } : {}) })) } : {}),
            ...(diets.length ? { suitableForDiet: diets } : {}),
          };
        }),
    })),
  };
}

export function JsonLd({ data }: { data: object }) {
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
