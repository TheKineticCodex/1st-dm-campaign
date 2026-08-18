// Campaign-level configuration. One place to grow the party.

/**
 * Number of protagonist seats. The Equal Protagonists rule (PROMPT-V2 §3):
 * every personal-story system — chairs, Reliquary tracks, tethers — has
 * exactly this many first-class slots, no favorites.
 */
export const PARTY_SIZE = 5

const NUMBER_WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight']

/** 'five' for 5, falling back to digits past eight. */
export const partyWord = NUMBER_WORDS[PARTY_SIZE] ?? String(PARTY_SIZE)

/**
 * The five seats, by the exact name each player joined with. A sealed
 * whisper finds a phone by name and nothing else, so these strings are the
 * contract between the Book and the table — spell them the way the Roster
 * spells them, and change them in one place only.
 */
/**
 * THE STAGE DEVICE — the screen on the stand that the table looks at.
 *
 * Type the Lantern-Keeper's code with this on the end (LANTERNKEEPER-STAGE)
 * and the app hands that device one screen and locks the door behind it: no
 * Book, no cheat sheet, no story. Tapping ✕ signs it out to the gate rather
 * than opening the Book, so a player who picks the iPad up finds nothing.
 *
 * Honest about what this is: the same credential wearing a different hat, so
 * the separation is in the app and not in the database. A curious player
 * cannot get through it; someone with developer tools could. That is the
 * right trade for a screen sitting on a table in your living room.
 */
export const STAGE_SUFFIX = '-STAGE'

/**
 * Strip the suffix off a typed code, forgiving however a thumb typed it —
 * a dash, a space, a slash, or nothing at all. Returns null if it isn't a
 * stage code, and never returns a code with no letters left in it.
 */
export function readStageCode(typed: string): string | null {
  const m = typed.trim().toUpperCase().replace(/\s+/g, '').match(/^(.*?)[-/:]?STAGE$/)
  if (!m) return null
  const base = m[1]!.replace(/[-/:]+$/, '')
  return /[A-Z0-9]/.test(base) ? base : null
}

export const PEACHES = 'Peaches capiche'
export const BILLY = 'William Blackwood'
export const PHILIP = 'Philip'
export const FREYA = 'Freya'
export const FREYA_MOON = 'Freya Moon'

/**
 * A TEST SEAT — a device at the table that is not one of the five.
 *
 * A leading underscore marks it. The convention is already in the repo: the
 * live specs join as `_gametest` and `_wheeltest`, and the stray `_moon` from
 * a rehearsal sits in the campaign now. The Book hides these by default so a
 * spare phone is never a sixth chair, never a whisper target, and never a lane
 * in the derby — but the device itself works exactly as any player's does, so
 * it stays usable for testing whenever the Lantern-Keeper asks to see it.
 */
export function isTestSeat(playerName: string): boolean {
  return playerName.trim().startsWith('_')
}

/** The seats that belong at the table tonight. */
export function atTheTable<T extends { playerName: string }>(roster: T[], showTest = false): T[] {
  return showTest ? roster : roster.filter((r) => !isTestSeat(r.playerName))
}

/**
 * MATCHING A SEAT BY NAME.
 *
 * Session 3 lost every one of Freya Moon's sealed readings because she joined
 * as "Freya moon" and the Book compared names with ===. A person typing their
 * own name into a phone at a table will not reproduce a string exactly, and it
 * is not their job to. Compare with this instead, everywhere.
 */
export function sameSeat(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false
  return a.trim().toLowerCase().replace(/\s+/g, ' ') === b.trim().toLowerCase().replace(/\s+/g, ' ')
}

/**
 * The name a device actually joined with, given the name the campaign expects.
 * Whispers must be addressed with the string the server knows, or the send is
 * silently dropped — so resolve before sending, never after.
 */
export function seatNameFor<T extends { playerName: string }>(roster: T[], wanted: string): string | null {
  return roster.find((r) => sameSeat(r.playerName, wanted))?.playerName ?? null
}
