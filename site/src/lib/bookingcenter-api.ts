import 'server-only';
import { gunzipSync } from 'node:zlib';

// Read-only calls to BookingCenter's XML web service: live rooms and rates for a stay, and each room's
// photos. The key stays on the server. Booking itself still happens on BookingCenter's page
// (lib/bookingcenter.ts).
//
// Settings: BOOKINGCENTER_API_URL, BOOKINGCENTER_API_KEY, BOOKINGCENTER_SITE_ID. Going to production means
// changing those three. On a production build, a test-system URL counts as not set up, so guests never see
// test rates; BOOKINGCENTER_ALLOW_TEST_RATES=true lifts that for a preview.
const CHAIN_AND_AGENT = 'BC'; // BookingCenter's own chain, and its public-website agent.
const TIMEOUT_MS = 12_000;
const RATES_CACHE_MS = 5 * 60_000; // Searches are watched against bookings, so repeats don't go back to them.
const RATES_CACHE_MAX = 500;
const PHOTOS_MAX = 12;

export type LiveRoom = {
  code: string;
  name: string;
  unitsLeft: number;
  maxGuests: number;
  beforeTax: number;
  afterTax: number;
  deposit: number | null;
  policy: string | null;
};

export type LiveRates = { rooms: LiveRoom[]; test: boolean };

type Config = { base: string; key: string; site: string; test: boolean };

function config(): Config | null {
  const { BOOKINGCENTER_API_URL: url, BOOKINGCENTER_API_KEY: key, BOOKINGCENTER_SITE_ID: site } = process.env;
  if (!url || !key || !site) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  // The key only ever goes to BookingCenter, over https.
  if (parsed.protocol !== 'https:' || !parsed.hostname.endsWith('.bookingcenter.com')) return null;
  const test = parsed.hostname.includes('-test');
  if (test && process.env.NODE_ENV === 'production' && process.env.BOOKINGCENTER_ALLOW_TEST_RATES !== 'true') return null;
  return { base: parsed.href.endsWith('/') ? parsed.href : `${parsed.href}/`, key, site, test };
}

export function liveRatesConfigured(): boolean {
  return config() !== null;
}

const xmlEscape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const envelope = (body: string) =>
  `<?xml version="1.0" encoding="UTF-8"?><soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/"><soap:Body>${body}</soap:Body></soap:Envelope>`;

const pos = (c: Config) =>
  `<POS><Source ISOCurrency="USD"/><RequestorID OTA_CodeType="10" ID="${xmlEscape(c.site)}" MessagePassword="${xmlEscape(c.key)}"/></POS>`;

/** The reply as text. It can carry PHP warnings ahead of the XML, and be gzipped despite what was asked. */
function replyText(raw: Buffer): string {
  const text = raw.toString('latin1');
  const start = text.indexOf('<?xml');
  if (start >= 0) return text.slice(start);
  const zipped = raw.indexOf(Buffer.from([0x1f, 0x8b]));
  if (zipped < 0) return '';
  const unzipped = gunzipSync(raw.subarray(zipped)).toString('latin1');
  return unzipped.slice(Math.max(0, unzipped.indexOf('<?xml')));
}

