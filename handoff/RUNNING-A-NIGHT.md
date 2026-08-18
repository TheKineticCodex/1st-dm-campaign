# RUNNING A NIGHT
### How a first-time Dungeon Master gets through six checkpoints without stalling
*A plan. No code was written. Every measurement in it was taken in a browser against `main` at 834×1194, not estimated.*

---

## 0. What I actually did before writing this

I read the repo, then I ran it. Dev server, iPad viewport, signed in as `LANTERNKEEPER`, walked the Gate → Midway → Grey-Gill. Every number below is a real `getBoundingClientRect()`, not a guess. Two things I want you to know up front, because they change what I think the problem is:

**The read-aloud sits at y = 879 with an *empty* party strip.** With your five chairs in it, that is the ~1050 you already measured. The first door button at the Gate is at **y = 1750** — the usable screen ends at 1139. So on the night, the thing the party does next was **611 pixels below the fold**, under a 559px NPC card.

**And this, which I did not expect.** I tapped through to Grey-Gill's tent, then opened “📖 More on this scene”. It said:

> **No current beat.**

The spine was standing in Grey-Gill's tent. The panel underneath it — the one holding the truth of the scene, the five approach-doors, the NPC list — did not know what scene we were in. Not a stale render; it was never wired to the same pointer. On the night of 17 August, that fold said “No current beat” from the first lantern to the last, because you never pressed a button on a *different tab* that nothing told you to press.

That is not a layout problem. Half your Book was dark all evening and nothing said so.

---

## 1. The diagnosis, in one paragraph

You didn't run out of material — you ran out of *instruction*. Everything the Book gave you answers the question “what is true about this scene?” Nothing answers “what do I say, right now, and what do I do when they answer?” Those are different documents and the app only has the first one, written four times over (`nightPath.ts`, `act1Scenes.ts`, `runbook.ts`, `cheatSheet.ts`), organised by topic rather than by time. A DM mid-scene has no attention for topic-navigation; he has attention for exactly one thing, the next move. So “there wasn't enough information to go off of” and “I got overwhelmed” are the same sentence: there was a great deal to read and nothing to *do*, and the doing was 611px below the fold behind a card about people you already had in front of you. Then you hit checkpoint four, which is the first checkpoint in the night that is not a procedure — the Gate is “ask five questions,” the Midway is “run a game,” Grey-Gill is “fire five whispers,” but **The Missing Note is a thing that may or may not happen**, and the Book answered that with five options and no default. Options are the cruellest thing to hand a frightened person. **And Peaches was not in the app.** Checkpoint four is Peaches's scene end to end; the one protagonist it is about had no phone in the Fair, so half its buttons were greyed out and its whole dramatic engine was missing — and the app never once mentioned that the scene it was walking you into belonged to someone who wasn't in it. You stalled at the exact point where the app stopped being a script and started being a menu, in a scene about someone who wasn't in the room.

I agree with your framing and I'd sharpen it: the app is a **reference work** and running a session needs a **prompter**. Everything below follows from that one swap.

---

## 2. The shape

### What replaces the scrolling page

**One beat at a time. Full screen. One gold button.**

A checkpoint stops being a card on a long page and becomes an ordered list of **beats**. A beat is one of four shapes, and it fills the screen:

| shape | what's on it | the gold button |
|---|---|---|
| **say** | the words to read aloud, large, at the top, nothing above them | *said it →* |
| **do** | one instruction, and the one button that instruction needs (send the whisper · set the room · start the carousel · hold up the slate) | *done →* |
| **ask** | a question for the table, and a place to type what they said | *they answered →* |
| **fork** | “what did they do?” and the doors | (the doors are the buttons) |

The fork is the only screen with more than one primary action, and it is correct there: it is the only moment the *table* has the initiative rather than you. Everywhere else, §9.6 holds exactly — one gold button, always in the same place, always meaning “I did that, next.”

**A beat never scrolls.** If a beat doesn't fit on the screen, the beat is too big and gets split into two. That is the design rule that makes the whole thing work, and it is the rule the current page cannot obey no matter how it is tidied.

So the Gate is not one screen with a paragraph, three bullets, seven buttons, an NPC card and five doors. It is:

> **1** say — the Moon line. one line.
> **2** say — the gold words.
> **3** do — hold up the slate (the iPad shows WELCOME → ADMISSION IS SOLD IN SETS)
> **4** ask — “What brought you here?” · Peaches ▸ [ ] · Billy ▸ [ ] · Philip ▸ [ ] · Freya ▸ [ ] · Freya Moon ▸ [ ]
> **5** do — hold up FIVE. THAT IS THE SET.
> **6** do — set the room to the Getting Fair
> **7** fork — what did they do? *(the five doors)*

