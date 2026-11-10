'use client';

import { useEffect, useRef, useState } from 'react';
import { OPENTABLE_LOADER as LOADER } from './reserve-links';

// OpenTable's own reservation widget for River Ranch (restaurant id 27631), the "standard" one from
// their restaurant-website embed. Their loader script draws the widget where the script tag sits, so we
// add the tag only once the block comes near the screen (it brings its own scripts). The plain link
// next to it always works, with or without the widget.

export function OpenTableWidget() {
  const box = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<'idle' | 'loading' | 'ready' | 'failed'>('idle');

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    let timer = 0;
    const load = () => {
      if (el.querySelector('script')) return;
      setState('loading');
      const s = document.createElement('script');
      s.src = LOADER;
      s.async = true;
      s.onerror = () => setState('failed');
      el.appendChild(s);
      // The widget arrives as an iframe; if nothing shows up, the link below carries on alone.
      const started = Date.now();
      const check = () => {
        if (el.querySelector('iframe')) return setState('ready');
        if (Date.now() - started > 12000) return setState('failed');
        timer = window.setTimeout(check, 400);
      };
      check();
    };
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: '400px 0px' },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div className="dn-ot" data-state={state}>
      <div ref={box} className="dn-ot__widget" aria-busy={state === 'loading'} />
      {state !== 'ready' && (
        <p className="dn-ot__wait">{state === 'failed' ? 'Pick your night, time and party size on OpenTable.' : 'Finding tables on OpenTable…'}</p>
      )}
    </div>
  );
}
