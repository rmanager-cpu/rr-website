# River Ranch: inventory of the current websites

Researched 2026-10-16. Read-only: no forms submitted, no sign-ins.

**How it was read.** riverranchlodge.com (Popmenu) returns HTTP 403 to direct fetches, because of Popmenu's bot protection. It was read through a public reader proxy (r.jina.ai). Several Popmenu "custom pages" lazy-load their sections and showed only "Load More Content" placeholders, so their body copy could not be captured. Those pages are marked **[NOT CAPTURED]** and need a manual look in a browser (or a copy-paste from Popmenu's admin) before the rebuild. Its sitemap.xml was readable directly. rrbanquets.com (Squarespace) was read directly. The Wayback Machine and archive.ph are not reachable from this environment. Page source was not visible, so analytics and pixels could not be confirmed (see section 4).

---

## 0. Domains, hosting, registrar (public RDAP)

| Domain | Registrar | Nameservers (DNS host) | Created | **Expires** | Site platform | Status today |
|---|---|---|---|---|---|---|
| riverranchlodge.com | **Network Solutions, LLC** | AWS Route 53 (ns-279.awsdns-34.com, ns-764.awsdns-31.net, ns-1503.awsdns-59.org, ns-1993.awsdns-57.co.uk) | 1998-10-28 | **2026-10-27 (11 days from now)** | **Popmenu** (images on popmenucloud.com, account slug `ayucilos`; "Powered by Popmenu" footer; Level Access accessibility badge) | Live. Returns 403 to bots. |
| rrbanquets.com | Squarespace Domains LLC | Google Cloud DNS (ns-cloud-b1..b4.googledomains.com) | 2025-11-16 | 2026-11-16 | **Squarespace** (images.squarespace-cdn.com, site id `6919555bee5c5b4f69c9ef43`; robots.txt header "Squarespace Robots Txt") | Live; being shut down in about a week |
| rrweddings.com | Squarespace Domains LLC | Google Cloud DNS (ns-cloud-e1..e4.googledomains.com) | 2025-11-09 | 2026-11-09 | Unknown (Squarespace-registered) | **404 confirmed** on both www and the bare domain |

Notes:
- **URGENT: riverranchlodge.com expires 2026-10-27.** Status is "client transfer prohibited" (the registrar lock). RDAP does not show whether auto-renew is on. Someone must log into Network Solutions and confirm renewal now. Network Solutions is the registrar and Route 53 is the DNS host, so the domain needs an AWS account login as well.
- rrbanquets.com and rrweddings.com were both registered in Nov 2025 through Squarespace Domains. If the Squarespace *site* is cancelled, the *domains* keep resolving only as long as the domain registrations are kept. Keep both domains registered and point them at 301 redirects. Do not let them lapse: rrweddings.com is already a 404 lead leak.

---

## 1. riverranchlodge.com (Popmenu)

### 1.1 Page tree
Source: the sitemap, which has only `<loc>` and `<priority>` and no lastmod dates, plus the nav.

The main nav is History · Menus · Stay ▾ · More ▾ · Become a VIP · Sign In · Plan Event ▾ · Play ▾ · Contact. The dropdown sub-links were not captured, apart from Stay → Know Before You Go and More → Contact. A top banner currently reads "Win $500! … Drawing 11/1" and links to /reviews.