Seven taps, seven screens, no scrolling, and the toll answers get typed into the app as they're said — which is the first time in this campaign's life they have anywhere to live.

### The number

| | today | after |
|---|---|---|
| top of the gold read-aloud, iPad 834×1194, five in the strip | **y ≈ 1050** | **y ≈ 170** |
| first door button, checkpoint 1 | y = 1750 (611px below the fold) | on screen, always |
| Tonight tab height, checkpoint 1 | 3267px | one screen |

170 is: the plate (93px) + a single thin line saying *checkpoint 4 of 6 · the carousel · 25 min · Peaches is not here* (~55px). Nothing else is allowed above the words you say. The party strip becomes that thin line during a beat; its full form stays on the Table tab where it belongs.

### The four alternatives, and what I did with them

**One-thing-at-a-time / prompter mode — adopted.** It is the only shape that answers “I didn't know what to do,” because it makes the next action the *default state of the screen* rather than something you go and find.

**A printed run-sheet, app reduced to a button box — adopted as half the answer, and I want to be plain about this.** Part of your problem is not solvable in software. A screen can hold your attention or the table's, not both, and a screen loses its place when you glance away. **Print one page and put it next to the laptop.** Six boxes, the gold words in full, the doors, and one fallback line each. It costs a print stylesheet and a route, it can't crash, it doesn't scroll, and it works if the wifi dies. I've made it **step 1**, before any interface work, and I think it alone would have got you through 17 August. That is a slightly humbling thing for an app plan to conclude and I'd rather say it than not. What the paper *can't* do is send a sealed whisper to the right phone, run the snail derby, or light the iPad — which is why it's half the answer and not the whole one.

**A two-screen split, laptop shows only the next action — rejected.** You have two screens and the second one belongs to the players. Turning the iPad into a DM prompter breaks §8.4 (the iPad is the shared focal point) and takes the stage away from the table for the whole night. The prompter has to live on the laptop.

**A “what do I do now?” button that always returns one concrete instruction — rejected as the shape, adopted as the valve.** If the button is the *only* route to direction, then getting direction requires asking for it, and a person who has frozen does not press buttons. Direction has to be the resting state of the screen. But as the thing you hit when the table has gone somewhere you have no line for, it is exactly right — see §4.

---

## 3. The moment-to-moment loop

I'm walking **The Missing Note**, because that is where you stopped.

### Arriving

You tap the last door of Grey-Gill's tent — *they sit for their readings*. The screen changes. It does not scroll; the old scene is gone.

Across the top, one thin line in copper:

> checkpoint 4 of 6 · the carousel · 15–25 min

And directly beneath it, because Peaches is not among tonight's faces (you said so in ten seconds before the first lantern — see §9.1a), one line in sea-blue that you cannot miss and did not have to go looking for:

> **Peaches isn't at the table tonight. This scene is hers. Here's how to run it without her →**

Tapping that gives you one screen — a paragraph *you* wrote in advance about running the carousel when Peaches is absent — and then drops you back. If she *is* playing, that line never appears. And if she's playing but her phone hasn't found the Fair, you were told that while people were still getting drinks, not here. (The paragraph doesn't exist yet; only you can write it. The app's job is to notice and ask, and it will ask you for it in the pre-flight list, not at the table.)

### Beat 1 — do

Centre of the screen, one instruction, one button:

> **Start the carousel. Let it loop under everything.**
>
> [ 🎠 the carousel — the song with the hole ]
>
> *said it* → **it's playing →**

You press the carousel button. The music starts. The iPad, which has been showing *the carousel* since the moment you arrived, is already lit — no action needed, that push is automatic now. You press the gold button.

### Beat 2 — say

The whole screen is the gold words, at 21px, starting at y ≈ 170:

> *“The carousel turns on its own. The organ inside plays something old and sweet — and every time it comes round, in the same place, one note is simply missing. There is a hole in the middle of the tune. The man working the lever is crying, and does not seem to know it.”*

Nothing else on the screen but the gold button: **said it →**

### Beat 3 — the wait

This is the beat that was missing from the app entirely, and it is the whole scene:

> **Now do nothing.**
>
> Let them look at it. Don't explain the hole. Don't warn anybody. If the silence gets long, that is the scene working.
>
> **they did something →**

That screen is the answer to “I didn't know what to do.” Sometimes the correct next action *is* nothing, and a beginner cannot know that unless the app says it in those words.

### Beat 4 — fork

> **What did they do?**
>
> ▸ Peaches hums the missing note
> ▸ Someone else hums it
> ▸ Nobody hums; they walk on
> ▸ They take the organ *(⚔ this opens the boss)*
> ▸ They open the organ
> ▸ *something else* →

