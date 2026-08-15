// ✦ The games layer — one shape for every carnival game.
//
// The DM's Book HOSTS a game: it holds the state, reduces player inputs,
// and broadcasts state snapshots (also on a heartbeat, so a phone that
// slept catches up). Phones are CONTROLLERS: they render the latest state
// and send inputs. The iPad STAGE renders the same state, big. Games are
// theatre, not records — nothing persists except the prize the DM whispers.
//
// A new game = a state type + a reducer here, and three small views
// (phone / stage / DM panel) in components/games/. The transport, the
// overlay chrome, the heartbeat, and "return to the story" are shared.

export type GameKind = 'draw' | 'note' | 'toll'

// ------------------------------------------------------------ Draw the Missing Piece
export interface Stroke {
  /** Normalised 0..1 points, [x, y] pairs. */
  p: number[]
  w: number
}
export interface DrawState {
  kind: 'draw'
  gameId: string
  phase: 'intro' | 'drawing' | 'reveal' | 'end'
  players: string[]
  round: number
  totalRounds: number
  artist: string
  /** The word — every phone receives it; only the artist's shows it. (A home game trusts its players.) */
  word: string
  strokes: Stroke[]
  guesses: { by: string; text: string; right: boolean }[]
  solvedBy: string | null
  score: number
  /** Seconds left in this round (host-driven). */
  timeLeft: number
  roundSeconds: number
}
export type DrawInput =
  | { type: 'stroke'; stroke: Stroke }
  | { type: 'stroke-append'; p: number[] }
  | { type: 'clear' }
  | { type: 'guess'; text: string }

// ------------------------------------------------------------ Hold the Note
export interface NoteState {
  kind: 'note'
  gameId: string
  phase: 'intro' | 'holding' | 'end'
  players: string[]
  /** midi note per player — the tune's chord tones, never the missing note. */
  notes: Record<string, number>
  held: Record<string, boolean>
  /** 0..100 — rises while everyone holds, falls otherwise. */
  chord: number
  timeLeft: number
  totalSeconds: number
  /** Seconds the whole party held together. */
  heldTogether: number
  /** A distraction the Fair is trying on one player right now. */
  distract: { target: string; text: string; until: number } | null
  won: boolean | null
}
export type NoteInput = { type: 'hold'; held: boolean }

// ------------------------------------------------------------ The Toll
export interface TollState {
  kind: 'toll'
  gameId: string
  phase: 'answer' | 'reveal' | 'end'
  players: string[]
  question: string
  /** Sealed until reveal: on phones, only your own is readable before then. */
  answers: { by: string; text: string }[]
  /** Order the answers are shown in (shuffled), and how many have been revealed with their author. */
  order: number[]
  revealed: number
}
export type TollInput = { type: 'answer'; text: string }

export type GameState = DrawState | NoteState | TollState
export type GameInput = DrawInput | NoteInput | TollInput

/** What travels on the channel. */
export interface GameEvent {
  gameId: string
  /** 'state' from the host; 'input' from a phone; 'clear' from the host ends everything. */
  kind: 'state' | 'input' | 'clear'
  state?: GameState
  from?: string
  input?: GameInput
  at: string
}

export const GAME_TITLES: Record<GameKind, string> = {
  draw: '🎨 Draw the Missing Piece',
  note: '🎵 Hold the Note',
  toll: '🕯 The Toll',
}

// ------------------------------------------------------------ Draw words
export const DRAW_WORDS = [
  'Pookie',
  'the carousel',
  'Grey-Gill’s tent',
  'the tide going out',
  'a paper lantern',
  'the seal-pup',
  'the Twins’ slate',
  'a jar of voices',
  'the Moon',
  'Wren’s spellbook',
  'the Getting Fair',
  'a mermaid’s tail',
  'the Dry Anchor',
  'a coral house',
  'the missing note',
  'a wax seal',
  'the lighthouse',
  'a snail with a crown',
]

/** Normalise a guess for matching: lowercase, no punctuation, no leading "the/a". */
export function normGuess(s: string): string {
  return s
    .toLowerCase()
    .replace(/[’'".,!?-]/g, '')
    .replace(/^(the|a|an)\s+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}
export function guessMatches(guess: string, word: string): boolean {
  const g = normGuess(guess)
  const w = normGuess(word)
  if (!g) return false
  if (g === w) return true
  // forgiving: the last word of the answer (tent, carousel, moon…) counts if it's distinctive
  const last = w.split(' ').pop() ?? w
  return last.length >= 4 && g === last
}

// ------------------------------------------------------------ Hold the Note pitches
/** Chord tones from the Sea's song (G mixolydian) — never E5, the missing note. */
export const NOTE_POOL = [67, 71, 74, 62, 69, 79, 72] // G4 B4 D5 D4 A4 G5 C5

// ------------------------------------------------------------ Toll questions
export const TOLL_QUESTIONS = [
  'What did you lose that you would walk into the sea to get back?',
  'What is the bravest lie you have ever told?',
  'Who at this table would you trust with your true name?',
  'What would you never, ever sell?',
  'What do you hum when you think no one can hear?',
  'What did you leave behind to be here tonight?',
]

/** Fisher–Yates, seeded by nothing — the host shuffles once and broadcasts the order. */
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}
