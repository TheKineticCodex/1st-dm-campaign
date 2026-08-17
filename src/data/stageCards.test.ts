import { describe, expect, it } from 'vitest'
import { NIGHT_PATH } from './nightPath'
import { STAGE_CARDS, cardsFor } from './stageCards'

describe('what can be held up to the table', () => {
  it('is scoped to real checkpoints, so a chip cannot appear in the wrong room', () => {
    const ids = new Set(NIGHT_PATH.checkpoints.map((c) => c.id))
    for (const d of STAGE_CARDS)
      for (const a of d.at) expect(ids.has(a) || a === 'fight', `${d.card.id} → ${a}`).toBe(true)
  })

  it('never offers the back fence at the gate', () => {
    // The whole safety story is scoping: one mistap is instantly public at 80px.
    const atGate = cardsFor('gate', false).map((d) => d.card.id)
    expect(atGate).toContain('slate-welcome')
    expect(atGate).not.toContain('slate-oneopens')
    expect(atGate).not.toContain('gates-lanterns')
  })

  it('offers the way out only while a fight is running', () => {
    expect(cardsFor('note', false).map((d) => d.card.id)).not.toContain('note-drop')
    expect(cardsFor('note', true).map((d) => d.card.id)).toContain('note-drop')
  })

  it('has a unique id and a chip for every card', () => {
    expect(new Set(STAGE_CARDS.map((d) => d.card.id)).size).toBe(STAGE_CARDS.length)
    for (const d of STAGE_CARDS) expect(d.chip.length, d.card.id).toBeGreaterThan(3)
  })

  it('keeps every line short enough to be signage', () => {
    for (const d of STAGE_CARDS)
      for (const l of d.card.lines) expect(l.length, `${d.card.id}: ${l}`).toBeLessThanOrEqual(56)
  })

  it('says nothing the players are not allowed to know', () => {
    const said = JSON.stringify(STAGE_CARDS.map((d) => d.card.lines)).toLowerCase()
    for (const secret of ['buyer', 'ones below', 'appraiser', 'wave', 'peaches', 'eclipse', 'xp'])
      expect(said, secret).not.toContain(secret)
  })

  it('gives the wordless card no words', () => {
    expect(STAGE_CARDS.find((d) => d.card.kind === 'gates')!.card.lines).toEqual([])
  })
})
