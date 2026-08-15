// The rules engine, pinned. Pure logic only — no DOM, no network. If any of
// these fail, a sheet at the table is wrong. Numbers marked VERIFY in the
// data files are pinned to what the data currently says; when the
// Lantern-Keeper corrects a figure, correct it here in the same commit.

import { describe, expect, it } from 'vitest'
import { CLASSES, maxHp, mod, profBonus } from '../data/rules'
import { CLASS_LEVELS, FEATS, FULL_CASTER_SLOTS, SPECIES_BY_LEVEL, SUBCLASSES, maxSpellLevel, toFeature } from '../data/levels'
import { PREPARED_COUNT, SPELLBOOK, cantripsKnown, spellByName, spellsFor, wizardBookSize } from '../data/spellbook'
import { rollD20, rollDamage, rollDice } from './dice'
import { asiLevels, computeSheet, finalAbilities } from './compute'
import type { CharacterBuild } from '../types'

const philip = (over: Partial<CharacterBuild> = {}): CharacterBuild => ({
  name: 'Philip',
  species: 'Halfling',
  klass: 'Fighter',
  bg: 'Soldier',
  bump2: 'STR',
  bump1: 'CON',
  assign: { STR: 15, DEX: 14, CON: 13, INT: 10, WIS: 12, CHA: 8 },
  skills: ['Perception', 'Insight'],
  subclass: null,
  level: 1,
  ...over,
})

const peaches = (over: Partial<CharacterBuild> = {}): CharacterBuild => ({
  name: 'Peaches',
  species: 'Aasimar',
  klass: 'Druid',
  bg: 'Sailor',
  bump2: 'WIS',
  bump1: 'CON',
  assign: { STR: 10, DEX: 14, CON: 13, INT: 8, WIS: 15, CHA: 12 },
  skills: ['Nature', 'Perception'],
  subclass: null,
  level: 1,
  ...over,
})

describe('core arithmetic', () => {
  it('ability modifier', () => {
    expect(mod(1)).toBe(-5)
    expect(mod(8)).toBe(-1)
    expect(mod(10)).toBe(0)
    expect(mod(11)).toBe(0)
    expect(mod(15)).toBe(2)
    expect(mod(20)).toBe(5)
  })
  it('proficiency bonus by level (2024: +2 through 4, +3 from 5)', () => {
    expect(profBonus(1)).toBe(2)
    expect(profBonus(4)).toBe(2)
    expect(profBonus(5)).toBe(3)
    expect(profBonus(8)).toBe(3)
    expect(profBonus(9)).toBe(4)
  })
  it('max HP with fixed rolls', () => {
    // Fighter d10, CON +2: 12 at level 1, then +8 (6+2) per level
    expect(maxHp(10, 2, 1)).toBe(12)
    expect(maxHp(10, 2, 4)).toBe(36)
    // Wizard d6, CON +1: 7, then +5 per level
    expect(maxHp(6, 1, 3)).toBe(17)
  })
})

describe('abilities and the level-4 choice', () => {
  it('applies origin bumps', () => {
    const A = finalAbilities(philip())
    expect(A.STR).toBe(17)
    expect(A.CON).toBe(14)
    expect(A.DEX).toBe(14)
  })
  it('applies ASIs from level-ups, capped at 20', () => {
    const A = finalAbilities(philip({ asi: { STR: 2, DEX: 1 } }))
    expect(A.STR).toBe(19)
    expect(A.DEX).toBe(15)
    expect(finalAbilities(philip({ asi: { STR: 10 } })).STR).toBe(20)
  })
  it('fighters get extra ASI levels', () => {
    expect(asiLevels('Fighter')).toEqual([4, 6, 8, 12, 14, 16, 19])
    expect(asiLevels('Druid')).toEqual([4, 8, 12, 16, 19])
  })
  it('a feat is due at 4 until one is taken', () => {
    expect(computeSheet(philip({ level: 4 }))!.featDue).toBe(true)
    expect(computeSheet(philip({ level: 4, feats: ['Sentinel'] }))!.featDue).toBe(false)
    expect(computeSheet(philip({ level: 3 }))!.featDue).toBe(false)
  })
  it('a subclass is due at 3 for classes that have them', () => {
    expect(computeSheet(philip({ level: 3 }))!.subclassDue).toBe(true)
    expect(computeSheet(philip({ level: 3, subclass: 'Champion' }))!.subclassDue).toBe(false)
    expect(computeSheet(philip({ level: 2 }))!.subclassDue).toBe(false)
  })
  it('every feat has a bump and a one-line text', () => {
    for (const f of FEATS) {
      expect(f.text.length).toBeGreaterThan(20)
      expect(f.bump === 'any' || f.bump.length > 0).toBe(true)
    }
  })
})

