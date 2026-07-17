// Derived character sheet — the prototype's computation, extended to be
// level-aware via CLASSES[klass].levels.

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
  allSkills: string[]
  /** Features accumulated from level 1 up to the current level. */
  features: string[]
  /** First-level spell slots at the current level (0 = not a caster). */
  slotCount: number
  spellAttack: number | null
  spellDc: number | null
}

export function finalAbilities(build: CharacterBuild): AbilityScores {
  const base = {} as AbilityScores
  ABILITIES.forEach((a) => (base[a] = build.assign[a] ?? 10))
  if (build.bump2) base[build.bump2] += 2
  if (build.bump1) base[build.bump1] += 1
  return base
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
  const allSkills = [...new Set([...(build.skills || []), ...(B.skills || [])])]

  const features: string[] = []
  for (let l = 1; l <= level; l++) features.push(...(K.levels[l]?.features ?? []))

  const slotCount = K.caster ? (K.levels[level]?.slots ?? 0) : 0
  const spellAttack = K.spells ? mod(A[K.prime]) + prof : null
  const spellDc = K.spells ? 8 + prof + mod(A[K.prime]) : null

  return { A, K, B, S, level, prof, hpMax, ac, atkMod, allSkills, features, slotCount, spellAttack, spellDc }
}

export function skillMod(sheet: ComputedSheet, skill: string): number {
  const ability = SKILL_ABILITY[skill]
  const proficient = sheet.allSkills.includes(skill)
  return mod(sheet.A[ability]) + (proficient ? sheet.prof : 0)
}

export function saveMod(sheet: ComputedSheet, ability: AbilityKey): number {
  return mod(sheet.A[ability]) + (sheet.K.saves.includes(ability) ? sheet.prof : 0)
}
