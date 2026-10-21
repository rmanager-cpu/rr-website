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
    menu: abs('/dine#menus'),
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

export function JsonLd({ data }: { data: object }) {
  // eslint-disable-next-line react/no-danger
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}
