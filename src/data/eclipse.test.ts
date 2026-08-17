import { describe, expect, it } from 'vitest'
import { PEACHES } from './campaign'
import { ACT1_SCENES } from './act1Scenes'
import {
  ECLIPSE_FLOOR,
  ECLIPSE_MAX,
  ECLIPSE_START,
  SHADOW_ORDER,
  beatFor,
  freshEclipse,
  openTheNight,
  spent,
  theRoll,
  whoseTurn,
} from './eclipse'

describe('the number only ever improves with time passing', () => {
  it('starts at 20 and does not move inside one night', () => {
    const s = freshEclipse(3)
    expect(s.number).toBe(ECLIPSE_START)
    expect(openTheNight(s, 3).number).toBe(ECLIPSE_START)
  })

  it('a missed roll changes nothing but the last die — nothing to farm', () => {
    let s = freshEclipse(3)
    for (let i = 0; i < 50; i++) s = theRoll(s, 5)
    expect(s.number).toBe(ECLIPSE_START)
    expect(s.fired).toBe(0)
  })

  it('drops two for every night that ended quiet', () => {
    const s = freshEclipse(3)
    expect(openTheNight(s, 4).number).toBe(18)
    expect(openTheNight(s, 6).number).toBe(14)
  })

  it('the night it fired does not count as a quiet one', () => {
    const fired = theRoll(freshEclipse(3), 20)
    expect(fired.number).toBe(ECLIPSE_START)
    expect(openTheNight(fired, 4).number).toBe(ECLIPSE_START)
    expect(openTheNight(fired, 5).number).toBe(18)
  })

  it('never falls past the floor — the dice keep a say', () => {
    expect(openTheNight(freshEclipse(1), 40).number).toBe(ECLIPSE_FLOOR)
  })
})

describe('one a night, three in the campaign', () => {
  it('spends the night the moment one fires', () => {
    const s = theRoll(freshEclipse(3), 20)
    expect(s.firedTonight).toBe(true)
    expect(spent(s)).toBe(true)
    expect(spent(openTheNight(s, 4))).toBe(false)
  })

  it('stops after three, and the fourth is the written one', () => {
    let s = freshEclipse(1)
    for (let night = 1; night <= ECLIPSE_MAX; night++) {
      s = openTheNight(s, night)
      s = theRoll(s, 20)
    }
    expect(s.fired).toBe(ECLIPSE_MAX)
    expect(spent(openTheNight(s, 9))).toBe(true)
    expect(beatFor(ECLIPSE_MAX).tier).toBe('last')
  })
})

describe('the shadow', () => {
  it('lands on nobody the first time, then rotates one each', () => {
    expect(whoseTurn(freshEclipse(3))).toBeNull()
    expect(beatFor(0).tier).toBe('first')
    expect(whoseTurn({ ...freshEclipse(3), fired: 1 })?.who).toBe('Peaches')
    expect(whoseTurn({ ...freshEclipse(3), fired: 2 })?.who).toBe('Billy')
    expect(whoseTurn({ ...freshEclipse(3), fired: 3 })?.who).toBe('Philip')
    expect(whoseTurn({ ...freshEclipse(3), fired: 4 })).toBeNull()
  })

  it('never falls on a Freya, and never on the same person twice', () => {
    const names = SHADOW_ORDER.map((s) => s.who)
    expect(new Set(names).size).toBe(names.length)
    for (const n of names) expect(n).not.toMatch(/Freya/)
  })

  it('targets names a real phone will answer to', () => {
    // A sealed whisper finds a phone by exact name. If these drift from the
    // whisper targets in the scenes, the shadow falls on nobody.
    const targets = new Set<string>()
    for (const scene of Object.values(ACT1_SCENES))
      for (const cue of scene.cues) if (cue.whisper?.target) targets.add(cue.whisper.target)
    for (const s of SHADOW_ORDER) expect(targets, s.who).toContain(s.target)
    expect(SHADOW_ORDER[0]!.target).toBe(PEACHES)
  })
})

describe('nothing in it reaches a player as the word', () => {
  it('never names itself, anywhere in its own data', () => {
    const said = JSON.stringify([
      beatFor(0),
      beatFor(1),
      beatFor(ECLIPSE_MAX),
      SHADOW_ORDER,
    ])
    expect(said.toLowerCase()).not.toContain('eclipse')
    expect(said.toLowerCase()).not.toContain('frequency')
  })
})
