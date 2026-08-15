import { describe, expect, it } from 'vitest'
import { ACT1_SCENES } from './act1Scenes'
import { RUN_SCENES } from './runbook'
import { SEEDS } from './storySeeds'

describe('the runbook walks the same story as the timeline', () => {
  it('every runbook scene key is a real scene (so "you are here" can find it)', () => {
    for (const s of RUN_SCENES) expect(Object.keys(ACT1_SCENES), s.key).toContain(s.key)
  })
  it('every seeded timeline beat has a runbook scene', () => {
    const keys = new Set(RUN_SCENES.map((s) => s.key))
    for (const b of SEEDS) expect(keys.has(b.title), b.title).toBe(true)
  })
  it('every battle has a retreat line and every foe has numbers', () => {
    for (const s of RUN_SCENES)
      for (const b of s.battles) {
        expect(b.retreat.length, `${b.code} retreat`).toBeGreaterThan(3)
        for (const f of b.foes) {
          expect(f.ac).toBeGreaterThan(5)
          expect(f.hp).toBeGreaterThan(0)
          expect(f.attack.length).toBeGreaterThan(3)
        }
      }
  })
  it('the three road climaxes and only they are the major battles of act 2', () => {
    const majors = RUN_SCENES.filter((s) => s.battles.some((b) => b.major)).map((s) => s.key)
    expect(majors).toEqual(['The Rent Comes Due (Bog climax)', 'Opening Night (Mirror climax)', 'The Sale of the Tail (Under-Sea climax)'])
  })
})
