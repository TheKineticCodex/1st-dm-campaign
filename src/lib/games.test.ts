import { describe, expect, it } from 'vitest'
import { guessMatches, normGuess, NOTE_POOL } from './games'
import { newDraw, newNote, newToll, reduceDraw, reduceNote, reduceToll, tickDraw, tickNote, tollReveal } from './gameHost'

const P = ['Peaches', 'Billy', 'Philip', 'Freya Sun', 'Freya Moon']

describe('guess matching', () => {
  it('normalises case, punctuation and articles', () => {
    expect(normGuess('The Carousel!')).toBe('carousel')
    expect(normGuess("Grey-Gill's tent")).toBe('greygills tent')
  })
  it('accepts exact and last-word guesses', () => {
    expect(guessMatches('carousel', 'the carousel')).toBe(true)
    expect(guessMatches('Tent', 'Grey-Gill’s tent')).toBe(true)
    expect(guessMatches('moon', 'the Moon')).toBe(true)
    expect(guessMatches('', 'the Moon')).toBe(false)
    expect(guessMatches('lantern', 'the carousel')).toBe(false)
  })
})

describe('Draw the Missing Piece', () => {
  it('rotates the artist and scores a right guess', () => {
    let s = newDraw(P, { rounds: 2, seconds: 30 })
    expect(s.phase).toBe('intro')
    s = tickDraw(s) // intro → round 1
    expect(s.phase).toBe('drawing')
    expect(s.round).toBe(1)
    expect(s.artist).toBe('Peaches')
    // artist strokes; a guesser cannot
    s = reduceDraw(s, 'Peaches', { type: 'stroke', stroke: { p: [0.1, 0.1], w: 0.02 } })
    s = reduceDraw(s, 'Peaches', { type: 'stroke-append', p: [0.2, 0.2, 0.3, 0.3] })
    expect(s.strokes[0].p).toEqual([0.1, 0.1, 0.2, 0.2, 0.3, 0.3])
    const before = s.strokes.length
    s = reduceDraw(s, 'Billy', { type: 'stroke', stroke: { p: [0.5, 0.5], w: 0.02 } })
    expect(s.strokes.length).toBe(before)
    // artist may not guess
    s = reduceDraw(s, 'Peaches', { type: 'guess', text: s.word })
    expect(s.solvedBy).toBeNull()
    // wrong then right
    s = reduceDraw(s, 'Billy', { type: 'guess', text: 'a shoe' })
    expect(s.guesses.at(-1)?.right).toBe(false)
    s = reduceDraw(s, 'Philip', { type: 'guess', text: s.word })
    expect(s.solvedBy).toBe('Philip')
    expect(s.score).toBe(1)
    expect(s.phase).toBe('reveal')
    // reveal → next round with the next artist, blank slate
    s = tickDraw(tickDraw(tickDraw(s)))
    expect(s.phase).toBe('drawing')
    expect(s.round).toBe(2)
    expect(s.artist).toBe('Billy')
    expect(s.strokes).toEqual([])
    expect(s.solvedBy).toBeNull()
    // time runs out → reveal → end after last round
    for (let i = 0; i < 40; i++) s = tickDraw(s)
    expect(s.phase).toBe('end')
    expect(s.score).toBe(1)
  })
})

describe('Hold the Note', () => {
  it('assigns chord tones, never the missing note', () => {
    const s = newNote(P)
    for (const p of P) expect(NOTE_POOL).toContain(s.notes[p])
    expect(Object.values(s.notes)).not.toContain(64) // E4
    expect(Object.values(s.notes)).not.toContain(76) // E5
  })
  it('chord rises only when everyone holds and wins on enough time together', () => {
    let s = tickNote(newNote(P, { seconds: 10 })) // intro → holding
    expect(s.phase).toBe('holding')
    for (const p of P.slice(0, 4)) s = reduceNote(s, p, { type: 'hold', held: true })
    s = tickNote(s, 0.1)
    expect(s.chord).toBe(0)
    expect(s.heldTogether).toBe(0)
    s = reduceNote(s, 'Freya Moon', { type: 'hold', held: true })
    for (let i = 0; i < 20; i++) s = tickNote(s, 0.1)
    expect(s.chord).toBeGreaterThan(30)
    expect(s.heldTogether).toBeCloseTo(2, 5)
    // ignore strangers
    const before = s
    s = reduceNote(s, 'Nobody', { type: 'hold', held: true })
    expect(s).toBe(before)
    // run the clock out holding → win (needs 55% of 10s = 5.5s together)
    for (let i = 0; i < 100; i++) s = tickNote(s, 0.1)
    expect(s.phase).toBe('end')
    expect(s.won).toBe(true)
  })
  it('loses when the party lets go', () => {
    let s = tickNote(newNote(P, { seconds: 5 }))
    for (let i = 0; i < 60; i++) s = tickNote(s, 0.1)
    expect(s.phase).toBe('end')
    expect(s.won).toBe(false)
  })
})

describe('The Toll', () => {
  it('seals one answer per player, shuffles, and reveals one at a time', () => {
    let s = newToll(P.slice(0, 3), 'What would you never sell?')
    s = reduceToll(s, 'Peaches', { type: 'answer', text: 'Pookie' })
    s = reduceToll(s, 'Peaches', { type: 'answer', text: 'Pookie, obviously' })
    s = reduceToll(s, 'Billy', { type: 'answer', text: 'my name' })
    s = reduceToll(s, 'Stranger', { type: 'answer', text: 'nope' })
    expect(s.answers.map((a) => a.by)).toEqual(['Peaches', 'Billy'])
    expect(s.answers[0].text).toBe('Pookie, obviously')
    s = tollReveal(s)
    expect(s.phase).toBe('reveal')
    expect([...s.order].sort()).toEqual([0, 1])
    // no more answers once revealed
    const locked = reduceToll(s, 'Philip', { type: 'answer', text: 'late' })
    expect(locked).toBe(s)
    s = tollReveal(s)
    expect(s.revealed).toBe(1)
    expect(s.phase).toBe('reveal')
    s = tollReveal(s)
    expect(s.revealed).toBe(2)
    expect(s.phase).toBe('end')
  })
})
