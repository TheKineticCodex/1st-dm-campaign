import { describe, expect, it } from 'vitest'
import { BILLY, FREYA, FREYA_MOON, PEACHES, PHILIP, readStageCode } from './campaign'

describe('the stage code', () => {
  it('recognises the suffix, however it gets typed on an iPad', () => {
    for (const typed of [
      'LANTERNKEEPER-STAGE',
      'lanternkeeper-stage',
      '  LanternKeeper-Stage  ',
      'LANTERNKEEPER STAGE',
      'LANTERNKEEPER/STAGE',
      'LANTERNKEEPER:STAGE',
    ])
      expect(readStageCode(typed), typed).toBe('LANTERNKEEPER')
  })

  it('leaves an ordinary code alone', () => {
    expect(readStageCode('LANTERNKEEPER')).toBeNull()
    expect(readStageCode('SEAFORGOT')).toBeNull()
    expect(readStageCode('')).toBeNull()
  })

  it('does not treat the bare word as a code', () => {
    // Otherwise "STAGE" would strip to nothing and join the empty campaign.
    expect(readStageCode('STAGE')).toBeNull()
    expect(readStageCode('-STAGE')).toBeNull()
  })

  it('carries the players code through so the gate can refuse it', () => {
    // The gate checks the role that comes back, not the string — a traveller
    // typing SEAFORGOT-STAGE must not light the stage.
    expect(readStageCode('SEAFORGOT-STAGE')).toBe('SEAFORGOT')
  })
})

describe('the five seats', () => {
  it('are spelled the way the whispers address them', () => {
    expect([PEACHES, BILLY, PHILIP, FREYA, FREYA_MOON]).toEqual([
      'Peaches capiche',
      'William Blackwood',
      'Philip',
      'Freya',
      'Freya Moon',
    ])
  })
})
