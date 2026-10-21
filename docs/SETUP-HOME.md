# Working on another computer

Everything in Git comes down with a clone. Two things deliberately don't: secret settings
(`.env.local` files) and the big photo library. Steps below.

## 1. Tools (once per computer)
- Git, Node.js 20 or newer (24 is what the work computer runs), VS Code with Claude Code.
- GitHub CLI, signed in as `rmanager-cpu`: `gh auth login`.

## 2. Get the code
```
git clone https://github.com/rmanager-cpu/rr-website.git
git clone https://github.com/rmanager-cpu/rr-events.git
cd rr-events && git checkout claude/new-project-setup-8ld784
```
Open `rr-website` in VS Code and start Claude Code there; it reads `CLAUDE.md`, then
`docs/KICKOFF.md` and `docs/HISTORY-WALL.md` for where things stand.

## 3. The Wall (`rr-website/history-wall`)
```
cd history-wall
npm install
```
Create `history-wall/.env.local` (git-ignored) with two lines:
```
VITE_SUPABASE_URL=https://wldjocyzgxtnnhxziduq.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<the publishable key>
```
The publishable key is in Supabase: river-ranch-office → Project Settings → API Keys (the
`sb_publishable_…` one). Or ask Claude to fetch it with the Supabase connector. It's the public key,
safe in a web page, but it still stays out of Git.

`npm run dev` runs it locally. To deploy: `npx vercel login`, then `npx vercel link --project
the-wall-river-ranch` (team turbohospitalitysolutions), then `npx vercel build --prod` and
`npx vercel deploy --prebuilt --prod`.

## 3b. The site (`rr-website/site`)
```
cd site
npm install
npm run dev        # http://localhost:3100
```
No secrets needed. Deploy: `npx vercel link --project river-ranch-site`, then `npx vercel deploy --prod`
(Vercel builds it; a local `--prebuilt` build fails on Windows without symlink permission).

## 4. The events app (`rr-events`)
Its `.env.local` holds real secrets (database, Google sign-in, encryption keys, Anthropic). Never put
it in Git, email or chat. Either:
- `npx vercel link` (to the events app's project) then `npx vercel env pull .env.local`, if the values
  are stored on Vercel; or
- copy the file over yourself on a USB stick or through a password manager.

## 5. Photos
`Desktop\River Ranch Images` (1.2 GB) and `Desktop\RR Event Gallery` (233 MB) live only on the work
computer. Copy them over (Google Drive or a USB drive) if the site work needs them at home. The wall
photos are already in the repo.

## Where things stand (2026-10-19)
- The Wall is live: https://the-wall-river-ranch.vercel.app. Answers land in `wall_submissions`.
- Three homepage looks to pick from (private): https://claude.ai/artifact/4egnsybpV9S3x8Q9QYaVbH
- Waiting on Alex: pick a look; say go on the wall email pings (events app sends from events@ to
  frontdesk@, rmanager@, lodgemanager@; needs an events-app deploy and a paste file).
- Staff side: planned as a "Website" section inside the events app (Wall answers, form submissions,
  easy edits of hours, menus, specials, events, photos, page text).
- riverranchlodge.com expires 2026-10-27: renew at Network Solutions.