describe('the computed sheet', () => {
  it('level-1 fighter: HP, AC, attack, prof', () => {
    const s = computeSheet(philip())!
    expect(s.hpMax).toBe(12)
    expect(s.ac.val).toBe(18)
    expect(s.atkMod).toBe(3 + 2) // STR 17 → +3, prof +2
    expect(s.attacks).toBe(1)
    expect(s.slotsByLevel).toEqual([])
  })
  it('fighter 5 attacks twice; prof rises', () => {
    const s = computeSheet(philip({ level: 5, subclass: 'Champion', feats: ['Ability Score Improvement'], asi: { STR: 2 } }))!
    expect(s.attacks).toBe(2)
    expect(s.prof).toBe(3)
    expect(s.featureList.some((f) => f.name === 'Extra Attack')).toBe(true)
    expect(s.featureList.some((f) => f.name === 'Improved Critical')).toBe(true)
  })
  it('subclass features join at 3; feats join the list; ASI does not', () => {
    const s = computeSheet(philip({ level: 4, subclass: 'Battle Master', feats: ['Ability Score Improvement', 'Sentinel'] }))!
    const names = s.featureList.map((f) => f.name)
    expect(names).toContain('Combat Superiority')
    expect(names).toContain('Sentinel')
    expect(names).not.toContain('Ability Score Improvement')
  })
  it('core feature uses are attached (Second Wind, Action Surge)', () => {
    const s = computeSheet(philip({ level: 2 }))!
    const sw = s.featureList.find((f) => f.name === 'Second Wind')!
    const as = s.featureList.find((f) => f.name === 'Action Surge')!
    expect(sw.uses).toEqual({ n: 2, per: 'long' })
    expect(as.uses).toEqual({ n: 1, per: 'short' })
  })
  it('druid slots by level and spell attack/DC', () => {
    const s3 = computeSheet(peaches({ level: 3, subclass: 'Circle of the Sea' }))!
    expect(s3.slotsByLevel).toEqual([4, 2])
    expect(s3.slotCount).toBe(4)
    expect(s3.spellDc).toBe(8 + 2 + 3) // WIS 17 → +3
    expect(s3.spellAttack).toBe(5)
    const s5 = computeSheet(peaches({ level: 5, subclass: 'Circle of the Sea', feats: ['Ability Score Improvement'] }))!
    expect(s5.slotsByLevel).toEqual([4, 3, 2])
    expect(s5.featureList.some((f) => f.name === 'Wild Resurgence')).toBe(true)
  })
  it('species traits wake at later levels', () => {
    expect(computeSheet(peaches({ level: 2 }))!.speciesTraits.some((t) => t.startsWith('Celestial Revelation'))).toBe(false)
    expect(computeSheet(peaches({ level: 3, subclass: 'Circle of the Land' }))!.speciesTraits.some((t) => t.startsWith('Celestial Revelation'))).toBe(true)
  })
  it('returns null for an unfinished build', () => {
    expect(computeSheet(philip({ klass: null }))).toBeNull()
  })
})

describe('levels data integrity', () => {
  it('every subclass has level-3 features with text', () => {
    for (const [klass, subs] of Object.entries(SUBCLASSES)) {
      expect(CLASSES[klass]).toBeDefined()
      for (const [name, sc] of Object.entries(subs)) {
        expect(sc.features[3]?.length, `${klass}/${name}`).toBeGreaterThan(0)
        for (const f of sc.features[3]) expect(f.text.length, `${name}/${f.name}`).toBeGreaterThan(20)
      }
    }
  })
  it('subclass-granted spells exist in the spellbook', () => {
    for (const subs of Object.values(SUBCLASSES)) {
      for (const [name, sc] of Object.entries(subs)) {
        for (const list of Object.values(sc.grants ?? {})) {
          for (const spell of list) expect(spellByName(spell), `${name} grants ${spell}`).toBeDefined()
        }
      }
    }
  })
  it('class levels 3–5 exist for our three classes', () => {
    for (const k of ['Druid', 'Wizard', 'Fighter']) {
      expect(CLASS_LEVELS[k][3].length).toBeGreaterThan(0)
      expect(CLASS_LEVELS[k][4].length).toBeGreaterThan(0)
      expect(CLASS_LEVELS[k][5].length).toBeGreaterThan(0)
    }
  })
  it('the full-caster slot table', () => {
    expect(FULL_CASTER_SLOTS[1]).toEqual([2])
    expect(FULL_CASTER_SLOTS[3]).toEqual([4, 2])
    expect(FULL_CASTER_SLOTS[5]).toEqual([4, 3, 2])
    expect(maxSpellLevel(1)).toBe(1)
    expect(maxSpellLevel(5)).toBe(3)
  })
  it('toFeature splits "Name: text"', () => {
    expect(toFeature('Second Wind: heal')).toEqual({ name: 'Second Wind', text: 'heal' })
    expect(toFeature('Weapon Mastery')).toEqual({ name: 'Weapon Mastery', text: '' })
  })
  it('species-by-level lists exist for Aasimar and Fairy', () => {
    expect(SPECIES_BY_LEVEL.Aasimar[3].length).toBe(1)
    expect(SPECIES_BY_LEVEL['Fairy ✦'][3].length).toBe(1)
    expect(SPECIES_BY_LEVEL['Fairy ✦'][5].length).toBe(1)
  })
})

