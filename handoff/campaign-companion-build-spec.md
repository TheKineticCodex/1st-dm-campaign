# BUILD SPEC — "The Song the Sea Forgot" Campaign Companion
### A phased web app for a 3-player D&D campaign (Wild Beyond the Witchlight, 2024 rules)

You are building a companion web app for a first-time Dungeon Master (the project owner) running a Feywild carnival campaign for three players. Work in phases, deploy early and often, and keep every phase shippable on its own — the DM's Session 1 is coming up and whatever exists by then must work.

---

## 1. Context

- **Players:** 3 adults, using phones (iOS Safari primarily). The DM uses a phone + an iPad at the table.
- **Campaign:** The Wild Beyond the Witchlight. Fairy-tale tone: Feywild twilight, carnival lanterns, bargains, stolen things. The app should *feel* like the campaign — whimsical, slightly mysterious, never corporate.
- **Rules version:** D&D 2024 (revised 5e). Level 1 data now; structure everything so levels 2–8 can be added later without refactoring.
- **Starting point:** Two working React prototypes exist and are included in this repo (or will be pasted in): `witchlight-quiz.jsx` and `players-companion.jsx`. They contain the finished visual design, the quiz logic, the level-1 character builder, computed character sheet, and beginner rules guide. **Port and improve them — do not redesign from scratch.** Their palette, typography, and copywriting voice are the design system (see §3).

## 2. Tech stack

- **Frontend:** React + Vite (or Next.js if you prefer — your call, justify it). Mobile-first, single codebase, responsive up to iPad landscape.
- **Backend:** Supabase (the owner has an account). Use it for: Postgres storage, realtime channels (Phase 3), and simple row-level security.
- **Auth:** NO user accounts. A campaign has a short join code (e.g. `SEAFORGOT`). A player enters the code + picks their name once; store a device token in localStorage to reconnect them. The DM has a separate DM code. Keep it that simple — this is 4 people who know each other.
- **Hosting:** Vercel or Netlify free tier. Give the owner one URL to text to players.
- **No paid services, no app stores, no native code.**

## 3. Design system (from the prototypes — reuse exactly)

- Palette: night `#181030`, panel `#251A48`, panel edge `#3A2C66`, lantern gold `#E8B84B`, seafoam `#7FD4C1`, parchment `#F2E9D8`, ink `#241A42`, faint `#9C8FC4`.
- Type: Cormorant Garamond (display), Sorts Mill Goudy (body).
- Voice: the app speaks as "the lanterns" / the carnival. Playful, slightly ominous fairy-tale copy. Example register: "The carnival never charges coin. What it does charge is another matter."
- Motion: gentle card-rise transitions, glowing ✦ accents. Respect `prefers-reduced-motion`.
- Accessibility floor: visible focus states, 44px tap targets, works one-handed on a phone.

## 4. PHASE 1 — Player Companion (highest priority, must ship first)

Port the existing `players-companion.jsx` into the real app with server persistence.

**Tabs:** Fortune (quiz) · Build (character forge) · Sheet · Guide.

Changes vs. the prototype:
1. **Server persistence.** Characters and quiz answers save to Supabase keyed by campaign + player, not just device storage. Device storage remains as offline cache.
2. **Quiz results flow to the DM automatically** (no more copy/paste) — but keep the copy button as fallback.
3. **Builder upgrades:**
   - Add a species detail view (all traits, not just two).
   - Add subclass selection stub (locked, labeled "unlocks at level 3") so the data model supports it.
   - Validate everything; impossible states must be unreachable.
4. **Sheet upgrades:**
   - Add tappable dice: tapping an attack, skill, or save rolls it (d20 + modifier) with a small animated result. Advantage/disadvantage toggle.
   - HP tracker: current/max with +/− buttons, death-save pips at 0 HP.
   - Spell slot tracker for casters (checkboxes that reset on "Long Rest" button; short rest restores Warlock slots).
   - Rest buttons (Short/Long) that do the right things and confirm before acting.
   - Free-text sections: Appearance, Personality, "What I lost" (this one is private — visible to the player and DM only, flagged clearly).
5. **Level-up support (data-driven):** structure class data as `{ class: { levels: { 1: {...}, 2: {...} } } }`. Populate level 1 fully (already done in prototype) and level 2 for all classes. Higher levels can be empty objects for now.

