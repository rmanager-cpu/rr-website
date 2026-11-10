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


## Close-up photo picks (2026-11-05)
From the Nov 4 shoot in the shared Drive folder "Wall" (id 1KRjoroRRnyTX-Mmi9Shty5KGM3EFMPz_): 75 unique
phone photos at 4000x3000, plus 4 exact duplicates. Graded by eye against the current close-ups. 84 frames in all:
the 81 traced ones and 3 new ones (`new-*`) that aren't traced yet. Not installed: the photos show neighboring
frames, so each needs cropping and straightening to its frame before it goes in `source/closeups/`.

The live Wall was last deployed about Oct 17, before the Oct 31 close-ups commit, so it doesn't have those either.
Tags read from these photos: u-group-78 is No. 75, u-trophy 25, u-dogs 68, u-bear 63, u-staff-suspenders 32,
u-dark-portrait 33, u-riverhouse 64, u-couple-23 23.

| Grade | Frame | On the wall | Best shot | Note |
|---|---|---|---|---|
| Reshoot | f9 | No. 9, two cooks in aprons | 20261104_165031.jpg | Finger over the lens, flash on his face |
| Reshoot | f35 | No. 35, three women, one in a choker | 20261104_165040.jpg | Finger over the bottom half |
| Reshoot | f37 | No. 37, big staff group | 20261104_165129.jpg | Finger over the bottom half |
| Reshoot | u-men-39 | No. 39, group of men at the bar | 20261104_165052.jpg | Finger plus a huge flare |
| Reshoot | u-women-38 | No. 38, big group of women | 20261104_165144.jpg | Finger over the bottom half |
| Reshoot | u-doorway | Man in red, blonde woman, man in vest | 20261104_165136.jpg | Finger over the bottom half |
| Reshoot | new-67 | No. 67, man in red jacket with a dog | 20261104_165220.jpg | Finger over the left side. Not on The Wall yet |
| Reshoot | new-rock | Man in pink shirt climbing a rock | 20261104_165212.jpg | Finger over the left side. Not on The Wall yet |
| Reshoot | new-hut | Two men at the Alpine Meadows hut | 20261104_165201.jpg | Finger over the bottom. Not on The Wall yet |
| Reshoot | f10 | No. 10, cook in an apron at a spit | 20261104_163915.jpg | Flash right on his face |
| Reshoot | u-gray-frame | Gray barnwood frame, man holding a child | 20261104_163921.jpg | Flash on his face |
| Reshoot | f28 | No. 28, ornate frame, rafts on the river | 20261104_164855.jpg | Flash on the people. Two tries, same problem |
| Reshoot | f47 | No. 47, signed "The Ranch Rocks!!" sunset | 20261104_164708.jpg | Flash on the faces. Signatures are great |
| Reshoot | u-grand-opening | River Ranch grand opening announcement | keep current | Not shot. Historic, and we can't read it |
| Reshoot | u-welcome-menu | Gold "Welcome to the River Ranch" menu | keep current | Not shot. We only have the top third |
| Great | u-boncafe | Bon Appetit "Bon Cafe" page, Feb/Mar 1966, with a River Ranch logo | bon-appetit-bon-cafe-feb-mar-1966.jpg (Desktop library, 14_Historic_and_Signage) | Readable. Shot by management, not yet installed on The Wall |
| Reshoot | f71 | No. 71, skier clipping, "1984" written on it | keep current | Not shot. Very blurry |
| Reshoot | f7 | No. 7, tall photo of a house over the water | keep current | Not shot. Dark and blurry |
| Reshoot | u-group-46 | No. 46, group on a red background | keep current | Not shot. Tiny |
| Reshoot | u-snowman-small | Three people with a spiky-haired snowman | keep current | Not shot. Tiny |
| Eh | f4 | No. 4, River Ranch Bill of Fare | 20261104_164624.jpg | Glare hides parts of 3 menu lines |
| Eh | f1 | No. 1, black and white, three at the bar | 20261104_164126.jpg | Flash on the hands, faces are fine |
| Eh | f2 | No. 2, black and white picnic | 20261104_164304.jpg | Flash in the middle of the crowd |
| Eh | f21 | No. 21, man in a towel, woman with a drink | 20261104_164735.jpg | Flash just above his head |
| Eh | u-couple-23 | No. 23, couple, floral shirt | 20261104_164022.jpg | Top edge cut off |
| Eh | f26 | No. 26, skier in flames | keep current | New shot has flash on him. Keeping the old one |
| Eh | f31 | No. 31, costumes at the bar | 20261104_164408.jpg | Flash, shadow along the bottom |
| Eh | f34 | No. 34, the clown at the bar | 20261104_164715.jpg | Right edge cut off, flash low |
| Eh | f42 | No. 42, couple by the fireplace | keep current | New shot has flash on his face. Keeping the old one |
| Eh | f43 | No. 43, ski group above the lake | 20261104_164238.jpg | Flash low in the middle |
| Eh | f44 | No. 44, huge group photo | 20261104_164157.jpg | Mild flash mid-group, right edge tight |
| Eh | f45 | No. 45, four women, flowers in hair | 20261104_164424.jpg | Flash on the top woman's chin |
| Eh | f52 | No. 52, Swany ski racer | keep current | New shot has flash on his chest. Keeping the old one |
| Eh | f53 | No. 53, fisherman holding a big fish | 20261104_164844.jpg | Huge flare behind him, he's clean |
| Eh | f54 | No. 54, signed baseball player | 20261104_164008.jpg | Flash on his chest, autograph reads fine |
| Eh | f55 | No. 55, man with a deer | 20261104_164144.jpg | Flash on his lap, face is fine |
| Eh | f72 | No. 72, two men in the snow | 20261104_164000.jpg | Right edge cut off |
| Eh | f73 | No. 73, two men, silver frame | 20261104_164834.jpg | Flash above them, edges cut |
| Eh | u-blacktie-clipping | NY Times, "Black Tie and Pucci" | 20261104_164040.jpg | Whole clipping, but the small print is soft |
| Eh | u-dam | River dam in the snow | 20261104_164616.jpg | Flash spot in the sky, right edge tight |
| Eh | u-letter | Letter on State of California letterhead | 20261104_164313.jpg | Off-center, shadow along the bottom |
| Eh | u-ski-nautique | Ski Nautique boat | 20261104_164941.jpg | Top and left cut off |
| Eh | u-bar-crowd | Crowded bar, lanterns overhead | 20261104_164948.jpg | Off-center, right edge cut |
| Eh | f13 | No. 13, fly fisherman on the river | keep current | Not shot. Old one is okay |
| Eh | f18 | No. 18, skiers at a helicopter | keep current | Not shot. Old one is okay |
| Eh | f58 | No. 58, Woodies Wharf banner | keep current | Not shot. Old one is okay |
| Eh | u-lodge-river | Lodge across the river, small caption plate | keep current | Not shot. Old one is okay |
| Eh | u-patio-umbrella | Patio umbrella over the rocks and river | keep current | Not shot. Old one is okay |
| Eh | u-snowroof | Rooftops buried in snow, caption plate | keep current | Not shot. Caption is unreadable |
| Great | f74 | No. 74, polka-dot pants | 20261104_163905.jpg |  |
| Great | u-group-78 | No. 75, the Wooden Nickel snowman | 20261104_163855.jpg |  |
| Great | f12 | No. 12, trout and fly rod | 20261104_163929.jpg |  |
| Great | f57 | No. 57, three women, lake behind | 20261104_163935.jpg |  |
| Great | u-skier-14 | Purple skier | 20261104_163943.jpg |  |
| Great | u-laughing-56 | No. 56, laughing man, tequila | 20261104_163952.jpg |  |
| Great | f24 | No. 24, octagon frame, white suit | 20261104_164022.jpg |  |
| Great | f59 | No. 59, signed race car | 20261104_164022.jpg |  |
| Great | u-snow-village | Squaw Valley sport shop in the snow | 20261104_164049.jpg |  |
| Great | u-subtlety | "Leave Subtlety at Home" article | 20261104_164119.jpg |  |
| Great | u-trophy | No. 25, man with a trophy | 20261104_164204.jpg |  |
| Great | u-dogs | No. 68, golden retrievers on a chairlift | 20261104_164222.jpg |  |
| Great | f41 | No. 41, men in tuxedos | 20261104_164254.jpg |  |
| Great | f49 | No. 49, hang glider | 20261104_164335.jpg |  |
| Great | f69 | No. 69, ski patrol group | 20261104_164350.jpg |  |
| Great | f62 | No. 62, "No Dogs Allowed" snow dog | 20261104_164358.jpg |  |
| Great | f48 | No. 48, the tram | 20261104_164432.jpg |  |
| Great | f61 | No. 61, Rock 'n' Roll Marathon | 20261104_164440.jpg |  |
| Great | f50 | No. 50, climber on a rope | 20261104_164454.jpg |  |
| Great | f40 | No. 40, oval frame, two women | 20261104_164502.jpg |  |
| Great | u-lake-clipping | "The Auto Fared Better" clipping | 20261104_164510.jpg |  |
| Great | f70 | No. 70, trophy at the bar | 20261104_164532.jpg |  |
| Great | f17 | No. 17, women on an old car | 20261104_164539.jpg |  |
| Great | f19 | No. 19, avalanche and skier | 20261104_164549.jpg |  |
| Great | u-bear | No. 63, Team River Ranch, 1st place 2003 | 20261104_164557.jpg |  |
| Great | u-sepia-bar | Red-tinted photo of the old bar | 20261104_164608.jpg |  |
| Great | f76 | No. 76, signed "Thanks River Ranch!!" | 20261104_164812.jpg |  |
| Great | f30 | No. 30, dining room, chandeliers | 20261104_164725.jpg |  |
| Great | u-staff-suspenders | No. 32, staff in suspenders | 20261104_164744.jpg |  |
| Great | u-dark-portrait | No. 33, two men, M*A*S*H shirt | 20261104_164753.jpg |  |
| Great | u-family-22 | No. 22, two couples with kids | 20261104_164802.jpg |  |
| Great | u-riverhouse | No. 64, snowy river and lodge | 20261104_164818.jpg |  |
| Great | u-anniversary-1992 | "Be There or Be Square" 1992 poster | 20261104_164907.jpg |  |
| Great | f51 | No. 51, two men, one in big sunglasses | 20261104_164958.jpg |  |
| Great | f60 | No. 60, three in sunglasses | 20261104_165014.jpg |  |

