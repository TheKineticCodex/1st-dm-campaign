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

7. **Tailwind v4 added during the Phase 1 port.** The prototypes use
   Tailwind utility classes throughout; installing Tailwind (one plugin,
   one import) let the port keep the prototype markup verbatim instead of
   hand-translating every class to CSS.

8. **HP stored as damage-taken, not current-HP.** Max HP is derived from
   the build, so if the build changes (level up, CON bump) current HP can
   never desync or exceed the new max.

9. **Level-2 rules data added with `// VERIFY` flags.** The prototype only
   covers level 1 (verified). Level 2 features/slots for all twelve
   classes were added from the 2024 PHB per spec §4.5, but each entry is
   flagged for the owner to check before the party reaches level 2.

10. **Persistence via SECURITY DEFINER RPCs.** Anon-key clients can only
    call functions; every function demands a device token (players) or
    the dm_code (DM). Tables stay fully RLS-locked with zero policies.

11. **The map lives on the DM's iPad only.** Spec §6 says "the iPad
    becomes the shared table; phones stay personal" — so the map is a
    local surface on the DM device (image + draggable tokens, persisted
    locally), not a synced view. No image ever leaves the device, which
    also keeps the licensing guardrail airtight.

12. **Handouts target players by name, realtime by broadcast.** Names are
    unique per campaign (DB constraint) and are what the DM sees; the RPC
    resolves name → player id for storage. Live delivery is a Supabase
    channel broadcast keyed on the campaign id (either code resolves it
    via get_channel); persisted handouts catch up late joiners.

13. **Offline rehearsal mode.** Player-side live features (initiative
    banner, envelopes) still run their catch-up fetch in offline mode, so
    the owner can rehearse the full Table flow alone on one device by
    switching between DM and player codes.

14. **Sealed Whispers (A2) shipped with Phase 3.** The addendum's hard
    rule names A2 as one of the two above-weight features for Session 1,
    and it upgrades the same component that plain handouts use — one
    envelope for both. Ephemeral mode is opt-in per handout (60s).

15. **The Mirror (AI portraits) — owner-approved exception to §9's "no AI
    in v1".** Requested by the owner mid-build. Uses pollinations.ai:
    free, keyless, no account — so it honors §2's "no paid services".
    The prompt is assembled from the character's choices (species, class,
    background, aura) plus the player's own appearance text; the random
    seed is baked into the stored URL so a portrait, once seen, never
    changes. One look is final by design — the fiction ("the mirror does
    not repent") is the nudge to describe yourself well first. Network
    failure allows retry; "forge without a portrait" always remains.
    All generation logic isolated in src/lib/portrait.ts for easy swap.

16. **The roll feed and race are deliberately ephemeral.** Amendment 8.3
    says durable things go to Postgres — but the live dice feed and derby
    are theater, not records: nothing needs to survive a refresh, so they
    ride broadcast only. If dice *history* ever becomes a feature, that's
    when it gets a table.

17. **Conditions travel DM → player as a command, not a write.** The DM
    broadcasts apply/lift; the player's device (the authority on its own
    character) updates and persists its own state through the existing
    save path. No new RPC, no second writer to the character row. Cost:
    a player whose phone is asleep misses the command — the DM just
    re-taps, matching how a real table repeats itself.

18. **Component files, not nested components.** Every component lives at
   module scope in its own file — the prototype's keyboard-focus bug
   (components defined inside components remounting on each render) is
   structurally prevented.
