# History Wall

An explorable, zoomable version of the photo wall in the lodge. Every frame can be tapped; frames we
don't know yet open a "What's the story behind this one?" box. Built as a self-contained React
component (`src/wall/`) so it can drop into whatever the main site ends up on.

```
npm install
npm run dev          # the wall, and /#mapper (the tracing tool, dev only)
npm run build        # type-check + production build into dist/
npm run images       # rebuild web images after adding/replacing a photo in source/
```

## Where things live

| What | File | Edited by |
|---|---|---|
| Wall photos (originals) | `source/<section>.jpg` | drop in, then `npm run images` |
| Web sizes + placeholder | `public/wall/*.webp`, `src/data/images.json` | generated, don't edit |
| Sections and their order | `src/data/sections.json` | hand |
| Frame outlines per section | `src/data/geometry/<section>.json` | the mapper (`/#mapper`) |
| What each frame is / does | `src/data/frames.json` | hand |
| The component | `src/wall/` | code |

Outlines are stored as fractions (0–1) of the photo's width and height, so they stay aligned at any
screen size, pan or zoom, and survive re-exporting the photo at another resolution.

## Frame ids

- `f41`: the number on the frame's tag on the real wall. The site shows it as "No. 41".
- `u-something`: the tag isn't readable in the current photo. Rename to `f<number>` once confirmed,
  in the geometry files (the mapper's list) and in `frames.json`.

A frame can appear on more than one section (the shots overlap). Same id everywhere; it opens from
whichever photo shows it largest.

## Adding what we learn about a frame

Add or edit its entry in `src/data/frames.json`. Everything except `id` is optional:

```json
{
  "id": "f76",
  "title": "Thanks River Ranch!!",
  "teaser": "Signed downhill photo",
  "description": "What we know, and how we know it.",
  "closeup": "frames/f76.webp",
  "action": { "type": "link", "href": "https://…", "label": "Watch the run" },
  "themes": ["sports"],
  "related": ["f52"]
}
```

`action.type` is one of:
- `ask` (default): the story box.
- `link`: a button out to a video, article or page (`href`, optional `label`).
- `story`: a page on our own site (`href`).
- `easter-egg`: a `message` shown in the panel, or an `href`.

Frames with an action other than `ask` get a gold outline in "outline every photo" mode. A frame with
a story still offers "Know more about this one?", so the box never goes away.

`closeup` is optional: put a straight-on photo of the frame in `public/frames/` and it replaces the
crop from the wall photo.

## Adding or replacing a wall photo

1. Save it as `source/<id>.jpg` (lowercase id, e.g. `bar-left`).
2. `npm run images`.
3. Add `{ "id": "bar-left", "title": "…" }` to `src/data/sections.json` where it sits in the room.
4. `npm run dev`, open `/#mapper`, choose the section, trace the frames, Save.

If a replacement photo is framed differently, the old outlines won't line up; re-trace in the mapper.

## The mapper (`/#mapper`, dev only)

- **Add frame:** click the corners in order: top-left, top-right, bottom-right, bottom-left. Enter (or
  clicking the first point) finishes; then type the id. For ovals or odd shapes, click more points.
- **Select:** click an outline, drag its orange corners, rename it in the list, Delete to remove.
- **Save** writes `src/data/geometry/<section>.json` straight from the browser (a dev-server-only
  endpoint; it doesn't exist in the production build).

Four-point outlines matter: the panel uses those corners to straighten a frame shot at an angle.

## Stitching a stretch of wall

Overlapping shots of one flat stretch, left to right, go in `source/shots/<name>/`. Then:

```
node --max-old-space-size=8192 scripts/stitch.mjs wall host middle exit --outlines
npm run images
```

It lines the shots up by feature matching (the wall is a plane, so each shot maps onto the middle
one exactly), squares the result up, matches exposure, and hides each join along the
lowest-difference path. `--outlines` converts frames traced on each shot
(`source/shots/<name>/outlines/<shot>.json`) into `src/data/geometry/<name>.json`; leave it off once
outlines have been edited on the stitched wall in the mapper, or they'll be overwritten.

## Submissions

`src/wall/adapters.ts`:
- `supabaseAdapter` (live) inserts into `wall_submissions` in the river-ranch-office hub with the
  publishable key from `.env.local` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`). Row-level
  security lets the public add rows and nothing else.
- `localAdapter` (used when those aren't set) keeps submissions in the visitor's browser only.

Database: `supabase/wall_submissions.sql`, then `supabase/wall_submissions_02_one_reward.sql`
(one reward code per email or phone). Paste each into the Supabase SQL editor as the owner.

Spam: a hidden honeypot field on the form; in the database, the same story for the same frame within
a day is dropped, and past 300 submissions an hour inserts are refused.

## Deploying

Vercel project `the-wall-river-ranch` (https://the-wall-river-ranch.vercel.app). Built locally so the
key stays in `.env.local`:

```
npx vercel build --prod
npx vercel deploy --prebuilt --prod
```

## How the wall works (for whoever touches `src/wall/`)

- `useViewport.ts`: pan/zoom. Writes the transform straight to the layer (no React render per frame)
  and only tells React about coarse scale changes. Drag with momentum, pinch, ctrl/⌘ + wheel and
  trackpad pinch to zoom, horizontal wheel pans, double-click/double-tap zooms, arrows/+/−/0 on the
  keyboard. A plain vertical wheel is left to the page (a hint appears instead), and on phones
  vertical swipes scroll the page until you zoom in, so the wall never traps scrolling.
- `HistoryWall.tsx`: photo + SVG outlines in one transformed layer, so they can't drift apart. Loads
  the next sharper file only when the zoom level needs it. The hover "lift" redraws the frame's own
  pixels (clipped to its outline) slightly larger with a shadow and dims the rest. Touch: first tap
  lifts and centers, second opens. Keyboard: Tab between frames, Enter opens.
- `Straightened.tsx`: flattens a traced quad into a rectangle with a CSS `matrix3d` perspective
  transform, so angled frames read straight-on.
- `FramePanel.tsx`: the `<dialog>` with the image, the story or box, and previous/next.
- Respects `prefers-reduced-motion` (no momentum, no animated zoom, lift without motion).
