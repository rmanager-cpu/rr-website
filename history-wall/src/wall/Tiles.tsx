import { useEffect, useState } from 'react';
import type { SectionImage } from './types';
import type { View } from './useViewport';

type Subscribe = (fn: (v: View, size: { w: number; h: number }) => void) => () => void;

export interface TileRef {
  col: number;
  row: number;
}

/** Tiles of `image` that intersect a world-space rectangle (plus a margin). */
export function tilesIn(image: SectionImage, x0: number, y0: number, x1: number, y1: number, pad = 0): TileRef[] {
  const t = image.tiles;
  if (!t) return [];
  const c0 = Math.max(0, Math.floor((x0 - pad) / t.size));
  const c1 = Math.min(t.cols - 1, Math.floor((x1 + pad) / t.size));
  const r0 = Math.max(0, Math.floor((y0 - pad) / t.size));
  const r1 = Math.min(t.rows - 1, Math.floor((y1 + pad) / t.size));
  const out: TileRef[] = [];
  for (let row = r0; row <= r1; row++) for (let col = c0; col <= c1; col++) out.push({ col, row });
  return out;
}

/** Absolutely positioned <img> tiles, in world (source-pixel) coordinates. */
export function TileImages({ image, tiles, url }: { image: SectionImage; tiles: TileRef[]; url: (src: string) => string }) {
  const t = image.tiles!;
  return (
    <>
      {tiles.map(({ col, row }) => (
        <img
          key={`${col}_${row}`}
          className="hw-tile"
          src={url(t.src.replace('{col}', String(col)).replace('{row}', String(row)))}
          alt=""
          draggable={false}
          onLoad={(e) => e.currentTarget.classList.add('is-loaded')}
          style={{
            left: col * t.size,
            top: row * t.size,
            width: Math.min(t.size + 1, image.width - col * t.size),
            height: Math.min(t.size + 1, image.height - row * t.size),
          }}
        />
      ))}
    </>
  );
}

/**
 * Full-resolution tiles for the part of the wall on screen, only once the zoom level is beyond what
 * the largest whole image can show sharply.
 */
export function WallTiles({ image, subscribe, url }: { image: SectionImage; subscribe: Subscribe; url: (src: string) => string }) {
  const [tiles, setTiles] = useState<TileRef[]>([]);
  useEffect(() => {
    if (!image.tiles) return;
    const largest = image.files[image.files.length - 1].w;
    let key = '';
    return subscribe((v, size) => {
      const need = image.width * v.s * Math.min(2, window.devicePixelRatio || 1);
      const next =
        need <= largest * 1.25
          ? []
          : tilesIn(image, -v.x / v.s, -v.y / v.s, (size.w - v.x) / v.s, (size.h - v.y) / v.s, image.tiles!.size * 0.25);
      const k = next.map((t) => `${t.col}_${t.row}`).join(',');
      if (k !== key) {
        key = k;
        setTiles(next);
      }
    });
  }, [image, subscribe]);
  if (!image.tiles || !tiles.length) return null;
  return <TileImages image={image} tiles={tiles} url={url} />;
}
