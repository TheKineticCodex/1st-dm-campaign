// Tonight's path — the Lantern-Keeper's choose-your-own-adventure.
//
// The night as a spine of checkpoints. At each one: the gold words to read,
// the few things to do, and the doors the party can walk through. You tap
// the door they took; the Book remembers and moves you on. Beside the doors
// sit the small ones — the things they might try that aren't on the list —
// so nothing at the table is a surprise you have to invent cold.
//
// Canon: campaign/the-story.md, src/data/runbook.ts, src/data/act1Scenes.ts.
// Monster numbers are SRD 5.2 from memory; glance once before the night.

import type { Foe } from './runbook'

export interface PathDoor {
  id: string
  /** What the party does — the thing you tap. */
  label: string
  /** What happens. Yours to know, not to read aloud. */
  then: string
  /** A battle this door opens, if any. */
  battle?: string
  /** Where it goes. Omitted = on to the next checkpoint. */
  goes?: string
  /** Marks the night — shown afterwards in the trail. */
  marks?: string
}

export interface Checkpoint {
  id: string
  title: string
  where: string
  minutes: string
  /** One breath: what this scene IS. */
  oneBreath: string
  /** The gold words — the only thing you read aloud. */
  readAloud: string
  /** The two or three things to actually do. */
  doThis: string[]
  /** The doors they might walk through. Tap the one they take. */
  doors: PathDoor[]
  /** Not on the list, but they might: small notes, so nothing is cold. */
  alsoMight: { if: string; then: string }[]
  /** The scene's own note about who this lands on. */
  lands?: { who: string; note: string }[]
  exit: string
}

export interface NightBattle {
  id: string
  kind: 'easy' | 'boss'
  name: string
  when: string
  /** The force as written, for the party's CURRENT level. */
  force: string
  /** Raw SRD XP of that force, for the budget line. */
  xp: number
  /** What to add if they have levelled since this was written. */
  ifStronger: string
  arena: string
  tricks: string[]
  /** How it ends without anyone dying — always have one. */
  ends: string
  win: string
  loss: string
  foes: Foe[]
}

export interface Night {
  session: number
  title: string
  /** The Moon line to read at the open. */
  moon: string
  /** The level this night was written for. */
  writtenFor: number
  checkpoints: Checkpoint[]
  battles: NightBattle[]
}

// ---------------------------------------------------------------- the foes

const flyingSword = (look: string): Foe => ({
  name: 'Empty costume (Flying Sword)',
  look,
  block: 'Flying Sword · CR 1/4 · 50 XP',
  ac: 17,
  hp: 17,
  speed: 'fly 50 ft (hovers)',
  attack: 'Longsword +3 · 1d8+1 slashing',
  special: 'Antimagic Susceptibility · False Appearance while still',
  tactics: 'Fences. Aims to disarm and drive back, never to kill. Drops when the stock is dropped.',
})

const porter: Foe = {
  name: 'The Porter (Animated Armor · boss)',
  look: 'A porter’s coat and gloves with nobody inside, carrying the organ like a coffin',
  block: 'Animated Armor · CR 1 · 200 XP — run at HP 45 and it is your boss',
  ac: 18,
  hp: 45,
  speed: '25 ft',
  attack: 'Multiattack: two slams +4 · 1d6+2 bludgeoning each',
  special:
    'At half HP the coat splits: it keeps fighting and the empty coat rises as one more sleeve (a Flying Sword). Say the seams tearing.',
  tactics: 'Stands over the organ. Never leaves it. Shoves rather than kills — it is repossessing, not murdering.',
}

// ------------------------------------------------------------- the battles

