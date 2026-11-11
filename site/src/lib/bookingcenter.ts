// Until the API keys arrive, booking is a redirect: our date picker opens BookingCenter's results page
// with the dates applied. Rates, availability and minimum stays all live there, so none are kept here.
const RESULTS_URL = 'https://book.bookingcenter.com/02/chk_availability.php';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Reformats the picker's string directly: a Date in local time can land a day off in California.
function toBookingCenterDate(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}-${MONTHS[Number(m) - 1]}-${y}`;
}

/** checkIn and checkOut are 'YYYY-MM-DD' from a date input. roomType pins that type at the top of the results;
 *  promo fills BookingCenter's promo code box (a deal like STAYDINE). */
export function bookingCenterUrl(opts: { checkIn: string; checkOut: string; roomType?: string; promo?: string }): string {
  const params = new URLSearchParams({
    site: 'RIVERR',
    check_in_date: toBookingCenterDate(opts.checkIn),
    check_out_date: toBookingCenterDate(opts.checkOut),
  });
  if (opts.roomType) params.set('room_type', opts.roomType);
  if (opts.promo) params.set('promo', opts.promo);
  return `${RESULTS_URL}?${params.toString()}`;
}

/** The day after a 'YYYY-MM-DD' date, in the same format. */
export function nextDay(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1)).toISOString().slice(0, 10);
}

/** A promo code from a link (?promo=staydine), if it looks like one: letters and digits, up to 20. */
export function cleanPromo(raw: string | null | undefined): string {
  const v = (raw ?? '').trim();
  return /^[A-Za-z0-9]{1,20}$/.test(v) ? v.toLowerCase() : '';
}
