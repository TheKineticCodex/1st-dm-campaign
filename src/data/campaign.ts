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
export const PEACHES = 'Peaches capiche'
export const BILLY = 'William Blackwood'
export const PHILIP = 'Philip'
export const FREYA = 'Freya'
export const FREYA_MOON = 'Freya Moon'
