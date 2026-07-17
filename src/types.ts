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
  /** Aura key (see glyphs.tsx AURAS) — the light the lanterns see in you. */
  aura?: string
  /** The mirror's portrait — seed baked into the URL; once seen, final. */
  portraitUrl?: string
}

/** Volatile play state, tracked separately from the build. */
export interface CharacterState {
  /** Damage taken (max HP is derived, so healing rules never desync). */
  damage: number
  slotsUsed: number
  deathSaves: { successes: number; failures: number }
  conditions: string[]
  /** Concentration co-pilot: set when holding a concentration spell. */
  concentrating?: boolean
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
  /** The mirror questions' species recommendation. */
  topSpecies?: string[]
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

// ---- Phase 3 (Table Mode) types ----

export interface InitiativeRow {
  id: string
  name: string
  init: number
  isPc: boolean
  /** Player name for "you're up" matching (PC rows only). */
  playerName?: string
}

export interface Encounter {
  id: string
  order: InitiativeRow[]
  activeIndex: number
  active: boolean
}

export interface Handout {
  id: string
  /** null = everyone; otherwise the target player's name. */
  target: string | null
  title: string
  body: string
  /** Small image as data URL (owner-supplied asset). */
  imageDataUrl?: string
  /** A2 Sealed Whispers: the message fades 60s after the seal breaks. */
  ephemeral?: boolean
  sentAt: string
}

// ---- NEXT-1: live table events (broadcast only — feed is ephemeral by
// design; the DM's Book stores nothing from these) ----

export interface RollEvent {
  playerName: string
  characterName: string
  label: string
  total: number
  kept: number
  modifier: number
  mode: string
  isNat20: boolean
  isNat1: boolean
  at: string
}

export interface ConditionEvent {
  targetPlayer: string
  condition: string
  active: boolean
}

export interface RaceEvent {
  raceId: string
  phase: 'start' | 'progress' | 'finish' | 'end'
  playerName?: string
  progress?: number
  /** Finish order by player name, sent with phase 'end'. */
  results?: string[]
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