That last row is new and it matters more than the five above it. It is the honest admission that your table will do a sixth thing, and it leads to the valve in §4.

### When they do something not on any list

Say a player asks the weeping operator what he is crying about, which is on no list anywhere. You tap **something else**, and you get **one screen, one sentence** — the fallback written for *this beat*:

> **“Yes — tell me how.”** Then ask for a roll: easy 10 · medium 15 · hard 20.
>
> *another →*

Tap *another* and you get the next one written for this scene:

> He has to think about his own name before he answers. Let that be the whole answer.

Tap again, and again, and you eventually reach the general ones — *“Hold that thought. Everyone else, what are you doing?”* — and then a Wonder card, drawn right there, on that screen, with a button to send it to every phone. Which is the first time `PANIC_LINES`' instruction to *“Draw a Wonder card”* has been true from the screen that says it.

Then: **back to the beat**, exactly where you were.

### Beat 5 — the branch that fires

Nobody hums; a player pushes the operator instead; you tap *nobody hums; they walk on*. You get:

> **say** — *“Lovely tune, isn't it. Always has been,”* he says, humming along, weeping, and not noticing either.
>
> **said it →**
>
> **do** — Freya Moon's pendant stirs. First time it has ever done that.
> [ ✉ Freya Moon: the pendant stirs ]  ← *she's here, this will land*
>
> **done →**

And here is the rule that keeps §“every whisper reaches a phone” true: **if the target isn't at the table, the beat does not quietly grey out a button.** It says so by name, and it gives you the way through:

> ✉ **Peaches isn't playing tonight — this one can't send.**
> Read it aloud to the table instead, or hold it for her:
> *“You know the missing note. You have always known it…”*
> [ keep it for Peaches ]   **done →**

“Keep it for Peaches” writes it to a small list so the next time she joins, it's still waiting. Nothing is silently dropped. That single change is the difference between nine whispers sent and two landing, and nine whispers sent and you *knowing* which two landed.

### The transition into the next checkpoint

You tap the last beat's gold button. One screen, held for as long as you want:

> **checkpoint 4 done — the note stays missing**
>
> They left it alone. It will find them later.
>
> *next up:* **Whispers in the Dark** · 10–15 min
> The lanterns dim for the midnight show. Five visions, one each — every one walking toward the back fence.
>
> **[ walk on → ]**     *back a step*

Three things happen when you tap *walk on*, none of which you do by hand: the iPad changes to the new room, the trail records *left the note alone*, and the first beat of the new checkpoint comes up. That's the transition you described as messy — it becomes one tap and a sentence telling you what you're walking into before you walk into it.

---

## 4. The overwhelm valve

**The current `if you freeze` control is not enough, and it is worse than not enough — it lies.** It shows the first three of six `PANIC_LINES`, generic to the whole campaign, and one of the three it doesn't show tells you to draw a Wonder card from a screen that has no Wonder deck on it. It also sits in the plate at the top, which is where your eyes are not when you are frozen.

Replace it with three things:

1. **Every fork ends with `something else →`.** The valve is reachable from the resting state, not from a control you have to remember exists.
2. **Every beat carries its own `stuck` lines** — two or three, written for that beat, in the data. That is a content field on every beat and the plan makes it **required**: a unit test fails if any beat lacks one. This is what turns “not enough information to go off of” into a promise the codebase enforces.
3. **The lines run out into the general ones, then into the Wonder deck, on the same screen.** You can keep tapping forever and always get one concrete thing.

And one rule about the valve's shape: **it gives you one line at a time, never a list.** A list of six things to try is the same problem as five doors — it is another decision. One sentence, and a button that says *another*.

The plate's `if you freeze` becomes a second door into the same screen, and the sea-blue panel of three lines is deleted.

---

## 5. What gets deleted

A plan that only adds is the trap you named, so here is the ledger. Everything below either goes or moves.

### Deleted from the Tonight tab

