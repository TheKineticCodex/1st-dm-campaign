// The dice tray — any die, any number, any modifier. Lives in the sheet's
// Roll popover so it's one tap away mid-scene. d20 rolls go to the
// table's live feed like every other roll; other dice stay on the phone
// (the DM sees the total when you say it, like a real table).
//
// The livery: the selected die is LIT (onState), never filled; every chip is
// a 44px target; the count/modifier row wraps rather than overflowing at
// 320px; "Roll Nd" is the ONE brass action in the tray. The 🎲 that used to
// letter the button survives for screen readers (and the e2e name) inside a
// clipped span — the visible mark is the drawn die glyph.

import type { CSSProperties } from 'react'
import { useState } from 'react'
import { rollD20, rollDice, type RollMode, type RollResult } from '../lib/dice'
import { rollDice3d } from '../lib/dice3d'
import { buzz } from '../lib/phoneSound'
import { readCache, writeCache } from '../lib/storage'
import { C, body, display, eyebrow, goldAction, numerals, onState, panelSurface, wellSurface } from './ui'
import { Icon } from './icons'

const DICE = [4, 6, 8, 10, 12, 20, 100]

/** Kept in the accessibility tree (and so in the button's name) but off the glass. */
const SR_ONLY: CSSProperties = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }

interface TrayRoll {
  label: string
  rolls: number[]
  modifier: number
  total: number
  at: number
}

interface DiceTrayProps {
  mode: RollMode
  /** Called for d20 rolls so the sheet can show its roll card and broadcast. */
  onD20: (r: RollResult) => void
}

export function DiceTray({ mode, onD20 }: DiceTrayProps) {
  const [die, setDie] = useState(20)
  const [count, setCount] = useState(1)
  const [modifier, setModifier] = useState(0)
  const [history, setHistory] = useState<TrayRoll[]>(() => readCache<TrayRoll[]>('dice-history') ?? [])
  const [last, setLast] = useState<TrayRoll | null>(null)
  const [inTheAir, setInTheAir] = useState(false)

  /** A die chip: lit when chosen (ember wash + gold rim + gold-hi), never filled. */
  const chip = (on: boolean): CSSProperties => ({
    ...(on ? onState : { ...wellSurface, color: C.parchment }),
    minHeight: 44,
    minWidth: 44,
    cursor: 'pointer',
    ...display,
    fontSize: 18,
    fontWeight: 700,
  })

  const roll = () => {
    const label = `${count}d${die}${modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : ''}`
    let entry: TrayRoll
    if (die === 20 && count === 1) {
      const r = rollD20(label, modifier, mode)
      onD20(r)
      entry = { label: mode === 'normal' ? label : `${label} (${mode})`, rolls: mode === 'normal' ? [r.kept] : [...r.dice], modifier, total: r.total, at: Date.now() }
    } else {
      const rolls = rollDice(count, die)
      entry = { label, rolls, modifier, total: rolls.reduce((s, x) => s + x, 0) + modifier, at: Date.now() }
      // the theatre: real dice tumble to these numbers, then the total lands
      setLast(null)
      setInTheAir(true)
      void rollDice3d([{ die, values: rolls }]).then(() => {
        setInTheAir(false)
        setLast(entry)
        buzz(18)
      })
      const next = [entry, ...history].slice(0, 6)
      setHistory(next)
      writeCache('dice-history', next)
      return
    }
    setLast(entry)
    const next = [entry, ...history].slice(0, 6)
    setHistory(next)
    writeCache('dice-history', next)
  }

  return (
    <div className="mt-1 rounded-xl p-2" style={{ ...panelSurface, border: `1px solid ${C.brassDim}55` }}>
      <p className="mb-1.5">
        <span style={eyebrow}>any dice</span>
      </p>
      <div className="flex flex-wrap gap-1.5">
        {DICE.map((d) => (
          <button key={d} type="button" onClick={() => setDie(d)} aria-pressed={die === d} className="rounded-lg px-3" style={chip(die === d)}>
            d{d}
          </button>
        ))}
      </div>
      {/* wraps at 320px rather than pushing the tray sideways */}
      <div className="flex flex-wrap items-center gap-1.5 mt-2">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-xs" style={{ ...body, fontWeight: 600, color: C.faint }}>
            how many
          </span>
          <button type="button" onClick={() => setCount(Math.max(1, count - 1))} className="rounded-lg px-3" style={chip(false)} aria-label="fewer dice">
            −
          </button>
          <span className="num" style={{ ...body, ...numerals, fontSize: 17, fontWeight: 600, minWidth: 24, textAlign: 'center', color: C.parchment }}>{count}</span>
          <button type="button" onClick={() => setCount(Math.min(20, count + 1))} className="rounded-lg px-3" style={chip(false)} aria-label="more dice">
            +
          </button>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="text-xs ml-1" style={{ ...body, fontWeight: 600, color: C.faint }}>
            plus
          </span>
          <button type="button" onClick={() => setModifier(modifier - 1)} className="rounded-lg px-3" style={chip(false)} aria-label="lower modifier">
            −
          </button>
          <span className="num" style={{ ...body, ...numerals, fontSize: 17, fontWeight: 600, minWidth: 30, textAlign: 'center', color: C.parchment }}>{modifier >= 0 ? `+${modifier}` : modifier}</span>
          <button type="button" onClick={() => setModifier(modifier + 1)} className="rounded-lg px-3" style={chip(false)} aria-label="raise modifier">
            +
          </button>
        </span>
      </div>
      <button
        type="button"
        onClick={roll}
        className="w-full rounded-lg py-2 mt-2 inline-flex items-center justify-center gap-2"
        style={{ ...display, fontSize: 18, fontWeight: 700, ...goldAction, minHeight: 44, cursor: 'pointer' }}
      >
        {/* the die is drawn; the emoji stays for the a11y name only */}
        <span style={SR_ONLY}>🎲 </span>
        <Icon name="die" size={18} />
        <span className="num" style={numerals}>
          Roll {count}d{die}
          {modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : ''}
          {die === 20 && count === 1 && mode !== 'normal' ? ` · ${mode}` : ''}
        </span>
      </button>
      {inTheAir && (
        <p className="text-center mt-2 text-xs uppercase tracking-widest" style={{ color: C.gold, letterSpacing: '0.25em', animation: 'ceremony-fade 2s ease-out infinite' }}>
          in the air…
        </p>
      )}
      {last && (
        <p className="text-center mt-2" style={{ color: C.parchment, animation: 'cardRise .3s ease-out' }}>
          <span className="num" style={{ ...display, ...numerals, fontSize: 28, fontWeight: 700, color: C.gold }}>{last.total}</span>
          <span className="text-xs block num" style={{ ...numerals, color: C.faint }}>
            {last.label} · [{last.rolls.join(', ')}]{last.modifier ? ` ${last.modifier > 0 ? '+' : ''}${last.modifier}` : ''}
          </span>
        </p>
      )}
      {history.length > 1 && (
        <p className="text-xs mt-2 text-center num" style={{ ...numerals, color: C.faint }}>
          before: {history.slice(1).map((h) => `${h.label} → ${h.total}`).join(' · ')}
        </p>
      )}
    </div>
  )
}
