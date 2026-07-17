# Testing checklist ✦

Written for a non-developer. Do these on your **phone** (Safari) unless it
says iPad. Each phase's checklist is added when that phase ships.

## Phase 1 — Player Companion

Setup: open the app link on your phone. (Local dev: `npm run dev` and open
the printed URL.)

**Joining**
- [ ] You see "The Song the Sea Forgot" and two boxes. Enter code `SEAFORGOT` and your first name, tap **Step through the gate**.
- [ ] You land on the Fortune tab. Close Safari completely, reopen the link — you should go straight back in without re-entering the code.

**Fortune (the quiz)**
- [ ] Tap the name box and type — the keyboard should stay up the whole time (no flicker, no losing your place).
- [ ] Tap **Step inside**. Answer all ten questions (four ask you to type).
- [ ] You get three suggested classes, gold card on top.
- [ ] Tap **Copy my fortune for the DM** — the button changes to "Copied". Paste into Notes to confirm.
- [ ] Tap **Ask the lanterns again** — the quiz restarts from the door.

**Build (the forge)**
- [ ] From Fortune results, tap **Build this character** — your name and top class come along.
- [ ] On the species step, tap **all traits ▾** on any species — the full trait list unfolds.
- [ ] On the class step, you see "Subclass — unlocks at level 3 🔒".
- [ ] Try tapping **Next** without finishing a step — it should be grayed out every time.
- [ ] On abilities, each number (15, 14, 13, 12, 10, 8) can only be used once.
- [ ] Finish and tap **Forge my character sheet**.

**Sheet**
- [ ] Your name, class, HP, AC, and speed look right.
- [ ] Tap any ability box — a roll card rises from the bottom with a d20 result.
- [ ] Tap **Advantage**, roll again — the card shows two dice and keeps the higher.
- [ ] Tap the − button on HP twelve times. At 0 HP a **Death saving throws** panel appears. Tap + once — it disappears.
- [ ] If you built a spellcaster: tap a gold spell-slot pip to spend it (✦ becomes ·). Tap **Long Rest**, confirm — HP and pips refill.
- [ ] If you built a Warlock: spend the pact slot, then **Short Rest** — it comes back.
- [ ] Type something into **What I lost** — note it's marked 🔒 private (only you and the DM).
- [ ] Close Safari completely, reopen — your character is still there, on the Sheet tab.

**Guide**
- [ ] Tap Guide. Ten questions unfold and collapse when tapped.

**The 15-minute test (the real one)**
- [ ] Hand your phone to someone who has never seen this. Link → quiz → built character → rolling dice, under 15 minutes, no help from you.