| what | height today | where it goes |
|---|---|---|
| `TheRhyme` card | **476px** at checkpoint 1 | becomes beat 0 of checkpoint 1 — it *is* a “say” beat. Data stays in `tale.ts`; the whole rhyme moves to Look it up. |
| Fold 🌕 *A Freya called Sun, a Freya called Moon* | 52px closed | Look it up. It is never needed mid-scene — `ECLIPSE_NUDGE` already sits in `alsoMight` where it belongs. |
| Fold 🗓 *Tonight's clock* | 52px closed | **deleted outright.** It's a table of contents for a page that no longer scrolls. Its only content (`c.doThis[0]`) is now the beats themselves. |
| Fold 🕯 *Before the lanterns* | **790px, and it sits open all night** | becomes its own pre-flight screen, shown when the Book opens and the night hasn't started, replaced by the prompter the moment you begin. This kills the wedged-open bug structurally instead of patching `Fold`'s mount-once behaviour. |
| Fold 📖 *More on this scene* → **all of `RunNight`** | +811px empty, ~1650px populated | **the component is deleted.** Its four unique things are rehomed — see below. |
| `WhoIsHere`'s full cheat-sheet card | **559px, open, at the Gate** | a two-line strip (*Hush writes · Hum hums · they are not cruel and not free*), full card one tap into the drawer. **−480px.** This was my worst call last time; it's the biggest single offender on the page. |
| `BattleCard startOpen` | ~300px open | the battle becomes its own beat, entered only through the door that opens it. |
| the sea-blue `if you freeze` panel | ~150px when on | replaced by §4. |

### Deleted from the data

- **`TONIGHT_BEATS` in `cheatSheet.ts`** — the fourth copy of the night. Gone.
- **`RUN_SCENES[].beats` prose strings for the six session-3 scenes** — the fifth copy, and interestingly the closest thing to this plan that already exists. They become the typed beats. (The `key` stays; `runbook.test.ts` keeps passing.)
- **`PartyGlance`** merges into `PartyStrip` — two layouts of one thing.
- **The Porter's duplicate stat block** — `runbook.ts:358` says “run at HP 45” in its force line while the card next to it renders HP 33 from `F.animatedArmor`. One block, one number, your ruling.

### Where `RunNight`'s four unique things go

| | to |
|---|---|
| `guide.truth` | into the beat data as the drawer's first line — “what this scene actually is” |
| the eight *How to DM* cards (`dmBasics.ts`) | Look it up. They are for the week before, not the moment. |
| the soundboard (room beds, song, the SFX bank) | extracted to `src/components/Soundboard.tsx`, mounted on **Table** beside `StageControls`. The beats already carry the buttons a scene needs; the full board is for when you want something the scene didn't anticipate. |
| the Wonder deck (`wonder.ts`) | into the stuck valve, §4 |

### The `nightPath.ts` / `act1Scenes.ts` duplication

**My proposal: `nightPath.ts` becomes the source of truth for the six session-3 scenes. `act1Scenes.ts` keeps its keys and stays the source of truth for Acts 2–3 and for the `cues`.** Concretely:

- `cues` and `ambience` move *into* the checkpoint (they are already read from `ACT1_SCENES` by pointer; the pointer stops being needed). `ACT1_SCENES` keeps every key so `runbook.test.ts` passes untouched.
- **Grey-Gill gets an `ambience` field.** `act1Scenes.ts:356-357` is the only Act 1 carnival scene without one, which is why the heart of the night has no *set the room* button while three other surfaces order you to press it. That's a one-line fix and it is in step 2.
- The five thematic doors (`fight/talk/sneak/bargain/insane`) — **these were never on your spine at all.** They fold into the beats' `stuck` lines and the drawer. They are good writing and they were invisible on the night.
- `moves` is populated for exactly two Session 1 scenes and `undefined` for all six of tonight's, and `NightPath` never reads the field. The feature built to answer your question was blank. It becomes the fork's `something else` list and gets filled for the six.

**The two read-alouds: I am not choosing between them and neither is the app.** Every one of the six scenes has two versions and in several cases each has something the other lacks — `act1Scenes`'s carousel has *“the horses' glass eyes are all turned toward the water”*, which `nightPath`'s doesn't; `nightPath`'s Grey-Gill has her spoken line, which `act1Scenes`'s doesn't. Several want to be *combined*, not picked. **They are your sentences.** I've put all six pairs side by side, plus the four factual contradictions, in `handoff/choose-the-wording.md`. Mark it up and the merge takes an afternoon. Until you do, nothing merges — the “older wording, for you, not to read” patch stays exactly where it is, because a patch that admits it's a patch is better than an agent quietly deleting your prose.

### Net effect on the Tonight surface

Today, checkpoint 1: **3267px**, of which 2128px is above the first door.
After: **one screen**, no scroll, at every one of the six.

---

## 6. The file-level plan

### New

