# The Song the Sea Forgot ✦

Campaign companion web app for a 3-player *Wild Beyond the Witchlight*
campaign (D&D 2024 rules). Mobile-first, no accounts — players join with a
code, the DM has a separate code.

## Status

- **Phase 1 — Player Companion:** in progress. App shell, join flow, design
  system, and database schema are in place. The Fortune quiz, character
  Build forge, Sheet, and Guide tabs are being ported from the prototypes.
- **Phase 2 — DM Dashboard:** not started.
- **Phase 3 — Table Mode:** not started.

## Run it locally

```bash
npm install
npm run dev
```

Open the printed URL. Without Supabase configured the app runs in offline
mode (everything saves to the device only).

## Wire up Supabase (one-time, ~5 minutes)

1. Create a project at [supabase.com](https://supabase.com) (free tier).
2. In the dashboard, open **SQL Editor → New query**, paste the contents of
   [`supabase/schema.sql`](supabase/schema.sql), and run it. This creates
   every table plus the campaign itself (join code `SEAFORGOT`, DM code
   `LANTERNKEEPER` — edit the last lines of the file first if you want
   different codes).
3. Open **Project Settings → API** and copy the Project URL and the `anon`
   key into a `.env.local` file (see [`.env.example`](.env.example)).
4. For the deployed site, add the same two values as environment variables
   in Vercel/Netlify.

## Deploy (Vercel free tier)

1. Go to [vercel.com/new](https://vercel.com/new) and import this GitHub
   repository. Vercel auto-detects Vite; the defaults are correct.
2. Add the two `VITE_SUPABASE_*` environment variables.
3. Deploy. Text the resulting URL to your players.

## Project layout

- `src/components/` — screens and UI (one component per file, always at
  module scope — see DECISIONS.md #7)
- `src/lib/` — Supabase client, device identity, offline cache
- `src/styles/theme.css` — the design system (palette, type, motion)
- `supabase/schema.sql` — full database schema, RLS, seed campaign
- `DECISIONS.md` — choices made where the spec left room