```
/                         Home
/history                  History                       [NOT CAPTURED]
/menus                    Menus index                   [NOT CAPTURED – lazy]
  /menus/dinner
  /menus/tuesday-dinner-menu
  /menus/happy-hour
  /menus/patio-lunch
  /menus/weekend-lunch
  /menus/weekend-breakfast
  /menus/kids-menu
  /menus/dessert
  /menus/beverages
  /menus/wine-list
  /menus/merchandise        (apparel + gift cards)
  /menus/our-rooms          (lodge room types shown as a "menu")
  /menus/mothers-day-brunch-2022   (STALE)
/items/<slug>             ~247 individual dish / wine / room / merch pages (Popmenu item pages)
/book-a-room              Book A Room                   [NOT CAPTURED – lazy; booking engine unknown]
/lodge-info               Lodge Information (rates, amenities, PDFs)
/know-before-you-go       Know Before You Go            [NOT CAPTURED]
/local-activities         Local Activities
/ski-butlers              Ski Butlers rental partner
/private-parties          → shows rrbanquets.com content (see problems)
/weddings                 Weddings                      [NOT CAPTURED]
/live-music               Live Music
/snowfest                 Snowfest voting
/love-your-lodge          Love Your Lodge               [NOT CAPTURED]
/join-our-team            Join Our Team                 [NOT CAPTURED]
/reviews                  Raves & Reviews (Popmenu dish reviews + giveaway)
/contact                  Contact
/order                    Popmenu online ordering ("No menus available")
/accessibility            Website Accessibility statement (not in sitemap)
/files/lodge-map-pdf.pdf, /files/lodgemapmaster-pdf.pdf, /files/lodgepoliciespdf-pdf.pdf
```

### 1.2 Per page: purpose and content worth keeping

**Home** (title "Home - River Ranch Lodge, Bar & Restaurant, Lake Tahoe")
- H1 "River Ranch Lodge & Restaurant". Welcome copy: a historic Alpine-style lodge on the Truckee River with 19 boutique rooms, a riverside restaurant with a cantilevered dining room and bar, a second interior dining room with a stone fireplace, and a seasonal riverfront patio. It pitches vacations, dinners, weddings, reunions and private events.
- There is a background video (Popmenu-hosted) and buttons for View Our Menus, Book A Room, Book A Table, and Leave a Review. **"Book A Table" only jumps to `/#location`**; there is no reservation widget.
- Dish-review cards (Brussels & Shishitos, Top Sirloin, Ranch Stroganoff).
- The "Hours & Info" block says hours change with the seasons. It lists weekend breakfast Sat–Sun 8–12, patio lunch Fri–Sun from noon, and dinner "5–8/9 PM nightly, reservations recommended".

**Restaurant hours (identical on Contact, Live Music, Snowfest, Accessibility)**
- Mon–Thu: dinner 5–9 pm
- Fri: lunch 12–5, dinner 5–9
- Sat–Sun: breakfast 8–12, lunch 12–5, dinner 5–9
- Happy hour (menu page): Mon–Fri 3–5 pm, dine-in only, not on holidays

**Contact**
- Phone (530) 583-4264
- Lodge: frontdesk@riverranchlodge.com
- Restaurant: info@riverranchlodge.com
- Events: events@riverranchlodge.com
- Address: 2285 River Rd, Tahoe City, CA **96146**, under the location label "Alpine Meadows, CA"
- Static Mapbox map image linking to a Google Maps *search* (query_place_id is empty)
- No contact form
- Social: facebook.com/riverranchlodge, instagram.com/riverranchlodge

**Lodge Info**
- Seasons and nightly rates (rates may change):
  - Peak: Winter 2026/27, Dec 11 to Apr 10; Summer 2026, Jun 5 to Sep 19.
    - Sun–Thu $160–210 · Fri–Sat $180–230 · Holidays $190–250
  - Off: Fall 2026, Sep 20 to Dec 10; Spring 2027, Apr 11 to Jun 3.
    - Sun–Thu $140–190 · Fri–Sat $160–210 · Holidays $190–250