**Acceptance:** a brand-new player can go from link → quiz → built character → rolling dice on their sheet in under 15 minutes on a phone, and the DM can see the result without asking.

## 5. PHASE 2 — DM Dashboard

A DM-code-gated view. Mobile-friendly but optimized for iPad.

- **Roster:** all three characters at a glance — HP, AC, passive Perception, key stats, spell save DCs.
- **Quiz vault:** each player's full divination answers (especially "what would you risk everything to recover" / "what do you fear losing") — this is the DM's raw material for each character's secret Lost Thing.
- **Lost Things tracker:** per character, three private DM fields: *What was taken · What they believe happened · What actually happened.* Never visible to players.
- **Session notes:** a simple per-session note with a template: What happened / Clues found / Clues missed / NPCs met / Threads open.
- **NPC cards:** name, pronunciation, one distinct performable trait, motivation, secret, connection to the mystery. Quick-add, searchable.
- **Clue tracker:** table of Conclusion → Clue 1/2/3 → found? (the three-clue rule). Seed it empty; the DM fills it.

**Acceptance:** the DM can run a prep session and a live session from the iPad without paper.

## 6. PHASE 3 — Table Mode (stretch — only after 1 & 2 are solid)

Realtime layer via Supabase channels. The iPad becomes the shared table; phones stay personal.

- **Initiative tracker:** DM starts an encounter; order broadcasts to all phones; "you're up next" nudge on the active player's phone.
- **Handouts:** DM pushes an image or text card to everyone — or *secretly to one player* (the killer feature: the Druid's alligator clues go only to her phone).
- **Shared map (simple):** DM uploads an image map to the iPad view; draggable tokens for the 3 PCs + enemies. No fog of war, no grid math, no measurement tools — this is a picture with movable pieces, not Foundry.
- **Ambient mode:** when idle, the iPad shows a campaign title screen with drifting lanterns.

**Acceptance:** in a mock session, the DM can run one combat and deliver one secret handout with zero player confusion.

## 7. Data model (Supabase)

- `campaigns` (id, name, join_code, dm_code)
- `players` (id, campaign_id, name, device_token)
- `characters` (id, player_id, jsonb build, jsonb state {hp, slots, conditions}, private_notes)
- `quiz_results` (player_id, jsonb answers, top_classes)
- `lost_things` (character_id, taken, believed, truth) — RLS: DM only
- `npcs`, `clues`, `session_notes` (campaign_id scoped, DM only)
- `handouts` (campaign_id, target: all | player_id, content, sent_at)
- `encounters` (campaign_id, jsonb initiative_order, active_index)

RLS everywhere: players read/write only their own rows; DM code unlocks campaign-wide.

## 8. Rules-data notes

- 2024 PHB rules. The prototype's class/species/background data is verified for level 1 — treat it as source of truth and extend it.
- Witchlight-book options (Fairy, Harengon, Feylost, Witchlight Hand) are 2014-era, adapted: the two backgrounds grant +2/+1 to any abilities (house rule, DM-approved).
- Recommended spell loadouts are curated defaults, not full pickers — keep it that way at level 1; add a full picker only if trivial.
- Never invent rules. If uncertain, add a `// VERIFY` comment and flag it in your summary rather than guessing.

## 9. Non-goals

- No accounts, payments, or email.
- No fog of war, dynamic lighting, or VTT feature creep.
- No character options beyond the listed species/classes/backgrounds.
- No AI features in v1.
- Don't rebuild the visual design.

## 10. Working method

1. Ship Phase 1 to a live URL before touching Phase 2. Deploy something within the first session.
2. After each phase: give the owner a test checklist written for a non-developer ("open this link on your phone, tap X, you should see Y").
3. Commit in small, described steps. Keep a `DECISIONS.md` for anything you chose that the spec left open.
4. Test everything in mobile Safari viewport. The keyboard-focus bug class (components defined inside components causing remounts) has already bitten this project once — don't reintroduce it.
5. If a phase is at risk, cut scope inside the phase rather than polishing. Working and plain beats beautiful and broken.

Owner's priority order if time runs short: **Phase 1 > DM Roster + Quiz Vault > everything else.**
