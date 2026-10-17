import { useEffect, useRef, useState } from 'react';
import { bounds, perspectiveMatrix, quadFor, quadSize } from './geometry';
import { TileImages, tilesIn } from './Tiles';
import type { Point, SectionImage } from './types';

interface Props {
  /** Frame outline in source-image pixels. */
  points: Point[];
  image: SectionImage;
  /** Already-loaded smaller whole image, shown at once. */
  previewSrc: string;
  url: (src: string) => string;
  alt: string;
}

/**
 * Shows one frame cut out of the wall photo and flattened to a straight-on rectangle, using a
 * perspective transform from its traced corners. Sharp pixels come from the full-resolution tiles
 * under the frame (or the largest whole image when the photo isn't tiled). Frames traced with more
 * than four points (ovals, octagons) use their bounding box and are clipped to their outline.
 */
export function Straightened({ points, image, previewSrc, url, alt }: Props) {
  const box = useRef<HTMLDivElement>(null);
  const [avail, setAvail] = useState({ w: 0, h: 0 });
  const [sharpLoaded, setSharpLoaded] = useState(false);

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setAvail({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const quad = quadFor(points);
  const natural = quadSize(quad);
  const k = avail.w && avail.h ? Math.min(avail.w / natural.w, avail.h / natural.h) : 0;
  const dw = natural.w * k;
  const dh = natural.h * k;
  const matrix = k
    ? perspectiveMatrix(quad, [
        [0, 0],
        [dw, 0],
        [dw, dh],
        [0, dh],
      ])
    : undefined;
  const clip = points.length > 4 ? `polygon(${points.map(([x, y]) => `${x}px ${y}px`).join(', ')})` : undefined;
  const b = bounds(points);
  const tiles = tilesIn(image, b.x, b.y, b.x + b.w, b.y + b.h);
  const fullSrc = url(image.files[image.files.length - 1].src);

  return (
    <div className="hw-straight" ref={box}>
      {k > 0 && (
        <div className="hw-straight-frame" style={{ width: dw, height: dh }} role="img" aria-label={alt}>
          <div
            className="hw-straight-world"
            style={{ width: image.width, height: image.height, transform: matrix, clipPath: clip }}
          >
            <img src={previewSrc} alt="" width={image.width} height={image.height} draggable={false} />
            {tiles.length ? (
              <TileImages image={image} tiles={tiles} url={url} />
            ) : (
              <img
                src={fullSrc}
                alt=""
                width={image.width}
                height={image.height}
                draggable={false}
                className={`hw-straight-sharp${sharpLoaded ? ' is-loaded' : ''}`}
                onLoad={() => setSharpLoaded(true)}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