- Rate terms: the rate covers 1–2 guests, and each extra guest over 12 is $10/night. Taxes are 10% Placer County TOT plus 2.5% TBID. Dogs are allowed only in designated rooms for a $25 fee, arranged in advance. The lodge is non-smoking and has no A/C.
- Amenities: 19 rooms furnished in lodge-pole pine, hickory, birch and antiques. Most have river views. There are 7 balcony rooms, 3 deck rooms, 9 dog-friendly rooms and 3 budget rooms.
- In-room: en-suite bath (mostly shower/tub), flatscreen TV with HDMI, free Wi-Fi, Keurig, mini-fridge (most with freezer), hair dryer, iron and board, spare fan and blankets. There is no microwave in rooms; one is available at breakfast.
- Services: complimentary grab-and-go breakfast year-round "when occupancy allows". The bar and restaurant are open nightly. The summer patio bar and grill is open daily, so rooms near it may get noise. Free public-transit drop-off and pickup on site, with hours that vary by season.
- Links to the Lodge Map PDF (two different files are linked) and the Lodge Policies PDF.

**Lodge Policies PDF** (`/files/lodgepoliciespdf-pdf.pdf`, undated)
- Deposit is one night plus tax, taken at booking.
- Cancellation needs 7 days' notice in summer, winter and holidays, and 3 days in spring and fall. A cancellation inside the window forfeits the deposit, and no refunds are given for weather or a short ski or rafting season.
- Leaving early is charged one additional night.
- Check-in is 3 pm; call if arriving after 5 pm. Check-out is 11 am, and late check-out may carry a fee. Guests must be 18+ with ID.
- Rooms have stairs and there is no elevator. Everything is non-smoking.
- Dogs: allowed only in select rooms, maximum 2, $25 plus tax per night. No dogs in inside-access or upstairs balcony rooms, and dogs may not be left unattended. Owners pay for damages and extra cleaning, and there is a $200 fee for an undisclosed pet.
- Skis, boards, rafts and bikes are not allowed in rooms. Ski lockers are available in winter and bike racks in summer; guests bring their own lock.
- Parking is free and unassigned, shared with the restaurant.

**Our Rooms** (`/menus/our-rooms`, Popmenu "menu" of room types; no prices or booking links)
1. King Bed, Balcony Over Patio
2. King Bed, Over Patio (1 dog room)
3. King Bed, Ground Floor ADA
4. 2 Queen Beds, Balcony Over River
5. Budget Room Over Kitchen, River View
6. Budget Room Off Parking Lot (dogs OK)
7. King Bed, Deck on Terrace (dogs OK; limited privacy in summer)
8. King Bed, Ground Floor (dogs OK)
9. King Bed, Balcony Over River
10. 2 Queen Beds, Over Patio (1 dog room)
11. Budget Room Over Bar & Kitchen

Most room cards carry "possible noise" notes where they apply.

**Book A Room**: [NOT CAPTURED]. **The lodging booking engine vendor could not be identified** because the widget lazy-loads. A third-party listing says reservations are "guaranteed with a credit card". The vendor and URL must be confirmed with the owner or in a browser.

**Menus** (Popmenu; prices are public). Samples:
- Dinner starters: Soup $9/$12, Greek or Caesar salad $12/$17, Brussels & Shishitos $12/$17, Ahi Poke $25, Wings $18, Chophouse Burger $24, Wedge $16, Hummus $17, Calamari $18, Poutine $16, Ranch Nachos $20. Add-ons: bacon $3, chicken $7, prawn $12, tenderloin $12.
- The Tuesday dinner menu differs: Wings $16, Calamari $23, Autumn Farm Salad $16 under a "summer-farm-salad" slug, and a cheese plate $22.
- Happy hour: soup $6/$8, Brussels $11, Poutine $12, Burger $13, Caesar $11, Fries $6, Wings $13, Nachos $15.
- Weekend breakfast, **8–11 AM** Sat–Sun: Steak & Eggs $36, Benedict $25, items around $18, Biscuits & Gravy $14, Granola $12.
- Wine list: about 80 bottles (California and Oregon, Champagne, dessert wines). Cocktails, beer and NA are in the sitemap item slugs.
- Mother's Day Brunch 2022 is still published.

