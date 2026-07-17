# AGENT PROMPT — Build "The Song the Sea Forgot" Campaign Companion
### Read this first. Everything you asked for is in this bundle.

## Your three requests, answered

1. **The prototype files are here:** `prototypes/witchlight-quiz.jsx` and `prototypes/players-companion.jsx`. The companion file supersedes the quiz file (it contains the quiz plus builder, sheet, and guide) — port from `players-companion.jsx`; keep `witchlight-quiz.jsx` only as a reference for the earlier standalone quiz. Their visual design, quiz scoring, and level-1 rules data (classes, species, backgrounds, spell loadouts, AC/HP formulas) are the verified source of truth. Port, don't rebuild. One known history lesson baked into them: components must be defined at module level — an earlier version defined layout components inside the main component and every keystroke remounted the tree, killing input focus on mobile. Never reintroduce that bug class.

2. **Supabase:** the owner will create the project and run your SQL when you're ready. Do NOT block on this — see "Never block" below.

3. **Vercel:** the owner will import the repo himself. Your job is to make the default import work with zero configuration beyond two env vars.

## Documents in this bundle, in reading order

1. `campaign-companion-build-spec.md` — the foundation: phases 1–3, data model, design system, constraints.
2. `campaign-companion-magic-addendum.md` — the magic layer: Tiers A–E, the Three Protagonists Rule, revised phase order 4–7, licensing guardrails.
3. `prototypes/` — working code and rules data.

Where documents conflict, the addendum wins on features and principles; the base spec wins on stack and data model; this prompt wins on working method.

## Mission for this run

Get as far down the phase list as you can **without ever leaving the app in a broken state**. Definition of "almost one-shot" success, in strict order:

1. **Phase 1 complete and demoable** — quiz → builder → sheet (tappable dice, HP tracker, spell slots, rests, conditions display) → guide, mobile-first, working end-to-end with the LOCAL storage adapter (below) even before Supabase exists.
2. **Persistence layer ready to flip on** — `supabase/schema.sql`, RLS policies, seed script that creates the campaign with join code `SEAFORGOT` and a DM code, and a `README.md` section titled "Owner setup (10 minutes)" with exact click-by-click steps for Supabase + Vercel written for a non-developer.
3. **Phase 2 (DM Dashboard)** — roster, quiz vault, Lost Things tracker (3 slots), session notes, NPC cards, clue tracker.
4. **Phase 3 (Table Mode)** — initiative sync, handouts (including single-target), basic map with movable tokens.
5. **Phase 4 (Tier A)** — Bargain Ledger, Sealed Whispers, Reliquary (3 tracks, mermaid's populated with a placeholder melody, tracks 2–3 as first-class placeholders), condition co-pilot, roll feed.
6. Then Tiers B/C/D/E per the addendum's revised phase order.

Stop and summarize rather than rushing a phase to 80%. A finished Phase N beats a started Phase N+1, every time.

## Never block — the storage adapter rule

Define one interface, two implementations:

```
interface Store {
  getCharacter/saveCharacter, getQuizResult/saveQuizResult,
  ...one method per table in the spec's data model
}
```

- `LocalStore` — localStorage + in-memory. Default. The whole app must be fully usable single-device with this.
- `SupabaseStore` — activated automatically when `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are present. Realtime features (Phase 3+) degrade gracefully to polling or hidden when absent.

This means the owner can test on his phone TODAY, and flipping on Supabase later is env vars, not a refactor.

## Decisions you're authorized to make alone

Framework choice (Vite vs Next), file structure, component library or none, animation implementation, minigame mechanics details, exact copy in the carnival voice (match the register in the prototypes), placeholder art (simple SVG in-palette — no external image dependencies). Log every such choice in `DECISIONS.md` with one line of reasoning.

## Decisions you must NOT make alone

- Any D&D rule not present in the prototype data — mark `// VERIFY`, list in your summary. Never invent rules.
- Anything touching the licensing guardrail (addendum B3): no WotC maps, art, or adventure text in the repo, ever. SRD 5.2 (CC) only for monster stats. When in doubt, leave a slot for owner-uploaded assets instead.
- Deleting or restructuring the verified rules data.
- The Three Protagonists Rule is non-negotiable: personal-story systems have three equal slots; the mermaid's is merely the first populated.

## Quality gates (every phase)

- Mobile Safari viewport (390×844) is the primary test target; iPad landscape secondary.
- Inputs hold focus while typing. Tap targets ≥ 44px. `prefers-reduced-motion` respected.
- No console errors on the happy path. Impossible states unreachable in the builder.
- After each phase, append to `TESTING.md` a checklist written for a non-developer ("Open the link on your phone. Tap Fortune. Type a name — the keyboard should stay up.").

## Deliverables at the end of this run

1. Working app (Phase 1 minimum, further if quality allows) runnable via `npm install && npm run dev`.
2. `supabase/schema.sql` + seed script.
3. `README.md` with the non-developer "Owner setup (10 minutes)" section.
4. `DECISIONS.md`, `TESTING.md`, and a final summary: what's done, what's `// VERIFY`-flagged, what's next, and the exact two things you need from the owner (Supabase keys, Vercel import).

Build it like the Feywild made it. Begin.
