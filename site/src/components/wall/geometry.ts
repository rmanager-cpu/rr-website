import type { Hotspot, Point } from './types';

export interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Hotspot points in source-image pixels. */
export function toPixels(points: Point[], width: number, height: number): Point[] {
  return points.map(([x, y]) => [x * width, y * height]);
}

export function bounds(points: Point[]): Box {
  const xs = points.map((p) => p[0]);
  const ys = points.map((p) => p[1]);
  const x = Math.min(...xs);
  const y = Math.min(...ys);
  return { x, y, w: Math.max(...xs) - x, h: Math.max(...ys) - y };
}

export function centroid(points: Point[]): Point {
  const n = points.length;
  return [points.reduce((s, p) => s + p[0], 0) / n, points.reduce((s, p) => s + p[1], 0) / n];
}

/** Polygon area (shoelace), in the units of the points. */
export function area(points: Point[]): number {
  let a = 0;
  for (let i = 0; i < points.length; i++) {
    const [x1, y1] = points[i];
    const [x2, y2] = points[(i + 1) % points.length];
    a += x1 * y2 - x2 * y1;
  }
  return Math.abs(a) / 2;
}

/** Corners used to straighten a frame: the traced corners for quads, else the bounding box. */
export function quadFor(points: Point[]): [Point, Point, Point, Point] {
  if (points.length === 4) return points as [Point, Point, Point, Point];
  const b = bounds(points);
  return [
    [b.x, b.y],
    [b.x + b.w, b.y],
    [b.x + b.w, b.y + b.h],
    [b.x, b.y + b.h],
  ];
}

/** Natural width/height of a straightened quad (average of opposite edges). */
export function quadSize(q: [Point, Point, Point, Point]): { w: number; h: number } {
  const d = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1]);
  return { w: (d(q[0], q[1]) + d(q[3], q[2])) / 2, h: (d(q[0], q[3]) + d(q[1], q[2])) / 2 };
}

/** Reading order: rows top to bottom, then left to right. */
export function readingOrder(hotspots: Hotspot[]): Hotspot[] {
  return [...hotspots].sort((a, b) => {
    const ca = centroid(a.points);
    const cb = centroid(b.points);
    const rowA = Math.round(ca[1] * 6);
    const rowB = Math.round(cb[1] * 6);
    return rowA - rowB || ca[0] - cb[0];
  });
}

// --- Perspective transform (maps a quad onto a rectangle) as a CSS matrix3d ---

type M3 = number[];

function adj(m: M3): M3 {
  return [
    m[4] * m[8] - m[5] * m[7], m[2] * m[7] - m[1] * m[8], m[1] * m[5] - m[2] * m[4],
    m[5] * m[6] - m[3] * m[8], m[0] * m[8] - m[2] * m[6], m[2] * m[3] - m[0] * m[5],
    m[3] * m[7] - m[4] * m[6], m[1] * m[6] - m[0] * m[7], m[0] * m[4] - m[1] * m[3],
  ];
}

function mul(a: M3, b: M3): M3 {
  const c: M3 = [];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++) {
      let s = 0;
      for (let k = 0; k < 3; k++) s += a[3 * i + k] * b[3 * k + j];
      c[3 * i + j] = s;
    }
  return c;
}

function mulV(m: M3, v: number[]): number[] {
  return [0, 1, 2].map((i) => m[3 * i] * v[0] + m[3 * i + 1] * v[1] + m[3 * i + 2] * v[2]);
}

function basis(p: Point[]): M3 {
  const m = [p[0][0], p[1][0], p[2][0], p[0][1], p[1][1], p[2][1], 1, 1, 1];
  const v = mulV(adj(m), [p[3][0], p[3][1], 1]);
  return mul(m, [v[0], 0, 0, 0, v[1], 0, 0, 0, v[2]]);
}

/** CSS matrix3d() that maps `from` (TL, TR, BR, BL) onto `to`. Use with transform-origin 0 0. */
export function perspectiveMatrix(from: Point[], to: Point[]): string {
  const t = mul(basis(to), adj(basis(from)));
  const n = t.map((x) => x / t[8]);
  return `matrix3d(${[n[0], n[3], 0, n[6], n[1], n[4], 0, n[7], 0, 0, 1, 0, n[2], n[5], 0, n[8]].join(',')})`;
}