export const NIGHT_BATTLES: NightBattle[] = [
  {
    id: 'costumes',
    kind: 'easy',
    name: 'The Empty Costumes',
    when: 'They rob a stall, block the porters, or take a prize that was somebody’s',
    force: 'Five empty costumes (Flying Swords) — one for each of them',
    xp: 250,
    ifStronger: 'At level 2: seven sleeves, or five plus the Porter standing in the aisle watching.',
    arena:
      'The Midway: prize shelves (climbable, and they come down), ring-toss nets (throwable — a netted sleeve is grappled), lantern strings (cut one and a 10-ft patch goes dark)',
    tricks: [
      'They only want the stock back. Drop what was taken and every sleeve stops mid-air.',
      'They fence — disarm, drive back, herd. They do not chase anyone who runs.',
      'A cut lantern string drops the sleeve beneath it for a round.',
    ],
    ends: 'Dropping the goods ends it instantly, at any point, even mid-swing. Say that with the first hit.',
    win: 'The stall-keep apologises to the COSTUMES, not to them. First real sign of who the Fair works for.',
    loss: 'Nothing is taken but the goods, and a paper crown each "for the trouble" — the Fair is not cruel yet.',
    foes: [flyingSword('an empty sleeve holding a prop rapier, cuffs still buttoned')],
  },
  {
    id: 'organ',
    kind: 'boss',
    name: 'The Porter and the Turning Floor',
    when: 'They take the organ off the carousel — or the moment the missing note is hummed and they will not let it go',
    force: 'The Porter (Animated Armor, HP 45) + four empty costumes',
    xp: 400,
    ifStronger: 'At level 2: two Porters, and the platform turns twice as fast (exits move every half round).',
    arena:
      'The carousel platform, turning the whole fight — every round the exits are somewhere else; carved horses as cover; the organ sliding on its own',
    tricks: [
      'Say the platform turns at the top of every round, and move the exits. It is the whole fight.',
      'The organ slides toward Peaches by itself. Do not explain it. Let her decide what that means.',
      'The Porter shoves people off the platform rather than killing them — a shove is a fall, not a death.',
      'At half HP the coat splits and one more sleeve joins. Say the seams tearing.',
    ],
    ends:
      'If the organ crosses the Fair’s fence line, every costume stops at the line — they cannot follow. That is the escape hatch: run, don’t win.',
    win: 'They keep the song. Everything downstream is stranger, and the Fair now knows their faces.',
    loss:
      'The organ goes back on its spindle and each of them pays one personal item as a "restocking fee" — recoverable later at the drowned market, which is a reason to take the blue gate.',
    foes: [porter, flyingSword('an empty sleeve, prop rapier, cuffs still buttoned')],
  },
]

// ---------------------------------------------------------------- the path