## History facts: how solid each one is (2026-11-05)

Lore on the old site was passed down, not researched, so public copy should only state the first group flatly.

**Best source found: Bon Appetit, February/March 1966, page 23 ("Bon Cafe"), framed on the wall**

Written about 18 months after River Ranch opened, decades before the website versions below. It says:

- River Ranch is "a relatively new resort" on the Truckee in Tahoe City. Owner: Gardner W. Mein, a "young San Francisco married" with no previous experience. Resident manager: Alan Brenner.
- "Its historic predecessor, the Deer Park Inn, was built in 1888."
- Poet Edwin Markham "exulted in 1914 that this was 'where the joy hunters gather!'" "By that time a narrow-gauge railway had been built to the door."
- "The River Ranch, in fact, stands on the site of still another hostel, the Deer Park Lodge, which was built in the thirties to replace the Deer Park Inn."
- Time, July 1965, in a cover story on the best U.S. resorts: "a Currier & Ives styled encampment that opened only one year ago . . . has already become the place to stay for sophisticated young San Francisco marrieds."
- Most popular apres-ski drink: the Hot Damn. In a 6-ounce china mug, 2 teaspoons powdered milk, 1/2 cup hot water to dissolve, 1 ounce tequila, 1/2 ounce dark creme de cacao; stir, nutmeg on top.
- "Seasonal entertainment of a spectacular sort": kayak racing and a "River Rat Race" through the rapids, trout fishing steps from the lobby, snacks under tents on the terrace, ski events, and "cock-eyed golf and tennis games" in the snow.

