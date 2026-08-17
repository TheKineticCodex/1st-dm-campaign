// 📖 Salt, Salt, What Did You Give? — the Saltmere skipping rhyme.
//
// A children's rhyme nobody can source. One verse at the top of each session,
// twenty seconds, before the Moon line. Never explained: if a player asks what
// it means, the only correct answer is "it's just a thing the children sing."
//
// The refrain is the engine. Say it the same way every time so that by the
// fifth telling the table is saying it with you — at which point they have
// been reciting the Sea's own defence for months without noticing, and verse
// V can break it under them.
//
// The whole win condition is in here from the start. That is the point: when
// the Moon-Night lands it should feel like something they always knew.

export interface TaleVerse {
  /** As the Lantern-Keeper counts them. */
  numeral: string
  /** The first session that hears this one. */
  session: number
  /** One paragraph per line, as read aloud. */
  lines: string[]
  /** How the refrain lands this time. */
  refrain: 'as written' | 'falters' | 'breaks'
  /** For you, never read out. */
  direction?: string
}

export const TALE_TITLE = 'Salt, salt, what did you give?'

export const REFRAIN = {
  call: 'Salt, salt, what did you give?',
  answer: 'Only what was mine to give.',
  /** Verse V. The rhyme they know starts to come out wrong. */
  faltered: '…only what was mine to give.',
  /** The Moon-Night. It never gets finished again. */
  broken: 'Give it back.',
}

/**
 * Seven verses over the sessions from here. If your pacing runs long or short,
 * change the `session` numbers — nothing else reads them. The last verse is
 * the Moon-Night's and is held for session 9 and after.
 */
export const TALE: TaleVerse[] = [
  {
    numeral: 'I',
    session: 3,
    lines: [
      'Once, the sea was in love with the moon.',
      'She crossed over him every night, and not once came down. So he rose. Every day of the world he rose as high as he could, and every day he fell back.',
      'That is all a tide is. That is all it ever was.',
    ],
    refrain: 'as written',
    direction:
      'The tide has just gone out and the town is frightened, which is exactly when an old rhyme surfaces. Have Maddy hum it, or Pip chant it skipping, and Griff refuse to join in.',
  },
  {
    numeral: 'II',
    session: 4,
    lines: [
      'He couldn’t bear it, so he paid to stop.',
      'He didn’t pay in fish, or ships, or drowned men. He paid with the song he sang while he was rising.',
      'And it worked. He forgot her. He forgets a little more every year — and he doesn’t rise so high now.',
    ],
    refrain: 'as written',
  },
  {
    numeral: 'III',
    session: 5,
    lines: [
      'The ones who bought it never stole a thing in their lives. Ask them.',
      'They came with lanterns and good manners, and they asked. And he said yes. And that was that.',
      'They come back when the moon comes near. They are very polite. They never charge coin.',
    ],
    refrain: 'as written',
    direction: 'By now somebody at the table has heard a stall-keeper say the same four words. Do not connect them.',
  },
  {
    numeral: 'IV',
    session: 6,
    lines: [
      'What they buy, they keep.',
      'Shelf after shelf in the dark, and every jar still full, and every jar still singing to nobody at all.',
      'Put your ear to one and you can hear it. Put your ear to a hundred and you can hear how quiet it is.',
    ],
    refrain: 'as written',
  },
  {
    numeral: 'V',
    session: 7,
    lines: [
      'Here’s the thing about a song.',
      'It was never only his. It belonged to every fish that swam in it, every boat that sat on it, every child that ever fell asleep listening to it.',
      'He sold what was not only his to sell.',
    ],
    refrain: 'falters',
    direction:
      'THE ONE THAT MATTERS. Let the answer come out slower and trail off, and do not comment on it. You deliver the whole reveal by getting the rhyme slightly wrong. If the table says the line for you, let them — it lands harder in their own mouths.',
  },
  {
    numeral: 'VI',
    session: 8,
    lines: [
      'The pieces didn’t stay where they were put.',
      'They lean. They always lean. Put two of them in one room and they’ll find each other, and neither will tell you how.',
    ],
    refrain: 'as written',
    direction: 'Say this one on a night they have already watched two pieces lean. Never say which two.',
  },
  {
    numeral: 'VII',
    session: 9,
    lines: [
      'And if they were ever all together, and all sang at once — not one of them, all of them —',
      'the sea would remember what it loved, and come back up the harbour steps to say so.',
    ],
    refrain: 'breaks',
    direction:
      'The Moon-Night. The rhyme they have chanted since the carnival does not get finished this time. Ask the call, wait, and answer it yourself.',
  },
]

/** The verse for a given night. Holds on the last one once the tale runs out. */
export function verseFor(session: number): TaleVerse {
  let found = TALE[0]!
  for (const v of TALE) if (session >= v.session) found = v
  return found
}

/** How to run it. On the card, for the nights you have forgotten. */
export const TALE_HOW = [
  'One verse at the top of the session, before the Moon line. Twenty seconds, then move on.',
  'Same refrain, same rhythm, every single time. It has to be boring and familiar for five sessions so that verse V can break it.',
  'Never explain it. "It’s just a thing the children sing" is the only right answer, and it is the right answer every time.',
  'Fragments belong to everyone: Grey-Gill reading a palm and murmuring "only what was mine to give, dear"; the Twins’ slate wiped and rewritten as ONLY WHAT WAS MINE TO GIVE; the carousel organ playing the refrain with a hole in it.',
]
