import 'server-only';
import { CHAIN_AND_AGENT, call, config, decode, pos, xmlEscape, type Config } from './bookingcenter-api';

// Read-only calls for the staff preview page (/stay/preview): everything BookingCenter's test or live
// system answers, shown as it comes back, with no handoff when something fails. Nothing here saves,
// changes or cancels a booking. The guest pages keep using fetchLiveRates in bookingcenter-api.ts.

const CACHE_MS = 5 * 60_000; // BookingCenter watches look-to-book, so a reload doesn't search again.
const CACHE_MAX = 300;
const RAW_MAX = 40_000; // characters of a reply kept for the "what came back" view

export type CallResult<T> = {
  name: string; // the OTA message, as BookingCenter names it
  ok: boolean;
  ms: number;
  error: string | null;
  data: T | null;
  raw: string; // the reply, key removed, cut to RAW_MAX
  tags: { tag: string; count: number }[];
};

export type PreviewRate = {
  plan: string;
  planName: string | null;
  beforeTax: number | null;
  afterTax: number | null;
  deposit: number | null;
  policy: string | null;
};

export type PreviewRoom = { code: string; name: string; unitsLeft: number; maxGuests: number; rates: PreviewRate[] };

export type ContentEntry = { kind: string; code: string | null; name: string | null; attrs: Record<string, string>; text: string };

// ---------- small XML readers (BookingCenter's replies are plain OTA XML, sometimes with odd whitespace) ----------

/** Every <tag ...>…</tag> or <tag .../> in the text, outermost first. */
function elements(xml: string, tag: string): string[] {
  return xml.match(new RegExp(`<${tag}\\b(?:[^>]*?/>|[^>]*>[\\s\\S]*?</${tag}>)`, 'g')) ?? [];
}

/** The attributes on an element's own opening tag. */
function attrsOf(el: string): Record<string, string> {
  const open = el.match(/^<[^>]*>/)?.[0] ?? '';
  const out: Record<string, string> = {};
  for (const m of open.matchAll(/([A-Za-z_][\w:.-]*)="([^"]*)"/g)) out[m[1]] = decode(m[2]);
  return out;
}

const firstAttr = (xml: string, tag: string, name: string) => {
  const el = elements(xml, tag)[0];
  return el ? attrsOf(el)[name] ?? '' : '';
};

