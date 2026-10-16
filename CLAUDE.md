# River Ranch website (riverranchlodge.com)

The new public website for River Ranch Lodge & Restaurant, Tahoe City, CA. Built by Alex (the owner) and
Claude together. Start with `docs/KICKOFF.md`: the decisions so far, what's still open, and where
everything lives.

## Standing rules
- Never push to GitHub or deploy without Alex's explicit yes at the time.
- Never print secrets; keys only in `.env.local` (git-ignored); scan the staged diff for keys before every
  commit; never bypass a pre-commit hook.
- Never copy a client's personal details (names, emails, phones from inquiries or estimates) into the repo.
- Public pages never name staff; anything staff-facing says "management", never "Alex".
- AI features use Anthropic models only (no OpenAI).
- Supabase: the shared hub project is `river-ranch-office` (ref `wldjocyzgxtnnhxziduq`). Changes to it
  ship as one-transaction paste files for Alex to run in the SQL editor (the MCP's confirmations
  auto-decline in VS Code); read-only queries are fine.
- Don't touch DNS or MX for riverranchlodge.com without Alex: company email runs on it (Google Workspace).

## Related
- The internal events app: `C:\Users\Chef\rr-events` (Next.js 14 on Vercel, live at
  https://rr-events-nine.vercel.app). Its leads, calendar, pricing and booking engine are what the
  site's inquiry form, availability calendar and (later) instant booking plug into. Read its
  `docs/DESIGN.md` for the app's palette, but this site gets its OWN fresh look (Alex's choice).