describe('the spellbook', () => {
  it('has no duplicate names and every card is complete', () => {
    const names = new Set<string>()
    for (const s of SPELLBOOK) {
      expect(names.has(s.name), `duplicate ${s.name}`).toBe(false)
      names.add(s.name)
      expect(s.level).toBeGreaterThanOrEqual(0)
      expect(s.level).toBeLessThanOrEqual(3)
      expect(s.text.length, s.name).toBeGreaterThan(30)
      expect(s.time.length).toBeGreaterThan(0)
      expect(s.range.length).toBeGreaterThan(0)
      expect(s.duration.length).toBeGreaterThan(0)
    }
  })
  it('the class starter lists are all in the book', () => {
    for (const k of ['Druid', 'Wizard']) {
      const sp = CLASSES[k].spells!
      for (const n of [...sp.cantrips, ...sp.leveled]) expect(spellByName(n), `${k} starter ${n}`).toBeDefined()
    }
  })
  it('a druid at 3 can browse 2nd-level but not 3rd; a wizard has Fireball at 5', () => {
    const d3 = spellsFor('D', maxSpellLevel(3))
    expect(d3.some((s) => s.name === 'Moonbeam')).toBe(true)
    expect(d3.some((s) => s.name === 'Call Lightning')).toBe(false)
    const w5 = spellsFor('W', maxSpellLevel(5))
    expect(w5.some((s) => s.name === 'Fireball')).toBe(true)
    expect(w5.some((s) => s.name === 'Moonbeam')).toBe(false)
  })
  it('prepared / cantrip / book counts', () => {
    expect(PREPARED_COUNT.Druid[3]).toBe(6)
    expect(cantripsKnown('Druid', 3)).toBe(2)
    expect(cantripsKnown('Druid', 4)).toBe(3)
    expect(cantripsKnown('Wizard', 1)).toBe(3)
    expect(wizardBookSize(1)).toBe(6)
    expect(wizardBookSize(3)).toBe(10)
    expect(cantripsKnown('Fighter', 5)).toBe(0)
  })
  it('concentration and ritual tags are consistent with durations', () => {
    for (const s of SPELLBOOK) {
      if (s.duration.startsWith('Concentration')) expect(s.tags?.includes('C'), `${s.name} should be tagged C`).toBe(true)
      if (s.tags?.includes('C')) expect(s.duration.toLowerCase(), `${s.name} tagged C`).toContain('concentration')
    }
  })
})

describe('dice', () => {
  it('d20 rolls stay in range and honour advantage/disadvantage', () => {
    for (let i = 0; i < 300; i++) {
      const r = rollD20('t', 3, 'normal')
      expect(r.kept).toBeGreaterThanOrEqual(1)
      expect(r.kept).toBeLessThanOrEqual(20)
      expect(r.total).toBe(r.kept + 3)
      const a = rollD20('t', 0, 'advantage')
      expect(a.kept).toBe(Math.max(a.dice[0], a.dice[1]))
      const d = rollD20('t', 0, 'disadvantage')
      expect(d.kept).toBe(Math.min(d.dice[0], d.dice[1]))
    }
  })
  it('flags nat 20 and nat 1', () => {
    let seen20 = false
    let seen1 = false
    for (let i = 0; i < 2000 && !(seen20 && seen1); i++) {
      const r = rollD20('t', 0, 'normal')
      if (r.kept === 20) {
        expect(r.isNat20).toBe(true)
        seen20 = true
      }
      if (r.kept === 1) {
        expect(r.isNat1).toBe(true)
        seen1 = true
      }
    }
    expect(seen20 && seen1).toBe(true)
  })
  it('damage notation and generic dice', () => {
    for (let i = 0; i < 100; i++) {
      const d = rollDamage('2d6', 3)
      expect(d.rolls).toHaveLength(2)
      expect(d.total).toBe(d.rolls[0] + d.rolls[1] + 3)
      for (const x of d.rolls) {
        expect(x).toBeGreaterThanOrEqual(1)
        expect(x).toBeLessThanOrEqual(6)
      }
    }
    expect(rollDamage('nonsense', 2)).toEqual({ rolls: [], total: 2 })
    expect(rollDice(4, 8)).toHaveLength(4)
    expect(rollDice(0, 8)).toHaveLength(0)
    for (const x of rollDice(200, 4)) {
      expect(x).toBeGreaterThanOrEqual(1)
      expect(x).toBeLessThanOrEqual(4)
    }
  })
})
