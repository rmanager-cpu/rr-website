'use client';

import Image from 'next/image';
import { useEffect, useRef, type ReactNode } from 'react';
import type { Photo } from '@/content/photos';

/**
 * Fireside's aperture: a dark band whose photo opens from a slit to full bleed as you scroll into it
 * (one scroll value drives a clip-path inset and a slow zoom-out). Without JS or under reduced motion
 * the photo is simply full bleed. Styles: celebrate.css (.cel-ap).
 */
export function Aperture({ photo, id, labelledBy, children }: { photo: Photo; id?: string; labelledBy?: string; children: ReactNode }) {
  const band = useRef<HTMLElement>(null);
  const media = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sec = band.current;
    const box = media.current;
    if (!sec || !box || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const img = box.querySelector('img');
    const clamp = (v: number) => Math.min(1, Math.max(0, v));
    let raf = 0;
    const frame = () => {
      raf = 0;
      const vh = window.innerHeight;
      const r = sec.getBoundingClientRect();
      if (r.bottom < -100 || r.top > vh + 100) return;
      const t = clamp((vh - r.top) / (vh * 0.95));
      const p = t * t * (3 - 2 * t);
      const y = ((1 - p) * 30).toFixed(2);
      const x = ((1 - p) * 34).toFixed(2);
      box.style.clipPath = `inset(${y}% ${x}% ${y}% ${x}%)`;
      if (img) img.style.transform = `scale(${(1.22 - 0.2 * p).toFixed(4)})`;
    };
    const request = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    frame();
    return () => {
      window.removeEventListener('scroll', request);
      window.removeEventListener('resize', request);
      if (raf) cancelAnimationFrame(raf);
      box.style.clipPath = '';
      if (img) img.style.transform = '';
    };
  }, []);

  return (
    <section ref={band} className="cel-ap section--dark" id={id} aria-labelledby={labelledBy}>
      <div ref={media} className="cel-ap__media">
        <Image src={photo.src} alt={photo.alt} fill sizes="100vw" />
      </div>
      <div className="cel-ap__copy">{children}</div>
    </section>
  );
}
