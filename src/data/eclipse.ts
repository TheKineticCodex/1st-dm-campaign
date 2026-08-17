// The Alignment — the thing the two Freyas do without meaning to.
//
// A Freya called Sun, a Freya called Moon, and somebody standing between
// them. Once in a while the sky agrees with the arrangement.
//
// IT IS NEVER CALLED AN ECLIPSE AT THE TABLE. Not by you, not by an NPC,
// not by the slate. The Fair has no word for it and neither do you. On
// screen it is "the thing with no name", because a player will glance at
// the iPad and that is the joke.
//
// No mechanics. No advantage, no save, no bonus. It buys one second, and
// one second is not a win. See cheatSheet.ts → THE_HIDDEN_LOGIC for why
// the two unpriceable things in the sky are the two things it takes.

import { BILLY, PEACHES, PHILIP } from './campaign'
import type { CheatCard } from './cheatSheet'

// ------------------------------------------------------------- the numbers

/** Tonight's number starts here. Roll this or higher on a d20. */
export const ECLIPSE_START = 20
/** Every night that ends without one, the number comes down by this. */
export const ECLIPSE_DROP = 2
/** It never goes below this — the dice keep a say in it. */
export const ECLIPSE_FLOOR = 5
/** Three in the whole campaign. The fourth is the Moon-Night, and it is written. */
export const ECLIPSE_MAX = 3

export interface EclipseState {
  /** The night this was last opened on. */
  night: number
  /** Tonight's number: roll it or higher. */
  number: number
  /** How many have happened, ever. */
  fired: number
  /** One a night. */
  firedTonight: boolean
  /** The last d20, for the panel to show. */
  lastRoll: number | null
}

export function freshEclipse(night: number): EclipseState {
  return { night, number: ECLIPSE_START, fired: 0, firedTonight: false, lastRoll: null }
}

/**
 * Carry the state into tonight. Nights that ended without an Alignment bring
 * the number down; a night that had one already reset it to 20 when it fired.
 * The odds improve with time passing, never with attempts — nothing to farm.
 */
export function openTheNight(prev: EclipseState | null, night: number): EclipseState {
  if (!prev) return freshEclipse(night)
  if (prev.night >= night) return prev
  const quiet = prev.firedTonight ? night - prev.night - 1 : night - prev.night
  return {
    ...prev,
    night,
    number: Math.max(ECLIPSE_FLOOR, prev.number - quiet * ECLIPSE_DROP),
    firedTonight: false,
    lastRoll: null,
  }
}

/** The roll behind the screen. Equal or higher and it happens. */
export function theRoll(prev: EclipseState, d20: number): EclipseState {
  if (d20 < prev.number) return { ...prev, lastRoll: d20 }
  return { ...prev, number: ECLIPSE_START, fired: prev.fired + 1, firedTonight: true, lastRoll: d20 }
}

/** No more rolling: one a night, three in the campaign. */
export function spent(s: EclipseState): boolean {
  return s.firedTonight || s.fired >= ECLIPSE_MAX
}

// -------------------------------------------------------------- the shadow

/**
 * Whose price goes blank, one each, in this order. Names must match the
 * whisper targets in act1Scenes.ts exactly, or the shadow falls on nobody.
 * The first Alignment blanks nobody at all — it means nothing, on purpose.
 */
export const SHADOW_ORDER: { target: string; who: string }[] = [
  { target: PEACHES, who: 'Peaches' },
  { target: BILLY, who: 'Billy' },
  { target: PHILIP, who: 'Philip' },
]

/** Who the next one lands on. Null on the first, which lands on nobody. */
export function whoseTurn(s: EclipseState): { target: string; who: string } | null {
  if (s.fired < 1 || s.fired > SHADOW_ORDER.length) return null
  return SHADOW_ORDER[s.fired - 1] ?? null
}

// --------------------------------------------------------------- the beats

export interface EclipseBeat {
  tier: 'first' | 'middle' | 'last'
  /** What it is, for you. */
  name: string
  /** When this one is the one. */
  when: string
  /** The gold words — the only part you read aloud. */
  readAloud: string
  /** What it actually does. */
  thenWhat: string
  /** How it ends. Never reverent. */
  comic: string
}

