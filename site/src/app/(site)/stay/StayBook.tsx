import { L } from '@/content/lorem';
import { business } from '@/content/site';

/** The "Book a room" band that closes every Stay page. Old /book-a-room links land on `#book`. */
export function StayBook() {
  return (
    <section className="section on-night" id="book" aria-labelledby="book-h">
      <div className="container stack" style={{ gap: 22, maxWidth: 900 }}>
        <span className="eyebrow">Book a room</span>
        <h2 id="book-h" className="serif h-m">Book online, or call the front desk.</h2>
        <p className="lede">{L.line2}</p>
        <div className="btn-row">
          <a href={business.links.bookRoom} className="btn btn--amber" rel="noopener">Book online</a>
          <a href={`tel:${business.phoneE164}`} className="btn btn--ghost-cream">{business.phone}</a>
          <a href={`mailto:${business.email.lodge}`} className="btn btn--ghost-cream">{business.email.lodge}</a>
        </div>
      </div>
    </section>
  );
}
