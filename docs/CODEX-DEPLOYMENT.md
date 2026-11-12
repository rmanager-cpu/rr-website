# Deploying from Codex

Checked 2026-11-12 against repository commit `5cb7e46`.

## Two different deployment targets

| App | Working directory | Vercel team | Vercel project | URL |
| --- | --- | --- | --- | --- |
| The Wall | `history-wall/` | `turbohospitalitysolutions` | `the-wall-river-ranch` | https://the-wall-river-ranch.vercel.app |
| Main website | `site/` | `turbohospitalitysolutions` | `river-ranch-site` | https://river-ranch-site.vercel.app |

The latest GitHub `main` status points to a successful **main website** deployment.
It does not establish that The Wall deploys on push. No GitHub Actions workflows
are present. Use the Wall's existing CLI procedure until its Vercel Git settings
have been inspected. Before pushing website changes, check the connected Vercel
project's root directory and production branch; pushing can publish the website.

Read `CLAUDE.md` before making changes. Its standing rule is: "Never push to
GitHub or deploy without Alex's explicit yes at the time." Authentication,
project inspection, local builds, and local project linking do not publish.

## What has been verified here

- Checkout: `/workspace/rr-website`, branch `main`.
- Node.js `24.22.1`, npm `11.9.0`, Vercel CLI `65.14.0`.
- `npm ci --no-audit --no-fund` succeeds in `history-wall/`.
- `npm run build` passes TypeScript checking and creates the Vite production build.
- The Wall's public backend URL and active publishable key were obtained through
  the Supabase connection for the project identified in `SETUP-HOME.md`.
  They are in `history-wall/.env.local`, mode `600`, confirmed git-ignored.
  No database changes or customer-data queries were needed.
  After CLI linking, this file also contains a CLI-managed OIDC token; keep the
  whole file private even though the two browser client settings are public.
- Rebuilt with those settings: both are embedded in the browser bundle, and all
  configured wall-image sizes and all generated close-ups exist in `dist/`.
- Local Vite preview: `/` and `/?embed` return HTTP 200 with the correct title;
  all 67 checked JS/CSS, configured wall-image, and close-up URLs return HTTP 200.
  These are HTTP smoke checks, not a full browser interaction test.
- Vercel device login completed: `whoami` confirms `rmanager-cpu`, with access
  to `turbohospitalitysolutions`. Local linking to the existing Wall project
  succeeded; project and production settings were pulled into ignored `.vercel/`.
- `vercel build --prod --scope turbohospitalitysolutions` succeeded, producing
  `.vercel/output/` with both required public backend settings in the JS bundle.
  The pulled production environment has no `VITE_SUPABASE_*` entries, so the
  local `.env.local` client configuration remains necessary for this build route.
- The production alias resolves to a Ready deployment created 2026-11-12 02:48 UTC:
  `dpl_FMm4Hv4X8jJzx5u3RnN3FYxyLbcD`, unique URL
  `https://the-wall-river-ranch-8r95l848o-turbohospitalitysolutions.vercel.app`.
  A reference is saved in ignored `.vercel/verified-production.json`; re-inspect
  before a future release because production may change in another session.
- No deployment or Git push was performed during the initial deployment setup.

## Photo and research update (2026-11-12)

- Preserved 24 unique originals from 28 uploads and selected 20 primary close-ups
  plus one newspaper detail image. The skier below the phone is now a mapped frame.
- `npm run closeups` and `npm run build` passed. Desktop and mobile browser checks
  verified all 20 selected close-ups, the new hotspot, the article detail link,
  confirmed number labels, and embedded mode.
- `history-wall/research/` contains the illustrated draft catalog for all 63 active
  frames. It is not imported by the public application. Research included a read-only
  check of the Wall inbox; its two entries were setup tests and supplied no history.
- Alex authorized pushing the prepared work to GitHub. Rebuild Vercel's prebuilt
  output before a later deployment; the initial output predates the final photo batch.

Credentials and ignored files may not carry into a new workspace. Check them
again rather than assuming that a previous session's login still works.

## Authenticate and inspect (no deployment)

The commands below pin the CLI version checked here. Run them from
`/workspace/rr-website/history-wall`.

```sh
npx --yes vercel@65.14.0 whoami
npx --yes vercel@65.14.0 login
npx --yes vercel@65.14.0 teams ls
npx --yes vercel@65.14.0 link --yes --scope turbohospitalitysolutions --project the-wall-river-ranch
npx --yes vercel@65.14.0 inspect https://the-wall-river-ranch.vercel.app --scope turbohospitalitysolutions
```

Skip `login` when already authenticated. The device sign-in must be approved by
the account with access to the existing team. Keep tokens out of chat, Git, and
command arguments. A Vercel plugin connection and a CLI login are separate:
verify each capability before relying on it.

Confirm `.vercel/project.json` names `the-wall-river-ranch` and the intended team
before proceeding. Record the current production deployment ID/unique URL for
rollback. Do not create a replacement project or temporary deployment to work
around missing access.

Pull production project settings and environment values into ignored `.vercel/`:

```sh
npx --yes vercel@65.14.0 pull --yes --environment=production --scope turbohospitalitysolutions
```

The Wall also needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` at
**build time**. Follow `SETUP-HOME.md` to restore `.env.local` if absent; use only
the public publishable client key, never a service-role/secret key. Check that
Vercel's pulled values target the same project. Without these settings the code
still builds successfully but uses browser-local prototype submissions. A green
build alone is therefore insufficient. Never print the values while checking.

## Build and verify locally

```sh
npm ci --no-audit --no-fund
npm run build
npx --yes vercel@65.14.0 build --prod --scope turbohospitalitysolutions
```

`npm run build` creates `dist/`. `vercel build --prod` creates the separate Vercel
output under `.vercel/output/` required by `deploy --prebuilt`; `dist/` alone is
not a prebuilt Vercel deployment. Verify the production bundle has the intended
public backend settings and that image/close-up references resolve. Check the
page, zoom, frame dialog, and embedded mode locally. Don't submit a fake story
to the production database as a smoke test.

For a hosted preview, pull preview settings, build without `--prod`, and deploy
with `--prebuilt` without `--prod`. Confirm the preview has the intended client
settings. A prebuilt output's environment must match its deployment target.
Obtain the required deployment authorization for previews too.

## Publish after authorization

After reviewing the exact changes and receiving Alex's go-ahead for this release:

```sh
npx --yes vercel@65.14.0 deploy --prebuilt --prod --scope turbohospitalitysolutions
npx --yes vercel@65.14.0 inspect https://the-wall-river-ranch.vercel.app --scope turbohospitalitysolutions
```

Wait for Ready status, then check the live URL, wall imagery, frame close-ups,
and `?embed` layout. Confirm that the page isn't in browser-local prototype mode.
Record the new deployment URL and the commit/change set. Do not change DNS or MX.

If rollback is required, use the previous known-good deployment captured before
publishing, after confirming authorization for that production change:

```sh
npx --yes vercel@65.14.0 rollback <previous-deployment-id-or-url> --scope turbohospitalitysolutions
```

Inspect and smoke-test the production alias again. Rollback does not revert Git
history or database changes.

## Cloud command access

Ordinary network commands in this session's sandbox initially could not reach
the inherited proxy. The approved escalated clone, npm installs, and Vercel CLI
requests succeeded. Preserve the supplied proxy and CA settings; use the cloud
runtime skill's escalation procedure if that failure recurs. Never disable TLS
verification or overwrite proxy settings to work around it.