| file | ~lines | notes |
|---|---|---|
| `src/components/Prompter.tsx` | ~280 | the one-beat screen. Reuses `Btn`/`C`/`display`/`eyebrow`/`seaLit` from `ui.tsx`, `fireCue` from `lib/cues.ts`, the trail rendering lifted from `NightPath.tsx:378-402`. |
| `src/components/CueRow.tsx` | ~90 | **extracted unchanged** from `NightPath.tsx:139-215`. It is already the best thing on the page — buttons directly under the bullet that asks for them — and both the prompter and the fallback card need it. |
| `src/components/StuckScreen.tsx` | ~70 | the valve. One line, *another*, then `WONDER` with the send button. |
| `src/components/RunSheet.tsx` | ~120 | the printable page. Reads the same beats. |
| `src/styles/print.css` | ~60 | `@media print` — hide the nav, black on white, page-break per checkpoint. |
| `src/lib/answers.ts` | ~70 | the five gate answers: read, write, list. Supabase when shared, `writeCache` when not. |
| `src/data/beats.test.ts` | ~60 | every beat has a `stuck`; every whisper target resolves; every “set the room” bullet has an `ambience`. |
| `e2e/dm-night.spec.ts` | ~120 | the measurement test — see §8. |

### Changed

| file | now | after | what happens |
|---|---|---|---|
| `src/data/nightPath.ts` | 387 | ~900 | `Checkpoint` gains `beats?: Beat[]`, `cues`, `ambience`, `standIn?: Record<playerName, string>`. Added **one checkpoint at a time** — the prompter renders beats when present and falls back to today's card when not, which is what makes step 4 shippable for the Gate alone. |
| `src/components/DmDashboard.tsx` | 1388 | ~1290 | `TonightTab` goes from 45 lines to ~10: pre-flight, or prompter. Four folds deleted. The `frozen` panel deleted. |
| `src/components/NightPath.tsx` | 509 | ~180 | keeps the trail and the fallback checkpoint card; `CueRow`, `WhoIsHere` and `BattleCard` move out. (`BattleCard` is imported by `TableSection` and `RunbookSection` — it moves to `src/components/BattleCard.tsx` and both keep importing it.) |
| `src/components/TonightSection.tsx` | 1343 | ~700 | `RunNight` deleted; `Soundboard` extracted; `TheThingWithNoName`, `PartyStrip`, `StoryTimeline`, `StageControls` untouched. |
| `src/components/BeforeTheLanterns.tsx` | 266 | ~300 | the *who's here tonight* row — five toggles, the first thing on the pre-flight list. |
| `src/lib/night.ts` | 63 | ~115 | `NightProgress` gains `beat: number` and `took` becomes `Record<string, {door: string; who?: string[]}>` — **the field that records which player took the marked door**, which `nightPath.ts:196` and `:261` both order you to note and the app has never had. Plus `playing: string[]` — who is at the table tonight, which is not the same question as who has ever joined. **Cache-shape change: needs a read-migration** so a mid-night reload doesn't lose the trail. |
| `src/data/stageCards.ts` | 96 | ~160 | cards for `greygill`, `note`, `whispers` — the three checkpoints the iPad currently has nothing to show for, i.e. the whole heart of the night. Hand-vetted lines only, same as every card there now. |
| `src/data/cheatSheet.ts` | 280 | ~245 | `TONIGHT_BEATS` deleted. |
| `src/data/act1Scenes.ts` | 876 | ~880 | Grey-Gill gets `ambience: 'tent'`. Session-3 `readAloud`s left alone pending your ruling. |
| `src/components/TableSection.tsx` | 1223 | ~1250 | `<Soundboard/>` mounted. |
| `src/components/CheatSheet.tsx` | — | +30 | `DM_BASICS` lands here. |

### Deleted

`RunNight` (from `TonightSection.tsx`), `TONIGHT_BEATS`, `PartyGlance`, `WhoIsHere` in its current form, three Tonight folds.

### Needs a Supabase migration — you run this by hand

The five gate answers need somewhere durable. **There is a Toll game already** (`lib/games.ts:67`, in the game booth) that collects typed answers from the phones — but `lib/gameHost.ts` never touches the store, so those answers travel on broadcast and are **dropped after 72 hours**. They have never been saved. The finale reads them back verbatim (`act1Scenes.ts:838`). Six surfaces order you to write them down and there is no field in the app that accepts them.

```sql
create table if not exists gate_answers (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  player_name text not null,
  answer text not null,
  asked_at timestamptz not null default now()
);
alter table gate_answers enable row level security;
-- then the same policy shape handouts already uses
```

Offline, they go to `writeCache` — `LocalStore` must keep working, per §3.5 of the doctrine. This is **step 3** and it is small.

---

## 7. Staging

Each step ships alone, reverts alone, and has its own check.

**Step 1 — the paper.** `RunSheet.tsx` + `print.css` + a *print tonight's sheet* link at the top of Look it up. Reads today's data; changes nothing else. **Verify:** print it, read it at arm's length, run all six checkpoints off the paper alone with the laptop shut.
→ **This is the step that alone would have saved session 3.** No code you run at the table, no scrolling, no place to lose.

