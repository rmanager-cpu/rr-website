import { StayDates } from '@/components/RoomBooking';
import { Lines } from '@/components/fl/Lines';
import { business, lodging } from '@/content/site';
import './stay.css';

/** "3 PM" becomes a big 3 with an italic "pm". */
function Time({ value }: { value: string }) {
  const [num, unit] = value.split(' ');
  return (
    <span className="fact__num">
      {num} {unit && <em>{unit.toLowerCase()}</em>}
    </span>
  );
}

/** The "Book a room" band on every Stay page, on frost. Old /book-a-room links land on `#book`. */
export function StayBook() {
  return (
    <section className="section section--frost sty-book" id="book" aria-labelledby="book-h">
      <div className="container split">
        <div className="stack">
          <p className="label label--accent" data-reveal>Book a room</p>
          <Lines id="book-h" className="display-l" lines={['Pick your', <em key="n">nights.</em>]} />
          <p className="lede" data-reveal data-reveal-delay="150">Tell us when. You’ll see what’s open and what it costs, no phone tag.</p>
          <div className="sty-book__times" data-reveal data-reveal-delay="250">
            <div className="fact"><Time value={lodging.checkIn} /><span className="label">Check-in</span></div>
            <div className="fact"><Time value={lodging.checkOut} /><span className="label">Check-out</span></div>
          </div>
          <p className="sty-book__talk muted" data-reveal data-reveal-delay="300">
            Rather talk to a person? Call the front desk at <a className="text-link" href={`tel:${business.phoneE164}`}>{business.phone}</a>
            {' '}or write to <a className="text-link" href={`mailto:${business.email.lodge}`}>{business.email.lodge}</a>.
          </p>
        </div>
        <div className="sty-book__panel" data-reveal data-reveal-delay="150">
          <StayDates />
        </div>
      </div>
    </section>
  );
}
