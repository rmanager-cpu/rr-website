'use client';

import { useEffect, useRef, useState } from 'react';

// Venio's booking widget (the events app, rr-events): the Alpine Dining Room's calendar, "Send a request",
// "Planning something bigger?", and later "Book it now" with a Stripe deposit. Everything happens inside the
// frame between the guest and Venio; the website builds nothing behind it. From Venio's
// docs/WIDGET-HANDOFF.md (Nov 11, 2026). Rules from that handoff:
// - no sandbox attribute (it would stop "Book it now" sending the whole window to Stripe);
// - the frame reports its own height, so never set one;
// - only riverranchlodge.com, www.riverranchlodge.com, river-ranch-site.vercel.app and localhost may frame it;
// - a test code (?t=) never goes on a public page or in a NEXT_PUBLIC_ variable.
const VENIO = process.env.NEXT_PUBLIC_VENIO_URL ?? 'https://rr-events-nine.vercel.app';

export function VenioWidget({ venue = 'river-ranch', title = 'Book private dining', look }: { venue?: string; title?: string; look?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [height, setHeight] = useState(900);
  const [query, setQuery] = useState(() => (look ? `?look=${encodeURIComponent(look)}` : ''));

  // ?venio-look=… or ?venio-try=looks on this page's address passes through, for comparing the widget's looks.
  useEffect(() => {
    const page = new URLSearchParams(window.location.search);
    const q = new URLSearchParams();
    const chosen = page.get('venio-look') ?? look;
    if (chosen) q.set('look', chosen);
    if (page.get('venio-try') === 'looks') q.set('try', 'looks');
    const s = q.toString();
    setQuery(s ? `?${s}` : '');
  }, [look]);

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== VENIO || event.source !== frame.current?.contentWindow) return;
      const data = event.data as { type?: string; height?: number } | null;
      // On the way to the payment page: bring the frame's top back into view if the page has scrolled past it.
      if (data?.type === 'venio:show') {
        if (frame.current && frame.current.getBoundingClientRect().top < 0) frame.current.scrollIntoView({ block: 'start' });
        return;
      }
      if (data?.type !== 'venio:height' || typeof data.height !== 'number' || !Number.isFinite(data.height)) return;
      setHeight(Math.max(320, Math.min(Math.ceil(data.height), 8000)));
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={frame}
      src={`${VENIO}/w/${venue}${query}`}
      title={title}
      loading="lazy"
      scrolling="no"
      style={{ display: 'block', width: '100%', height, border: 0, overflow: 'hidden' }}
    />
  );
}
