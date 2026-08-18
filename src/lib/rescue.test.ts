// The failure this file exists for:
//
// The app's database was replaced on 15 August 2026 and the old one deleted.
// Five characters forged before that day survive only in the browser that
// made them. Reads already fall back to that copy — which is why nobody
// noticed — but nothing ever sent it back up, so the Book's roster showed
// five empty chairs while five correct sheets sat on five phones.
//
// Every test below fails against the old getCharacter, which returned the
// local copy and pushed nothing.

import { describe, expect, it, vi } from 'vitest'
import { carryHome, isWorthKeeping, quizWorthKeeping } from './rescue'
import { EMPTY_BUILD, EMPTY_NOTES, EMPTY_STATE, type QuizResult, type SavedCharacter } from '../types'

const billy: SavedCharacter = {
  build: { ...EMPTY_BUILD, name: 'William Blackwood', species: 'Human', klass: 'Wizard', level: 1 },
  state: EMPTY_STATE,
  notes: EMPTY_NOTES,
  updatedAt: '2026-08-14T20:00:00.000Z',
}

const quiz: QuizResult = {
  playerName: 'William Blackwood',
  answers: { fear: 'that the person everyone loves isn’t really him' },
  topClasses: ['Wizard'],
  updatedAt: '2026-08-14T20:00:00.000Z',
}

describe('is this local copy worth carrying up?', () => {
  it('a forged character is', () => {
    expect(isWorthKeeping(billy)).toBe(true)
  })
  it('a half-started forge is not — a name alone is not a person', () => {
    expect(isWorthKeeping({ ...billy, build: { ...EMPTY_BUILD, name: 'Wi' } })).toBe(false)
  })
  it('an untouched build is not', () => {
    expect(isWorthKeeping({ ...billy, build: EMPTY_BUILD })).toBe(false)
  })
  it('nothing at all is not', () => {
    expect(isWorthKeeping(null)).toBe(false)
    expect(isWorthKeeping(undefined)).toBe(false)
  })
  it('divination answers count only when somebody actually typed something', () => {
    expect(quizWorthKeeping(quiz)).toBe(true)
    expect(quizWorthKeeping({ ...quiz, answers: { fear: '   ' } })).toBe(false)
    expect(quizWorthKeeping(null)).toBe(false)
  })
})

describe('carrying a character home', () => {
  it('carries it up when the server has nobody in the seat', async () => {
    const push = vi.fn(async () => true)
    const out = await carryHome(null, billy, isWorthKeeping, push)
    expect(out).toEqual({ kind: 'carried' })
    expect(push).toHaveBeenCalledWith(billy)
  })

  it('NEVER overwrites a character the server already holds', async () => {
    const push = vi.fn(async () => true)
    const newer: SavedCharacter = { ...billy, updatedAt: '2026-08-18T00:00:00.000Z' }
    const out = await carryHome(newer, billy, isWorthKeeping, push)
    expect(out).toEqual({ kind: 'server-already-has-it' })
    expect(push).not.toHaveBeenCalled()
  })

  it('NEVER lets a wiped browser erase the seat it signs into', async () => {
    // Safari deletes this storage after ~7 days idle. That phone must be able
    // to sign in and read its character down — never to blank it.
    const push = vi.fn(async () => true)
    const out = await carryHome(null, null, isWorthKeeping, push)
    expect(out).toEqual({ kind: 'nothing-to-carry' })
    expect(push).not.toHaveBeenCalled()
  })

  it('NEVER uploads a half-finished forge over an empty seat', async () => {
    const push = vi.fn(async () => true)
    const halfway: SavedCharacter = { ...billy, build: { ...EMPTY_BUILD, name: 'Wi' } }
    const out = await carryHome(null, halfway, isWorthKeeping, push)
    expect(out).toEqual({ kind: 'nothing-to-carry' })
    expect(push).not.toHaveBeenCalled()
  })

  it('says so when the carry failed, instead of reporting success', async () => {
    // Every bug in this app's history was a silent success. Not this one.
    const out = await carryHome(null, billy, isWorthKeeping, async () => false)
    expect(out).toEqual({ kind: 'could-not-carry' })
  })

  it('a throwing push never takes the sheet down with it', async () => {
    const out = await carryHome(null, billy, isWorthKeeping, async () => {
      throw new Error('the mist')
    })
    expect(out).toEqual({ kind: 'could-not-carry' })
  })

  it('is safe to run on every open — a carried character stops being carried', async () => {
    // getCharacter runs on every mount. The second call sees the server copy.
    const push = vi.fn(async (_c: SavedCharacter) => true)
    let server: SavedCharacter | null = null
    const once = async () =>
      carryHome(server, billy, isWorthKeeping, async (c) => {
        server = c
        return push(c)
      })
    expect(await once()).toEqual({ kind: 'carried' })
    expect(await once()).toEqual({ kind: 'server-already-has-it' })
    expect(await once()).toEqual({ kind: 'server-already-has-it' })
    expect(push).toHaveBeenCalledTimes(1)
  })
})
