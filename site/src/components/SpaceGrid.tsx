import Image from 'next/image';
import { spaces } from '@/content/spaces';

// Where each space sits (or when it's open). Capacities come only from content/spaces.ts; until
// management confirms one, it says "Ask us".
const PLACE: Record<string, [string, string]> = {
  'Riverview room': ['Where', 'Out over the river'],
  'Alpine Dining Room': ['Where', 'By the stone fireplace'],
  'The Point': ['Where', 'The river end of the patio'],
  'Full Patio': ['Season', 'Warmer months'],
};

/** The name in Fireside's two voices: the first word plain, the rest in the italic accent. */
function Name({ name }: { name: string }) {
  const [first, ...rest] = name.split(' ');
  return rest.length ? <>{first} <em>{rest.join(' ')}</em></> : <>{name}</>;
}

/** The event spaces, one photo and a few facts each, alternating sides. Used on /celebrate/spaces
 *  (styles in app/(site)/celebrate/celebrate.css). */
export function SpaceGrid() {
  return (
    <div className="cel-rooms">
      {spaces.map((s, i) => {
        const place = PLACE[s.name];
        return (
          <article key={s.name} className={`cel-room split${i % 2 ? ' split--flip' : ''}`} aria-labelledby={`cel-room-${i}`}>
            {s.photo ? (
              <figure className="frame" data-reveal="clip">
                <Image src={s.photo.src} alt={s.photo.alt} fill sizes="(max-width: 860px) 100vw, 50vw" style={s.focus ? { objectPosition: s.focus } : undefined} />
              </figure>
            ) : (
              <div className="cel-room__ph" role="img" aria-label={`Photo coming soon: ${s.name}`} data-reveal>Photo coming soon</div>
            )}
            <div className="cel-room__body">
              <span className="cel-room__num" data-reveal aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <h2 id={`cel-room-${i}`} className="display-m" data-reveal data-reveal-delay="120"><Name name={s.name} /></h2>
              <p className="lede" data-reveal data-reveal-delay="240">{s.line}</p>
              <ul className="fl-facts" data-reveal data-reveal-delay="360">
                {place && <li><span>{place[0]}</span><span>{place[1]}</span></li>}
                <li><span>Fits</span><span>{s.capacity ?? 'Ask us'}</span></li>
              </ul>
            </div>
          </article>
        );
      })}
    </div>
  );
}
