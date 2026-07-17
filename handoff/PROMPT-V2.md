# THE SECOND LANTERN
### The prompt for the best version of "The Song the Sea Forgot" Campaign Companion
*Supersedes PROMPT.md as the working directive. The base spec still governs stack and data model; the magic addendum still governs feature inventory; this document governs purpose, priority, and craft. Where they conflict, this wins.*

---

## 0. The one sentence

Three people are about to play D&D for the first time with a first-time DM, and this app's job is to make them feel — at the table, between sessions, and in their very identity — that **the game knows they are in it, and reaches back.**

Every decision routes through that sentence. A feature that makes the table lean in beats a feature that is merely useful. A feature that makes one player feel *seen* beats both.

## 1. The three axes of "inside the game"

The owner has confirmed all three matter equally. Every phase must name which axes it serves.

**AXIS 1 — The table, live.** During sessions, phones must behave like enchanted objects, not screens. The test: a player's eyes should leave their phone *more* excited to look at the people around them. Sealed whispers that arrive mid-scene. The turn that taps you on the shoulder. Dice that the whole table watches land. A snail race everyone is screaming at.

**AXIS 2 — The week between.** A campaign is mostly the time between sessions. The Feywild should not switch off on Sunday night. Bargains whose terms hang over you all week. A dream that arrives Wednesday and fades in sixty seconds. A recap that reads like a storybook page. The ache of a Reliquary track one fragment short.

**AXIS 3 — The self.** The deepest hook: *who you are* in this story. The divination that read you before you chose. The portrait the mirror painted once and will not repaint. The Lost Thing only you and the DM know. The tether that haunts only your sheet. The callback, four sessions later, to the exact words you typed on the first night.

## 2. The state of the world (verified, live)