**Step 2 — the data tells one truth.** Grey-Gill's `ambience`. The Porter's HP. The organ's inscription. Grey-Gill's timing. The three missing stage cards. Your rulings from `choose-the-wording.md` applied to the six read-alouds. `moves` filled for the six. No interface change at all. **Verify:** `npm test` (existing 91 pass, plus the new `beats.test.ts` assertions that would have caught Grey-Gill's missing room button).

**Step 3 — the gate answers get somewhere to live.** The SQL, `answers.ts`, and a plain field in the Gate's *ask* beat. Also viewable in Look it up. **Verify:** type five answers, close the browser, reopen, they're there; check the row landed in Supabase.

**Step 4 — the prompter, for the Gate only.** `Prompter.tsx`, `CueRow` extracted, `beats` on checkpoint 1. The other five checkpoints render exactly as they do today. A quiet switch in Look it up flips between the two. **Verify:** the new `e2e/dm-night.spec.ts` asserts the read-aloud's top < 300 and the gold button on-screen at checkpoint 1. Then you run the Gate both ways and say which you'd rather be holding.

**Step 5 — the other five checkpoints, the drawer, the stuck valve.** `beats` for 2–6. `StuckScreen`. The *who's here tonight* toggles (§9.1a) and the absent-protagonist line they drive. The whisper-can't-send handling. **Verify:** the e2e spec extended to all six; the dress rehearsal in §8.

**Step 6 — the deletions.** Only after step 5 has survived a rehearsal. The four folds, `RunNight`, `TONIGHT_BEATS`, `WhoIsHere`, the `frozen` panel, `PartyGlance`. The switch from step 4 is removed here. **Verify:** the Tonight tab's `scrollHeight` at every checkpoint is ≤ the viewport; nothing imports the deleted things; `npm run build` and `npm run lint` clean.

**Step 7 — the end of the night.** The last beat is a *write* beat: three lines, pre-filled with the doors you tapped and the marks they left, one button to keep it. `NotesSection` already exists and takes exactly this shape. **Verify:** finish a rehearsal night and check a `SessionNote` row exists without having gone looking for the Notes fold.

---

## 8. Verification

### The suites

`npm run build` · `npm test` (9 files, 91 tests) · `npm run lint` · `npx playwright test` (14 phone e2e, iPhone-WebKit + Pixel-Chromium) · and the three `live-e2e/` specs against real Supabase with three browser contexts, which are the only proof the three devices talk. `live-e2e/finale.live.spec.ts:49` asserts the nav label `Table` exactly — **that label does not change.** Nor does `Tonight`.

### Reproduce first, then fix

You flagged this and you're right to. Several bugs in this app were “verified fixed” by tests that could not have caught them. So each new test is written to **fail against `main` first**:

| test | fails on `main` because |
|---|---|
| `e2e/dm-night.spec.ts` — read-aloud top < 300 at all six | it is at 879 (empty roster) / ~1050 (five) |
| `e2e/dm-night.spec.ts` — primary action within the viewport | the first door is at 1750 |
| `beats.test.ts` — every scene that says “set the room” has an `ambience` | Grey-Gill doesn't |
| `beats.test.ts` — every whisper target resolves against the five canonical names | it passes now, and it would have failed before `a1884b6` — it is the regression lock on the bug that cost Freya Moon five readings |
| a `live-e2e` addition — the stage receives a write at every checkpoint transition | on 17 August it received **one**, at 02:29 |

The read-aloud test uses a new Playwright project, `dm`, at 834×1194 — the phone projects can't see the DM view at all, which is why every measurement problem in this app has been invisible to CI.

### The dress rehearsal — nothing ships without it

You, alone, at the table you'll actually play at, with the iPad on its stand and no players. One evening. Walk all six checkpoints. Say the words out loud — actually out loud, because reading silently hides the thing that matters.

At **every** checkpoint, all of these must be true before you move on:

1. The words you read aloud are the first thing on the screen and you did not scroll to reach them.
2. There is exactly one gold button and you knew what it meant without reading twice.
3. You never once had to leave the screen you were on to do what the screen told you to do.
4. You pressed `something else` and got one concrete sentence about *this* scene — not a list, not a generic line.
5. The iPad changed when you arrived, and you didn't do anything to make it.

And these, once each:

- **At the Gate** — type all five answers. Then hard-reload the browser mid-scene. The answers and your place in the night both survive.
- **At the Midway** — run the Snail Derby from a beat, and get back to the beat you left without hunting for it.
- **At Grey-Gill's** — set the room (the button exists now). Fire all five readings one at a time. With a phone joined as one of the five, confirm it lands. **With the other four absent, confirm the app names each one and offers you the words to read aloud instead of greying a button out** — and that anyone you marked as not playing has no button there at all.
- **At the Missing Note** — with Peaches left untapped in *who's here tonight*, confirm the stand-in line appears at the top of the checkpoint before you need it. Then tap her back on with no phone joined, and confirm the pre-flight list says her phone hasn't found the Fair — the two absences must not look the same.
- **At the Whispers** — five whispers, and a written record afterwards of which reached a phone and which didn't.
- **At the Three Gates** — tap a gate, get the level-up and the end-of-night screen, write the three lines, and confirm the session note exists.

Then, the honest one: **run it a second time straight through and time it.** If any single beat took you more than a few seconds to understand, that beat is wrong and gets split. Tell me which ones and I'll split them.

---

## 9. Open questions — things I could not determine

**1. Was Peaches at the table on the 17th?** This is now the only part of that question still open, and you have already closed the rest of it.

**Philip did not play that night.** That is not a bug and I should not have listed it as one — it is a normal thing that happens when five adults try to be in one room. And **`'Peaches capiche'` is how she spells her own login**, so the seat name in `campaign.ts:48` is correct and my worry about it was wrong: she types it that way, so it matches.

What I still need to know is one thing: **was Peaches in the room and never got the app open, or was she also not playing?** The two have completely different answers and the design below covers both, so nothing is blocked on it — but it decides whether there is a join bug to hunt at all. If she wasn't there either, then there is no join bug: the night simply ran with three of five, and *that* explains an enormous amount about why it felt thin. Grey-Gill's five readings became three. The Missing Note's protagonist was absent. Two of five is not a technical failure, it is a different night.

The one residual name risk, and it is smaller than I made it sound: `FREYA = 'Freya'` and `FREYA_MOON = 'Freya Moon'` sit side by side, so a Freya Moon who types only `Freya` lands in Freya Sun's chair and receives **Freya Sun's** whispers. Both spellings happened to be present on the 17th so it didn't bite. Five tappable name chips at the gate instead of a free-text field would end it — but it is a small item now, not a headline, and it belongs in the tail rather than the critical path.

**1b. The five seats now exist in Supabase (done, 2026-08-18).** You asked for this and it is live. Two rows were missing — `Peaches capiche` and `Philip` — and they are now seeded on campaign `ec74111e…` with placeholder device tokens (`seed:peaches-capiche`, `seed:philip`).

**Why this is safe, and why it's better than it sounds.** `join_campaign` ends with:

```sql
on conflict (campaign_id, name) do update set device_token = excluded.device_token
```

and `players` carries `UNIQUE (campaign_id, name)`. So when Peaches's phone finally joins as *Peaches capiche*, it **adopts the seeded row** and swaps its real token in. No duplicate, and her `players.id` never changes — which matters because `handouts.target` is a **uuid foreign key to `players.id`**, not a name. That is the mechanical reason whispers to a missing player failed at the durable layer:

```sql
select id into v_target from players where campaign_id = v_campaign and name = p_handout->>'target';
if v_target is null then return; end if;     -- silently. no error. nothing sent.
```

With rows present, a whisper addressed to an absent player is now **written and waits** — it's on the phone the moment they open it. Before today it evaporated and the Book still said *"Whisper sealed and sent ✦"*, because `fireCue` never checks.

**The one thing still fragile, demonstrated rather than argued.** I ran the exact lookup that RPC does, for all five canonical names:

| the name `campaign.ts` addresses | server-side exact match | what the client resolves it to first |
|---|---|---|
| `Peaches capiche` | ✅ Peaches capiche | Peaches capiche |
| `William Blackwood` | ✅ William Blackwood | William Blackwood |
| `Philip` | ✅ Philip | Philip |
| `Freya` | ✅ Freya | Freya |
| **`Freya Moon`** | ❌ **null** | Freya moon |

Her row is stored with a lowercase *m*, so `dm_send_handout` still cannot find her by the name the code uses. It only works because `a1884b6` made the client resolve the name against the roster *before* sending. **Delete or bypass that one `seatNameFor` call anywhere and her readings vanish silently again** — the server-side `=` is the same bug one layer down, and it fails by returning quietly.

I did **not** rename her row to `Freya Moon`, deliberately: her device remembers the name it joined with, and `on conflict (campaign_id, name)` is exact — a rename means her next join creates a *second* row rather than adopting hers. The safe fix is on the server, not the data. **This needs your yes before I run it**, because it alters a `SECURITY DEFINER` function on the live database:

```sql
-- exact match first (nothing that works today changes), then a lenient fallback
select id into v_target from players
 where campaign_id = v_campaign and name = p_handout->>'target';
if v_target is null then
  select id into v_target from players
   where campaign_id = v_campaign
     and lower(btrim(name)) = lower(btrim(p_handout->>'target'));
end if;
if v_target is null then return; end if;
```

**1c. Nobody has forged a character on the live campaign.** Worth knowing before session 4, and I only saw it while doing the above: of the six player rows, **only `_moon` (your 15 August rehearsal seat) has a character or a quiz result.** Freya, Freya moon and William Blackwood all joined on the night with a name and nothing else. So the Vault — their own typed words, the callback engine of §6 of the doctrine — is **empty for every real player**, `partyLevel()` is falling back to `NIGHT_PATH.writtenFor` because no roster entry has a level, and the party strip has no hit points to show for anyone. Grey-Gill's five readings survived that only because they are hand-written in `act1Scenes.ts` rather than drawn from the vault. If you want the callbacks to fire in Act 3, the divination has to actually happen on their phones — that's a *before session 4* item, not a plan item.

**1a. The design change your two sentences actually produced.** The app cannot currently tell these two states apart:

- *Philip is not playing tonight* → plan around him. His whispers should not exist. His gate slot should not be blank and waiting.
- *Peaches is here but hasn't opened her phone yet* → go and fix that in the first two minutes, before the Gate.

Today both look identical: no row in the roster, buttons greyed, a tooltip naming someone who isn't coming. The Book infers presence from *"has this person ever joined"*, which is the wrong question — **and after §9.1b it cannot infer it at all**, because all five rows now exist permanently. That makes the toggle load-bearing rather than merely nice: seeding the seats fixed the whispers and removed the only signal the app had about who is in the room, so the toggle is the thing that replaces it.

**So the pre-flight list gains one step, and it is the first one:** five faces, tap the ones who are playing. That's it — ten seconds.

> **who's here tonight?**
> tap everyone who's playing.
> `[Peaches] [Billy] [Philip] [Freya] [Freya Moon]`

From that one tap everything downstream behaves:

- Anyone **untapped** is *not playing*. Their whispers never render as broken buttons. Their gate answer isn't asked for. The checkpoints they carry show your stand-in paragraph at the top before you need it. Philip's night simply isn't in the way of yours.
- Anyone **tapped but not joined** gets a line in the pre-flight list that will not clear until their phone is on: *"Peaches is playing but her phone hasn't found the Fair yet."* That is a thing to fix while people are still getting drinks, not a thing to discover at Grey-Gill's tent with five people watching.
- The party strip and the whisper buttons stop lying in both directions.

This is cheap — one row of toggles in `BeforeTheLanterns.tsx`, one field on `NightProgress` — and it goes in **step 5** beside the absent-protagonist handling. On 17 August it would have meant Philip was never mentioned once all evening, and Peaches's missing phone was a thirty-second problem at the start rather than a hole in the middle.

**2. Which read-aloud is the real one, per scene?** Yours to say. `handoff/choose-the-wording.md` has all six pairs side by side and four factual contradictions. In at least two cases I think the answer is *both, combined* — I've said which and why, and I have not written a word of your prose.

**3. Do you want the five gate answers in the app, on paper, or both?** My recommendation is **both, and typed as they're said**: the app for the finale (it must read them back verbatim in Act 3 and paper does not survive two years) and paper because you'll want to look at faces, not a keyboard, while five people answer honestly. The *ask* beat has a field per player; if the room is quiet you type them, and if it isn't you write them on the run-sheet and type them in the car park afterwards. But if you'd rather the app not ask you to type at that moment at all, say so — it's a five-minute change and the beat becomes a reminder instead of a form.

**4. Two smaller ones.** Several surfaces point at a *playbook* and battle codes (`CARN-A`, what-ifs 4, 13, 14) that the app cannot open — `campaign/act1-playbook.md` exists in the repo but is not loaded. Do you want those references stripped, or the playbook surfaced in Look it up? And `nightPath.ts:346` puts Philip on two of the three gates. Deliberate, or a slip?

---

## 10. What I'm promising, and what I'm not

**Promising:** the words you read aloud sit at the top of the screen at all six checkpoints. There is one gold button and it always means the same thing. There is always a concrete next action, including when the table goes somewhere nobody wrote down. Every whisper either reaches a phone or tells you by name that it didn't and hands you the words. The iPad is lit from the Gate to the last gate. The Tonight surface is one screen instead of 3267 pixels.

**Not promising:** that software fixes the whole of this. Part of the answer is a sheet of paper next to the laptop, and step 1 is that sheet, before any of the rest. And the stand-in paragraphs for an absent protagonist have to be written by the person who wrote the campaign — the app can notice, and ask you at the right moment, and hold what you write. It cannot write it.

*The lanterns are already lit. This is just about knowing which one to look at.*
