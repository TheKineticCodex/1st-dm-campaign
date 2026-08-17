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
  'A song is the part of you that other people carry. It lives in everyone who loves the thing.',
  'The Sea loved the Moon. It couldn\'t bear it, so it GAVE its song away to forget her.',
  'But a song belongs to everyone born inside it — the Ones Below have spent forever buying up the pieces.',
  'Five people carry the last five pieces. They arrived on one tide. Now they sit at your table.',
  'The Moon is coming near again. On the night it\'s closest, sing the pieces together — and every song comes home, and the tide with it.',
]

/**
 * WHY THE FAIR CAME HERE — the answer to the question a player will ask.
 * (Nobody sang it down. The Talent Night trigger never happened at the table.)
 */
export const WHY_HERE = [
  'The Moon set the SEASON: the Fair comes when the Moon comes near. It always has — Griff saw it forty years ago, and the table can do that arithmetic themselves.',
  'The five set the ADDRESS: five people, each the last one holding a piece of a song somebody already gave away, walked into one small harbour town for their own honest reasons. Last pieces lean toward each other. Five of them leaning in one place is a chord you can hear from the bottom of the dark.',
  'So the Fair grounded HERE — off a town already on the round, because Grey-Gill has kept a tent on that seabed since the last time and hums in her sleep. Then the water walked out to meet the thing it once gave away.',
  'THE TIDE DID NOT LEAVE BECAUSE ANYBODY SANG. The tide left because the Fair arrived, and the Fair arrived because the count came to five.',
  'SAY IT LIKE THIS, if they ask straight out: "It wasn\'t you. The Fair comes when the Moon comes near — it always has, and it always will. What was new was where it landed. Every one of you walked to this town for your own reason, and not one of you was wrong about that. But every one of those reasons is made of the same thing: a piece of a song somebody already sold. Five last pieces, one small grey town, one tide. That\'s a chord you can hear from the bottom of the dark. So the Fair set down here — and the sea walked out to meet the thing it gave away."',
  'NEVER say the pull out loud. Show two pieces lean toward each other once and never explain it. The moment an NPC says "you were leaning", five players learn their honest reasons were a cover story — and the ending, which is five people CHOOSING, loses its floor.',
]

/** Why each of them was in Saltmere at all. Their own reasons, every one. */
export const WHY_THEY_CAME = [
  'Peaches — walking the coast because the coast is as close to home as legs get; she STOPPED here because of the humming in Maddy\'s cellar, the closest she has come to hearing home from dry land.',
  'Billy — pages in Wren\'s handwriting keep washing up along this coast, and a man in Saltmere buys strange old glass and pays in strange old coins.',
  'Philip — he followed the false teacher down the coast, and the trail simply ends at the tideline.',
  'Freya Moon — the blossom has been getting warmer down the coast for a month. In Saltmere it was the warmest it has ever been, days BEFORE the tide went out.',
  'Freya Sun — she follows people, not places, and she is the only one who arrived AHEAD of the Ones Below rather than behind them: the man with the small book was three towns back, and the next name on his list lives near this coast.',
]

/** One line at every session's open. Bigger. Wronger. That's the whole clock. */
export const MOON_CLOCK = [
  'Session 3 — "A fingernail-paring of moon over the sand. Thin. Nothing yet."',
  'Session 5 — "The moon is a hand\'s-breadth wider than it should be. The gulls won\'t look at it."',
  'Session 7 — "The moon is wrong. Everyone in Saltmere has stopped saying so."',
  'Session 9 — "The dry harbor floods for one minute at midnight, then drains. The chapel bell rang once, alone."',
  'Finale — "The moon fills the sky. The Sea is standing up on its hind legs to reach her."',
]

/**
 * WHY ANY OF IT WORKS — the lens, not new content. Nothing here is ever
 * said in-world by anybody. It is here so that when a player asks a hard
 * question you answer it the same way every time. See eclipse.ts for the
 * one place the two unpriceable things in the sky ever come up.
 */
