'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import './river-cam.css';

// The live river cam: an HDOnTap stream co-branded with Tahoetopia, TrueLive and Truckee River Rafting
// (see the river-webcam note). Its player only allows itself to be framed on riverranchlodge.com and a few
// partner sites, so everywhere else (localhost, Vercel previews) it would show a broken frame. There we
// show a still with a link to the live feed instead. Keep the official embed as is: logos, link and all.
// Drawn the Fireside way: the picture in a thick ink frame with a "Live" tag on its corner. The page
// around it supplies the heading (home: "The river, right now."; /dine/happening: beside the intro).
const STREAM = 'https://portal.hdontap.com/s/embed?stream=river-ranch_ttv-CUST-TOPIA&ratio=16:9&fluid=true';
const PLAYS_ON = /(^|\.)riverranchlodge\.com$/;

export function RiverCam() {
  const box = useRef<HTMLDivElement>(null);
  const [live, setLive] = useState(false);

  // Load the player only once the tile is near the screen: it brings its own scripts and video.
  useEffect(() => {
    if (!PLAYS_ON.test(window.location.hostname) || !box.current) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setLive(true);
          io.disconnect();
        }
      },
      { rootMargin: '300px 0px' },
    );
    io.observe(box.current);
    return () => io.disconnect();
  }, []);

  return (
    <figure className="rcam">
      <div className="rcam__frame">
        <span className="rcam__live live" aria-hidden="true">Live</span>
        <div ref={box} className="rcam__screen">
          {live ? (
            <iframe src={STREAM} title="Live webcam: the Truckee River at River Ranch" allow="autoplay; fullscreen" allowFullScreen />
          ) : (
            <a href={STREAM} target="_blank" rel="noopener" className="rcam__still">
              <Image src="/photos/snowy-river-lodge-blue-sky.jpg" alt="The snowy Truckee River running past the lodge" fill sizes="(max-width: 1400px) 100vw, 1320px" />
              <span className="rcam__watch">Watch the river cam live</span>
            </a>
          )}
        </div>
      </div>
      <figcaption className="rcam__note">
        <span className="sr-only">The live river cam: the Truckee River behind River Ranch. </span>
        Cam down? It’s run by{' '}
        <a className="text-link" href="http://tahoetopia.com" target="_blank" rel="noopener">
          Tahoetopia
        </a>
        .
      </figcaption>
    </figure>
  );
}
