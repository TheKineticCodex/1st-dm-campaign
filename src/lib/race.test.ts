import { describe, expect, it } from 'vitest'
import { RACE_GOAL, reduceRace, startBoard } from './race'

const NAMES = ['Peaches capiche', 'William Blackwood', 'Philip']

describe('everybody watching the derby sees the same race', () => {
  it('starts every snail on the line', () => {
    const b = startBoard('r1', NAMES)
    expect(Object.values(b.lanes)).toEqual([0, 0, 0])
    expect(b.finished).toEqual([])
  })

  it('moves the snail the tap belongs to, and only that one', () => {
    let b = startBoard('r1', NAMES)
    b = reduceRace(b, { raceId: 'r1', phase: 'progress', playerName: 'Philip', progress: 12 }, NAMES)!
    expect(b.lanes['Philip']).toBe(12)
    expect(b.lanes['Peaches capiche']).toBe(0)
  })

  it('puts a finisher on the post at the goal, once', () => {
    let b = startBoard('r1', NAMES)
    const cross = { raceId: 'r1', phase: 'finish' as const, playerName: 'Philip' }
    b = reduceRace(b, cross, NAMES)!
    b = reduceRace(b, cross, NAMES)!
    expect(b.lanes['Philip']).toBe(RACE_GOAL)
    expect(b.finished).toEqual(['Philip'])
  })

  it('ignores a stray event from a race that already ended', () => {
    let b = startBoard('r1', NAMES)
    b = reduceRace(b, { raceId: 'r1', phase: 'end', results: ['Philip'] }, NAMES)!
    b = reduceRace(b, { raceId: 'r1', phase: 'progress', playerName: 'Philip', progress: 99 }, NAMES)!
    expect(b.ended).toBe(true)
    expect(b.lanes['Philip']).toBe(0)
  })

  it('ignores an event from a different race entirely', () => {
    const b = startBoard('r1', NAMES)
    const after = reduceRace(b, { raceId: 'OTHER', phase: 'progress', playerName: 'Philip', progress: 30 }, NAMES)
    expect(after!.lanes['Philip']).toBe(0)
  })

  it('a fresh start replaces whatever was on the board', () => {
    let b = startBoard('r1', NAMES)
    b = reduceRace(b, { raceId: 'r1', phase: 'finish', playerName: 'Philip' }, NAMES)!
    b = reduceRace(b, { raceId: 'r2', phase: 'start' }, NAMES)!
    expect(b.raceId).toBe('r2')
    expect(b.finished).toEqual([])
  })
})
