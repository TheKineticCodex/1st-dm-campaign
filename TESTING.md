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

## Phase 2 — DM Dashboard

Best on the iPad, works on the phone. If you were signed in as a player on
this device, tap **leave** first.

**Getting in**
- [ ] At the gate, enter code `LANTERNKEEPER` and your name — you land in **The Lantern-Keeper's Book**, not the player app.
- [ ] Note the line under the title: before Supabase is set up it says "offline — showing this device only"; after, "campaign-wide".

**Roster**
- [ ] With no players joined it says "No travelers yet."
- [ ] (After Supabase setup) Have a player build a character on their phone, then tap **refresh** — their card appears with HP, AC, Passive Perception, Initiative, and Spell DC if they're a caster.
- [ ] If they wrote something in "What I lost", it shows on their card marked 🔒.

**Vault**
- [ ] Each player who took the quiz has a card with every answer; the two Lost-Thing questions ("risk everything to get back" / "afraid of losing") burn gold with a ✦.

**Lost Things**
- [ ] Each forged character has three boxes: What was taken / What they believe / What actually happened. Type in each, tap elsewhere, switch sections and come back — still there.
- [ ] Verify on a player's phone that none of this is visible anywhere.

**Notes**
- [ ] **+ New session note** opens the template (What happened / Clues found / Clues missed / NPCs met / Threads open). Save it; it appears in the list as "Session 1".

**NPCs**
- [ ] **Quick-add NPC**, fill in name + a trait, save. The card shows.
- [ ] Search for a word from the trait — the card is found. Search nonsense — "No match in the book."

**Clues**
- [ ] **+ New conclusion**, type a conclusion and three clues, tick one as found, tap **save changes**. Reload the page — everything is still there, tick included.

**The prep test (the real one)**
- [ ] Sit with the iPad and prep Session 1 — NPCs, clue paths, each character's Lost Thing — without touching paper.

## Phase 3 — Table Mode (+ Sealed Whispers)

The **Table ⚔** section of the DM view. Initiative and the map work
before Supabase; anything reaching the players' phones needs Supabase set
up (the section tells you which mode you're in).

**Initiative (works offline, on the iPad)**
- [ ] Open Table ⚔. Each forged character is already listed. Type an enemy name, tap **add**.
- [ ] Give everyone an initiative number, tap **Begin the encounter** — the list sorts high-to-low with the top row lit gold.
- [ ] **Next turn →** moves the gold marker and wraps around at the bottom.
- [ ] (After Supabase) Players' phones show a banner: whose turn it is, "You're up next", and a gold "Your turn!" when it's them.
- [ ] **End encounter** returns to setup, and player banners disappear.

**Handouts**
- [ ] Write a title and text, leave target on "Everyone", tap send. (After Supabase: every player's phone gets a sealed envelope.)
- [ ] Pick "Only [name] 🤫" — just that player receives it. Confirm the others see nothing.
- [ ] On the receiving phone: an envelope with a wax seal. Swipe across it (or tap the fallback) — the seal breaks, the text types itself out.
- [ ] Send one with the "fades 60 seconds" box ticked — after the seal breaks, a countdown shows, and the whisper vanishes on its own.
- [ ] Rehearsal without Supabase: send a handout as DM, tap leave, rejoin with the player code — the envelope arrives on this same device.

**Map (iPad, offline is fine)**
- [ ] Tap **Choose a map image**, pick a photo/scan of yours. Party tokens appear at the bottom edge.
- [ ] Drag tokens with a finger — they move smoothly and stay put after a reload.
- [ ] **+ Enemy token** adds a red token; **Clear map** (confirm) empties the board.

**The mock-session test (the real one)**
- [ ] Run one combat and deliver one secret handout with zero player confusion.

## Phase NEXT-1 — First Night Kit (Snail Derby · Condition Co-pilot · Roll Feed)

Needs two devices for the live parts: your iPad (DM) and a phone (player,
private tab is fine). This doubles as the **witness protocol** — do the
whole list before Session 1.

**The Great Snail Derby 🐌**
- [ ] iPad → Table ⚔ → **Start the Snail Derby**. Every joined player's phone is taken over by the race screen with a giant TAP! button.
- [ ] Mash the button on the phone — the snail 🐌 crawls along that player's lane on the iPad in near-real-time.
- [ ] First phone to 40 taps gets 🥇 on its lane. Tap **Call the race** — every phone shows its medal and placement, then returns to normal by itself.
- [ ] Run it twice in a row — the second race starts clean.

**Condition co-pilot**
- [ ] iPad → Roster → on a character's card tap **+ condition** → pick one (say, Frightened).
- [ ] Within a second or two, the player's Sheet shows the condition with its plain-language explanation. Tap the chip on the iPad (✕) to lift it — it vanishes from the phone.
- [ ] On the phone: in the Spellcasting panel, tap **"Tap when you cast a concentration spell"**. Then take 1 damage (− button). A gold **"The spell wavers"** panel appears — tap to roll. 10+ says "The spell holds"; less says it slips and the toggle clears itself.

**The table's dice — live**
- [ ] With the iPad on Table ⚔, roll anything on the phone (a skill, a save, the attack). It appears at the top of the iPad's dice feed within a moment, name and all.
- [ ] Roll until someone hits a natural 20 (or 1) — the feed row burns gold (or shows a tiny trombone 🎺).

**Calm the lanterns**
- [ ] Tap **calm the lanterns** in the header (player or DM view) — drifting motes, shimmer, and twinkles stop; content stays. **wake the lanterns** brings them back. The choice survives a reload.
