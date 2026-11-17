import './demo-promotions.css';

/** Promotional copy intentionally belongs only to the private booking demo. */
export function DemoPromotions() {
  return (
    <aside className="demo-promos" aria-label="Demo promotions">
      <p className="demo-promos__eyebrow" data-reveal="fade">
        <span className="demo-promos__signal" aria-hidden="true" />
        THESE PRICES ARE BULLSHIT
        <span className="demo-promos__rule" aria-hidden="true" />
      </p>
    </aside>
  );
}

export function DemoCalendarBanner() {
  return (
      <div className="demo-promos__deal" data-reveal>
        <svg className="demo-promos__spark" viewBox="0 0 80 80" fill="none" aria-hidden="true">
          <path d="M40 3v74M3 40h74M14 14l52 52M14 66l52-52" stroke="currentColor" strokeWidth="2" />
          <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="1" />
        </svg>
        <p className="demo-promos__headline">THIS CALENDAR IS BULLSHIT</p>
        <span className="demo-promos__shine" aria-hidden="true" />
      </div>
  );
}
