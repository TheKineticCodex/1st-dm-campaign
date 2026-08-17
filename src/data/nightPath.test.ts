import { describe, expect, it } from 'vitest'
import { ACT1_SCENES } from './act1Scenes'
import { NIGHT_BATTLES, NIGHT_PATH } from './nightPath'

describe("tonight's path is joined to the scenes it needs", () => {
  it('every checkpoint names a scene that exists', () => {
    // This is the test that would have caught the heart of the night having no
    // cue buttons: nightPath said Grey-Gill with a curly apostrophe and
    // act1Scenes said it with a straight one, and nothing anywhere complained.
    for (const c of NIGHT_PATH.checkpoints)
      expect(Object.keys(ACT1_SCENES), `${c.id} → ${c.scene}`).toContain(c.scene)
  })

  it('every scene it names has cues to press', () => {
    for (const c of NIGHT_PATH.checkpoints)
      expect(ACT1_SCENES[c.scene]!.cues.length, c.id).toBeGreaterThan(0)
  })

  it('every door that opens a battle names a real one', () => {
    const ids = new Set(NIGHT_BATTLES.map((b) => b.id))
    for (const c of NIGHT_PATH.checkpoints)
      for (const d of c.doors)
        if (d.battle) expect(ids.has(d.battle), `${c.id}/${d.id} → ${d.battle}`).toBe(true)
  })

  it('every checkpoint has gold words, three things to do, and a way out', () => {
    for (const c of NIGHT_PATH.checkpoints) {
      expect(c.readAloud.length, c.id).toBeGreaterThan(40)
      expect(c.doThis.length, c.id).toBeGreaterThan(1)
      expect(c.doors.length, c.id).toBeGreaterThan(1)
      expect(c.exit.length, c.id).toBeGreaterThan(2)
    }
  })

  it('every battle has an escape hatch — nobody has to win', () => {
    for (const b of NIGHT_BATTLES) {
      expect(b.ends.length, b.id).toBeGreaterThan(10)
      expect(b.foes.length, b.id).toBeGreaterThan(0)
      for (const f of b.foes) {
        expect(f.ac, `${b.id}/${f.name}`).toBeGreaterThan(5)
        expect(f.hp, `${b.id}/${f.name}`).toBeGreaterThan(0)
      }
    }
  })
})
