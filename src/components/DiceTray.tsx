// The dice tray — any die, any number, any modifier. Lives in the sheet's
// 🎲 Roll popover so it's one tap away mid-scene. d20 rolls go to the
// table's live feed like every other roll; other dice stay on the phone
// (the DM sees the total when you say it, like a real table).

import { useState } from 'react'
import { rollD20, rollDice, type RollMode, type RollResult } from '../lib/dice'
import { readCache, writeCache } from '../lib/storage'
import { C, display } from './ui'

const DICE = [4, 6, 8, 10, 12, 20, 100]

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

  const chip = (on: boolean) => ({
    background: on ? C.gold : C.night,
    color: on ? C.ink : C.parchment,
    border: `1px solid ${on ? C.gold : C.panelEdge}`,
    minHeight: 40,
    minWidth: 44,
    cursor: 'pointer',
    ...display,
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
    }
    setLast(entry)
    const next = [entry, ...history].slice(0, 6)
    setHistory(next)
    writeCache('dice-history', next)
  }

  return (
    <div className="mt-1 rounded-xl p-2" style={{ background: C.panel, border: `1px solid ${C.gold}44` }}>
      <p className="text-xs uppercase tracking-widest mb-1" style={{ color: C.sea, letterSpacing: '0.2em' }}>
        any dice
      </p>
      <div className="flex flex-wrap gap-1">
        {DICE.map((d) => (
          <button key={d} type="button" onClick={() => setDie(d)} className="rounded-md px-2 py-1 text-sm" style={chip(die === d)}>
            d{d}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <span className="text-xs" style={{ color: C.faint, width: 44 }}>
          how many
        </span>
        <button type="button" onClick={() => setCount(Math.max(1, count - 1))} className="rounded-md px-3" style={chip(false)} aria-label="fewer dice">
          −
        </button>
        <span style={{ ...display, fontSize: 18, fontWeight: 700, minWidth: 24, textAlign: 'center' }}>{count}</span>
        <button type="button" onClick={() => setCount(Math.min(20, count + 1))} className="rounded-md px-3" style={chip(false)} aria-label="more dice">
          +
        </button>
        <span className="text-xs ml-2" style={{ color: C.faint, width: 44 }}>
          plus
        </span>
        <button type="button" onClick={() => setModifier(modifier - 1)} className="rounded-md px-3" style={chip(false)} aria-label="lower modifier">
          −
        </button>
        <span style={{ ...display, fontSize: 18, fontWeight: 700, minWidth: 28, textAlign: 'center' }}>{modifier >= 0 ? `+${modifier}` : modifier}</span>
        <button type="button" onClick={() => setModifier(modifier + 1)} className="rounded-md px-3" style={chip(false)} aria-label="raise modifier">
          +
        </button>
      </div>
      <button
        type="button"
        onClick={roll}
        className="w-full rounded-lg py-2 mt-2 text-base"
        style={{ ...display, fontWeight: 700, background: C.gold, color: C.ink, border: 'none', minHeight: 44, cursor: 'pointer' }}
      >
        🎲 Roll {count}d{die}
        {modifier ? (modifier > 0 ? ` +${modifier}` : ` ${modifier}`) : ''}
        {die === 20 && count === 1 && mode !== 'normal' ? ` · ${mode}` : ''}
      </button>
      {last && (
        <p className="text-center mt-2" style={{ color: C.parchment }}>
          <span style={{ ...display, fontSize: 28, fontWeight: 700, color: C.gold }}>{last.total}</span>
          <span className="text-xs block" style={{ color: C.faint }}>
            {last.label} · [{last.rolls.join(', ')}]{last.modifier ? ` ${last.modifier > 0 ? '+' : ''}${last.modifier}` : ''}
          </span>
        </p>
      )}
      {history.length > 1 && (
        <p className="text-xs mt-2 text-center" style={{ color: C.faint }}>
          before: {history.slice(1).map((h) => `${h.label} → ${h.total}`).join(' · ')}
        </p>
      )}
    </div>
  )
}