export const ECLIPSE_BEATS: EclipseBeat[] = [
  {
    tier: 'first',
    name: 'The light goes thin',
    when: 'The first one, ever. It buys nothing and it means nothing, and that is the whole design.',
    readAloud:
      'The light goes thin. Not dark — thin, the way it goes when a cloud passes that is not there. A gull stops in the middle of a note. Somebody’s lantern gutters and comes back. And then it is over, and nobody else looks up.',
    thenWhat:
      'Nothing happens. No roll, no save, nothing to investigate. If they ask what that was, you do not know either — and neither does anyone in the Fair. Move the scene on inside ten seconds. The whole trick is that you did not stop for it.',
    comic: 'Pookie lies flat on the ground for the duration, then gets up and will not meet anyone’s eye.',
  },
  {
    tier: 'middle',
    name: 'The ring',
    when: 'The second and the third. These are the two that do something.',
    readAloud:
      'The light goes thin — and this time there is a reason for it. Over your heads something round has slid across something round, and where they do not quite fit there is a ring of white fire. Everything on the ground has two shadows. The Fair goes quiet the way a room goes quiet when somebody drops a glass.',
    thenWhat:
      'One second, on the person whose turn it is in the shadow. For that second the price on them goes blank — the tag Tarn would see and they cannot — and whatever was about to happen to that person does not happen. A hand does not close. A sentence does not finish. Then the light comes back and every NPC carries on as though the sentence had finished, because not one of them noticed it stop.',
    comic:
      'The stall-keeper apologises to nobody in particular, starts the sentence again from the top word for word, and gets it wrong.',
  },
  {
    tier: 'last',
    name: 'The one over the harbour',
    when: 'The Moon-Night. Scripted — it happens whether or not the number ever came up.',
    readAloud:
      'Every lantern in the Fair goes out at the same moment, and it does not get dark. Above the sea — which is standing on its hind legs to reach her — the two of them finally overlap, and a ring of white fire opens over the whole harbour. Every price in the world goes blank at once. Every single one. And out on the empty stage, hanging on nothing, there is one tag that was not there a moment ago, with one name written on it.',
    thenWhat:
      'This is the payoff for the whisper you never explained: nothing is priced on the one doing the pricing. Tonight, something is. Do NOT read the name out — ask who walks over and looks, and let a player read it. The man with the tea sets his cup down very carefully. When the light comes back, Philip’s tag is the last one in the world to come back at all; give him the beat and say nothing about it.',
    comic: 'Pookie lies down. This time everybody else does too, and nobody is embarrassed.',
  },
]

/** The beat for a given count of Alignments already spent. */
export function beatFor(fired: number): EclipseBeat {
  if (fired <= 0) return ECLIPSE_BEATS[0]!
  if (fired < ECLIPSE_MAX) return ECLIPSE_BEATS[1]!
  return ECLIPSE_BEATS[2]!
}

// ---------------------------------------------------------------- the test

export const ECLIPSE_TEST: string[] = [
  'SHIELDING — Freya Sun puts herself between somebody and a PRICE. Not a blade: an offer. She steps in front of a bargain being made at someone she loves.',
  'REACHING — Freya Moon reaches for something that was taken. The pendant out, a hand out, or a name said out loud. Any one of the three counts.',
  'THE MIDDLE — and somebody who is not a Freya is standing between them. That third person is the whole point: without them there is nothing to align, and this is the party’s thing rather than two players’ toy.',
  'AND NOBODY PLANNED IT. If a player says "let’s do the sky thing", there is no roll, ever. It happens TO you. Never explain that rule; just never roll.',
]

export const ECLIPSE_HOW: string[] = [
  'When all three land at once, roll a d20 behind the screen. Tonight’s number or higher, and it happens.',
  'It starts at 20 and it does not move for trying. Every night that ends without one, it comes down by two — the odds improve with time passing, never with attempts. There is nothing here to farm.',
  'The moment one fires, the number goes back to 20.',
  'Once a night. Three in the whole campaign — and then the Moon-Night, which is written and does not need the dice.',
  'By the third road the number is low enough that you should stop rolling and simply take it the next time the three things line up.',
]

export const ECLIPSE_NEVER: string[] = [
  'Never say the word. Not you, not an NPC, not the slate. The Fair has no word for this and neither do you.',
  'The shadow never falls on a Freya. They cause it; they are never the ones it saves.',
  'THE TWO WHO CAUSE IT ARE THE ONLY TWO WHO DO NOT SEE IT. She is mid-shield with the light in her eyes; she is turned away, mid-reach. Everyone else describes it to them afterwards, badly, disagreeing about what it looked like.',
  'The benefit rotates: Peaches, then Billy, then Philip. One each, and that is the lot.',
  'No mechanics. No advantage, no save, no bonus, no inspiration. It buys one second, and one second never wins a scene.',
  'Never in a scene with only the two Freyas in it. No third person in the middle, no Alignment.',
  'Never let anyone explain it. Ask Grey-Gill and you get bubbles. Ask Hush and he wipes the slate and writes nothing at all.',
  'End every single one on the comic note. If the table goes reverent, Pookie fixes it.',
]

/**
 * The private half — sealed to whoever is in the shadow, and to nobody else.
 * The two who caused it are not on this list and never will be.
 */
export const ECLIPSE_WHISPER = {
  title: 'One second, and nobody else notices',
  body:
    'The light goes thin. Something round has crossed something round, and there is a ring of white fire around it, and everything on the ground has two shadows. And whatever was about to happen to you does not happen. A hand does not close. A sentence does not finish. Then the light comes back, and everyone carries on as though the sentence had finished, and you are the only one who knows it did not.',
}

/**
 * The nudge that goes in the Book's night path. The realistic failure here
 * is not running it wrong — it is never noticing the three things happen.
 */
export const ECLIPSE_NUDGE = {
  if: 'Freya Sun steps in front of an OFFER, and Freya Moon reaches for something taken',
  then:
    'Look at who is standing between them. If it is anyone but a Freya, and you did not arrange any of it — that is the three. Do not stop the scene: roll it on their next turn, in Tonight → the thing with no name.',
}

// ------------------------------------------------------------- cheat cards

export const ECLIPSE_CARDS: CheatCard[] = [
  {
    title: '🌑 The thing with no name — when it happens',
    lines: [
      'Three things at once, none of them arranged by anybody:',
      ...ECLIPSE_TEST,
      '—',
      ...ECLIPSE_HOW,
      'Tonight’s number, the words to read, and whose turn it is all live in Tonight → run the night, at the bottom.',
    ],
  },
  {
    title: '🌑 The thing with no name — the nevers',
    lines: ECLIPSE_NEVER,
  },
]
