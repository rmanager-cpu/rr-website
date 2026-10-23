import Image from 'next/image';
import Link from 'next/link';
import { photos } from '@/content/photos';

/** The APRÈS / happy hour section from the design canvas. Used on the homepage and the Happy Hour page. */
export function ApresSection({
  eyebrow = '05 · Après',
  headingLevel = 'h2',
  title = 'Après and happy hour at the round bar',
  line = 'Happy hour, Monday to Friday, 3 to 5.',
  detail = 'At the round bar under the log ceiling: wings, poutine, the Chophouse burger, nachos and cold drinks after the last run.',
  cta = { href: '/events/happy-hour', label: 'Happy hour' },
}: {
  eyebrow?: string;
  headingLevel?: 'h1' | 'h2';
  title?: string;
  line?: string;
  detail?: string;
  cta?: { href: string; label: string } | null;
}) {
  const H = headingLevel;
  return (
    <section className="apres on-night" aria-labelledby="apres-h">
      <div className="apres__bg" aria-hidden="true">
        <Image src={photos.roundBar.src} alt="" fill sizes="100vw" />
      </div>
      <div className="apres__shade" aria-hidden="true" />
      <div className="container stack" style={{ maxWidth: 1440, gap: 40, paddingBlock: '110px 120px' }}>
        <span className="eyebrow">{eyebrow}</span>
        <H id="apres-h" className="sr-only">{title}</H>
        <div className="apres__word" aria-hidden="true">
          <span>APRÈS</span>
          <span>APRÈS</span>
          <span>APRÈS</span>
        </div>
        <div className="row-split" style={{ gap: 40 }}>
          <div className="stack" style={{ gap: 22, maxWidth: 560 }}>
            <p className="serif" style={{ margin: 0, fontSize: 'clamp(32px, 3.6vw, 52px)', lineHeight: 1.02 }}>{line}</p>
            <p className="lede">{detail}</p>
            {cta && (
              <Link href={cta.href} className="btn btn--amber" style={{ alignSelf: 'flex-start' }}>
                {cta.label}
              </Link>
            )}
          </div>
          <Image src={photos.bartender.src} alt={photos.bartender.alt} width={photos.bartender.width} height={photos.bartender.height} sizes="380px" className="tilt" style={{ width: 'min(380px, 100%)', aspectRatio: '4 / 5', objectFit: 'cover' }} />
        </div>
      </div>
    </section>
  );
}
