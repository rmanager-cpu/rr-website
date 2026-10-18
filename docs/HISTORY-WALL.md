# History Wall: interactive version of the photo wall in the lodge

Decided with Alex, 2026-10-16. Built as a standalone React component, so it can sit on the new site
whatever framework that ends up on (Next.js vs Astro is still open).

## What it is
- A scrollable, zoomable, high-res photo of the real wall, keeping the real arrangement of frames
  (not a grid).
- Hovering a frame enlarges it / lifts it off the wall; on phones, a first tap does the same.
- Clicking a frame does whatever that frame's **action** says (below).

## Two stages, one component
**Stage 1: ask the public.** Nobody on the current team knows most of these photos (many predate
Alex). Every frame starts with the action `ask`: a simple box, "What's in this photo?", plus optional
name and optional email/phone. The page gets posted publicly (local Facebook and history groups,
historical societies, a QR code next to the real wall) to collect what people know.
- Submissions are **never public**. They go privately to management only.
- Stored in the Supabase hub (`river-ranch-office`), new table via a paste file for Alex to run.
  Contact details live only there, never in the repo.
- Spam protection on the form.
- **Reward: 10% off for approved submissions.** When management approves a submission, a unique
  single-use code (with QR) is emailed to the submitter. Never one shared code. Email is required
  only for the reward; name and phone stay optional.
  - Redemption: staff scan the QR at the register, a page shows valid / already used, staff mark it
    redeemed and apply 10% in the POS.
  - Terms (Alex, 2026-10-16): 10% off dining or lodging, up to $200; max one coupon per email
    (enforced in the database by `supabase/wall_submissions_02_one_reward.sql`). Still proposed,
    not confirmed: expires 90 days after sending, not combinable with other offers.
  - Approval means "useful", not "verified": rewards may attract made-up answers, so codes are never
    automatic.

**Stage 2: frames get destinations** as we learn what they are. Per-frame action, set in data:
- `ask`: the box (the default for anything not yet identified)
- `link`: e.g. a ski photo goes to that skier's highlight video, a magazine clipping goes to the article
- `story`: a page on the site (e.g. old menus go to food photos)
- `easter-egg`: Alex's call

Changing a frame from `ask` to anything else is a data edit, not a code change.

## Data, kept separate
- Wall photography: one or more high-res sections, served as tiles/sized versions (never one giant
  image).
- Frame geometry: polygon corners stored relative to the source image (0–1), so they stay aligned at
  any size, pan or zoom.
- Frame content: id, title (optional until known), action + target, related frames, theme tags later.
- Frame ids are the numbers already on the physical frames' tags (1–76), so the site matches the wall.
- Close-ups are optional per frame: without one, the enlarged view is a crop of the wall section.
  First close-ups to shoot: anything with readable text, group photos with small faces, and frames
  that will get a stage-2 destination.

## Tools
- A dev-only mapping tool: click a frame's corners on the wall photo, give it an id, export to the
  data file. Needed first, since every frame is clickable in stage 1.

## Rules
- Never invent history or substitute fake/AI images for the real material.
- Keyboard-accessible, visible focus, respects reduced motion; phones are first-class.

## Prototype (2026-10-16)
Working prototype in `history-wall/` (Vite + React, see its README). Built from Alex's first phone
photos: 5 sections (the corner, the poster wall, by the host stand, the long wall, under the exit
sign), 81 traced frames, 48 with readable tag numbers. Stage 1 only: every frame opens the box;
submissions stay in the visitor's browser until the private endpoint exists.

Open questions:
- The order of the sections around the room (guessed; only host stand → long wall → exit is known).
- `u-` frames whose tag numbers couldn't be read (rename once the close-ups come in).
- Reward terms, and where submissions go (Supabase hub table, paste file for Alex).

## Live (2026-10-16)
https://the-wall-river-ranch.vercel.app (Vercel team turbohospitalitysolutions, project
the-wall-river-ranch; deployed from `history-wall/` with `vercel build --prod` then
`vercel deploy --prebuilt --prod`, which reads the publishable key from `history-wall/.env.local`).
- One section: the main wall, stitched from the host stand, long wall and exit-sign shots
  (`npm run` … `node scripts/stitch.mjs wall host middle exit`). Poster and corner walls left out
  for now (Alex); their photos and outlines stay in `source/` and `src/data/geometry/`.
- Submissions go to `wall_submissions` in the hub once `history-wall/supabase/wall_submissions.sql`
  has been run.

## Next: stitched walls (decided 2026-10-16)
Replace the five overlapping section photos with one stitched image per flat stretch of wall, so the
wall reads as continuous instead of frames repeating across shots.
- Shoot: clear the wall, lock focus/exposure, walk sideways at a fixed distance (don't pivot), ~50%
  overlap, rows top then bottom, 1x, no flash, no phone panorama mode. One folder per stretch
  (`wall-1`, `wall-2`… left to right), plus one shot across each corner.
- Stitch with Hugin (or similar; not installed yet). Each stretch becomes a section.
- The panoramas will be large, so the wall moves to tiled loading (deep-zoom tiles), loading only the
  visible tiles at the needed resolution.
- Re-trace outlines on the stitched images. Frame ids (the tag numbers) and submissions carry over.

## Waiting on
- The overlapping wall shots above.
