# The Song the Sea Forgot ✦

Campaign companion web app for a 3-player *Wild Beyond the Witchlight*
campaign (D&D 2024 rules). Mobile-first, no accounts — players join with a
code, the DM has a separate code.

## Status

- **Phase 1 — Player Companion:** ✅ complete. Fortune quiz, character
  forge, live sheet (tappable dice, HP/death saves, spell slots, rests,
  conditions, private notes), beginner guide.
- **Phase 2 — DM Dashboard:** ✅ complete. Roster, quiz vault, Lost Things,
  session notes, NPC cards, three-clue ledger. Sign in with the DM code.
- **Phase 3 — Table Mode:** ✅ complete. Initiative tracker (broadcasts to
  phones), handouts — to all or secretly to one player, arriving as a
  sealed envelope with typewriter reveal and optional 60-second fade
  (Sealed Whispers, A2) — and the iPad map with draggable tokens.
  ⚠ The realtime paths are wired but need a live Supabase project to be
  exercised — run the Phase 3 checklist in TESTING.md after setup.
- **Phase 4 — Tier A magic:** A2 Sealed Whispers shipped early (above).
  Bargain Ledger, Reliquary, condition co-pilot, roll feed: next.

The app works fully **without any setup** (offline mode — everything saves
to the device). Supabase connects the devices; Vercel puts it on the
internet. Both below.

## Run it locally

```bash
npm install
npm run dev
```

## Owner setup (10 minutes)

Do this once, in order. No coding involved.

**Part 1 — Supabase (the shared memory), ~6 minutes**

1. Go to [supabase.com](https://supabase.com), sign in, and click
   **New project**. Name it anything (e.g. `sea-forgot`), pick the free
   plan, choose a password (you won't need it again), wait ~1 minute for
   it to provision.
2. In the left sidebar click **SQL Editor**, then **New query**.
3. On GitHub, open [`supabase/schema.sql`](supabase/schema.sql), copy ALL
   of it, paste into the query box, click **Run**. You should see
   "Success. No rows returned."
   - Want different codes than `SEAFORGOT` / `LANTERNKEEPER`? Edit the
     very last lines before running.
4. Repeat with [`supabase/rpcs.sql`](supabase/rpcs.sql): new query, paste
   all of it, **Run**.
5. In the left sidebar click **Project Settings → API**. Keep this page
   open — you need two values from it: **Project URL** and the **anon
   public** key. (The anon key is safe to expose; the SQL you just ran is
   what protects the data.)

**Part 2 — Vercel (the live link), ~4 minutes**

1. Go to [vercel.com/new](https://vercel.com/new) and sign in with GitHub.
2. Import this repository (`1st-dm-campaign`). Vercel detects Vite —
   don't change any build settings.
3. Before clicking Deploy, expand **Environment Variables** and add both:
   - `VITE_SUPABASE_URL` = the Project URL from Supabase
   - `VITE_SUPABASE_ANON_KEY` = the anon public key from Supabase
4. Click **Deploy**. In ~1 minute you get a URL like
   `1st-dm-campaign.vercel.app`.
5. Text that URL + the join code to your players. Keep the DM code for
   yourself — entering it at the gate opens the Lantern-Keeper's Book.

To test locally against Supabase, copy `.env.example` to `.env.local` and
fill in the same two values.

## Project layout

- `src/components/` — screens and UI (one component per file, always at
  module scope — see DECISIONS.md #7)
- `src/lib/` — Supabase client, device identity, offline cache
- `src/styles/theme.css` — the design system (palette, type, motion)
- `supabase/schema.sql` — full database schema, RLS, seed campaign
- `DECISIONS.md` — choices made where the spec left room
