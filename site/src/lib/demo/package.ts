// Pure package rules. Every price rule here is illustrative, never a production offer.
export const DEAL = { minRooms: 5, percentOff: 10, ticketDayCents: 12500 } as const;
export type Search = { checkIn: string; checkOut: string; guests: number; rooms: number; mode: 'sandbox' | 'sample'; scenario: 'normal' | 'limited' | 'sold-out' | 'failure' };
export type Rate = { plan: string; beforeTax: number | null; afterTax: number | null };
export type InventoryRoom = { code: string; unitsLeft: number; maxGuests: number; rates: Rate[] };
export type Room = { code: string; available: number; sleeps: number; plan: string; beforeCents: number; taxCents: number };
export type Availability = { rooms: Room[]; checkedAt: string; source: 'sandbox' | 'sample'; nights: number };
export type Selection = Record<string, number>;
export type PackageTotal = { lodging: number; discount: number; taxes: number; tickets: number; total: number; rooms: number; people: number };
const DAY = 86400000;
export const money = (cents: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
export const todayInTahoe = () => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Los_Angeles' }).format(new Date());
export const addDays = (date: string, count: number) => new Date(Date.parse(date + 'T12:00:00Z') + count * DAY).toISOString().slice(0, 10);
export function dayNumber(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const n = Date.parse(value + 'T00:00:00Z');
  return Number.isFinite(n) && new Date(n).toISOString().slice(0, 10) === value ? n / DAY : null;
}
export function readSearch(value: Record<string, unknown>, today = todayInTahoe()): Search {
  const start = dayNumber(value.checkIn), end = dayNumber(value.checkOut), now = dayNumber(today)!;
  const guests = Number(value.guests), rooms = Number(value.rooms);
  if (start === null || end === null || start < now || start > now + 730 || end <= start || end - start > 7) throw new Error('Choose a valid stay of 1–7 nights, within the next two years.');
  if (!Number.isInteger(guests) || guests < 1 || guests > 4) throw new Error('Choose 1–4 guests per room.');
  if (!Number.isInteger(rooms) || rooms < DEAL.minRooms || rooms > 19) throw new Error('Choose 5–19 rooms for this group deal.');
  if (value.mode !== 'sandbox' && value.mode !== 'sample') throw new Error('Choose an availability source.');
  const scenario = value.scenario ?? 'normal';
  if (!['normal', 'limited', 'sold-out', 'failure'].includes(String(scenario))) throw new Error('Unknown review scenario.');
  return { checkIn: String(value.checkIn), checkOut: String(value.checkOut), guests, rooms, mode: value.mode, scenario: scenario as Search['scenario'] };
}
// Require both a whole-stay answer and every night. A missing rate, room type or night cannot be priced.
// The same rate plan must exist every night; sum one-night totals to avoid interpreting a nightly Base as a stay total.
export function intersectInventory(stay: InventoryRoom[], nights: InventoryRoom[][], guests: number): Room[] {
  if (!nights.length) return [];
  return stay.flatMap(room => {
    const everyNight = nights.map(n => n.find(r => r.code === room.code));
    if (everyNight.some(r => !r)) return [];
    const all = [room, ...everyNight as InventoryRoom[]];
    if (all.some(r => !Number.isInteger(r.unitsLeft) || r.unitsLeft <= 0 || !Number.isInteger(r.maxGuests) || r.maxGuests < guests)) return [];
    const available = Math.min(19, ...all.map(r => r.unitsLeft));
    const plans = [...new Set(room.rates.map(r => r.plan))].filter(Boolean);
    const options = plans.flatMap(plan => {
      const rates = everyNight.map(r => r!.rates.find(p => p.plan === plan));
      if (rates.some(r => !r || r.beforeTax === null || r.afterTax === null || !Number.isFinite(r.beforeTax) || !Number.isFinite(r.afterTax) || r.beforeTax < 0 || r.afterTax < r.beforeTax)) return [];
      const beforeCents = rates.reduce((sum, r) => sum + Math.round(r!.beforeTax! * 100), 0);
      const afterCents = rates.reduce((sum, r) => sum + Math.round(r!.afterTax! * 100), 0);
      return [{ plan, beforeCents, taxCents: afterCents - beforeCents }];
    }).sort((a, b) => a.beforeCents + a.taxCents - b.beforeCents - b.taxCents);
    return options[0] ? [{ code: room.code, available, sleeps: Math.min(...all.map(r => r.maxGuests)), ...options[0] }] : [];
  });
}
export function packageTotal(available: Room[], selection: Selection, q: Search, ticketPeople: number, ticketDays: number): PackageTotal {
  if (!selection || typeof selection !== 'object' || Array.isArray(selection)) throw new Error('Choose your rooms.');
  let rooms = 0, lodging = 0, rawTax = 0;
  for (const [code, count] of Object.entries(selection)) {
    if (!Number.isInteger(count) || count < 0) throw new Error('Room quantities must be whole numbers.');
    if (count === 0) continue;
    const room = available.find(r => r.code === code);
    if (!room || room.sleeps < q.guests || count > room.available) throw new Error('That room selection is no longer available for the full stay.');
    rooms += count; lodging += count * room.beforeCents; rawTax += count * room.taxCents;
  }
  if (rooms !== q.rooms) throw new Error(`Select all ${q.rooms} rooms to price the whole group.`);
  const nights = dayNumber(q.checkOut)! - dayNumber(q.checkIn)!;
  if (!Number.isInteger(ticketPeople) || ticketPeople < 0 || ticketPeople > rooms * q.guests || !Number.isInteger(ticketDays) || ticketDays < 1 || ticketDays > nights) throw new Error('Choose valid ticket quantities and ski days.');
  const discount = Math.round(lodging * DEAL.percentOff / 100);
  // Hypothetical proportional lodging tax adjustment; real discount/tax treatment needs approval.
  const taxes = Math.round(rawTax * (100 - DEAL.percentOff) / 100);
  const tickets = ticketPeople * ticketDays * DEAL.ticketDayCents;
  return { lodging, discount, taxes, tickets, total: lodging - discount + taxes + tickets, rooms, people: rooms * q.guests };
}
export function sampleAvailability(q: Search): Availability {
  const nights = dayNumber(q.checkOut)! - dayNumber(q.checkIn)!;
  const list = [
    { code: 'RIVDD', available: 3, sleeps: 4, rate: 260 },
    { code: 'RIVQ', available: 2, sleeps: 2, rate: 240 },
    { code: 'KVIEW', available: 1, sleeps: 2, rate: 225 },
    { code: '2Q', available: 1, sleeps: 4, rate: 215 },
    { code: 'K', available: 1, sleeps: 2, rate: 195 },
  ];
  return { source: 'sample', checkedAt: new Date().toISOString(), nights, rooms: list.filter(r => r.sleeps >= q.guests).map((r, i) => ({ code: r.code, sleeps: r.sleeps, available: q.scenario === 'sold-out' ? 0 : q.scenario === 'limited' ? (i < 2 ? 1 : 0) : r.available, plan: 'SAMPLE', beforeCents: r.rate * nights * 100, taxCents: r.rate * nights * 10 })).filter(r => r.available > 0) };
}