**Merchandise and gift cards** (`/menus/merchandise`)
- Apparel: tees $20–29, hoodies and quarter-zips $58, youth hoodie $35. Prices include tax and shipping is extra.
- Restaurant Gift Card: $25–$200 in $25 steps, valid on food, beverage and merchandise.
- Lodge Gift Certificate: $50, $100, $150, $200, $250 or $500, valid on lodging, tax and room charges.
- The purchase path is not visible. It appears to go through Popmenu item pages and /order, but **/order currently says "No menus available – check back later"**, so online gift-card and merch purchase may be broken.

**Local Activities**
- Skiing: billed as the closest lodging to Palisades Tahoe (formerly Squaw Valley and Alpine Meadows). Snowshoe the Truckee River trail; après-ski fireplace lounge. Links: palisadestahoe.com and skibutlers.com/portal/riverranchlodge.
- Rafting: a 2–4 hr float from Tahoe City to River Ranch, then lunch on the patio, May–Sep weather permitting, dogs welcome. Partners: **Truckee River Raft Co. (truckeeriverraft.com)** and **Truckee River Rafting (truckeeriverrafting.com)**.
- Biking: paved path about 3.5 mi each way. Shops: Factory Bike (squawbikes.com), Olympic Bike (olympicbikeshop.com), Willard's (willardsportshop.com). The last two use http links.

**Ski Butlers**: rentals delivered to the room, free on-mountain swaps and end-of-stay pickup, 10% off for River Ranch guests, no cancellation fees, and same-day is unlikely. Phone 530-582-8277. Link: skibutlers.com/portal/riverranchlodge. The copy still mentions COVID-19 distancing.

**Private Parties** (`/private-parties`): renders the **rrbanquets.com** homepage ("RRBanquets | Reserve Your Private Event Today") with "Book Now" links to https://www.rrbanquets.com/book. Either Popmenu redirects this page to rrbanquets.com or it is an external link. **It will break when Squarespace is shut down.**

**Weddings, History, Know Before You Go, Love Your Lodge, Join Our Team**: [NOT CAPTURED].
- From third-party listings: the lodge was built in **1888**. The patio seats about 150 for ceremonies and receptions in warm months, the indoor Alpine Dining Room holds 35 seated year-round, and the maximum is about 175.
- Wedding-Spot shows a full patio buyout at $7,500, a partial patio at $5,000, an indoor buyout at $1,500 off-season and $3,000+ peak, and the fireplace room at $750, with a "from $18,006 for 50 guests" headline. These may be stale; check with the owner.

**Live Music**: "August Concert Series Lineup", Mondays 6–10 PM, with no year and no performers. The calendar says "No upcoming events". This is stale for October.

**Snowfest**: a "Vote Here" button to a Google Form (docs.google.com/forms/d/e/1FAIpQLSe7_EljhqjpfiqY0jFqanj5ZK7fCIYGUfv9e2T_Jub3ZDpdEw/viewform). It is undated and probably a past year's event.

**Reviews** ("Raves & Reviews"): Popmenu dish-review form (location, item, review, email). Popmenu sponsors the monthly drawing, and the "Past Drawing Winners" list is a shared Popmenu-network list that includes other restaurants. The banner says "Win $500 … Drawing 11/1". Item links use `?location=alpine-meadows-ca`. Some review links point to slugs that are not in the sitemap (`famous-ranch-nachos`, `alpine-poutine`) and may 404.

**Accessibility**: a standard Popmenu accessibility statement. Requests go to info@riverranchlodge.com.

**Order**: Popmenu online ordering, currently empty.

### 1.3 Third-party integrations (riverranchlodge.com)

