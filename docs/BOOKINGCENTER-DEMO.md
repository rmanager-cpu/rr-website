# Private group ski package review

This is demo-only work on `bookingcenter-demo`. Do not merge it into `main`, promote it, or attach a River Ranch production domain.

## Experience

`/demo` contains a password gate and a guest-facing group package widget: dates, a complete room mix, optional lift-ticket people/days, and one itemized total. `/api/demo/review` repeats the availability checks and recalculates on the server. Nothing creates a reservation, inventory hold, ticket, payment, email, or guest record.

The `bookingcenter-demo` deployment serves only the demo and its public assets. Other application pages and APIs, including inquiry and admin routes, return 404. Production routing is unchanged; the new demo page and APIs independently deny production access.

## Configuration

Create these values as **Preview environment variables restricted to `bookingcenter-demo`**. Never give them a Production target or commit them to Git.

| Variable | Purpose |
| --- | --- |
| `DEMO_PASSWORD` | Separate review password, at least 16 characters. Do not reuse the staff password. |
| `DEMO_SESSION_SECRET` | Random signing key, at least 32 characters. |
| `BOOKING_DEMO_ONLY` | `true`, to explicitly isolate the preview routes. |
| `BOOKINGCENTER_API_URL` | Jeff's HTTPS sandbox endpoint. |
| `BOOKINGCENTER_SITE_ID` | `RIVERR` |
| `BOOKINGCENTER_API_KEY` | The sandbox API key, distinct from the WSDL documentation password. |

Keep Vercel Deployment Protection enabled. A Vercel share link also needs the demo password; issuing a link is a separate access decision. Sessions expire after eight hours. Rotating the password or signing key invalidates existing sessions. Login throttling is per process, not a distributed abuse-prevention service; hosting protection remains in place.

For local development only, put these values in ignored `.env.local`. `npm run dev` runs on port 3100. The local UI uses no database or third-party analytics.

## Data and pricing boundaries

- Default mode is an actual BookingCenter **sandbox** read. It is not live production inventory. Missing credentials, wrong property, a production endpoint, failed responses, or unknown nightly rates block the offer. There is no automatic sample fallback.
- The explicitly selected sample walkthrough uses fictional room counts and rates. It includes enough-room, two-room, sold-out and outage scenarios.
- A whole-stay search and every one-night search must agree on a room type and usable rate plan. Capacity must accommodate the requested guests. The smallest count across all searches limits the selection. One-night amounts are summed; whole-stay `Base` values are not assumed to be totals.
- Sample discount: 10% at five rooms. Sample ticket price: $125 per person-day, all-in. Discounted taxes are a proportional estimate. These rules are **not approved commercial terms** and imply no resort partnership.
- Availability is a snapshot, not a hold. Even a successful recheck cannot guarantee against a competing reservation. Production needs confirmed atomic booking/hold behavior, API response semantics, reconciled totals/taxes, payment processing, and lift-ticket inventory/fulfillment.
- The server ignores client-supplied prices. It rejects partial room selections, excessive quantities, unknown types, invalid dates, unsupported occupancy, and excess ticket days/people.

## Verification

Run `npm run typecheck`, `npm run build`, and `node --experimental-strip-types --test tests/demo-package.test.mjs` on Node 24. The package tests cover nightly bottlenecks, missing inventory, common rate plans, invalid rates, incomplete selections, pricing, ticket bounds and stale inventory.

Local HTTP checks also cover authentication, bad passwords, same-origin POSTs, HttpOnly/SameSite cookies, missing credentials, server-side recalculation and tampered cookies. Browser QA uses disposable local fixtures for the actual widget, with separate tests of the password-protected API. Those fixtures must never be committed or deployed.
