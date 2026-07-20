// Run-the-Night data: for each seeded beat title, everything the DM needs
// ON SCREEN — read-aloud, the truth, the five doors, which NPCs are here,
// and one-tap cues. Keyed by the beat titles seeded in the live timeline.

export interface SceneCue {
  label: string
  kind: 'whisper' | 'sfx' | 'go-table'
  /** whisper: prebuilt handout. target = exact player name, or null = all. */
  whisper?: { target: string | null; title: string; body: string; ephemeral?: boolean }
  /** sfx: preset key from lib/sfx.ts */
  sfx?: string
}

export interface SceneGuide {
  readAloud: string
  truth: string
  doors: { fight: string; talk: string; sneak: string; bargain: string; insane: string }
  npcs: string[]
  cues: SceneCue[]
}

const PEACHES = 'Peaches capiche'
const BILLY = 'William Blackwood'
const PHILIP = 'Philip'
const FREYA = 'Freya'
const FREYA_MOON = 'Freya Moon'

export const ACT1_SCENES: Record<string, SceneGuide> = {
  'The Gate of Paper Lanterns': {
    readAloud:
      'Three nights ago the tide went out of Saltmere and forgot to come back. Now, a mile out on the wet sand, stands a fence of paper lanterns, and a gate, and two figures — one humming half a song, one holding a slate that says WELCOME in wet ink. The lanterns you each carry tug toward it like dogs on a lead.',
    truth:
      'The toll — one honest answer each — is Court paperwork. Write every answer down; they return in Act 3.',
    doors: {
      fight: 'The Twins don’t resist; the lanterns dim around violence until it stops. Toll doubles.',
      talk: 'The toll, asked warmly. Ask each player at the table, out loud.',
      sneak: 'Over the fence: they arrive marked — every lantern watches them all night.',
      bargain: 'Hush accepts a secret instead (contract quill): "one secret, of Our choosing, later."',
      insane: 'See what-ifs 1 & 8 in the playbook.',
    },
    npcs: ['Brother Hush & Sister Hum'],
    cues: [
      { label: '🔔 Toll bell', kind: 'sfx', sfx: 'bell' },
      { label: '🎪 Carnival chime', kind: 'sfx', sfx: 'carnival' },
    ],
  },
  'The Games of the Midway': {
    readAloud:
      'Everything glitters, nothing has a price tag, and every stall-keeper knows your name before you say it.',
    truth:
      'Prizes are skimmed things. The prize stall pays Billy in a page of his mentor’s handwriting — the keeper doesn’t know its worth.',
    doors: {
      fight: 'Minors m1/m2, or interfere with the Empty Costumes → battle CARN-A.',
      talk: 'Gossip: "the Toll-Twins never sleep" · "don’t hum near the carousel."',
      sneak: 'Behind the stall: crates addressed THE STILL COURT, BELOW. First written clue.',
      bargain: 'Anything can be bought — for teeth, memories, birthdays. Quill for anything serious.',
      insane: 'What-ifs 4, 13, 14.',
    },
    npcs: ['The Bog Merchant'],
    cues: [
      { label: '🐌 Run the Snail Derby →', kind: 'go-table' },
      {
        label: '✉ Billy: the page',
        kind: 'whisper',
        whisper: {
          target: BILLY,
          title: 'A page, folded four times',
          body: 'The stall-keeper pays you your winnings — and among the scrip, a loose page. You know this handwriting the way you know your own heartbeat. It is your mentor’s. The ink looks… recent.',
        },
      },
      { label: '✨ Sparkle', kind: 'sfx', sfx: 'sparkle' },
    ],
  },
  "Grandmother Grey-Gill's Tent": {
    readAloud:
      'The tent smells of salt and low tide. The woman inside has a shawl pinned high at the neck, and eyes like the last hour before a storm.',
    truth:
      'She sold her name — she literally cannot speak the Court’s (only bubbles come; show this once). She recognizes Peaches instantly.',
    doors: {
      fight: 'She yields at once; the tent weeps salt water until they leave. One fortune lost forever.',
      talk: 'Her readings are their REAL vault answers — use the ✉ buttons below.',
      sneak: 'Her lockbox: a receipt — RECEIVED: one name (GREY-GILL). Second written clue.',
      bargain: 'A true answer for a kindness done on the road ahead.',
      insane: 'What-if 12: freeing her name is an Act 2–3 sidequest, seeded now.',
    },
    npcs: ['Grandmother Grey-Gill'],
    cues: [
      {
        label: '✉ Peaches: her reading',
        kind: 'whisper',
        whisper: {
          target: PEACHES,
          title: 'Grey-Gill reads your palm',
          body: '“You walked in on borrowed feet, child. The sea still sets a place for you at supper. You told the lanterns you would risk everything for your tail — the lanterns wrote it down. So did somebody else.”',
        },
      },
      {
        label: '✉ Billy: his reading',
        kind: 'whisper',
        whisper: {
          target: BILLY,
          title: 'Grey-Gill reads your cards',
          body: '“A man who jokes about everything, so nothing true can land on him. But you told the lanterns the truth once: the book matters because HIS hand wrote it. Hold that. Paper remembers, dear — and someone is un-remembering him, page by page.”',
        },
      },
      {
        label: '✉ Philip: his reading',
        kind: 'whisper',
        whisper: {
          target: PHILIP,
          title: 'Grey-Gill reads your scar',
          body: '“Hands trained to end things, held gentle on the table. That is the hardest grip there is, dear. You told the lanterns what you fear — not death, but falling away from your own convictions. Careful here. This place buys convictions. It pays very well.”',
        },
      },
      {
        label: '✉ Freya: her reading',
        kind: 'whisper',
        whisper: {
          target: FREYA,
          title: 'Grey-Gill reads your blades',
          body: '“Two swords, and daggers besides — armor worn on the outside so nobody checks for the wound underneath. You told the lanterns you would risk everything so your people never suffer what you suffered. The Court heard that too, love. To them that is not a vow. It is a PRICE.”',
        },
      },
      {
        label: '✉ Freya Moon: her reading',
        kind: 'whisper',
        whisper: {
          target: FREYA_MOON,
          title: 'Grey-Gill reads your pendant',
          body: '“May I see it? …No — keep it closed. A last blossom from a grove gone quiet. Child, blights do not keep receipts. But somewhere BELOW, something does. If the spring of your Heartbloom was taken and not killed, then somewhere it is still filed. And what is filed can be found.”',
        },
      },
      { label: '🌊 The sea breathes', kind: 'sfx', sfx: 'ocean' },
      { label: '💧 Bubbles (she tries the name)', kind: 'sfx', sfx: 'splash' },
    ],
  },
  'The Missing Note': {
    readAloud:
      'The carousel turns. The organ plays a sea-song. And every few bars — a hole, the same hole, where a note should be. The horses’ glass eyes are all turned toward the water.',
    truth:
      'The organ was built around the Sea’s stolen song; the missing note is the one the Court could not buy — it belongs to Peaches.',
    doors: {
      fight: 'Stealing the organ triggers CARN-A with double costumes (What-if 4 — let them keep it if they win).',
      talk: 'The operator hums along and weeps without noticing.',
      sneak: 'Inside: a brass cylinder — PROPERTY OF THE STILL COURT. Third written clue.',
      bargain: 'The ride stops for a song sung live. If Peaches sings, every lantern turns toward her.',
      insane: 'If anyone hums the missing note: hold three seconds of REAL silence at the table.',
    },
    npcs: [],
    cues: [
      { label: '🎪 The carousel tune', kind: 'sfx', sfx: 'carnival' },
      { label: '🕳 The carnival leans in', kind: 'sfx', sfx: 'ominous' },
      {
        label: '✉ Peaches: the note is yours',
        kind: 'whisper',
        whisper: {
          target: PEACHES,
          title: 'The hole in the song',
          body: 'You know the missing note. You have always known it. It is the first note you ever sang, and the organ is leaving a chair empty for it — the way the sea sets a place at supper.',
          ephemeral: true,
        },
      },
      {
        label: '✉ Freya Moon: the pendant stirs',
        kind: 'whisper',
        whisper: {
          target: FREYA_MOON,
          title: 'Against your collarbone',
          body: 'Each time the song reaches the hole where the note should be, the blossom in your pendant leans toward it — the way a flower leans toward morning. It has never done that before. Whatever spring your grove lost, this music knows a piece of the same silence.',
          ephemeral: true,
        },
      },
    ],
  },
  'Whispers in the Dark': {
    readAloud: 'The lanterns dim for the midnight show. In the dark between them, your glass grows warm.',
    truth: 'The veil is thin here; their Lost Things reach for them. Fire all whispers, then let the table talk.',
    doors: {
      fight: 'Nothing to fight. Deliver, then wait.',
      talk: 'Let them compare visions — or hide them. Both are gold.',
      sneak: 'Chasing any vision leads to the back fence.',
      bargain: '—',
      insane: 'All roads lead to the Three Gates.',
    },
    npcs: [],
    cues: [
      {
        label: '✉ Peaches: the vision',
        kind: 'whisper',
        whisper: {
          target: PEACHES,
          title: 'Between the lanterns',
          body: 'Wet footprints on dry boards, small and bare, walking away from you — and then, mid-stride, they simply stop. Whatever made them did not.',
          ephemeral: true,
        },
      },
      {
        label: '✉ Billy: the vision',
        kind: 'whisper',
        whisper: {
          target: BILLY,
          title: 'Between the lanterns',
          body: 'A page, mid-air, writing itself in a hand you love — and then un-writing, letter by letter, like someone reading it backwards out of the world.',
          ephemeral: true,
        },
      },
      {
        label: '✉ Philip: the vision',
        kind: 'whisper',
        whisper: {
          target: PHILIP,
          title: 'Between the lanterns',
          body: 'A voice you love says your name, once, from behind a stall curtain. Before you can answer, a politer voice answers for you — reading your answer aloud from a slate, in your own words, perfectly. You never said them to anyone here.',
          ephemeral: true,
        },
      },
      {
        label: '✉ Freya: the vision',
        kind: 'whisper',
        whisper: {
          target: FREYA,
          title: 'Between the lanterns',
          body: 'The people you protect, asleep and safe. Beside them, an open ledger and a patient quill, itemizing — line by line — exactly what keeping them that way would cost. The quill pauses. It is waiting for you to look.',
          ephemeral: true,
        },
      },
      {
        label: '✉ Freya Moon: the vision',
        kind: 'whisper',
        whisper: {
          target: FREYA_MOON,
          title: 'Between the lanterns',
          body: 'The Heartbloom Grove in full spring — every blossom open, every spirit laughing. And on every single flower, a small paper tag, tied with string, printed in the same careful hand: SOLD.',
          ephemeral: true,
        },
      },
      { label: '💓 Heartbeat under it all', kind: 'sfx', sfx: 'heartbeat' },
    ],
  },
  'The Three Gates': {
    readAloud:
      'The back fence isn’t a fence anymore. It’s three gates. Green lanterns, and the smell of moss. Silver lanterns, and your own face looking back. Blue lanterns, and stairs going down into water that waits.',
    truth:
      'All three are prepared. Let the table ARGUE — that argument is the session’s finale. Level 2 fires when they cross.',
    doors: {
      fight: 'Nothing to fight but the choice.',
      talk: 'Hush’s slate: ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST.',
      sneak: 'Splitting or refusing: what-ifs 2, 3, 18.',
      bargain: 'Hum hints — for one memory of tonight (you choose which; tell that player privately).',
      insane: 'End the session ON the crossing. Do not show the other side.',
    },
    npcs: ['Brother Hush & Sister Hum'],
    cues: [
      { label: '🔔 Midnight bell', kind: 'sfx', sfx: 'bell' },
      { label: '🕳 The gates wait', kind: 'sfx', sfx: 'ominous' },
      {
        label: '✉ ALL: the Feywild notices (after crossing)',
        kind: 'whisper',
        whisper: {
          target: null,
          title: 'The other side of the gate',
          body: 'The lanterns of the carnival go out behind you, all at once, like a held breath finally let go. Something very large and very patient has noticed you. Welcome to the road. — You feel stronger. (Level 2 — your sheet already knows.)',
        },
      },
    ],
  },
  'The Whispering Causeway (Bog road)': {
    readAloud:
      'A road of floating lanterns crosses black water. The water is full of voices. They are all very polite, and they all want something.',
    truth: 'The voices are Cassia’s leaking inventory. One knows the finale-flaw clue (route 2).',
    doors: {
      fight: 'Minors b-m1/2/3; BOG-A (the Hedge) at the causeway’s end.',
      talk: 'A voice tells it: a mermaid was born holding one note AFTER the sale.',
      sneak: 'Wading = crocodile + everything smells them.',
      bargain: 'A voice guides them — from inside someone’s mouth. One-time DM-controlled alarm.',
      insane: 'Drinking bog water: 1 exhaustion, one true dream of the Under-Sea.',
    },
    npcs: ['Old Cassia', 'The Bog Merchant'],
    cues: [
      { label: '🌊 Bog ambience', kind: 'sfx', sfx: 'ocean' },
      { label: '⛈ Thunder over the marsh', kind: 'sfx', sfx: 'thunder' },
      { label: '💧 Something surfaces', kind: 'sfx', sfx: 'splash' },
    ],
  },
  "Cassia's Jar-House ✦ LEVEL 3": {
    readAloud:
      'A house on stilts wearing other houses’ shutters. Inside, shelves to the ceiling: green jars, each humming, each labeled in a shaking hand.',
    truth:
      'Cassia is drowning in tithe-debt. She keeps ONE jar she will never sell: her sister’s laugh. The note-jar is the fragment — it is IN THE ROOM.',
    doors: {
      fight: 'Every broken jar frees a Shadow. Winning loses the guide.',
      talk: 'The Barge’s route for a kindness: carry her sister’s laugh somewhere safe.',
      sneak: 'The ledger under the mattress: ONE NOTE OF THE SEA’S SONG — jarred, awaiting collection.',
      bargain: 'Quill: the note-jar for assuming ONE tithe payment. The fine print does not say whose.',
      insane: 'Opening the note-jar: the note sings itself home to Peaches — forever audible. Beautiful; also a beacon.',
    },
    npcs: ['Old Cassia'],
    cues: [
      { label: '✨ A jar opens', kind: 'sfx', sfx: 'sparkle' },
      { label: '🔔 The Barge horn (end the session)', kind: 'sfx', sfx: 'bell' },
      {
        label: '✉ ALL: Level 3 — the bog goes silent',
        kind: 'whisper',
        whisper: {
          target: null,
          title: 'The first silence in centuries',
          body: 'Every voice in the bog stops at once. One full minute of true quiet — the first this marsh has known since the jars began. Then, from a thousand green bottles, very softly: thank you. (Level 3.)',
        },
      },
    ],
  },
  'The Tithe Barge (climax)': {
    readAloud:
      'It arrives without a wake. A barge of grey wood, stacked with crates that hum, poled by something wearing a ferryman’s coat — and the coat is the most alive thing about it.',
    truth: 'BOG-B setpiece. The barge leaves ON THE HOUR regardless — the fight has a clock. Manifest on the mast.',
    doors: {
      fight: 'Water Weird + drowned debtors. Crates freed = voices that distract the zombies.',
      talk: 'The Ferryman hands negotiators a receipt for one dignity. The schedule is not negotiable.',
      sneak: 'The manifest is laminated in wax, in plain sight — bold theft is very possible.',
      bargain: 'Cassia’s assumed-tithe contract (if signed) comes due HERE. Read it aloud.',
      insane: 'Boarding as it departs: Act 2 begins on the barge. Terrifying. Allowed.',
    },
    npcs: ['The Ferryman of Receipts', 'The Buyer'],
    cues: [
      { label: '🔔 The hour tolls', kind: 'sfx', sfx: 'bell' },
      { label: '⛈ The Weird rises', kind: 'sfx', sfx: 'thunder' },
      { label: '🎺 A debtor fumbles', kind: 'sfx', sfx: 'trombone' },
    ],
  },
  'The Gallery of Best Faces (Mirror road)': {
    readAloud:
      'A palace of standing mirrors with no walls holding them up. None of them show you. All of them show someone’s finest hour, on loop.',
    truth:
      'Bought performances. One mirror: Billy’s mentor mid-laugh. One covered: Billy, unsmiling — ACQUISITION PENDING.',
    doors: {
      fight: 'Minors m-m1/2/3. FAC-A (the Understudy) at the covered mirror.',
      talk: 'Mirrors answer with their one moment; sequences spell messages. The mentor teaches.',
      sneak: 'The catalog: the journal is IN TRANSIT. It is HERE.',
      bargain: 'Reflections for memories.',
      insane: 'Breaking one frees its moment forever — its owner, wherever they are, feels it return.',
    },
    npcs: ['Master Vetrine, Curator of Faces'],
    cues: [
      { label: '✨ Mirror shimmer', kind: 'sfx', sfx: 'sparkle' },
      { label: '🕳 The Understudy steps out', kind: 'sfx', sfx: 'ominous' },
      {
        label: '✉ Billy: the covered mirror',
        kind: 'whisper',
        whisper: {
          target: BILLY,
          title: 'The sheet slips',
          body: 'For half a second you see what’s under the cover: you. Standing exactly as you stand now. Not smiling. You have never once seen your own face not smiling. The card on the frame reads: PENDING.',
          ephemeral: true,
        },
      },
    ],
  },
  'The Restoration Room ✦ LEVEL 3': {
    readAloud:
      'Behind the gallery: a workshop. Faces in clamps. Smiles being polished. A laugh, disassembled on velvet, each note pinned like a butterfly.',
    truth:
      'The laugh is the mentor’s — the fragment. Vetrine believes preservation is love: let him SAY the thesis: “In here, nothing is ever lost.”',
    doors: {
      fight: 'He defends with the room; FAC-B early and harder. Warn with the environment first.',
      talk: 'He shows Billy the pending file. Price: “the moments you smile when no one is watching.”',
      sneak: 'Reassemble the laugh — group DC 13, three different skills, players propose which.',
      bargain: 'The laugh for “one hour of the party at their very best, to keep.”',
      insane: 'Wearing a clamped face: one scene as someone else. The face remembers being worn.',
    },
    npcs: ['Master Vetrine, Curator of Faces'],
    cues: [
      {
        label: '✉ ALL: Level 3 — the mirrors ripple',
        kind: 'whisper',
        whisper: {
          target: null,
          title: 'Something got out',
          body: 'A laugh — a real one, warm and a little rude — rolls through the Hall like weather. Every mirror ripples like water. Somewhere, a curator drops his pen. (Level 3.)',
        },
      },
      { label: '✨ The laugh reassembles', kind: 'sfx', sfx: 'sparkle' },
      { label: '🕳 Vetrine notices', kind: 'sfx', sfx: 'ominous' },
    ],
  },
  'Opening Night (climax)': {
    readAloud:
      'The gallery has become a theatre. The mirrors are the audience. Every seat reflects someone the Court has bought, applauding on loop, and the stage is waiting for its final acquisition.',
    truth: 'FAC-B setpiece. Broken mirrors free moments that CHEER the party — first break each = Inspiration.',
    doors: {
      fight: 'Vetrine + Shadows. He narrates the fight as a review, aloud. Do the voice.',
      talk: 'Mid-fight, at Billy’s lowest, Vetrine offers the smile-bargain, generously.',
      sneak: 'The props crate holds the journal. Grabbing it takes an action and ALL his attention.',
      bargain: 'Threaten the catalog with ink and he parleys instantly.',
      insane: 'Applauding the Understudy (if it survived) makes it bow, helpless, mid-battle.',
    },
    npcs: ['Master Vetrine, Curator of Faces', 'The Buyer'],
    cues: [
      { label: '🔨 Curtain up', kind: 'sfx', sfx: 'gavel' },
      { label: '✨ A mirror breaks (cheer!)', kind: 'sfx', sfx: 'sparkle' },
      { label: '🎺 The review is scathing', kind: 'sfx', sfx: 'trombone' },
    ],
  },
  'The Stairs Below (Under-Sea road)': {
    readAloud:
      'The stairs go down into water that doesn’t ask you to hold your breath. It asks you to trust it. Peaches doesn’t have to be asked at all.',
    truth: 'Breathing toll: one small truth spoken into the water per traveler. Peaches breathes free.',
    doors: {
      fight: 'Minors u-m1/2/3; MAR-A security escorts, not executioners — they grapple, never kill.',
      talk: 'Drowned commuters: auction tonight. “The tail lot,” they say, not looking at Peaches.',
      sneak: 'The back-current bypasses security (group Stealth; failure = surrounded start).',
      bargain: 'Lantern-jellies rented “for a hum.” Peaches’ hum makes them burst into harmony.',
      insane: 'Peaches announces herself: skip to the auction, on the Court’s terms. Allowed!',
    },
    npcs: ['Salt-Mother Naretha', 'The Bog Merchant'],
    cues: [
      { label: '🌊 Descent', kind: 'sfx', sfx: 'ocean' },
      { label: '💧 The market murmurs', kind: 'sfx', sfx: 'splash' },
      {
        label: '✉ Peaches: the water knows you',
        kind: 'whisper',
        whisper: {
          target: PEACHES,
          title: 'The first breath below',
          body: 'The water takes you in like a house you grew up in. You owe it no truth at the door — it already knows yours. Somewhere below, something of yours is waiting in a window, priced.',
          ephemeral: true,
        },
      },
    ],
  },
  "The Collector's Window ✦ LEVEL 3": {
    readAloud:
      'The shop window is the size of a cathedral door. In it, on black velvet, lit by patient blue light: a mermaid’s tail. The card reads: PAID IN FULL — ONE SONG.',
    truth:
      'The consignment is signed THE SEA (BY PROXY) — and the proxy seal is BLANK. The smoking gun. The scale is the fragment.',
    doors: {
      fight: 'The window fights back — the Water Weird lives in the glass.',
      talk: 'Naretha answers three questions honestly if Peaches agrees to APPEAR at the auction.',
      sneak: 'The consignment papers. Blank seal. Let a player notice it themselves if humanly possible.',
      bargain: 'Buy back “one scale, for sentiment” — she sells smiling. The scale is the fragment.',
      insane: 'Smash-and-grab: the auction begins immediately, alarm variant.',
    },
    npcs: ['Salt-Mother Naretha'],
    cues: [
      { label: '🕳 The tail, lit blue', kind: 'sfx', sfx: 'ominous' },
      {
        label: '✉ ALL: Level 3 — the prices flicker',
        kind: 'whisper',
        whisper: {
          target: null,
          title: 'A crack in the ledger',
          body: 'For one breath, every price-card in the drowned market flickers — uncertain, as if the numbers themselves just remembered they could be wrong. (Level 3.)',
        },
      },
      { label: '💧 The Weird stirs in the glass', kind: 'sfx', sfx: 'splash' },
    ],
  },
  'The Auction of the Tail (climax)': {
    readAloud:
      'The auction floor is an amphitheater of shells. The audience breathes water and wears pearls that used to be wishes. Lot the first: one mermaid’s tail, provenance impeccable.',
    truth:
      'SEA-B setpiece. Naretha must be beaten PROCEDURALLY — gavel, papers, or outbid. Killing her forfeits the lot.',
    doors: {
      fight: 'The audience bids on the combat. The gavel is the real objective.',
      talk: 'Any legal challenge (the blank seal!) suspends everything. Hags love a technicality.',
      sneak: 'The case answers only to the gavel.',
      bargain: 'Outbid the Buyer — with what? The table will discover what they’re willing to sell. Let them.',
      insane: 'Peaches sings the missing note: the tail glows and the audience forgets to breathe. One round of silence.',
    },
    npcs: ['Salt-Mother Naretha', 'The Buyer'],
    cues: [
      { label: '🔨 The gavel', kind: 'sfx', sfx: 'gavel' },
      { label: '🔔 The auction bell', kind: 'sfx', sfx: 'bell' },
      { label: '🕳 The Buyer raises a hand', kind: 'sfx', sfx: 'ominous' },
    ],
  },
  'The Still Court': {
    readAloud: '(Act 3 — not tonight. But when you get here: they signed nothing. That is the whole key.)',
    truth: 'The finale engine. Their Session-1 honest answers return as evidence. See the playbook.',
    doors: { fight: '—', talk: '—', sneak: '—', bargain: '—', insane: '—' },
    npcs: ['The Buyer'],
    cues: [],
  },
}