export const NIGHT_PATH: Night = {
  session: 3,
  title: 'The Carnival Night',
  moon: 'A fingernail-paring of moon over the sand — thinner than last month, and closer.',
  writtenFor: 1,
  checkpoints: [
    {
      id: 'gate',
      title: 'The Gate of Paper Lanterns',
      where: 'A mile out on the wet sand',
      minutes: '20–30 min',
      oneBreath: 'A fence of paper lanterns, a gate, and two figures — Hush with the slate, Hum half-singing.',
      readAloud:
        'The lanterns start a mile out, strung on nothing you can see. At the gate stand two of them: one holds a slate, one is humming a tune you almost know. The slate says: WELCOME. Then the hand wipes it, and writes again: ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE.',
      doThis: [
        'Read the Moon line first. One line, then let it go.',
        'Ask each player, warmly, out loud: one honest answer. Write every one down — they come back at the very end, in their own words.',
        'The gate opens. Set the room to the Getting Fair.',
      ],
      doors: [
        { id: 'answer', label: 'They answer, one by one', then: 'The gate opens without a sound. Hush nods at each answer like a shopkeeper taking coin. Write them down.', marks: 'paid the toll honestly' },
        { id: 'lie', label: 'Someone lies', then: 'Hum stops singing — that is the whole punishment. Hush writes: THAT WAS NOT AN ANSWER. Ask again. No penalty but the silence.', marks: 'lied at the gate' },
        { id: 'climb', label: 'They climb the fence', then: 'They arrive MARKED. Every lantern watches them all night, and tonight’s whispers land harder.', marks: 'came in over the fence' },
        { id: 'bargain', label: 'They bargain their way in', then: 'Hush accepts a secret instead — "one secret, of Our choosing, later." Note exactly who took that deal.', marks: 'owes the Twins a secret' },
        { id: 'swing', label: 'They swing at the Twins', then: 'The Twins do not resist. The lanterns dim around violence until it stops, and the toll doubles. Nobody is hurt; everyone is embarrassed.', marks: 'swung at the Twins' },
      ],
      alsoMight: [
        { if: 'They ask what the Fair is', then: '"A fair." Hum shrugs. Hush writes: IT COMES WHEN IT IS OWED.' },
        { if: 'They refuse to go in', then: 'The lanterns wait. So does the tide, which has not come back. Let the silence do the work.' },
        { if: 'They ask about the tide', then: 'Hush writes one word: SOON. Hum stops humming for exactly one beat.' },
        { if: 'They count the lanterns', then: 'There is one for every person inside. Let them do that arithmetic themselves.' },
      ],
      lands: [{ who: 'Everyone', note: 'Five honest answers on paper. This is the campaign’s last scene, seeded tonight.' }],
      exit: '→ The Games of the Midway',
    },
    {
      id: 'midway',
      title: 'The Games of the Midway',
      where: 'The Midway — stalls, snails, prizes a little wrong',
      minutes: '40–60 min',
      oneBreath: 'Everything glitters, nothing has a price tag, and every stall-keeper knows their name before they say it.',
      readAloud:
        'Past the gate the noise arrives all at once: barkers, bells, a snail derby with a crowd three deep. Every prize on every shelf is beautiful, and not one of them has a price. A stall-keeper turns and greets each of you by name.',
      doThis: [
        'Run the Snail Derby from the game booth. Prizes: a paper crown that never tears, a bottle of applause.',
        'At a prize stall, Billy is paid in scrip — and one loose PAGE in Wren’s handwriting. "It washed up." Do not explain it.',
        'If anyone goes behind a stall: crates stencilled BELOW, in the same glass as Tarn’s bottle.',
      ],
      doors: [
        { id: 'play', label: 'They play the games', then: 'Let them win. The prizes are lovely and every one of them was somebody’s.', marks: 'played the Midway' },
        { id: 'raven', label: 'They chase the raven that steals the page', then: 'It goes over the stall roofs. They get the page back and a nest of stolen receipts — a free clue.', marks: 'chased the raven' },
        { id: 'rob', label: 'They rob a stall or block the porters', then: 'The costumes come off the shelves. This is the easy fight, and dropping the goods ends it.', battle: 'costumes', marks: 'fought the costumes' },
        { id: 'snoop', label: 'They snoop behind the stalls', then: 'Crates stencilled BELOW — the same glass as the bottle from the cellar. First hard proof the Ones Below are real.', marks: 'found the crates marked BELOW' },
        { id: 'frogs', label: 'They open the frog-pond tent', then: 'Two giant frogs, one screaming barker, hush-money in scrip. Comic. Philip is small enough to be swallowed — mind that.', marks: 'opened the frog tent' },
      ],
      alsoMight: [
        { if: 'They gossip with the crowd', then: '"The Toll-Twins never sleep." · "Don’t hum near the carousel." · "Grey-Gill knows you before you sit."' },
        { if: 'They try to buy something', then: 'Anything can be bought — for teeth, memories, birthdays. Anything serious gets the quill and a contract.' },
        { if: 'They ask a stall-keeper their name', then: 'A long pause. "…I’ll have it back on Tuesday." Then a smile, and business as usual.' },
        { if: 'They look for a price tag', then: 'There are none. There is a sign: WE NEVER CHARGE COIN.' },
      ],
      lands: [{ who: 'Billy', note: 'The page is his mentor’s handwriting, and the ink looks recent.' }],
      exit: '→ Grandmother Grey-Gill’s Tent',
    },
    {
      id: 'greygill',
      title: 'Grandmother Grey-Gill’s Tent',
      where: 'A tent that smells of salt and low tide',
      minutes: '25–35 min · the heart of the night',
      oneBreath: 'A woman with a shawl pinned high at the neck, eyes like the last hour before a storm, who knows them already.',
      readAloud:
        'The tent smells of salt and low tide. The woman inside does not look up as you come in. Her shawl is pinned high at the neck, and her eyes are the colour of the last hour before a storm. "Sit down, then," she says. "All five of you. I’ve been expecting the tide."',
      doThis: [
        'Fire the five readings one at a time, and leave a beat of silence after each. Their own words, given back.',
        'She recognises Peaches instantly, and says nothing about it.',
        'If she tries to say who holds her name: only bubbles come out. Show that once, then move on.',
      ],
      doors: [
        { id: 'sit', label: 'They sit for their readings', then: 'Send the five whispers, one at a time. This is the callback engine firing — their own answers, in their own words.', marks: 'took their readings' },
        { id: 'whatsong', label: 'They ask what a song IS', then: '"It’s the bit of you other people are keeping safe, dear. That’s why they can’t just take it." This is the campaign’s thesis. Say it plainly and move on.', marks: 'heard what a song is' },
        { id: 'lockbox', label: 'They pick her lockbox', then: 'One slip of paper: ONE NAME (GREY-GILL). KEPT. What they hold, they hold on a promise.', marks: 'read her slip' },
        { id: 'threaten', label: 'They threaten her', then: 'She yields at once — no fight. The tent weeps salt water until they leave, and one fortune is lost forever. Choose whose.', marks: 'threatened Grey-Gill' },
        { id: 'trade', label: 'They trade for a true answer', then: 'She wants a kindness done on the road ahead, unspecified. She will collect. Note it.', marks: 'owes Grey-Gill a kindness' },
      ],
      alsoMight: [
        { if: 'They ask who she was', then: 'Bubbles. Just bubbles, and she waves it off like a cough.' },
        { if: 'They ask about the carousel', then: '"Don’t hum along, dear." She does not explain, and she will not repeat it.' },
        { if: 'They ask about the Twins', then: '"They keep the books. They don’t make the prices."' },
        { if: 'Billy asks about his name', then: 'She looks at him for a long moment. "You and I should not talk about that in here." Don’t say the shared wound aloud.' },
      ],
      lands: [
        { who: 'Peaches', note: 'She is recognised the moment she walks in.' },
        { who: 'Billy', note: 'Same wound as hers. Do not name it tonight.' },
      ],
      exit: '→ The Missing Note',
    },
    {
      id: 'note',
      title: 'The Missing Note',
      where: 'The carousel',
      minutes: '15–25 min',
      oneBreath: 'The organ plays the Sea’s song and skips one note, every single time. The operator weeps and does not notice.',
      readAloud:
        'The carousel turns on its own. The organ inside plays something old and sweet — and every time it comes round, in the same place, one note is simply missing. There is a hole in the middle of the tune. The man working the lever is crying, and does not seem to know it.',
      doThis: [
        'Start the carousel bed and let it loop under everything else.',
        'Do NOT warn Peaches. If she hums the note that is missing: three seconds of true silence — then every lantern in the Fair turns to look at her. Say it, and move on.',
        'If anyone else hums it: the same silence, and the lanterns look at HER anyway.',
      ],
      doors: [
        { id: 'peaches-hums', label: 'Peaches hums the missing note', then: 'Silence, then every lantern turns. The hunt begins tonight, and it begins because of a choice made at your table. Do not soften it.', marks: 'Peaches hummed the note' },
        { id: 'other-hums', label: 'Someone else hums it', then: 'The same silence — and the lanterns turn to HER regardless. Let the table sit with what that means.', marks: 'someone else hummed it' },
        { id: 'walk-on', label: 'Nobody hums; they walk on', then: 'The operator, if asked: hums along, weeps, "Lovely tune, isn’t it. Always has been." The note stays missing. It will find them later.', marks: 'left the note alone' },
        { id: 'steal', label: 'They take the organ', then: 'The boss fight. The organ WANTS to go — it slides toward Peaches by itself. If they get it past the fence, let them keep it.', battle: 'organ', marks: 'took the organ' },
        { id: 'open', label: 'They open the organ', then: 'Inside: a brass cylinder etched with a name none of them can read. Bubbles form on the metal as they look at it.', marks: 'opened the organ' },
      ],
      alsoMight: [
        { if: 'They talk to the horses', then: 'One is a carved seal-pup. It hums the first three notes. Play the seal-pup and say nothing else.' },
        { if: 'They ask the operator his name', then: 'He has to think about it. That should be enough.' },
        { if: 'They search for the missing note in the machine', then: 'There is a gap in the pin-drum exactly one note wide, and the wood around it is worn smooth by something being taken out often.' },
        { if: 'Freya Moon is near', then: 'Her pendant stirs for the first time. Say only that.' },
      ],
      lands: [
        { who: 'Peaches', note: 'Her choice. Whatever she does, the lanterns know now.' },
        { who: 'Freya Moon', note: 'The pendant stirs. First time.' },
      ],
      exit: '→ Whispers in the Dark',
    },
    {
      id: 'whispers',
      title: 'Whispers in the Dark',
      where: 'The Fair, lanterns dimmed for the midnight show',
      minutes: '10–15 min',
      oneBreath: 'Five visions, one each, and every one of them is walking toward the back fence.',
      readAloud:
        'The lanterns dim for the midnight show. In the dark between them, each of you sees something you lost — close enough to touch, walking away.',
      doThis: [
        'Fire all five vision whispers at once. They fade after a minute; that is the point.',
        'Say nothing at all while they read. Let the quiet be uncomfortable.',
        'Then, one question: "What do you share?" Let the table decide.',
      ],
      doors: [
        { id: 'share', label: 'They share what they saw', then: 'Every vision was walking the same way — toward the back fence. Let them work that out themselves.', marks: 'shared the visions' },
        { id: 'keep', label: 'Someone keeps theirs secret', then: 'Note who, and what. It costs them nothing tonight. It will cost them on their road.', marks: 'kept a vision secret' },
        { id: 'chase', label: 'They chase a vision', then: 'It is always just past the next lantern. Then the next. Then the fence, and the three gates.', marks: 'chased a vision' },
      ],
      alsoMight: [
        { if: 'They ask if the others saw the same thing', then: 'No two saw the same. All five were walking the same direction.' },
        { if: 'They try to follow with a light', then: 'The light makes it worse — the vision is only there in the dark between lanterns.' },
        { if: 'They ask a lantern', then: 'It turns to face them. That is all it does, and it is plenty.' },
      ],
      lands: [{ who: 'Everyone', note: 'Their lost thing, glimpsed, moving away from them.' }],
      exit: '→ The Three Gates',
    },
    {
      id: 'gates',
      title: 'The Three Gates',
      where: 'The back fence',
      minutes: '20 min · the END of the night',
      oneBreath: 'Three gates in the back fence. The slate: ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST.',
      readAloud:
        'The back fence has three gates in it that were not there an hour ago. One is hung with green lanterns, one with silver, one with blue. Hush is waiting, slate already written: ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST.',
      doThis: [
        'Green pulls Freya Sun and Philip · silver pulls Billy and Philip · blue pulls Peaches and Freya Moon. Each gate wants its two.',
        'Let them argue. Do not help. This is the biggest choice they have made.',
        'As they cross: level the party to 2, play the carousel, and let it fade behind them. End there — the music ends the session, not you.',
      ],
      doors: [
        { id: 'green', label: 'Green — the Whispering Causeway (the Bog)', then: 'Freya Sun and Philip walk in front. Next session opens on the causeway, and the hedge that hushes.', goes: 'END', marks: 'took the green gate' },
        { id: 'silver', label: 'Silver — the Gallery of Best Faces (the Mirrors)', then: 'Billy and Philip walk in front. Next session opens in the gallery, where every mirror is a moment somebody sold.', goes: 'END', marks: 'took the silver gate' },
        { id: 'blue', label: 'Blue — the Stairs Below (the Under-Sea)', then: 'Peaches and Freya Moon walk in front. Next session opens on the stairs down to the drowned market.', goes: 'END', marks: 'took the blue gate' },
        { id: 'split', label: 'They split up', then: 'Say it once, plainly, BEFORE they do it: the gates close on the last one through each. If they still insist — two roads, alternating sessions. Hard, but possible.', goes: 'END', marks: 'split between gates' },
        { id: 'refuse', label: 'They refuse all three', then: 'The Fair waits. Nothing happens. The tide does not come back. Let the silence do it, and end the night there.', goes: 'END', marks: 'refused all three gates' },
      ],
      alsoMight: [
        { if: 'They ask which gate to take', then: 'Hush writes: WE DO NOT ADVISE. THAT IS A DIFFERENT COUNTER.' },
        { if: 'They look for their vision’s gate', then: 'Let them find it. Whichever gate someone’s vision walked through is the honest answer.' },
        { if: 'They ask what happens to the other two', then: 'The slate again: THEY REMEMBER BEING CHOSEN LAST. Someone at the unchosen gate says, quietly: "we’ll come back for yours."' },
        { if: 'They try to open two at once', then: 'Both shut. Hush wipes the slate and writes: SETS. Same word as the gate. They will get it.' },
      ],
      lands: [{ who: 'Everyone', note: 'Two names on every gate. Whoever’s gate is not chosen carries that into Act 2.' }],
      exit: '→ the chosen road. All three, in time.',
    },
  ],
  battles: NIGHT_BATTLES,
}

/** 2024 encounter budgets, XP per character. */
const BUDGET: Record<number, { low: number; moderate: number; high: number }> = {
  1: { low: 50, moderate: 75, high: 100 },
  2: { low: 100, moderate: 150, high: 200 },
  3: { low: 150, moderate: 225, high: 300 },
  4: { low: 250, moderate: 375, high: 500 },
  5: { low: 500, moderate: 750, high: 1100 },
}

/** What `xp` means for a party of this size at this level. */
export function weigh(xp: number, level: number, heads: number): { label: string; budget: string } {
  const b = BUDGET[Math.min(5, Math.max(1, level))] ?? BUDGET[1]!
  const low = b.low * heads
  const moderate = b.moderate * heads
  const high = b.high * heads
  const label = xp <= low ? 'easy for them' : xp <= moderate ? 'a fair fight' : xp <= high ? 'hard — but survivable' : 'over their heads: have the escape hatch ready'
  return { label, budget: `${heads} at level ${level}: easy ${low} · fair ${moderate} · hard ${high} XP` }
}
