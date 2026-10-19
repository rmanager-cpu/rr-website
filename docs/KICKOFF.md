# Kickoff: the new riverranchlodge.com

Started 2026-10-16, carried over from the rr-events session where it was planned.

## Why now
- **rrbanquets.com** (Squarespace) is being shut down within about a week. It hosts the "Detailed
  Contact Form", which only reached rmanager@. In the Oct 15 inbox sweep, 12 of 13 recent form inquiries
  had no reply there: the biggest lead leak found. It also hosts a broken Dec-2025 booking wizard that
  shows every date "Not available".
- **rrweddings.com**: its Google Workspace was cancelled Oct 2, 2026 and the site returns 404. Any
  listing (e.g. Wedding-Spot) or printed material pointing there loses wedding inquiries.
- Alex's timeline: a quick start now, light prep over the weekend (Oct 17-18; Alex is mostly away from
  the computer), the heavy build Monday-Friday, Oct 19-23.

## Decided (Alex, 2026-10-16)
1. **Scope: the whole business.** One site for the lodge rooms, the restaurant & bar, and events &
   weddings. It replaces both riverranchlodge.com and rrbanquets.com.
2. **Look: a fresh direction.** Not the app's palette. Alex likes Webflow's aesthetic and says "we're
   going to have to get a little artsy on this project, which you and I usually don't do together."
   So: lead with photography, typography and motion; propose 2-3 distinct looks (mood, type, color,
   a hero mock each) and let Alex pick before building pages.
3. **Editing: custom (Alex, 2026-10-16: "I think custom. I like Webflow aesthetics.").** Framework not
   settled yet (Alex isn't sold on Astro; Next.js matches the events app). Original notes: Alex was considering Webflow, then asked "how hard would it
   be to make a little backend of my own? A little site builder backend of my own?"
   Claude's take to bring to him:
   - A custom Next.js site on Vercel, plus a small editor of its own for what actually changes (hours,
     menus, specials, events, photos, page text blocks, banners), is very doable: days, not weeks.
     Content in Supabase, images in storage, a password-protected /admin.
   - A full Webflow-style visual page builder (drag anything anywhere) is a months-long product; not
     worth it. Webflow's *look* (big imagery, refined type, scroll motion) is achievable in code.
   - Custom wins on the ties to the events app: the inquiry form posts straight into Leads, the public
     availability calendar and later instant booking read the same engine, "what's on" comes from the
     same calendar.
   Confirm with Alex before scaffolding.

## Must-haves
- **The inquiry form goes straight into Leads** (a small public endpoint on the events app, with spam
  protection), plus a copy to events@. Nothing may depend on someone reading an inbox.
- **Redirects**: every old rrbanquets.com / riverranchlodge.com URL 301s to its new page. No dead links.
- **Email keeps working**: riverranchlodge.com's MX (Google Workspace) is never touched.
- Phone-friendly (unlike the internal app, which is desktop-first, the public site is mostly read on
  phones), fast, accessible, good SEO (titles, descriptions, schema.org for LodgingBusiness / Restaurant
  / events, Google Business profile link).

## Later, from the same engine (not for launch unless Alex says)
- Public availability calendar for event spaces.
- Instant booking for private dining in set periods (rebuild of the old wizard; keep its terms: $50 of
  the deposit is always non-refundable; 7+ days out refund minus $50; 3-6 days 50%; under 3 days no
  refund; no-shows charged the full minimum). Never hard-code seasons or prices.
- A "what's on" calendar of public events and specials.
- Lead source tracking: forms carry UTM/source so the events app can report what worked.

## Blockers to start on early
- **URGENT: riverranchlodge.com EXPIRES 2026-10-27** (registry, checked 2026-10-16). Registrar: Network
  Solutions (registered since 1998); DNS on AWS Route 53; the site runs on Popmenu. If it lapses, the
  website AND company email (Google Workspace) stop. Alex to confirm renewal / auto-renew and find who
  holds the Network Solutions and AWS logins. rrbanquets.com (exp. 2026-11-16) and rrweddings.com
  (exp. 2026-11-09) are at Squarespace Domains: keep them and point them at redirects.
- **DNS access for riverranchlodge.com.** The Google Workspace admin is unknown (not Alex). Find the
  registrar (lookup.icann.org) and who holds the login; Google's recovery route is in the rr-events
  notes. Without DNS, the site can't launch on the real domain.
- **Hi-res logo**: the only local copy is 254px; `Hi res LOGO2.eps` is in OneDrive.

## Where things are
- Photos: `C:\Users\Chef\Desktop\River Ranch Images\` (02_Patio_and_Deck, 03_Interior_Dining_and_Bar,
  11_Logos_and_Brand) and `C:\Users\Chef\Desktop\RR Event Gallery` (gallery.json tags each photo's source
  and people; don't publish photos of identifiable guests without checking). Logos also in
  `C:\Users\Chef\Downloads\Images\RRLBRLogo*`.
- The old booking wizard: `C:\Users\Chef\Downloads\RR_Calendar_Booking_Wizard_2025-12-15_original (2).html`.
- An inventory of the current sites (pages, copy worth keeping, integrations like the lodging booking
  engine and restaurant reservations, problems, redirects) is being written to `docs/INVENTORY.md`.

## Progress
- 2026-10-16: The Wall (history wall) built and live; see `docs/HISTORY-WALL.md`.
- 2026-10-17: three homepage looks to pick from, on Alex's photos (private artifact):
  https://claude.ai/artifact/4egnsybpV9S3x8Q9QYaVbH — 1 Firelight (winter night, lamplight, Bodoni
  italic), 2 River Days (summer, river teal + sun, Bricolage), 3 Bulletin (printed matter in the road
  sign's blue, condensed type, artifacts from The Wall). Photo gap: most winter/night hero shots are
  only ~1200px wide; a full-screen hero needs ~2400px originals or a new shoot.

## First steps for this session
1. Read `docs/INVENTORY.md` when it lands.
2. Settle the editing question with Alex (custom + small editor vs Webflow).
3. Propose 2-3 looks with mood references and a hero mock each.
4. Then: sitemap, scaffold, and the inquiry endpoint on the events app.
