// Derived character sheet — the prototype's computation, extended to be
// level-aware via CLASSES[klass].levels (1–2) and levels.ts (3+).

import {
  ABILITIES,
  BACKGROUNDS,
  CLASSES,
  SKILL_ABILITY,
  SPECIES,
  maxHp,
  mod,
  profBonus,
  type AbilityKey,
  type AbilityScores,
  type BackgroundData,
  type ClassData,
  type SpeciesData,
} from '../data/rules'
import {
  CLASS_LEVELS,
  CORE_FEATURE_USES,
  FEATS,
  FULL_CASTER_SLOTS,
  SPECIES_BY_LEVEL,
  SUBCLASSES,
  toFeature,
  type Feature,
} from '../data/levels'
import type { CharacterBuild } from '../types'

export interface ComputedSheet {
  A: AbilityScores
  K: ClassData
  B: BackgroundData
  S: SpeciesData
  level: number
  prof: number
  hpMax: number
  ac: { val: number; note: string }
  atkMod: number
  /** Attacks per Attack action (Fighter 5+: 2). */
  attacks: number
  allSkills: string[]
  /** Features accumulated from level 1 up to the current level — as display strings (legacy). */
  features: string[]
  /** The same features, structured: class + subclass + level-up feats. */
  featureList: Feature[]
  /** Species traits, including any that woke at later levels. */
  speciesTraits: string[]
  /** First-level spell slots at the current level (0 = not a caster) — legacy. */
  slotCount: number
  /** Slots per spell level, index 0 = 1st level. Empty when not a caster. */
  slotsByLevel: number[]
  spellAttack: number | null
  spellDc: number | null
  /** The subclass chosen (or null), and whether one is due. */
  subclass: string | null
  subclassDue: boolean
  /** True at 4, 8, 12… when no feat/ASI has been chosen for that level yet. */
  featDue: boolean
}

export function finalAbilities(build: CharacterBuild): AbilityScores {
  const base = {} as AbilityScores
  ABILITIES.forEach((a) => (base[a] = build.assign[a] ?? 10))
  if (build.bump2) base[build.bump2] += 2
  if (build.bump1) base[build.bump1] += 1
  if (build.asi) for (const a of ABILITIES) base[a] = Math.min(20, base[a] + (build.asi[a] ?? 0))
  return base
}

/** Levels at which this class chooses an ASI or feat. 2024: 4, 8, 12, 16, 19 (Fighter also 6, 14). */
export function asiLevels(klass: string): number[] {
  const base = [4, 8, 12, 16, 19]
  return klass === 'Fighter' ? [4, 6, 8, 12, 14, 16, 19] : base
}

export function computeSheet(build: CharacterBuild): ComputedSheet | null {
  if (!build.klass || !build.species || !build.bg) return null
  const K = CLASSES[build.klass]
  const B = BACKGROUNDS[build.bg]
  const S = SPECIES[build.species]
  if (!K || !B || !S) return null

  const A = finalAbilities(build)
  const level = build.level
  const prof = profBonus(level)
  const hpMax = maxHp(K.die, mod(A.CON), level)
  const ac = K.ac(A)
  const atkMod = mod(A[K.weapon.ab]) + prof
  const attacks = build.klass === 'Fighter' && level >= 5 ? 2 : 1
  const allSkills = [...new Set([...(build.skills || []), ...(B.skills || [])])]

  // ---- features: class levels 1–2 (rules.ts), 3+ (levels.ts), subclass, feats
  const featureList: Feature[] = []
  for (let l = 1; l <= level; l++) {
    for (const f of K.levels[l]?.features ?? []) featureList.push(toFeature(f))
    for (const f of CLASS_LEVELS[build.klass]?.[l] ?? []) featureList.push(f)
    if (build.subclass) {
      for (const f of SUBCLASSES[build.klass]?.[build.subclass]?.features[l] ?? []) featureList.push(f)
    }
  }
  // uses for level 1–2 features that rules.ts lists as plain strings
  const coreUses = CORE_FEATURE_USES[build.klass] ?? {}
  for (const f of featureList) {
    const u = coreUses[f.name]
    if (u && !f.uses) f.uses = { n: u.n === 'prof' ? prof : u.n, per: u.per }
  }
  // feats taken at level-ups (ASI is recorded but not a feature)
  for (const name of build.feats ?? []) {
    const feat = FEATS.find((x) => x.name === name)
    if (feat && feat.name !== 'Ability Score Improvement') featureList.push({ name: feat.name, text: feat.text, action: 'passive' })
  }
  const features = featureList.map((f) => (f.text ? `${f.name}: ${f.text}` : f.name))

  // ---- species traits, plus later awakenings
  const speciesTraits = [...S.traits]
  for (let l = 1; l <= level; l++) speciesTraits.push(...(SPECIES_BY_LEVEL[build.species]?.[l] ?? []))

  // ---- spells
  const slotsByLevel = K.caster === 'full' ? [...(FULL_CASTER_SLOTS[level] ?? [])] : []
  const slotCount = K.caster ? (slotsByLevel[0] ?? K.levels[level]?.slots ?? 0) : 0
  const spellAttack = K.spells ? mod(A[K.prime]) + prof : null
  const spellDc = K.spells ? 8 + prof + mod(A[K.prime]) : null

  // ---- what's due
  const subclassDue = level >= K.subclassAt && !build.subclass && !!SUBCLASSES[build.klass]
  const featsTaken = (build.feats ?? []).length
  const featsOwed = asiLevels(build.klass).filter((l) => l <= level).length
  const featDue = featsOwed > featsTaken

  return {
    A,
    K,
    B,
    S,
    level,
    prof,
    hpMax,
    ac,
    atkMod,
    attacks,
    allSkills,
    features,
    featureList,
    speciesTraits,
    slotCount,
    slotsByLevel,
    spellAttack,
    spellDc,
    subclass: build.subclass,
    subclassDue,
    featDue,
  }
}

export function skillMod(sheet: ComputedSheet, skill: string): number {
  const ability = SKILL_ABILITY[skill]
  const proficient = sheet.allSkills.includes(skill)
  return mod(sheet.A[ability]) + (proficient ? sheet.prof : 0)
}

export function saveMod(sheet: ComputedSheet, ability: AbilityKey): number {
  return mod(sheet.A[ability]) + (sheet.K.saves.includes(ability) ? sheet.prof : 0)
}