/** One call. `init` lets the caller set caching. Errors never carry the request, so never the key. */
async function call(c: Config, path: string, action: string, body: string, init: RequestInit & { next?: { revalidate: number } } = { cache: 'no-store' }): Promise<string> {
  const res = await fetch(c.base + path, {
    ...init,
    method: 'POST',
    headers: { 'Content-Type': 'text/xml; charset=utf-8', SOAPAction: `www.bookingcenter.com/xml:${action}`, 'Accept-Encoding': 'identity' },
    body: envelope(body),
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`BookingCenter ${action} answered ${res.status}`);
  return replyText(Buffer.from(await res.arrayBuffer()));
}

const decode = (s: string) =>
  s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .trim();

const blocks = (xml: string, tag: string) => xml.match(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, 'g')) ?? [];
const attr = (xml: string, tag: string, name: string) => xml.match(new RegExp(`<${tag}\\b[^>]*?\\b${name}="([^"]*)"`))?.[1] ?? '';
const textIn = (xml: string, tag: string) => {
  const inner = xml.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`))?.[1];
  return inner === undefined ? '' : decode(inner.replace(/<(?!!\[CDATA\[)[^>]*>/g, ''));
};
const amount = (s: string) => {
  const n = Number(s);
  return s !== '' && Number.isFinite(n) ? n : null;
};

function parseRates(xml: string): LiveRoom[] {
  const error = attr(xml, 'Error', 'ShortText');
  if (error) {
    // Nothing open is an answer, not a failure. Anything else (a bad key, say) is a failure.
    if (/no\s+(rooms?\s+)?availab/i.test(error)) return [];
    throw new Error(`BookingCenter availability: ${error}`);
  }
  if (!xml.includes('OTA_HotelAvailRS')) throw new Error('BookingCenter availability: unreadable reply');
  const rooms: LiveRoom[] = [];
  for (const stay of blocks(xml, 'RoomStay')) {
    const code = attr(stay, 'RoomType', 'RoomTypeCode');
    const unitsLeft = amount(attr(stay, 'RoomType', 'NumberOfUnits')) ?? 0;
    const beforeTax = amount(attr(stay, 'Base', 'AmountBeforeTax'));
    const afterTax = amount(attr(stay, 'Base', 'AmountAfterTax'));
    if (!code || unitsLeft <= 0 || beforeTax === null || afterTax === null) continue;
    const payment = stay.match(/<GuaranteePayment\b[\s\S]*?<\/GuaranteePayment>/)?.[0] ?? '';
    rooms.push({
      code,
      name: textIn(stay, 'RoomTypeName') || code,
      unitsLeft,
      maxGuests: amount(attr(stay, 'RoomType', 'NumberOfGuests')) ?? 0,
      beforeTax,
      afterTax,
      deposit: amount(attr(payment, 'AmountPercent', 'Amount')),
      policy: textIn(stay.match(/<GuaranteeDescription\b[\s\S]*?<\/GuaranteeDescription>/)?.[0] ?? '', 'Text') || null,
    });
  }
  return rooms;
}

const ratesCache = new Map<string, { at: number; value: Promise<LiveRates> }>();

/** Open rooms and total rates for a stay, or null when the service isn't set up. Throws if it can't be reached. */
export function fetchLiveRates(q: { checkIn: string; checkOut: string; guests: number }): Promise<LiveRates> | null {
  const c = config();
  if (!c) return null;
  const cacheKey = `${c.base}|${q.checkIn}|${q.checkOut}|${q.guests}`;
  const hit = ratesCache.get(cacheKey);
  if (hit && Date.now() - hit.at < RATES_CACHE_MS) return hit.value;

  const body = `<OTA_HotelAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05/hotelavail"><parameters Version="1.001">${pos(c)}<AvailRequestSegments><AvailRequestSegment><StayDateRange Start="${q.checkIn}" End="${q.checkOut}"/><RoomStayCandidates><RoomStayCandidate Quantity="1"><GuestCounts IsPerRoom="false"><GuestCount AgeQualifyingCode="10" Count="${q.guests}"/></GuestCounts></RoomStayCandidate></RoomStayCandidates><HotelSearchCriteria><Criterion><HotelRef ChainCode="${CHAIN_AND_AGENT}" HotelCode="${xmlEscape(c.site)}" AgentCode="${CHAIN_AND_AGENT}"/></Criterion></HotelSearchCriteria></AvailRequestSegment></AvailRequestSegments></parameters></OTA_HotelAvailRQ>`;
  const value = call(c, 'hotel_availability.php', 'HotelAvailIn', body).then((xml) => ({ rooms: parseRates(xml), test: c.test }));
  // A failure isn't kept, so the next guest tries again.
  value.catch(() => ratesCache.delete(cacheKey));
  if (ratesCache.size >= RATES_CACHE_MAX) ratesCache.clear();
  ratesCache.set(cacheKey, { at: Date.now(), value });
  return value;
}

/** Each room type's photos from BookingCenter, by room code. Empty when it can't be had: the page keeps its own photos. */
export async function fetchRoomPhotos(): Promise<Record<string, string[]>> {
  const c = config();
  if (!c) return {};
  const body = `<OTA_HotelDescriptiveContentInfoRQ xmlns="http://www.opentravel.org/OTA/2003/05/hoteldescriptivecontentinfo"><parameters Version="1.003">${pos(c)}<HotelDescriptiveInfos><HotelDescriptiveInfo HotelCode="${xmlEscape(c.site)}" LanguageCode="EN"><FacilityInfo SendGuestRooms="yes"/><MultimediaObjects SendImages="yes"/></HotelDescriptiveInfo></HotelDescriptiveInfos></parameters></OTA_HotelDescriptiveContentInfoRQ>`;
  try {
    const xml = await call(c, 'hotel_information.php', 'HotelDescriptiveContentInfoIn', body, { next: { revalidate: 3600 } });
    const allowed = `https://images.bookingcenter.com/${c.site}/images/`; // The only place next.config lets images come from.
    const photos: Record<string, string[]> = {};
    for (const room of blocks(xml, 'GuestRoom')) {
      const code = attr(room, 'GuestRoom', 'CodeContext');
      const urls = blocks(room, 'MultimediaObject')
        .filter((m) => attr(m, 'Image', 'ThumbNail') !== 'Y')
        .map((m) => textIn(m, 'URL'))
        .filter((u) => u.startsWith(allowed) && !/_thumb\./i.test(u));
      if (code && urls.length) photos[code] = [...new Set(urls)].slice(0, PHOTOS_MAX);
    }
    return photos;
  } catch (e) {
    console.error('Room photos unavailable:', e instanceof Error ? e.message : 'unknown error');
    return {};
  }
}