export const THE_HIDDEN_LOGIC: CheatCard[] = [
  {
    title: '🤫 The physics — for you, never for them',
    lines: [
      'A song is not a thing. It is a WAVE — a movement through a medium — and the medium is everybody who loves it. That is the engine of this entire campaign, and no character in it will ever say the word.',
      'Which is why they cannot take one. A wave is not in any one place, so there is nothing to pick up. All they can do is find the loudest part of it and get that part to say yes.',
      'THEIR CRIME, in one image: they put waves in jars. In a jar it still hums — it just never reaches anybody. That is exactly what "something that no longer knows itself" means, on every shelf Below.',
      'It is why every keeper is broken the same way. Hush has the words and no sound. Hum has the sound and no words. Grey-Gill opens her mouth and only bubbles come out. Three broken transmitters in a row was never a coincidence, and you never point it out.',
      'It is why the ending is five people singing at once and not one hero with a key. Five sources, one medium, and the thing arrives whole.',
      'And it is why nobody has ever priced sunlight, or the pull of the Moon, or the tide: nobody holds them. That is the only place the two Freyas’ names mean anything at all — see the thing with no name.',
    ],
  },
  {
    title: '🤫 The one line under all of it',
    lines: [
      'YOU CAN ONLY SELL WHAT YOU HOLD ALONE.',
      'The Sea held its song alone — or thought it did. It was wrong, and that mistake is the crack in the promise, and the crack is the whole win.',
      'Say none of this to anyone. The words allowed at the table are hum, pull, lean, reach. Never wave, never explain. Show two pieces lean toward each other once, and stop.',
    ],
  },
]

/** The words, spelled and used the same way every single time. */
export const THE_WORDS: CheatCard[] = [
  {
    title: '📖 The four words — never mix them up mid-scene',
    lines: [
      'BELOW is the PLACE. A market in the dark where the selves of things sit humming on shelves.',
      'THE ONES BELOW are the PEOPLE. Capital O, capital B. This is the only name the players ever hear for them.',
      'THE FAIR is their SHOPFRONT — the travelling one. Same firm, different premises. The table is meant to work out that the Fair belongs to the Ones Below; DO NOT hand it to them. It lands at the Midway, on the crates.',
      'THE BUYER is the ONE FACE. The only one who can take a yes. Everyone else Below is a keeper who owes him rent. The players may hear his name from Act 2 on; they do not see him until the roads.',
      'And THE APPRAISER sets the prices. Three jobs, three people: he prices, the Buyer buys, the keepers keep. If you only remember one line, remember that one.',
    ],
  },
  {
    title: '📖 The three keepers — one road each',
    lines: [
      'THE JAR-WOMAN — the Bog. Voices in green jars, shelves to the ceiling, four payments behind on her rent. She will deal.',
      'THE MIRROR-MAN — the Hall. Everyone’s finest hour on loop. Believes keeping is love: "In here, nothing is ever lost."',
      'THE MARKET-MOTHER — the drowned market. Sells "one scale, for sentiment," smiling. Beat her by the rules and never kill her — kill her and the sale defaults to the Buyer.',
      'None of the three is the villain, and all three are frightened of the same man. Play them tired.',
    ],
  },
]