- **Repo:** `TheKineticCodex/1st-dm-campaign`, branch `main`. Vite + React + TS + Tailwind v4. Every push auto-deploys.
- **Live:** https://1st-dm-campaign.vercel.app · Supabase project `the-song-the-sea-forgot` (`dqzbofrvahioptrrgche`), schema + RPC layer applied and smoke-tested. Join `SEAFORGOT` · DM `LANTERNKEEPER`.
- **Shipped:** Phases 1–3 complete (companion, DM's Book, table mode) + A2 Sealed Whispers + the enchanted forge: divination ritual with class *and* species reading, skip-the-reading path, tappable verdict, sigil art for all 24 options, living medallion, aura choice, the Mirror (one-shot AI portrait, pollinations.ai, prompt style locked — owner approved), forge-sealing ceremony.
- **Store pattern:** one interface, LocalStore/SupabaseStore; offline always works; never break this.
- **Flags:** level-2 rules data and condition wordings carry `// VERIFY` pending owner check. Realtime broadcast paths built but not yet witnessed across two devices — witness them before Session 1.

## 3. The iron rules (unchanged, restated because they are load-bearing)

1. **Three Protagonists.** No players exist yet — Session 0 hasn't happened. Therefore every personal-story system (Reliquary, tethers, lost things, callbacks) ships as **three equal empty slots** that populate from real play. The mermaid, if she appears, is merely the slot that fills first. Never build a feature for one character that isn't a system for three.
2. **Never invent rules.** Prototype data is truth; additions get `// VERIFY` and a line in the summary.
3. **Licensing guardrail.** No WotC art, maps, or text in the repo, ever. Original art, SRD 5.2 stats only, owner-upload slots for his own book's scans. When gray, leave a slot and flag it.
4. **The focus bug class stays dead.** Components at module scope, always.
5. **Offline first.** Every feature degrades gracefully without Supabase; realtime features hide or fall back, never break.
6. **Accessibility floor:** 44px targets, visible focus, `prefers-reduced-motion` respected by every animation including ceremonies, one-handed phone use.
7. **Working and plain beats beautiful and broken.** Cut scope inside a phase, never ship a broken phase.

## 4. The voice (calibrated by what the owner kept)

The app speaks as the lanterns/the carnival: playful, slightly ominous, never corporate, never cute-for-cute's-sake. What landed and is now canon register:
- *"The carnival never charges coin. What it does charge is another matter."*
- *"The mirror shows you once, and does not repent."*
- *"The lanterns respect a made-up mind."*
- *"The Feywild takes notice of you."*

Rules of the voice: second person; the app never says "app," "save," "sync," "generate," or "error" — things are *kept*, *sealed*, *painted*, *clouded over*. Warnings are prophecies. Buttons are actions in the fiction ("Tuck it away," "Let the mirror see me"). Failures blame the mist, never the player.

## 5. The build order for the best version

Each phase ships complete, live, tested at 390×844, with a TESTING.md checklist in plain English, before the next begins. Axes served are marked.

**PHASE NEXT-1 — First Night Kit (Axes 1, 3). Everything Session 1 needs.**
- **A5 Roll feed:** every tappable-dice roll streams to the DM iPad — name, what for, result. Nat 20 = lantern-burst moment on the iPad; nat 1 = a small sad trombone of the soul. DM rolls hidden or shown per-roll. This makes every phone roll a *table event* (the single highest lean-in per effort remaining).
- **C1 Carnival minigames:** the snail race (tap-to-sprint, all phones, live positions on the iPad), the fortune wheel, catch-the-pixie. ~60 seconds each, results to the DM, prizes are fiction the DM pre-loads. Session 1 is at the carnival; these ARE the carnival.
- **A4 Condition co-pilot (player half):** when the DM applies a condition from the roster, it appears on that player's sheet in plain words. Concentration: when a concentrating caster takes damage, their phone offers the DC 10 check with one tap. (DM-applies-condition UI goes in the roster; the sheet display exists.)
- **Witness protocol:** before Session 1, run the two-device realtime checklist end to end. Nothing unwitnessed goes to the real table.

**PHASE NEXT-2 — The Bargain Ledger, A1 (Axes 1, 2, 3). The campaign's soul, done right.**
- DM composes a bargain (parties, price, terms in fairy-tale legalese — provide a template that writes the boring parts). It arrives on the player's phone as an illuminated contract: ornate border, wax seal, and a **finger-drawn signature** to accept. The signing is the ritual — make the ink look like ink.
- The Ledger tab shows every active bargain and, in gold, **what is still owed.**
- Fulfillment: the contract burns away in gold. Breach: the seal cracks and the contract stays, scarred. Both get ceremonies.
- Between sessions this is Axis 2's anchor: the ledger is the thing a player opens on a Tuesday to reread what they owe.

**PHASE NEXT-3 — The Reliquary, A3 (Axes 2, 3). The endgame engine; build the architecture now, fill it from play.**
- Three tracks, `Track 1/2/3`, all identical first-class citizens with: a motif type (sound / image / text — chosen with the DM after each character exists), fragment slots as illustrated card frames (original SVG in-palette), a "recovered" ceremony per fragment, and a completion state reserved for the finale.
- Populate nothing. Seed the mermaid's *song* motif only if/when that character actually gets made. The owner produces music in GarageBand — leave an owner-upload slot for melody layers (small audio files), never generate audio.
- DM side: a private Reliquary editor bound to each character's Lost Thing.

**PHASE NEXT-4 — The Week Between (Axis 2).**
- **D2 "Previously on…":** DM writes 3 bullets from a template; players get a storybook page when they next open the app.
- **Scheduled whispers:** the DM can compose a sealed whisper now and set it to arrive *later* (a date/time) — dreams arrive on Wednesdays. (Simple: `deliver_after` on handouts; check on open + realtime.)
- **D5 Session pulse:** end of session, one tap — favorite moment + a private more-of/less-of note to a first-time DM who needs exactly this.
- **D1 Quote wall:** tap-save lines at the table; carnival posters between sessions.

**PHASE NEXT-5 — Tethers, C3 (Axes 1, 3), then the rest.**
- The tether system: three slots, each a small living element on a sheet (sprite / object / ambient effect) with a hidden DM trigger panel that fires only on that player's phone. Architecture identical across slots; content designed with the DM after Session 0 from quiz answers. Then: C4 inspiration coin, C5 level-up ceremony (needs the VERIFY'd level 2+ data confirmed), B1/B2 map upgrades, D3/D4, Tier E as play demands.

## 6. The callback engine (cross-cutting, cheap, and the owner's explicit wish)

The quiz answers are the campaign's seed vault. Build toward the DM being able to *fire* them:
- Vault entries get a **"forge into a whisper"** button: one tap turns a player's own typed words into a pre-filled sealed whisper addressed to them ("You told the lanterns you feared losing his face…"). The best callback is verbatim.
- Keep recording new material: bargain texts, pulse notes, quote wall — everything a player writes is future ammunition, and everything shows its author and date in the DM's Book.

## 7. What only the owner can supply (ask when the moment comes, never block)

- Real player names/concepts after Session 0 → then design tether contents, reliquary motifs, and the two unwritten tracks *with him*.
- The mermaid's melody (GarageBand), if that character comes to exist.
- Map scans/photos from his book (upload slots exist).
- Session cadence and Session 1 date → drives the witness protocol deadline and scheduled-whisper defaults.
- Confirmation pass on all `// VERIFY` rules data before the party hits level 2.

## 8. Research amendments (binding — from the 2026-07-17 pressure-test report)