| Function | Vendor / URL | Notes |
|---|---|---|
| Website, menus, item pages, reviews, VIP list and loyalty ("Become a VIP", "Sign In"), online ordering | **Popmenu** (get.popmenu.com, popmenucloud.com/ayucilos/…) | The VIP email list and guest data live in Popmenu. **Export it before cancelling.** |
| Restaurant reservations | **OpenTable**: opentable.com/river-ranch-lodge-and-restaurant (rid **27631**) | It is listed on OpenTable, **but the site's "Book A Table" button does not link to it**. It only jumps to /#location. |
| Lodging booking engine | **UNKNOWN** (lives on /book-a-room, which lazy-loads) | Needs the owner or a browser to identify it |
| Gift cards | Popmenu item pages (restaurant gift card, lodge gift certificate) | The checkout path is unclear and /order is empty |
| Ski rentals | Ski Butlers partner portal: skibutlers.com/portal/riverranchlodge | Keep; 10% guest discount |
| Rafting | truckeeriverraft.com, truckeeriverrafting.com | Keep; ties to the "rafting pivot" switch |
| Ski resort | palisadestahoe.com | |
| Bike shops | squawbikes.com, olympicbikeshop.com, willardsportshop.com | Re-verify that they are still in business |
| Maps | Static Mapbox/OSM image plus a Google Maps search link | No embed and no place ID |
| Forms | Snowfest Google Form; Popmenu review form | No contact or inquiry form on the main site |
| Accessibility | Level Access badge (Popmenu partner) | |
| Social | facebook.com/riverranchlodge, instagram.com/riverranchlodge | |
| Analytics / pixels | Not verifiable (page source blocked) | Popmenu normally injects its own analytics and may carry GA or Meta pixels. Ask the owner for any GA4 property or Meta pixel IDs. |

### 1.4 Images and branding
- Photos: dish close-ups (review cards), lodge room interiors ("Lodge Room"), a dog-on-the-porch image (alt "Dog Ears"), mountains, river rafting, biking on trails, and a homepage hero video.
- Two logo PNG variants on popmenucloud (header and footer). A 2017 logo ("logo_2017_trans_whitetype_bluestroke", white type with a blue stroke) appears on Tahoe Quarterly.
- Alt text is mostly generic ("Image 1", "Image 2").
- Colors and fonts: not readable without page source. Use the palette in docs/DESIGN.md (estimate PDF plus the old widget).

---

## 2. rrbanquets.com (Squarespace; shutting down soon)

### 2.1 Page tree
From the sitemap; every lastmod is 2025-12-23. The nav is Menus · Availability and Booking · FAQs · Custom Inquiry · Cart.

```
/ (= /home)        Private Dining landing
/menus             Base / Enhanced / Premium menus
/book              Availability and Booking (4-step instant-booking wizard)
/faqs              FAQs
/custom-inquiry    Custom Inquiry ("Tell us your plans")
/about             Placeholder template page (not in nav)
/ski-stay          "Ski + Stay" (empty; not in nav)
/success           Deposit-paid confirmation
/fail              Payment-failed page
/store             Empty Squarespace store ("Store 2", bad lastmod year 57949)
/cart              Squarespace cart (empty)
```

### 2.2 Per page
- **Home**: titled "RRBanquets | Reserve Your Private Event Today", with H2s "Private Dining" and "A smarter way to book private dining." The copy says to book in minutes, "even from a chairlift": pick a date and menu, and staff follow up. Book Now goes to /book.
- **Menus**: soup, salad and dessert are included with every tier.
  - Soup: mushroom bisque or soup of the day. Salad: farm or Caesar. Dessert: cheesecake, flourless torte, fruit crisp or crème brûlée. Appetizers are à la carte.
  - **BASE $69/guest**: Mary's half chicken, mahi mahi, Chophouse burger, stuffed delicata squash (GF/V), Ranch Stroganoff.
  - **ENHANCED $89**: 8 oz prime top sirloin, pumpkin ravioli, delicata squash, bison short ribs, catch of the day.
  - **PREMIUM $119**: NZ elk chop, 16 oz prime ribeye, diver scallops, braised lamb shank, delicata squash.