/** The only rules the players ever need. Say them out loud when asked. */
export const THREE_RULES = [
  'They never take. They get you to say yes.',
  'You can only promise away what\'s yours. Promise away something others hold pieces of, and it doesn\'t hold — bring the real owners together, and it comes home.',
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
      'IF SOMEONE ASKS why her tail was taken when they never take: they did not take it. Somebody said yes for her, long before she was born — the Sea promised away pieces that were not only its to promise. That is the crack, and it is the whole reason you can win.',
    ],
  },
  {
    title: '🎩 Billy — the one who can read the bargains',
    lines: [
      'Three layers: William Blackwood (scholar, secretly writes songs about his friends) → Blue-Chew Billy (the show) → and beneath both, he GAVE AWAY his true name. It sits Below, like Grey-Gill\'s.',
      'Fear: that the person everyone loves isn\'t really him. Mentor: Professor Elias Wren — "Never confuse being clever with being right." Last man to see William unmasked.',
      'The spellbook matters for the HANDWRITING — proof someone knew him before. Every page the Ones Below un-write is a page of Wren.',
      'IF SOMEONE ASKS how, when they never take: he said yes. He was young, it seemed clever, and he does not remember doing it — which is what saying yes to them looks like afterwards, every time.',
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
      'WHO: the Fair\'s ushers and its bookkeepers. They take the toll and write it down. They keep the books — they do not set the prices. That is the Buyer, and they owe him like everyone else here.',
      'WHAT THEY GAVE: between them they make one whole speaker. Hush gave away his voice — he has the words and no sound. Hum gave away her words — she has the sound and no words. Neither one can say the thing plainly. Same shelf as Grey-Gill\'s name, Below.',
      'THEY ARE NOT CRUEL AND THEY ARE NOT FREE. They are doing a job they cannot stop doing. Play them courteous, tired, and absolutely immovable.',
      'LOOK — the pair: two tall ushers in faded gate-livery, brass buttons, white gloves that never get dirty. Identical faces you can only hold in your head one at a time. Neither of them blinks; nobody notices for an hour.',
      'LOOK — Hush: a slate on a cord, a chalk stub tied on, and a mouth that does not open. LOOK — Hum: her mouth never stops moving, and the words never arrive. They stay exactly the same distance apart all night, even walking.',
      'PLAY THEM: Hush — write 3–5 words on paper and HOLD IT UP; never read it aloud. Hum — answer everything in half-sung fragments that trail off…',
      'THE TOLL: one honest answer each, out loud. WRITE THEM DOWN. They come back once, at the very end, in the players\' own words.',
      'Slate: "ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE."',
      'INVESTIGATION 10 — the slate has been wiped a thousand times; ghost-words sit under tonight\'s. Every one is a name. The cuff of the livery carries a crest for a town that is on no map.',
      'INVESTIGATION 15 — the tally: one chalk mark per guest. FIVE marks were made before the party walked up, and beside them in the same hand: A SET. NOT YET SORTED. The chalk is fresh — counted tonight, in a hurry, by someone watching them come across the sand. Before they reached the GATE, not before they reached the town.',
      'INVESTIGATION 20 — the seam: Hush\'s slate is in Hum\'s handwriting. They never both look away at once. And the fence is only paper — it is not keeping anything out. It is keeping promises in.',
      'IF THEY READ THE ROOM (Insight): both of them want the party to answer honestly, and neither can say why. Hum hums louder when a lie is coming, and stops the moment it lands.',
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
    title: '🌑 The Ones Below — and the Buyer (the one face)',
    lines: [
      'A market in the dark where fairies keep the SELVES of things — names, springs, faces, songs — each humming on a shelf, each something that no longer knows itself.',
      'ONE FACE: the Buyer. Courteous, punctual, never lies, unseen until the middle. Everyone else Below is a keeper who owes him. Players hate one person, not an org chart.',
      'Their power IS the yes: they price what you think you\'ll never miss and arrive at your weakest hour.',
      'They cannot be fought. Only outlasted, out-thought, or out-sung.',
    ],
  },
  {
    title: '🌙 The Sea and the Moon (why any of this is happening)',
    lines: [
      'The Sea loved the Moon — the one thing it touches every day and can never reach. The tides were the Sea rising to get closer.',
      'It couldn\'t bear it, so it gave its song away to forget her. A sea that forgets why it moves slowly stops moving: eleven feet of horizon gone in Wick\'s lifetime.',
      'Forty years ago the Moon came near; Griff, age eight, saw the lights on the sand. Now she\'s coming near again. The night she\'s closest is the finale.',
      'The tide isn\'t stolen — it FOLLOWED its song to the Fair, and is pressed against the fence, grieving, unable to say why.',
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
