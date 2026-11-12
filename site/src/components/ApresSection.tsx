import Image from 'next/image';
import Link from 'next/link';
import { photos } from '@/content/photos';
import './apres.css';

/**
 * The après band (Fireside): the round bar behind a charcoal shade and film grain, one huge italic
 * "Après" in Instrument Serif, a line, and the bartender in a frame. Used on the Happy Hour page and on
 * Stay › Packages. `first` gives it room for the overlay header when it opens the page.
 */
export function ApresSection({
  eyebrow = 'Après',
  headingLevel = 'h2',
  title = 'Après and happy hour at the round bar',
  line = 'Happy hour, Monday to Friday, 3 to 5.',
  detail = 'Come in off the mountain and thaw. Dine-in at the round bar, and not on holidays.',
  cta = { href: '/dine/happening/happy-hour', label: 'Happy hour' },
  first = false,
}: {
  eyebrow?: string;
  headingLevel?: 'h1' | 'h2';
  title?: string;
  line?: string;
  detail?: string;
  cta?: { href: string; label: string } | null;
  first?: boolean;
}) {
  const H = headingLevel;
  return (
    <section className={`apres on-night grain${first ? ' apres--first' : ''}`} aria-labelledby="apres-h">
      <div className="apres__bg" aria-hidden="true">
        <Image src={photos.roundBar.src} alt="" fill sizes="100vw" priority={first} data-parallax="0.12" />
      </div>
      <div className="apres__shade" aria-hidden="true" />
      <div className="container apres__inner">
        <p className="label label--accent" data-reveal>{eyebrow}</p>
        <H id="apres-h" className="sr-only">{title}</H>
        <div className="apres__word" aria-hidden="true" data-reveal="lines" data-reveal-delay="120">
          <span className="rl"><span className="rl-i">Après</span></span>
        </div>
        <div className="apres__row">
          <div className="apres__copy">
            <p className="display-m" data-reveal data-reveal-delay="200">{line}</p>
            {detail && <p className="lede" data-reveal data-reveal-delay="300">{detail}</p>}
            {cta && (
              <div className="btn-row" data-reveal data-reveal-delay="400">
                <Link href={cta.href} className="btn">{cta.label}</Link>
              </div>
            )}
          </div>
          <figure className="frame frame--tall apres__frame" data-reveal="clip" data-reveal-delay="200">
            <Image src={photos.bartender.src} alt={photos.bartender.alt} fill sizes="340px" style={{ objectPosition: '30% 50%' }} />
          </figure>
        </div>
      </div>
    </section>
  );
}