Checks: the Markham line is confirmed in his book California the Wonderful (1914): "Deer Park Springs is a canyoned and cascaded slope where the joy-hunters gather." The Time wording hasn't been checked against Time itself. Bon Appetit is a magazine feature, not a deed, and local history gives 1880 rather than 1888 for the Deer Park hotel.

**Solid (primary document, or independent sources agree)**

| Claim | Evidence |
|---|---|
| Governor Edmund G. Brown came to dinner at River Ranch on a Friday and wrote "It certainly got our weekend off to a fine start" | His letter of March 12, 1965, on the wall, addressed to Gardner Mein, River Ranch Restaurant, Tahoe City |
| Deer Park Inn / Deer Park Springs Hotel was a separate resort about a mile up Bear Creek, from the 1880s | The Lake of the Sky (1915); Andy Wertheim, citing E.B. Scott's Saga of Lake Tahoe (says 1880); Palisades Tahoe blog (2021) |
| The railway from Truckee to Tahoe City opened in 1900, with a Deer Park stop at the Truckee River; narrow gauge until 1926 | Wertheim; Online Archive of California finding aid; Wikipedia |
| New owners bought River Ranch in 1972 | Sierra Sun (2007, 2012); Moonshine Ink (2012); the 1992 poster, "Celebrating 20 Years" |
| An annual Summer Concert Series was running by June 2011 (Zepparella, Great American Taxi) | Sierra Sun, June 20, 2011; Moonshine Ink, 2012 (Renegade Productions); 2017 listing |
| Live bands played River Ranch by 1997: Leftover Salmon (July 9, 1997), String Cheese Incident (Aug. 27, 1997), Garaj Mahal (2002), Umphrey's McGee (July 2, 2003), Tea Leaf Green (2004, "River Ranch Patio"), Hot Buttered Rum (2006) | Recordings on the Internet Archive Live Music Archive; etree for Leftover Salmon; the Umphrey's fan database for 2003; Songkick |
| Moonalice, Melvin Seals & JGB and Zepparella played in 2012 | Renegade Productions lineup announcement; Songkick |
| The series sat out the pandemic, came back in 2025, and ran again in 2026 | Tahoe.com (June 11, 2026: "the first year River Ranch brought its live concert series back since the Covid pandemic"); management, first hand |
| The comeback is backed by the North Tahoe Community Alliance's Event Funding Sponsorship (2026 contract for "River Ranch: Patio Concert Series") | Office inbox. NTCA's visitor brand was Go Tahoe North; it became Lake Tahoe Travel on Oct. 1, 2025, and gotahoenorth.com now redirects to laketahoetravel.com. The 2025 funding is per management; only the 2026 contract is in the inbox |

