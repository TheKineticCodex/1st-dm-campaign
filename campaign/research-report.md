# Research report — "The Song the Sea Forgot": the best table we can build, and how to build it at full power on Claude Max
### Received 2026-08-15 (Claude Research, from `research-brief.md`). Claude Max 20× confirmed. Re-verify plan/pricing figures before relying on them.

> Bottom line: keep the stack (Vite/React/TS + Supabase Free + Vercel Hobby) and pour effort into six upgrades in order — a Supabase keep-alive, a PWA + bundle split, a near-zero-maintenance test net, a phone-first "battle mode," diegetic carnival minigames on the existing real-time layer, and a Tone.js sound upgrade. A framework migration would risk player data for benefits a home game will never use; on Max 20× the true constraint is build time and context hygiene, not the usage meter.

## The five things to do first
1. **Supabase keep-alive cron** — Free projects pause after ~7 idle days; after 90 days paused, one-click restore is disabled. *(Done 2026-08-15: the existing workflow was pinging a deleted project; repointed.)*
2. **PWA + service worker + split the 573 KB bundle** — an artifact, not a browser tab; faster first load on bad wifi.
3. **Quality net: lint + Vitest on the rules engine + a few Playwright phone flows** — stops an AI pair quietly degrading 13.6k lines.
4. **Battle mode phase 1** — turn awareness + "what can I do right now" on the phone.
5. **One diegetic carnival minigame — the Fortune Wheel** — reuses the snail-derby broadcast plumbing.

## Part A — Claude Max playbook (summary)
- Max 20×: rolling 5-hour sessions (~900+ messages / 5h), weekly caps (all-models + a Sonnet cap; no rollover), ~50 sessions/month guideline. Claude Code and claude.ai share ONE quota. Context is 200K on every plan. If `ANTHROPIC_API_KEY` is set, Claude Code bills the API instead — audit env vars.
- On one build day a week you will not hit caps. **Don't ration messages — spend them on verification, review, tests.**
- Routing: Opus (high/max effort) for architecture, risky work, migrations; Sonnet for bulk implementation once a plan exists; Haiku for lookups/mechanical work. Thinking earns its cost on judgement, not rote edits.
- Prompt caching is automatic (system prompt, tools, CLAUDE.md). Editing CLAUDE.md mid-session doesn't take effect until `/clear`. Durable context beats chat churn: put the worldview in CLAUDE.md/docs; add deltas.
- Plan mode first for anything non-trivial. Subagents for side quests and adversarial review; a Haiku explorer + Sonnet reviewer is a cheap pair. Worktree fleets are overkill for a solo build day.
- Supabase MCP read-only against production; write only against a throwaway branch/project. Never commit keys.
- Weekly rhythm: retro (15m after session) → prep (`/clear`, CLAUDE.md current, ONE feature, plan in Opus) → build (Sonnet) → verify (lint + Vitest + Playwright + adversarial review subagent) → ship (`main` → Vercel) → real-phone walk before the session.
- Prompt templates (build with tests · verify vs SRD · reseed the Book · review the diff · walk the phone viewport) — see brief §2.7 in the original report.
- Quality toolkit: Biome (or keep oxlint), Vitest on pure rules logic, Playwright with iPhone (WebKit) + Pixel (Chromium) projects, `strict` + `noUncheckedIndexedAccess`, bundle analyzer + `React.lazy` + vendor `manualChunks`, budgets (~170 KB gz JS mobile; TBT ≤ 200 ms; LCP ≤ 2.5 s).
- Guardrails: show rows/DDL before running; additive migrations only; back up before schema changes; one feature per build day; time-box rabbit holes (`/clear` and re-plan after ~2 failed tries).

## Part B — Experience design (summary)
- **What loved apps share:** Jackbox's frictionless join + private-per-phone info (we already have it — protect it); Owlbear's restraint (keep the iPad map simple); D&D Beyond's data model but not its heads-down density; Descent's principle: the app orchestrates mood/bookkeeping while the shared space stays the focus.
- **Be more beautiful:** ceremonies (level-up, signing, a piece coming home), the iPad stage, the finale. **Get out of the way:** the play sheet in combat, joining, anything touched every few seconds. Haptics = progressive enhancement only (iOS Safari has no Vibration API; the checkbox hack died in iOS 26.5).
- **Carnival games (each ≤ 60 s, DM-triggered, one-tap close, "return to story" control):** Fortune Wheel (build first, ~1d) · Ring Toss for Lanterns (~1–1.5d; resolve timing on-phone) · Catch-the-Pixie (~0.5–1d; device-timestamp taps) · Strong-Man Bell (~0.5d; hold alternative for accessibility) · Shell Game with a fairy who cheats politely (~1d) · The Bargain — sealed secret bids (~1.5d; best fiction fit).
- **Battle mode, three screens:** P1 turn awareness + "what can I do right now" (~1d) · P2 fast HP/condition entry + death-save ceremony broadcast (~1d) · P3 living iPad battlefield: lighting/weather tints, sound bed per phase, token move animation, simple fog (~1.5–2d, Owlbear-simple) · P4 "what just happened" recap to phones (~0.5–1d).
- **Sound:** Tone.js (lazy-loaded) for the musical/generative layer; raw Web Audio for one-shots. iOS needs a tap to unlock (on-theme) and won't play if the ringer is silent. Free sources if ever needed: Freesound CC0, Pixabay; BBC RemArc is non-commercial only. Finale "melody on every phone": pre-position the synth params, unlock audio early, broadcast a shared start time; embrace slight drift.
- **Beyond screens:** the Moon on the iPad ambient screen and the Story tab, driven by one DM-set value · smart lights (Hue/Govee) controlled from the DM's devices, outside the app · printed contracts/wax seals/a physical "piece comes home" token · post-session recap handouts.

## The stack decision — stay and improve
No framework change (client-heavy real-time SPA; migration risks data for no payoff). Supabase Realtime is enough (200 connections / 2M msgs per month vs six devices); revisit only for server-authoritative competitive games. Vercel Hobby fine. Supabase Free + keep-alive; consider Pro ($25/mo) only for effortless daily backups. Tailwind v4 + a few Radix primitives; own small "artifact" components; no shadcn wholesale.
Zero-data-loss discipline for schema changes: `pg_dump` before any change (Free has no downloadable backups); additive migrations only; never rewrite `players.device_token` or `characters` JSONB; test on a throwaway project with MCP read-only against production; keep down-scripts + the pre-change dump; `git revert` rolls the app back.

## Eight-week roadmap (~1 build day/week)
1. Keep-alive cron + first full `pg_dump`. *(cron done)*
2. Quality net: lint + strict TS + Vitest on rules + 3–4 Playwright phone flows.
3. PWA + bundle: `vite-plugin-pwa`, analyze, lazy-load Spells/Guide/dice/level-up, vendor `manualChunks`.
4. Battle mode P1.
5. Battle mode P2.
6. Fortune Wheel.
7. Sound upgrade (lazy Tone.js) + The Bargain.
8. Living iPad (P3) + finale broadcast-start mechanism.

## Do-not-build
Server-authoritative competitive minigames · framework migration · heavy component library · AI art beyond the Mirror · in-app copyrighted music / Spotify · commercial features on free tiers · anything inviting heads-down browsing · sample-perfect multi-phone audio sync · a fleet of parallel worktrees.

## Open questions (ranked)
1. How often will minigames actually be used? 2. Smart lights — yes/no? 3. Supabase Pro for backups? 4. How exact must the finale's simultaneity be? 5. Will the app ever leave the home table? 6. Heavy browser-Claude and Claude Code in the same week (shared quota)?
