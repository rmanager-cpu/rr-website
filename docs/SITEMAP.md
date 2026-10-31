# Site map (decided with management, 2026-10-31)

One site on riverranchlodge.com: the homepage story, three sections, and a small shared layer. Every
page uses the homepage's look (fonts, brush headings, framed photos). Each section has its own color,
taken from its frame on the homepage: Stay snow paper, Dine evergreen, Celebrate sugar pine.

The header is the same everywhere: River Ranch · Stay · Dine · Celebrate · Book. Inside a section, a
slim second row shows that section's tabs.

## Home `/`
The scroll story (hero, Stay, Dine, Celebrate), then Visit (hours, address, email sign-up).

## Stay `/stay`  (main button: Book a Room)
| Tab | Address | What's on it | Comes from |
|---|---|---|---|
| (main) | `/stay` | The lodge in short, best rooms, Book | current /stay |
| Rooms | `/stay/rooms` | Room types, photos, amenities; one page per type | current /stay rooms section |
| Packages | `/stay/packages` | Ski & stay and seasonal deals | new content |
| Guest Info | `/stay/guest-info` | Check-in/out, policies, parking, pets, skiing & nearby, Ski Butlers, questions | current Good to know, Nearby, FAQ |

Booking: our own pages. Never a straight link to BookingCenter's screens; once the BookingCenter API
keys arrive, booking runs on the API inside our pages. What Book does until then is still open.

## Dine `/dine`  (main button: Reserve a Table, OpenTable)
| Tab | Address | What's on it | Comes from |
|---|---|---|---|
| (main) | `/dine` | The restaurant and bar in short, hours, Reserve | current /dine |
| Menus | `/dine/menus` | Every menu, dish pages, happy hour, Order Online | current /menus, /order |
| Wine | `/dine/wine` | Wine list, Johanson Family Wine | current /johanson-family-wine |
| Happening | `/dine/happening` | Calendar: concerts, karaoke, prime rib night, holiday hours; one page per event | current /events |

Printed menus stay a staff tool in /admin (layout on hold until the two-page holders are described).

## Celebrate `/celebrate`  (main button: Plan Your Event)
| Tab | Address | What's on it | Comes from |
|---|---|---|---|
| (main) | `/celebrate` | Everything we host; private dining and corporate/groups live here, not on pages of their own | current /celebrate |
| Weddings | `/celebrate/weddings` | Ceremony and reception on the river, packages, preferred vendors | current weddings section |
| Spaces | `/celebrate/spaces` | Each room or area: photos, capacity, layouts | current "The rooms" section |
| Plan | `/celebrate/plan` | Availability and the inquiry as one flow: pick a date, then "What are you planning?" (Wedding / Private dinner or party / Corporate or group / Other); goes straight into Venio's Leads. Later, instant booking on the set dates. | current planner |

## Shared (footer and the "More" menu)
| Page | Address | Notes |
|---|---|---|
| History | `/history` | The River Ranch story with The Wall built into the page |
| Loyalty & Gift Cards | `/loyalty-and-gift-cards` | One page, titled exactly that |
| Careers | `/careers` | |
| Visit | `/visit` | Directions, hours, contact |

## When pages move
Every current address 301s to its new home (e.g. `/menus/dinner` → `/dine/menus/dinner`,
`/events/zombie-karaoke` → `/dine/happening/zombie-karaoke`, `/johanson-family-wine` → `/dine/wine`,
`/loyalty` → `/loyalty-and-gift-cards`), and the old-site redirects in `site/next.config.mjs` are
re-pointed straight to the final pages (no redirect chains). The sitemap and structured data follow.