**Good but not airtight**

| Claim | Evidence and gap |
|---|---|
| Grand opening as River Ranch, Sunday, November 22, 1964 | The year is inferred, now strongly. The ad says Sunday, Nov. 22, at the entrance to Alpine Meadows (opened 1961); Nov. 22 was a Sunday in 1964 and 1970; Time said in July 1965 that it "opened only one year ago"; the governor's letter says River Ranch in March 1965. The newspaper date at the top of the ad should settle it, but it's unreadable in the current photo |
| Deer Park Lodge, built in the thirties, stood on the River Ranch site; the Deer Park Inn was its predecessor | Bon Appetit, 1966; Palisades Tahoe (2021) agrees. Not checked against deeds or old local papers |
| A summer concert series since about 1993 | Lake Tahoe News, June 15, 2010: "River Ranch Lodge has its 18th Annual Under the Stars Concert Series ... beginning June 24." One listing, probably from the lodge's own release, and the count assumes no skipped years. It does mean Renegade (2012) didn't start the series |
| Time magazine named River Ranch to its list of best resorts, July 1965 | Quoted in Bon Appetit, 1966, and on the old site as "top 10, 1967," whose wording and year look garbled. Check Time's archive |

**Lore: only the lodge's own telling, or press repeating it**

- River Ranch began as the 1888 building. The old site merges the Inn and the Lodge into one; Bon Appetit treats them as two buildings. The California newspaper archive blocked automated searches, so old papers are untested. Best places to check: the Gatekeeper's Museum in Tahoe City, E.B. Scott's Saga of Lake Tahoe, Placer County deed records.
- Today's building went up in 1950 as a tennis camp. On the lodge's site by 2000, but Bon Appetit's thirties Lodge doesn't mention it, and the only tennis in that article is a joke game in the snow. The old courts across the river are about a quarter mile from the lodge, per management, so they don't tie it to the lodge. Left off.
- Deer Park Inn built in 1888. In print by 1966 (Bon Appetit), but Wertheim, citing Saga of Lake Tahoe, says 1880, and the exact year hasn't been checked against a record.
- The inn on the narrow gauge from the start. Later versions blur this; Bon Appetit has it right that the railway came afterward. The railway opened in 1900.
- Foreign diplomats used the lodge as headquarters at the 1960 Olympics. On the lodge's own site by 2000, with no independent source.
- Popular until the Great Depression. Plausible, not documented.
- Top 10 in 1967. That wording is only on the old site; see the Time row above for what Bon Appetit reported.
- River Ranch Rats. Only on the old site, but Bon Appetit has a "River Rat Race" through the rapids in 1966, which may be the root. Left off at management's request.
- STS9 played here, and concerts before 1997. Hearsay. Maceo Parker (June 26, 2008) appears only on Songkick.
- Built around 1925. Only from a 2013 Sierra Sun story on the sale listing, which also dates the outdoor patio and second dining room to the 1980s.

