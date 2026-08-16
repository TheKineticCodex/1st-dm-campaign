// Every animation the app asks for must actually exist in theme.css.
//
// This test exists because `cardRise` didn't. The prototype defined
// `@keyframes cardRise`; the port to theme.css renamed it `card-rise` but
// left all 36 call sites saying `cardRise`. An unknown keyframe name is
// still *valid* CSS — the browser accepts it and animates nothing — so the
// entrance motion was silently dead app-wide for weeks, on the DM's Book
// screen most visibly. Nothing failed. That is the whole problem.
//
// Sources come in through Vite's `?raw` glob rather than node:fs: this file
// sits under src/, which is typechecked as browser code (no node types).

import { describe, expect, it } from 'vitest'
import css from './theme.css?raw'

const components = import.meta.glob('../**/*.tsx', { query: '?raw', import: 'default', eager: true }) as Record<
  string,
  string
>

const keyframes = new Set([...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]))

/** Values that may stand where a keyframe name would, and name no keyframe. */
const KEYWORDS = new Set(['none', 'inherit', 'initial', 'unset', 'revert'])

/**
 * The keyframe names in one `animation:` shorthand. Function calls go first
 * so the commas inside `cubic-bezier(.2,.8,.2,1)` don't split a layer, and
 * `${...}` holes collapse so template literals read like plain strings.
 */
function namesIn(value: string): string[] {
  return value
    .replace(/\$\{[^}]*\}/g, '')
    .replace(/[\w-]+\([^)]*\)/g, ' ')
    .split(',')
    .map((layer) => layer.trim().split(/\s+/)[0] ?? '')
    .filter((name) => /^[A-Za-z][\w-]*$/.test(name) && !KEYWORDS.has(name))
}

/**
 * The value expression following `animation:` at `start` — up to the comma
 * that ends the property, ignoring commas nested in quotes or brackets. A
 * ternary (`isNat20 ? 'a' : 'b'`) has no top-level comma, so all of its
 * branches come back together.
 */
function valueAt(text: string, start: number): string {
  let depth = 0
  let quote: string | null = null
  let out = ''
  for (let i = start; i < text.length; i++) {
    const ch = text[i]
    if (quote) {
      out += ch
      if (ch === '\\') out += text[++i] ?? ''
      else if (ch === quote) quote = null
      continue
    }
    if (ch === "'" || ch === '"' || ch === '`') quote = ch
    else if (ch === '(' || ch === '[' || ch === '{') depth++
    else if (ch === ')' || ch === ']' || ch === '}') {
      if (depth === 0) break
      depth--
    } else if (ch === ',' && depth === 0) break
    out += ch
  }
  return out
}

interface Use {
  where: string
  name: string
}

function usesInComponents(): Use[] {
  const uses: Use[] = []
  for (const [path, text] of Object.entries(components)) {
    const where = path.replace(/^\.\.\//, '')
    for (const match of text.matchAll(/\banimation:/g)) {
      const value = valueAt(text, match.index + match[0].length)
      // Only the literal parts name keyframes; identifiers are runtime values.
      for (const [literal] of value.matchAll(/'[^']*'|"[^"]*"|`[^`]*`/g))
        for (const name of namesIn(literal.slice(1, -1))) uses.push({ where, name })
    }
  }
  return uses
}

function usesInCss(): Use[] {
  const uses: Use[] = []
  for (const [, value] of css.matchAll(/\banimation(?:-name)?:\s*([^;}]*)/g))
    for (const name of namesIn(value)) uses.push({ where: 'theme.css', name })
  return uses
}

describe('every animation names a keyframe that exists', () => {
  it('theme.css defines the keyframes the components ask for', () => {
    const missing = usesInComponents().filter((u) => !keyframes.has(u.name))
    expect(missing.map((u) => `${u.where}: ${u.name}`)).toEqual([])
  })

  it('theme.css defines the keyframes its own rules ask for', () => {
    const missing = usesInCss().filter((u) => !keyframes.has(u.name))
    expect(missing.map((u) => u.name)).toEqual([])
  })

  // Guards the scanner itself: if these stop being found, the regexes have
  // drifted and the tests above would pass by seeing nothing at all.
  it('actually finds the animations it is checking', () => {
    const found = usesInComponents()
    expect(found.length).toBeGreaterThan(30)
    expect(found.some((u) => u.name === 'cardRise')).toBe(true)
    expect(found.some((u) => u.name === 'emberEdge')).toBe(true)
    expect(keyframes.size).toBeGreaterThan(15)
  })
})