const textOf = (el: string) => decode(el.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();

const num = (s: string | undefined) => {
  if (s === undefined || s === '') return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

/** Element names in a reply and how often each appears: a map of what BookingCenter sent. */
function tagCounts(xml: string): { tag: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const m of xml.matchAll(/<([A-Za-z_][\w.-]*:)?([A-Za-z_][\w.-]*)[\s>/]/g)) {
    const tag = m[2];
    if (tag === 'xml') continue;
    counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts].map(([tag, count]) => ({ tag, count })).sort((a, b) => b.count - a.count);
}

function errorIn(xml: string): string | null {
  const el = elements(xml, 'Error')[0];
  if (!el) return null;
  const a = attrsOf(el);
  return a.ShortText || textOf(el) || a.Code || 'BookingCenter answered with an error.';
}

function why(e: unknown): string {
  if (!(e instanceof Error)) return 'Unknown error.';
  const cause = (e as Error & { cause?: { code?: string; message?: string } }).cause;
  if (e.name === 'TimeoutError') return 'No answer within 12 seconds.';
  return cause?.code ? `${e.message} (${cause.code})` : cause?.message ? `${e.message}: ${cause.message}` : e.message;
}

// ---------- one call, cached, timed, with the key scrubbed from anything kept ----------

const cache = new Map<string, { at: number; value: Promise<CallResult<unknown>> }>();

function run<T>(c: Config, name: string, path: string, action: string, body: string, parse: (xml: string) => T): Promise<CallResult<T>> {
  const key = `${c.base}|${path}|${body}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) return hit.value as Promise<CallResult<T>>;

  const value = (async (): Promise<CallResult<T>> => {
    const started = Date.now();
    let xml = '';
    try {
      xml = await call(c, path, action, body);
      const clean = xml.split(c.key).join('•••');
      const base = { name, ms: Date.now() - started, raw: clean.slice(0, RAW_MAX), tags: tagCounts(xml) };
      const err = errorIn(xml);
      // "Nothing open" is an answer, not a failure.
      if (err && !/no\s+(rooms?\s+)?availab/i.test(err)) return { ...base, ok: false, error: err, data: null };
      if (!xml.trim()) return { ...base, ok: false, error: 'Empty reply.', data: null };
      return { ...base, ok: true, error: null, data: parse(xml) };
    } catch (e) {
      return { name, ms: Date.now() - started, ok: false, error: why(e), data: null, raw: xml.split(c.key).join('•••').slice(0, RAW_MAX), tags: [] };
    }
  })();

  // A failure isn't kept, so the next load tries again.
  value.then((r) => !r.ok && cache.delete(key));
  if (cache.size >= CACHE_MAX) cache.clear();
  cache.set(key, { at: Date.now(), value });
  return value;
}

// ---------- availability: OTA_HotelAvailRQ, the message the Stay pages already use ----------

function parseRooms(xml: string): PreviewRoom[] {
  const byCode = new Map<string, PreviewRoom>();
  for (const stay of elements(xml, 'RoomStay')) {
    const type = attrsOf(elements(stay, 'RoomType')[0] ?? '');
    const code = type.RoomTypeCode;
    if (!code) continue;
    const nameEl = elements(stay, 'RoomTypeName')[0];
    const room = byCode.get(code) ?? {
      code,
      name: (nameEl && textOf(nameEl)) || code,
      unitsLeft: num(type.NumberOfUnits) ?? 0,
      maxGuests: num(type.NumberOfGuests) ?? 0,
      rates: [],
    };
    room.unitsLeft = Math.max(room.unitsLeft, num(type.NumberOfUnits) ?? 0);

    const names = new Map<string, string>();
    for (const p of elements(stay, 'RatePlan')) {
      const a = attrsOf(p);
      if (a.RatePlanCode) names.set(a.RatePlanCode, a.RatePlanName || textOf(p) || '');
    }
    const payment = elements(stay, 'GuaranteePayment')[0] ?? '';
    const deposit = num(firstAttr(payment, 'AmountPercent', 'Amount'));
    const policyEl = elements(stay, 'GuaranteeDescription')[0];
    const policy = (policyEl && textOf(policyEl)) || null;

    // A stay total wins over a nightly base when both are there.
    const amounts = (el: string) => {
      const total = attrsOf(elements(el, 'Total')[0] ?? '');
      const base = attrsOf(elements(el, 'Base')[0] ?? '');
      return {
        beforeTax: num(total.AmountBeforeTax) ?? num(base.AmountBeforeTax),
        afterTax: num(total.AmountAfterTax) ?? num(base.AmountAfterTax),
      };
    };

    const roomRates = elements(stay, 'RoomRate');
    if (roomRates.length) {
      for (const rr of roomRates) {
        const plan = attrsOf(rr).RatePlanCode || [...names.keys()][0] || '';
        room.rates.push({ plan, planName: names.get(plan) || null, ...amounts(rr), deposit, policy });
      }
    } else {
      const plan = [...names.keys()][0] || '';
      room.rates.push({ plan, planName: names.get(plan) || null, ...amounts(stay), deposit, policy });
    }
    byCode.set(code, room);
  }
  return [...byCode.values()];
}

export type AvailQuery = { checkIn: string; checkOut: string; guests: number; quantity?: number; promo?: string };

function availBody(c: Config, q: AvailQuery): string {
  // PromotionCode is OTA's place for a promo code; whether BookingCenter applies it is what the page tests.
  const promo = q.promo ? `<RatePlanCandidates><RatePlanCandidate PromotionCode="${xmlEscape(q.promo.toUpperCase())}"/></RatePlanCandidates>` : '';
  return `<OTA_HotelAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05/hotelavail"><parameters Version="1.001">${pos(c)}<AvailRequestSegments><AvailRequestSegment><StayDateRange Start="${q.checkIn}" End="${q.checkOut}"/>${promo}<RoomStayCandidates><RoomStayCandidate Quantity="${q.quantity ?? 1}"><GuestCounts IsPerRoom="false"><GuestCount AgeQualifyingCode="10" Count="${q.guests}"/></GuestCounts></RoomStayCandidate></RoomStayCandidates><HotelSearchCriteria><Criterion><HotelRef ChainCode="${CHAIN_AND_AGENT}" HotelCode="${xmlEscape(c.site)}" AgentCode="${CHAIN_AND_AGENT}"/></Criterion></HotelSearchCriteria></AvailRequestSegment></AvailRequestSegments></parameters></OTA_HotelAvailRQ>`;
}

/** Null when the settings aren't usable (settingsReport says why). */
export function previewAvailability(q: AvailQuery): Promise<CallResult<PreviewRoom[]>> | null {
  const c = config({ allowTest: true });
  if (!c) return null;
  return run(c, 'OTA_HotelAvailRQ', 'hotel_availability.php', 'HotelAvailIn', availBody(c, q), parseRooms);
}

/** One-night searches for each night from `start`, a few at a time. */
export async function previewNights(start: string, days: number): Promise<{ night: string; result: CallResult<PreviewRoom[]> }[] | null> {
  if (!config({ allowTest: true })) return null;
  const nights = Array.from({ length: days }, (_, i) => addDays(start, i));
  const out: { night: string; result: CallResult<PreviewRoom[]> }[] = new Array(nights.length);
  let next = 0;
  const worker = async () => {
    while (next < nights.length) {
      const i = next++;
      const night = nights[i];
      // One guest, so every room type counts.
      out[i] = { night, result: (await previewAvailability({ checkIn: night, checkOut: addDays(night, 1), guests: 1 }))! };
    }
  };
  await Promise.all(Array.from({ length: 6 }, worker));
  return out;
}

// ---------- site content: OTA_HotelDescriptiveContentInfo (rooms, images, items, packages, policies) ----------

const CONTENT_KINDS = ['Package', 'PackageInfo', 'InventoryItem', 'Item', 'Service', 'Policy', 'MarketingMessage'];

function parseContent(xml: string): ContentEntry[] {
  const out: ContentEntry[] = [];
  for (const kind of CONTENT_KINDS) {
    for (const el of elements(xml, kind)) {
      const attrs = attrsOf(el);
      const nameEl = elements(el, 'Name')[0] ?? elements(el, 'Description')[0];
      out.push({
        kind,
        code: attrs.Code || attrs.ID || attrs.PackageCode || attrs.ItemCode || attrs.CodeContext || null,
        name: attrs.Name || attrs.PackageName || attrs.ItemName || (nameEl ? textOf(nameEl) : null) || null,
        attrs,
        text: textOf(el).slice(0, 400),
      });
    }
  }
  return out;
}

const contentBody = (c: Config, extra: string) =>
  `<OTA_HotelDescriptiveContentInfoRQ xmlns="http://www.opentravel.org/OTA/2003/05/hoteldescriptivecontentinfo"><parameters Version="1.003">${pos(c)}<HotelDescriptiveInfos><HotelDescriptiveInfo HotelCode="${xmlEscape(c.site)}" LanguageCode="EN">${extra}<FacilityInfo SendGuestRooms="yes"/><MultimediaObjects SendImages="yes"/></HotelDescriptiveInfo></HotelDescriptiveInfos></parameters></OTA_HotelDescriptiveContentInfoRQ>`;

/** Asks for hotel info and policies too; if BookingCenter refuses that, asks the way the room photos do. */
export async function previewContent(): Promise<CallResult<ContentEntry[]> | null> {
  const c = config({ allowTest: true });
  if (!c) return null;
  const name = 'OTA_HotelDescriptiveContentInfo';
  const wide = await run(c, name, 'hotel_information.php', 'HotelDescriptiveContentInfoIn', contentBody(c, '<HotelInfo SendData="yes"/><Policies SendPolicies="yes"/>'), parseContent);
  if (wide.ok) return wide;
  return run(c, name, 'hotel_information.php', 'HotelDescriptiveContentInfoIn', contentBody(c, ''), parseContent);
}

// ---------- dates ----------

export function addDays(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().slice(0, 10);
}

export const todayInTahoe = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