**1950 to 2011, for other pages**

- 1972: new owners, then a 50-seat wooden-booth restaurant (Sierra Sun, 2007).
- 1973: Truckee River Rafting starts; the float ends at River Ranch (company listings).
- 1980s: patio and second dining room built (Sierra Sun, 2013); Riverview Room added 1986 (Moonshine Ink, 2012).
- 1982: after the avalanche closed Highway 89, one employee cooked and served dinner alone and customers bussed their own tables (Moonshine Ink, 2012).
- About 1989: snow sculpture contest begins; inferred, since a 2020 listing calls it the 32nd annual (Visit Tahoe City).
- About 1993: the Under the Stars Concert Series begins; inferred, since 2010 was the 18th annual (Lake Tahoe News).
- About 2004: Truckee Duckee Derbee begins; inferred, since 2010 was the seventh (Lake Tahoe News).
- 2024: Alpine Meadows alumni reunion on the patio, with live '80s music (Palisades Tahoe).
- May 2000: the patio already hosts weddings and receptions, up to 150 guests (archived site).
- October 2000: the site calls River Ranch "the final destination of most raft trips on the Truckee River."
- 2002: raft rental page sells a 5-mile float from Tahoe City that "exits directly into the River Ranch landing."
- 2006: site mentions "an occasional high-spirited concert"; fact sheet lists the River Rum Punch.
- 2014: "hundreds of people end their Tahoe City raft floats on the River Ranch deck" on summer weekends (Lake Tahoe News).
- 2017 to 2020: Wild Winter Wednesdays listings, with happy hour, raffles, music and nonprofit benefits (Visit Tahoe City).

**Where the old story came from (Wayback Machine)**

- October 2000: the lodge's site already has 1888, Deer Park Inn, the narrow gauge, the 1950 rebuild, the tennis camp and the diplomats. The author isn't known.
- 2006: a press release repeats it. Local press then repeats similar wording in 2007 and 2012, so those articles aren't independent confirmation.
- 2017 to June 2019: the site still says Deer Park Inn, with no Time magazine or Rats.
- August 2020: the /history page now says Deer Park Lodge and adds Time magazine, the Rats and the San Francisco Who's Who line. Captures between those dates weren't checked for the exact change.
- These additions weren't invented. Each has a root in the 1966 Bon Appetit page framed on the wall, though some details were garbled along the way.