- **Book (the old booking wizard)**:
  - Minimums: weekday $2,000, weekend/holiday $4,000, with separate April minimums. Tax and gratuity are extra.
  - Deposit is **10% of the minimum spend**. Bar is billed on consumption. The calendar is indoor private dining only; patio dates are released in spring.
  - Step 1: name, email, phone. Step 2: guests 13–50 and start time 5:00–8:00 PM in half-hour steps, plus notes. Step 3: menu tier (Base, Enhanced, Premium or "decide later"). Step 4: T&C checkbox, then "Continue to Pay Deposit & Complete Booking", which redirects to /success or /fail.
  - The payment provider is not named on the page. Per project notes it is Apps Script plus Stripe.
  - Per project notes the calendar still shows Dec 2025, all "Not available".
- **FAQs**: 13 Q&As. Keep the facts:
  - Event types: corporate, holiday, ski groups, rehearsal dinners, receptions, birthdays.
  - Instant booking covers 13–50 guests. Groups over 50, buyouts and weddings go to custom inquiry.
  - Follow-up within 1–3 days.
  - Patio dates are weather-dependent and released late winter or early spring, with indoor as backup.
  - **No room or site fees.**
  - **22% gratuity**, shared across kitchen, servers, bartenders, hosts, bussers and setup crew.
  - **7-day minimum notice.**
  - The date is held only on deposit. One tier per event. Dietary needs are accommodated.
  - Deposit is 10% of the F&B minimum. Cancellation: 7+ days, refund minus a $50 fee; 6–3 days, 50% of the deposit; within 48 h or no-show, the full minimum is charged.
  - ADA accessible, with a private lot (parking not guaranteed in peak season or storms).
- **Custom Inquiry**: heading "Tell us your plans". The form fields did not render in the capture; it is likely a Squarespace form block, and its destination needs a check in Squarespace. Image: a bottle of Johanson Cabernet 2021.
- **About**: an unfinished template with "Placeholder" alt text and generic venue copy. **Ski + Stay**: empty. **Store**: empty.
- Footer on every page: events@riverranchlodge.com · 530-583-4264 · 2285 River Road, Tahoe City, CA **96145** · Facebook · Instagram (the link is instagram.com/riverranchlodge.com, which is wrong; see problems).

