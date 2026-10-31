# Home page scroll prototype (Oct 31, 2026)

A working, single-file prototype of the cinematic home page. Open `index.html` in a browser
(serve the folder or open the file directly). It is a design reference for the real Next.js
home page in `site/`, not production code.

## The story

One sticky scroll track in three equal acts, after a still hero:

1. **Hero** (no motion until the first scroll). Blue-hour snow lodge, stacked brush lettering:
   Stay / Dine / Celebrate, each with a one-line placeholder and a link to its section.
2. **Hero to Stay.** The lodge photo shrinks into a frame and dissolves into the entrance photo;
   the faded Tahoe panorama comes up behind it; one photo floats in; "Stay" slides from the hero
   into place as the heading. CTA: Check Out the Lodge.
3. **Stay to Dine** and **Dine to Celebrate** use the same move: the current frame opens to full
   screen, dissolves into the next section's main photo, and that photo shrinks into its frame
   while the next backdrop fades in behind it. No zooming. Then the floats and words land.

| Section   | Backdrop (faded)            | Main frame            | Support photo  | Word color     | Frame color | CTA                                 |
|-----------|-----------------------------|-----------------------|----------------|----------------|-------------|-------------------------------------|
| Stay      | Tahoe panorama (stock)      | Lodge entrance        | Ski room       | Alpine Navy    | Snow Paper  | Check Out the Lodge (amber)         |
| Dine      | The round bar               | Dining room at night  | Elk chops      | Firelight Amber| Evergreen   | Check Out the Restaurant (cream)    |
| Celebrate | Ceremony chairs by the river| Couple, nose to nose  | Cake cutting   | Snow Paper     | Sugar Pine  | Plan Your Event (amber)             |

Rules this settled on:
- **Backdrop, main photo, one support photo.** No more. Everything else is saved for the inside pages.
- **All three main frames are the same size** (48vw x 78vh, 11vh from the top); only the side changes.
- **Each section owns a color world:** Stay snowy blue and white, Dine warm wood and firelight,
  Celebrate summer greens and gold. No two adjacent sections share a word color.
- Layout alternates: Stay words left, Dine words right, Celebrate words left.

After the story: a Visit section with hours by department, address, directions and the email signup.
Dine also shows a "Dinner tonight from..." line under its button.

Photos held for inside pages: skiers over the lake and snowy porch (Lodge); server by the fire and
the bartender (Restaurant / Bar & Après); ring exchange, cheering toast, hug, string-lights reception,
long table on the river (Weddings); the winter pond at night (Lodge or a winter backdrop).

## Design tokens

Snow Paper `#F6F5EC`, Glacier Ice `#E6F1F6`, Powder Blue `#AAD9F8`, Ski Cobalt `#1760C4`,
Alpine Navy `#10263B`, Evergreen `#294B40`, Sugar Pine `#B2895B`, Firelight Amber `#F2AD5C`,
Charcoal `#151D22`. Wordmark: Fraunces. Body: Figtree. Brush lettering: Knewave with a light
rough-edge SVG filter (a stand-in; final lettering not chosen yet).

## Before this goes live

- **Original photo files.** These are AI-upscaled from small web copies and should be replaced:
  hero (snow lodge at dusk), bar, night dining room. (The Celebrate couple photo is an original.)
- Stock photo (panorama): confirm the license allows commercial use.
- **Mobile hero:** a vertical shot of the lodge would show it better on phones than the wide photo.
- **Lettering:** final choice, or real hand lettering for the three words.
- **Copy:** every bracketed line is a placeholder. No AI taglines.
- **Hours:** placeholders. Hours should be staff-editable (not layout).
- **Wiring:** Book -> BookingCenter (redirect for now), restaurant/menus, Plan Your Event -> the
  events app's inquiry flow, email signup -> the email platform. Buttons currently show a short
  "comes later" toast.
- **Next.js port:** keep headings, copy and images as real HTML (next/image) so Google reads
  everything; layer the motion on top; keep the `prefers-reduced-motion` fallback (jump cuts).
- Summer swap later: the purple-sky patio shot and the halibut were set aside for spring/summer.
