# Home page scroll prototype (Oct 31, 2026)

A working, single-file prototype of the cinematic home page. Open `index.html` in a browser
(serve the folder or open the file directly). It is a design reference for the real Next.js
home page in `site/`, not production code.

## The story

One sticky scroll track in three equal acts, after a still hero:

1. **Hero** (no motion until the first scroll). Blue-hour snow lodge, stacked brush lettering:
   Stay / Dine / Celebrate, each with a one-line placeholder and a link to its section.
2. **Hero to Stay.** The lodge photo shrinks into a frame and dissolves into the entrance photo;
   the faded Tahoe panorama comes up behind it; three photos float in; "Stay" slides from the hero
   into place as the heading. CTA: Check Out the Lodge.
3. **Stay to Dine** and **Dine to Celebrate** use the same move: the current frame opens to full
   screen, dissolves into the next section's main photo, and that photo shrinks into its frame
   while the next backdrop fades in behind it. No zooming. Then the floats and words land.

| Section   | Backdrop (faded)        | Main frame             | Floats                                   | Frame color | CTA                      |
|-----------|-------------------------|------------------------|------------------------------------------|-------------|--------------------------|
| Stay      | Tahoe panorama (stock)  | Lodge entrance          | Skiers over the lake, snowy porch, ski room | Snow Paper  | Check Out the Lodge      |
| Dine      | The round bar           | Dining room at night    | Server by the fire, lamb                 | Evergreen   | Check Out the Restaurant |
| Celebrate | The river at night      | Ring exchange           | Cake cutting, string-lights reception    | Sugar Pine  | Plan Your Event          |

After the story: a Visit section with hours by department, address, directions and the email signup.
Layout alternates: Stay words left, Dine words right, Celebrate words left. Phones get the same story
with fewer floats. The bartender shot was cut from Dine (flash snapshot next to pro-shoot photos);
it suits a future Bar & Après page.

## Design tokens

Snow Paper `#F6F5EC`, Glacier Ice `#E6F1F6`, Powder Blue `#AAD9F8`, Ski Cobalt `#1760C4`,
Alpine Navy `#10263B`, Evergreen `#294B40`, Sugar Pine `#B2895B`, Firelight Amber `#F2AD5C`,
Charcoal `#151D22`. Wordmark: Fraunces. Body: Figtree. Brush lettering: Knewave with a light
rough-edge SVG filter (a stand-in; final lettering not chosen yet).

## Before this goes live

- **Original photo files.** These are AI-upscaled from small web copies and should be replaced:
  hero (snow lodge at dusk), bar, night dining room, night pond. The ring exchange is cropped out
  of the pricing packet; the original is needed.
- Stock photos (panorama, skiers over the lake): confirm the licenses allow commercial use.
- **Lettering:** final choice, or real hand lettering for the three words.
- **Copy:** every bracketed line is a placeholder. No AI taglines.
- **Hours:** placeholders. Hours should be staff-editable (not layout).
- **Wiring:** Book -> BookingCenter (redirect for now), restaurant/menus, Plan Your Event -> the
  events app's inquiry flow, email signup -> the email platform. Buttons currently show a short
  "comes later" toast.
- **Next.js port:** keep headings, copy and images as real HTML (next/image) so Google reads
  everything; layer the motion on top; keep the `prefers-reduced-motion` fallback (jump cuts).
- Summer swap later: the purple-sky patio shot and the halibut were set aside for spring/summer.
