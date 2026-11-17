import 'server-only';
import { CHAIN_AND_AGENT, call, config, pos, xmlEscape } from '@/lib/bookingcenter-api';
import { parsePreviewRooms } from '@/lib/bookingcenter-preview';
import { addDays, dayNumber, intersectInventory, sampleAvailability, type Availability, type Search } from './package';

// Fresh, read-only sandbox searches. No fallback from BookingCenter to fabricated inventory.
export async function availability(q: Search): Promise<Availability> {
  if (q.mode === 'sample') {
    if (q.scenario === 'failure') throw new Error('Simulated availability outage. No package can be offered.');
    return sampleAvailability(q);
  }
  const c = config({ allowTest: true });
  if (!c) throw new Error('BookingCenter sandbox access is not configured. Live availability cannot be verified. You can explicitly switch to the sample walkthrough.');
  if (!c.test || c.site !== 'RIVERR') throw new Error('This review demo only permits the River Ranch BookingCenter sandbox. Production API requests are disabled.');
  const nights = dayNumber(q.checkOut)! - dayNumber(q.checkIn)!;
  async function read(start: string, end: string) {
    const body = `<OTA_HotelAvailRQ xmlns="http://www.opentravel.org/OTA/2003/05/hotelavail"><parameters Version="1.001">${pos(c!)}<AvailRequestSegments><AvailRequestSegment><StayDateRange Start="${start}" End="${end}"/><RoomStayCandidates><RoomStayCandidate Quantity="1"><GuestCounts IsPerRoom="false"><GuestCount AgeQualifyingCode="10" Count="${q.guests}"/></GuestCounts></RoomStayCandidate></RoomStayCandidates><HotelSearchCriteria><Criterion><HotelRef ChainCode="${CHAIN_AND_AGENT}" HotelCode="${xmlEscape(c!.site)}" AgentCode="${CHAIN_AND_AGENT}"/></Criterion></HotelSearchCriteria></AvailRequestSegment></AvailRequestSegments></parameters></OTA_HotelAvailRQ>`;
    const xml = await call(c!, 'hotel_availability.php', 'HotelAvailIn', body, { cache: 'no-store' });
    if (!xml.includes('OTA_HotelAvailRS')) throw new Error('BookingCenter returned an unreadable availability response. No package can be offered.');
    if (/<(?:\w+:)?Error\b/.test(xml)) {
      if (/no\s+(rooms?\s+)?availab/i.test(xml)) return [];
      throw new Error('BookingCenter rejected the availability request. The key or property access may need attention.');
    }
    return parsePreviewRooms(xml);
  }
  try {
    const stay = await read(q.checkIn, q.checkOut);
    const nightly = [];
    // At most three simultaneous calls, bounded to seven nights.
    for (let i = 0; i < nights; i += 3) {
      const batch = Array.from({ length: Math.min(3, nights - i) }, (_, j) => addDays(q.checkIn, i + j));
      nightly.push(...await Promise.all(batch.map(date => read(date, addDays(date, 1)))));
    }
    return { source: 'sandbox', checkedAt: new Date().toISOString(), nights, rooms: intersectInventory(stay, nightly, q.guests) };
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('BookingCenter')) throw error;
    throw new Error('BookingCenter availability is unavailable or timed out. No package can be offered. Please try again.');
  }
}
