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
