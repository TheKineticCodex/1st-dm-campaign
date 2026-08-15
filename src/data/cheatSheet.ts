// The Lantern-Keeper's Cheat Sheet — the whole campaign on one screen,
// in plain words, for glancing at mid-scene. Everything here is what the
// DM needs to REMEMBER; the why lives in campaign/*.md.
//
// Voice rule: if a nine-year-old couldn't follow a line, rewrite it.
// No manifests, no proxy-seals, no depositions. Promises, songs, pieces.

export interface CheatCard {
  title: string
  lines: string[]
}

/** The story, in one breath. Read this when you forget what it's about. */
export const STORY_IN_A_BREATH = [
  'The Sea had a song. Its heart broke, and it GAVE the song away to forget.',
  'But a song belongs to everyone born inside it — so it could never truly be given away.',
  'The Ones Below have spent forever gathering the missing pieces.',
  'Five people carry the last five pieces. They arrived on one tide. Now they sit at your table.',
  'Sing the pieces together, and every song comes home — and the tide with it.',
]

/** The only rules the players ever need. Say them out loud when asked. */
export const THREE_RULES = [
  'They never take. They get you to say yes.',
  'What they hold, they hold on a promise. Break the promise, and it comes home.',
  'Sing the pieces together, and the song comes home.',
]

/** Who each player is, what they carry, and what makes their night. */
export const THE_FIVE: CheatCard[] = [
  {
    title: '🐊 Peaches — the one the Sea listens to',
    lines: [
      'Carries: the last note of the SEA\'s song. Lost: her tail (she never said yes — she woke on the shore with legs).',
      'Pookie the alligator saw it happen. He never leaves her. He RUNS AWAY when worried — that\'s your tell.',
      'Misses her coral house. If she got her tail back, she\'d go home. (Winning may cost the party her. Let that hang.)',
      'The carousel skips HER note. If she hums along, every lantern turns to look. Do not warn her.',
    ],
  },
  {
    title: '🎩 Billy — the one who can read the bargains',
    lines: [
      'Three layers: William Blackwood (scholar, secretly writes songs about his friends) → Blue-Chew Billy (the show) → and beneath both, the Feywild TOOK HIS TRUE NAME. It sits Below, like Grey-Gill\'s.',
      'Fear: that the person everyone loves isn\'t really him. Mentor: Professor Elias Wren — "Never confuse being clever with being right." Last man to see William unmasked.',
      'The spellbook matters for the HANDWRITING — proof someone knew him before. Every page the Ones Below un-write is a page of Wren.',
      'Table rules (his player\'s): the more serious it gets, the funnier he gets. No joke = something is truly wrong. He checks the chain on the book when scared — never explain it.',
    ],
  },
  {
    title: '🛡 Philip — the one who won\'t kill',
    lines: [
      'Was following a false teacher — someone who claims peace but teaches against it, knowingly. (That is what a person looks like after selling their convictions.)',
      'Rule he won\'t break: he will not kill — "I refuse to close the door on someone\'s salvation." He\'ll get close.',
      'Fears losing his MOTHER — "a garden, blooming with life and hope." (Same language as Freya Moon\'s grove. Neither knows yet.)',
      'His job in the story: the Ones Below can\'t be fought, only outlasted. The gentle blade is the only fighter built for this.',
    ],
  },
  {
    title: '⚔ Freya Sun — the one they haven\'t got yet',
    lines: [
      'Protects, at all costs: PEACHES and PHILIP. When the Ones Below move on either, they\'re pulling on her vow without ever speaking to her.',
      'What makes her laugh: Pookie. (Free comedy, every session.)',
      'The wound: her cat, whom she loved more than anything, was murdered. On-screen ONLY with her permission. The Ones Below were NOT behind it — that grief stays hers.',
      'She\'s the last one whose song hasn\'t been touched. They want it most. She is the story\'s last temptation.',
    ],
  },
  {
    title: '🌸 Freya Moon — the one who can feel where songs are held',
    lines: [
      'Carries: the last blossom of the Heartbloom Grove — the last note of the GROVE\'s song. Her pendant stirs near anything taken. She is the party\'s compass.',
      'Perfect memory: under the oldest willow at dusk, glowing moths in her hair, family laughing nearby.',
      'Lost her older sister ELOWEN MOON — taught her to speak to flowers, "kindness stronger than magic." Never found. (Below? Deciding.)',
      'Hope refills when life grows where it shouldn\'t: a flower through stone, an animal back on its feet, kindness where cruelty was easier. Give her one of those every session.',
    ],
  },
]

