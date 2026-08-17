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
