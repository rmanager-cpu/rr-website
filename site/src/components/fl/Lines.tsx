import type { CSSProperties, ElementType, ReactNode } from 'react';

type Props = {
  /** One entry per visual line. Use <em> inside a line for the italic accent. */
  lines: ReactNode[];
  /** The element to render (default h2). */
  as?: ElementType;
  className?: string;
  id?: string;
  /** Stagger the whole block (ms, or "1".."4" steps), like data-reveal-delay. */
  delay?: number | string;
  /** Turn the scroll reveal off (for example inside a page hero, which rises on load by itself). */
  still?: boolean;
};

/**
 * Fireside's masked line reveal: each line rises out of its own mask, one after another.
 *   <Lines as="h2" className="display-l" lines={['Pine, hickory,', <>birch and <em>a few antiques.</em></>]} />
 * renders <h2 class="display-l" data-reveal="lines"><span class="rl"><span class="rl-i" style="--i:0">…
 * Server-safe (no client JS of its own); components/fl/Motion.tsx drives the reveal.
 */
export function Lines({ lines, as: Tag = 'h2', className, id, delay, still }: Props) {
  return (
    <Tag className={className} id={id} data-reveal={still ? undefined : 'lines'} data-reveal-delay={delay !== undefined ? String(delay) : undefined}>
      {lines.map((line, i) => (
        <span key={i} className="rl">
          <span className="rl-i" style={{ '--i': i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Tag>
  );
}
