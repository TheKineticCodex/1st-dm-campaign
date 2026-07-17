import type { AbilityKey } from './data/rules'

/** Everything chosen in the character forge. */
export interface CharacterBuild {
  name: string
  species: string | null
  klass: string | null
  bg: string | null
  bump2: AbilityKey | null
  bump1: AbilityKey | null
  assign: Record<AbilityKey, number | null>
  skills: string[]
  /** Locked until level 3 — stored now so level-up needs no migration. */
  subclass: string | null
  level: number
}

/** Volatile play state, tracked separately from the build. */
export interface CharacterState {
  /** Damage taken (max HP is derived, so healing rules never desync). */
  damage: number
  slotsUsed: number
  deathSaves: { successes: number; failures: number }
  conditions: string[]
}

/** Player free text. `lost` is private: visible to this player and the DM only. */
export interface CharacterNotes {
  appearance: string
  personality: string
  lost: string
  notes: string
}

export interface SavedCharacter {
  build: CharacterBuild
  state: CharacterState
  notes: CharacterNotes
  updatedAt: string
}

export interface QuizResult {
  playerName: string
  answers: Record<string, string>
  topClasses: string[]
  updatedAt: string
}

export const EMPTY_BUILD: CharacterBuild = {
  name: '',
  species: null,
  klass: null,
  bg: null,
  bump2: null,
  bump1: null,
  assign: { STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null },
  skills: [],
  subclass: null,
  level: 1,
}

export const EMPTY_STATE: CharacterState = {
  damage: 0,
  slotsUsed: 0,
  deathSaves: { successes: 0, failures: 0 },
  conditions: [],
}

export const EMPTY_NOTES: CharacterNotes = {
  appearance: '',
  personality: '',
  lost: '',
  notes: '',
}

// ---- Phase 2 (DM) types ----

export interface LostThing {
  characterId: string
  taken: string
  believed: string
  truth: string
}

export interface Npc {
  id: string
  name: string
  pronunciation: string
  trait: string
  motivation: string
  secret: string
  connection: string
}

export interface Clue {
  id: string
  conclusion: string
  clues: { text: string; found: boolean }[]
}

export interface SessionNote {
  id: string
  sessionNumber: number
  whatHappened: string
  cluesFound: string
  cluesMissed: string
  npcsMet: string
  threadsOpen: string
}