/** The cast that matters. Everyone else is scenery until their scene. */
export const WHO_IS_WHO: CheatCard[] = [
  {
    title: '🚪 The Twins — Brother Hush & Sister Hum (the gate)',
    lines: [
      'Hush never speaks: write 3–5 words on paper and HOLD IT UP. Hum answers everything in half-sung fragments.',
      'The toll: one honest answer each, out loud. WRITE THEM DOWN. They come back once, at the very end, in the players\' own words.',
      'Slate: "ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE."',
    ],
  },
  {
    title: '🔮 Grandmother Grey-Gill (the heart)',
    lines: [
      'Warm gravel; shawl pinned high over old gills. Sold her own NAME for her tent — when she tries to say who bought it, only bubbles come. Mime it once.',
      'Reads their real confessions back as prophecy. To Peaches: "You walked in on borrowed feet, child. The sea still sets a place for you at supper."',
      'She and Billy have the same wound (a name held Below). Don\'t say it. Let him feel the chill.',
    ],
  },
  {
    title: '🎠 The carousel operator (the missing note)',
    lines: [
      'Hums the broken sea-song, weeps steadily, notices neither. The organ carries the Sea\'s song — one note always skipped.',
      'If anyone hums the note: three full seconds of true silence at your table. Count them.',
    ],
  },
  {
    title: '👤 The Appraiser (always somewhere else)',
    lines: [
      'ABSENT tonight — that\'s the scary part. A closed tent, a coat on a hook, no one inside.',
      'Everyone gives the same four words: "He\'s out. Appraising."',
    ],
  },
  {
    title: '🌑 The Ones Below (the villain — one face, seen late)',
    lines: [
      'A market in the dark where fairies keep everything they were ever given. Polite. Punctual. Never lie. Always got a yes.',
      'Their power IS the yes: they price what you think you\'ll never miss and arrive at your weakest hour.',
      'They cannot be fought. Only outlasted, out-thought, or out-sung.',
    ],
  },
  {
    title: '🏘 Saltmere callbacks',
    lines: [
      'Tarn (blinded by Billy\'s bottle; now SEES the price tags on things — your seer). Pip (his boy, 9, all glare). Maddy ("love"/"trouble"; feeds people). Griff (harbormaster: "The tide got BOUGHT").',
    ],
  },
]

/** Tonight — the carnival, beat by beat. What to press, what to say. */
export const TONIGHT_BEATS: CheatCard[] = [
  {
    title: '1 · The Gate',
    lines: ['Twins. One honest answer EACH, out loud. Write them down. 🔔 toll bell · 🎪 chime.'],
  },
  {
    title: '2 · The Midway',
    lines: ['Snail Derby (⚔ Table). Prizes: paper crown, bottled applause. ✉ Billy: the page (Wren\'s handwriting). Sneaking finds crates marked BELOW — same glass as Tarn\'s.'],
  },
  {
    title: '3 · Grey-Gill\'s tent — the heart',
    lines: ['Fire the ✉ readings ONE AT A TIME with a beat of silence after each. Do the bubble-mime. 🌊 💧'],
  },
  {
    title: '4 · The Carousel',
    lines: ['The song with the hole. If Peaches hums — every lantern turns. ✉ Peaches: the note is yours · ✉ Freya Moon: the pendant stirs.'],
  },
  {
    title: '5 · Whispers in the Dark',
    lines: ['Lanterns dim. Fire ALL FIVE vision whispers. 💓 heartbeat. Let the table decide what to share.'],
  },
  {
    title: '6 · THE THREE GATES — the whole night',
    lines: [
      'Green + moss (Bog) · Silver + your own face (Mirrors) · Blue + stairs into water (Below). Slate: "ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST."',
      'Every gate pulls TWO players (Bog: Freya Sun + Philip · Mirrors: Philip + Billy · Below: Peaches + Freya Moon). Let them argue. Someone hears "we\'ll come back for yours."',
      'On commitment: 🎵 UP · ✉ ALL: the Feywild notices (Level 2). Read the crossing. Then not one more word. The music ends the session — not you.',
    ],
  },
]

/** When you freeze. Any one of these buys you a minute. */
export const PANIC_LINES = [
  'Read the gold words aloud.',
  'Press any button.',
  '"What do you do?"',
  '"Hold that thought — everyone else, what are you doing?"',
  'Draw a Wonder card.',
  'Pookie stares at the water.',
]