The owner commissioned independent research on this directive. Its findings amend the above:

**8.1 Operational (done or standing order):**
- **Supabase pausing is the #1 operational risk** (Free plan pauses after ~7 idle days; a campaign played weeks apart would find its backend asleep). A daily keep-warm GitHub Action now pings the database. **Standing order: the moment Phase NEXT-4 (between-session features) ships, recommend Supabase Pro ($25/mo)** — scheduled delivery on a pausable free project is worthless, and Pro adds backups and 50 msg/s realtime.
- **The local store is a disposable cache, never the source of truth.** iOS evicts script-writable storage after ~7 days of disuse. Every session must cold-start cleanly from the server; verify on a real iPhone after a long gap. Sync on `online`/foreground, never rely on Background Sync (unsupported on iOS).
- **The Mirror got its safety valve:** a quiet "the mist marred the glass — look once more" regenerate now exists under the fiction, because a grotesque one-shot AI output at an emotionally loaded ceremony is a live risk (pollinations has no SLA and weak moderation). "Forge without a portrait" remains. Never make a single AI output unskippable.
- **Legal notices shipped:** Fan Content Policy notice + SRD 5.2 CC-BY-4.0 attribution on the gate and in the README. The app must stay free, private, unlisted, non-commercial — Vercel Hobby is non-commercial-only anyway. Never use WotC logos or the ampersand trade dress. Never reproduce adventure text; owner-upload slots only.

**8.2 Roadmap reorder (novelty-weighted):**
- The research found the **dice feed is derivative** (D&D Beyond Shared Dice does it) while the **carnival minigames and the finger-drawn fey-contract signature appear genuinely novel** — no shipped product does either. Therefore, within NEXT-1: **minigames and condition co-pilot lead; the roll feed ships last** as table-stakes polish. **NEXT-2 (Bargain Ledger) is promoted** — the signature is one of only two novel wow-moments and technically cheap (use `signature_pad`; handle devicePixelRatio and set `touch-action: none` on the canvas).
- Sealed whispers validated as a real unmet need — with one design law from the community: private content must **default sealed** (tap-to-reveal), because "texts on someone's phone are easy to see by accident." Already true; keep it true.
- Reliquary audio: iOS blocks all autoplay — the melody plays only from an explicit tap, which is on-theme ("listen to the memory"). Don't cache audio in the PWA (~50MB origin cap).

**8.3 Realtime engineering laws:**
- Throttle high-frequency broadcasts (snail race positions) to **≤10Hz, batched** — free tier allows ~20 msg/s total. Prefer Broadcast over Presence.
- **Broadcast is fire-and-forget (dropped after 72h). Anything durable — dice history, minigame results, whisper delivery — writes to Postgres.**
- Move channels to **private channels with RLS** when Table Mode hardens (anon-key spam is a known vector).

**8.4 The phones-at-the-table law (adoption-critical):**
The community's default belief is that phones *destroy* in-person play. The objection is to *off-task* use — so every phone interaction must be **fast, glanceable, and diegetic**: seconds not menus, an artifact not a browser. The iPad is the shared focal point; phones are for secrets, dice, and ceremonies. Any feature that invites heads-down browsing at the table is wrong even if it's beautiful.

**8.5 Motion:** before any new ceremony ships, add an **in-app motion toggle** ("calm the lanterns") alongside `prefers-reduced-motion` — replace motion with fades, don't just delete it.

**8.6 Campaign-craft preloads for the DM's Book** (do during NEXT-4, they're content not code):
- Seed the clue tracker with Witchlight's long-fuse callbacks: Kettlesteam, Diana Cloppington, Northwind & Red's wishes — clues planted in Chapter 1 that pay off in Chapter 4.
- Add a homebrew merchant table slot (the module under-provides shops) and a sidekick slot (standard 3-player fix; also the natural diegetic home for a tether).
- Frame the divination forge as the centerpiece of a real Session Zero; the app should gently encourage the owner to run one (tone, safety tools, inter-character connections, and the table's phone policy).

**8.7 Housekeeping:** audit for dynamically constructed Tailwind class names (v4 purges them silently — inline styles are safe, string-built `bg-${x}` classes are not); plan the Supabase key migration (legacy anon keys deprecated end of 2026 — the publishable `sb_publishable_…` key already exists on the project).

## 9. Definition of the best version

It is NOT feature completeness. It is: **three specific humans, one year from now, unable to imagine having played this campaign without it** — because the app held their faces, their bargains, their recovered fragments, their table's laughter at a nat 1, and the words they typed the first night, and gave all of it back to them at exactly the right moments. Judge every pull request against that.

*Build it like the Feywild made it. The lanterns are already lit.*