### 2.3 Integrations
- Squarespace commerce (cart and store, unused).
- Payment: Stripe via Apps Script per project notes, returning to /success or /fail.
- Squarespace form on /custom-inquiry (unverified).
- Squarespace image CDN.
- robots.txt blocks AI crawlers (ClaudeBot, GPTBot and others; Squarespace's "block AI crawlers" setting).

### 2.4 Images
- Hero "PrivateDiningHero2.png" and "Private Dining (1).png".
- FAQ images: a lakeside cabin walkway, a steak with mashed potatoes, a wine-set dining table, a fireplace dinner table, and the bar with booths and garland.
- Wine bottle with candle (Custom Inquiry).

---

## 3. rrweddings.com
- **404 confirmed** on www and the bare domain. The domain is still registered at Squarespace Domains (Google Cloud DNS) until 2026-11-09.
- No live pages, so no content. It is a lead leak for anyone with old cards, listings or emails.
- No third-party directory found linking to it in this pass. Visit Placer links to riverranchlodge.com/weddings/ instead.

---

## 4. Problems found
1. **riverranchlodge.com expires 2026-10-27.** Confirm auto-renew at Network Solutions today.
2. **/private-parties on the main site depends on rrbanquets.com.** It breaks when Squarespace goes.
3. **"Book A Table" goes nowhere.** It jumps to /#location even though OpenTable rid 27631 exists.
4. **/order is empty** ("No menus available"), so gift-card and merch purchase is likely broken.
5. **ZIP and town are inconsistent.** The main site uses Tahoe City **96146** under an "Alpine Meadows, CA" label. rrbanquets, Wedding-Spot and Visit Placer use **96145**. Tahoe Quarterly uses "Alpine Meadows 96146". Pick one; 2285 River Rd is normally given as Tahoe City / Alpine Meadows 96146, so confirm with USPS.
6. **Hours are inconsistent.**
   - Weekend breakfast is 8–12 on the hours block but **8–11 AM** on the breakfast menu.
   - The home block says dinner "5–8/9 PM" and "Patio lunch Fri–Sun". In October the patio is likely closed, yet the hours still show lunch Fri–Sun.
   - OpenTable (search snippet) says dinner daily 5–9.
7. **Cancellation rules contradict each other on rrbanquets.**
   - /book says that 6–3 days out you get "50% of the minimum spend" back.
   - The T&C says 3–6 days is a 50% refund and anything within 3 days gets no refund.
   - The FAQ says 6–3 days is 50% of the deposit and "within 48 hours" is the full minimum.
8. **Stale content:**
   - Mother's Day Brunch 2022 menu.
   - Live Music "August Concert Series" with no year and an empty calendar.
   - Snowfest voting with no date.
   - Ski Butlers copy mentions COVID-19.
   - The Tuesday menu "Autumn Farm Salad" sits under a "summer-farm-salad" slug.
   - rrbanquets /about has placeholder text, and /ski-stay and /store are empty.
   - The rrbanquets calendar is stuck at Dec 2025, per project notes.
9. **Price drift between menus.** Wings are $18 on dinner and $16 on Tuesday dinner; calamari is $18 and $23. It is unclear which is current.
10. **Two different Lodge Map PDFs** are linked on /lodge-info.
11. **Wrong Instagram link on rrbanquets**: instagram.com/riverranchlodge.com. The main site uses instagram.com/riverranchlodge.
12. **Stray space in the mailto** for frontdesk@ on /contact.
13. **Possible 404s**: review links to item slugs that are not in the sitemap (`famous-ranch-nachos`, `alpine-poutine`).
14. **Old inbound URLs**: Visit Placer links to riverranchlodge.com/weddings/ and /events/. /events is not in the current sitemap and is likely a 404.
15. **Mixed event pricing in public listings.** Wedding-Spot shows a $1,500–$7,500 "buyout" and "fireplace room" price structure. rrbanquets says no site fees, $2k/$4k minimums and per-person tiers. **Those listings need updating after launch.**
16. **No contact or inquiry form on the main site.** Event leads depend on rrbanquets (going away) or plain email.
17. **Wrong location label.** Popmenu's location is "Alpine Meadows, CA" and its slug `alpine-meadows-ca` appears in URLs.
18. **Weak alt text** everywhere ("Image 1", "Placeholder").

## 5. SEO basics
- **Title pattern (main site)**: "<Page> - River Ranch Lodge, Bar & Restaurant, Lake Tahoe" (for example "Book A Room - …", "Menus - …"). Several pages capture only as their bare page name.
- **Title pattern (rrbanquets)**: "<Page> | <tagline> — RRBanquets", for example "Menus | Discover & Book Your Ideal Menu — RRBanquets".
- **Meta descriptions**: not visible in the captured text on either site; check in a browser.
- **Schema.org**: not verifiable (source blocked). Popmenu usually emits Restaurant JSON-LD; Squarespace emits basic LocalBusiness and WebSite JSON-LD. **Plan for the new site**: LodgingBusiness plus Restaurant, menus, OpeningHoursSpecification, Event (live music), and FAQPage.
- **Google Business Profile**: no GBP link on either site. The main site links only to a Google Maps *search* URL. Owner to confirm GBP ownership and which website URL GBP points to.
- **Sitemaps**: the main site has about 264 URLs, about 247 of them thin Popmenu /items/ pages. The rrbanquets sitemap has a broken lastmod on /store.
- **External listings pointing at the site**: Tahoe Quarterly (http://riverranchlodge.com), Tahoe.com (https://riverranchlodge.com/), Visit Placer (/weddings/, /events/), OpenTable, Yelp, TripAdvisor (separate hotel and restaurant listings), Wedding-Spot (phone only), NLTRA member directory (its SSL certificate has expired).

## 6. Redirect map (old URL → new site)

Suggested targets; adjust to the final page names.

**riverranchlodge.com (Popmenu paths)**
| Old | → New |
|---|---|
| /book-a-room, /menus/our-rooms, /items/*-bed-*, /items/budget-room-* | /stay (or /stay/rooms) |
| /lodge-info, /know-before-you-go, /files/lodgepoliciespdf-pdf.pdf | /stay/policies (keep a policies PDF path or 301 it) |
| /files/lodge-map-pdf.pdf, /files/lodgemapmaster-pdf.pdf | /stay (map) |
| /menus, /menus/* (dinner, tuesday-dinner-menu, happy-hour, patio-lunch, weekend-lunch, weekend-breakfast, kids-menu, dessert, beverages, wine-list) | /menus (or /menus/<same-slug>) |
| /menus/mothers-day-brunch-2022 | /menus |
| /items/* (dish, wine and cocktail pages) | /menus |
| /menus/merchandise, /items/*gift*, /items/* (merch), /order | /gift-cards (and /shop if merch is kept) |
| /private-parties, /weddings, /weddings/, /events, /events/ | /events (private dining and weddings) |
| /history | /about (or /history) |
| /local-activities, /ski-butlers, /snowfest, /live-music | /explore (activities) and /whats-on (music and events) |
| /reviews, /love-your-lodge | / (or /about) |
| /join-our-team | /jobs |
| /contact, /accessibility | /contact, /accessibility |

**rrbanquets.com (whole domain; keep the domain registered)**
| Old | → New |
|---|---|
| / , /home, /about | riverranchlodge.com/events |
| /menus | riverranchlodge.com/events/menus |
| /book | riverranchlodge.com/events/book (new instant-booking view) |
| /faqs | riverranchlodge.com/events/faq |
| /custom-inquiry | riverranchlodge.com/events/inquire (inquiry form → Leads) |
| /ski-stay | riverranchlodge.com/stay |
| /success, /fail, /store, /cart, everything else | riverranchlodge.com/events |

**rrweddings.com (whole domain)** → riverranchlodge.com/events (or /weddings). Point the domain at the redirect now, because it is 404 today.

## 7. Open questions for the owner
1. Is **auto-renew on** for riverranchlodge.com (Network Solutions, expires Oct 27)? Who has the Network Solutions and AWS Route 53 logins?
2. **Which lodging booking engine** is behind /book-a-room, and what is its booking URL? Does its contract tie it to Popmenu?
3. **Popmenu contract**: when does it end, is there a cancellation notice period, and can we export the VIP/loyalty email list, reviews and menu data?
4. **Gift cards**: how are they sold today (Popmenu, Toast, or in person)? Toast has native e-gift cards; should the new site link there?
5. Online ordering: is it wanted at all (Toast Online Ordering), or should /order be dropped?
6. Reservations: should "Book a Table" go to OpenTable (rid 27631), or is a move to Toast Tables planned?
7. **Official address line**: Tahoe City or Alpine Meadows, and 96145 or 96146?
8. **Current hours**, including whether the patio lunch runs in winter, and breakfast 8–11 vs 8–12.
9. **The one cancellation and deposit policy** for events. Three conflicting versions exist on rrbanquets; ties to the pricing-rules revisit.
10. Weddings: what should the new page say (capacities, spaces, pricing approach)? The Wedding-Spot numbers look out of date.
11. Are Snowfest, the Live Music series, Ski Butlers, and the three bike shops still active?
12. Is there a GA4 property, Meta pixel, or Google Business Profile login to carry over?
13. Where do the rrbanquets Custom Inquiry submissions currently go (Squarespace form storage or email)?
14. Hiring: what should /jobs use (7shifts hiring, or an email)?
15. Photos: is there an original photo library? Current images are Popmenu and Squarespace uploads.
