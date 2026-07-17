# Decisions

Choices made where the spec left room. Newest at the bottom.

1. **Vite + React (not Next.js).** The app is a pure client SPA talking to
   Supabase — no SSR, no API routes needed, and the prototypes are plain
   client-side JSX. Vite is lighter, deploys identically on Vercel/Netlify
   free tier, and avoids Next's server/client component split entirely.

2. **TypeScript.** The prototypes are `.jsx`; the port is to `.tsx`. The
   builder's "impossible states must be unreachable" requirement is much
   easier to honor with typed character/build models.

3. **No router library.** Four tabs driven by component state, one URL.
   Simpler on iOS Safari (no history-swipe surprises) and there's nothing
   to deep-link yet. Revisit if Phase 2's DM view wants its own path.

4. **Offline-first storage layer.** `src/lib/supabase.ts` exports `null`
   when env vars are missing; every data call falls back to localStorage.
   The app therefore works before the owner wires Supabase, and device
   storage doubles as the offline cache afterwards (spec §4.1).

5. **RLS via security-definer RPCs, not per-row policies.** With no
   Supabase Auth there is no `auth.uid()` to write policies against.
   Tables are locked to the anon role entirely; access goes through
   Postgres functions that take the device token / DM code as an argument.
   Simple, and the anon key alone can read nothing.

6. **Seed codes.** `SEAFORGOT` (players) and `LANTERNKEEPER` (DM) are
   seeded by `supabase/schema.sql`; the owner can edit before running.

7. **Component files, not nested components.** Every component lives at
   module scope in its own file — the prototype's keyboard-focus bug
   (components defined inside components remounting on each render) is
   structurally prevented.
