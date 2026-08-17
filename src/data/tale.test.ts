import { describe, expect, it } from 'vitest'
import { REFRAIN, TALE, verseFor } from './tale'

describe('the rhyme comes out one verse at a time', () => {
  it('gives session 3 the first verse and nothing else', () => {
    const v = verseFor(3)
    expect(v.numeral).toBe('I')
    expect(v.lines.join(' ')).toContain('in love with the moon')
  })

  it('walks forward one verse a night', () => {
    expect(verseFor(4).numeral).toBe('II')
    expect(verseFor(5).numeral).toBe('III')
    expect(verseFor(7).numeral).toBe('V')
  })

  it('holds on the last verse rather than running out', () => {
    // A campaign that runs long must not land on undefined mid-sentence.
    expect(verseFor(9).numeral).toBe('VII')
    expect(verseFor(40).numeral).toBe('VII')
  })

  it('never goes backwards or skips a verse', () => {
    const seen = TALE.map((t) => t.session)
    expect([...seen].sort((a, b) => a - b)).toEqual(seen)
    expect(new Set(TALE.map((t) => t.numeral)).size).toBe(TALE.length)
  })

  it('breaks the refrain exactly twice, and in the right places', () => {
    const odd = TALE.filter((t) => t.refrain !== 'as written')
    expect(odd.map((t) => t.numeral)).toEqual(['V', 'VII'])
    expect(odd[0]!.refrain).toBe('falters')
    expect(odd[1]!.refrain).toBe('breaks')
  })

  it('keeps the crack and the win in the two verses that break it', () => {
    expect(TALE.find((t) => t.numeral === 'V')!.lines.join(' ')).toContain('not only his to sell')
    expect(TALE.find((t) => t.numeral === 'VII')!.lines.join(' ')).toContain('all sang at once')
    expect(REFRAIN.broken).toBe('Give it back.')
  })

  it('never explains itself — the forbidden words stay out of the rhyme', () => {
    const said = JSON.stringify(TALE.map((t) => t.lines)).toLowerCase()
    for (const word of ['wave', 'frequency', 'medium', 'the ones below', 'the buyer'])
      expect(said, word).not.toContain(word)
  })
})
