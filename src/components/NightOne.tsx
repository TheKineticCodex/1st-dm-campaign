// The Road to Night One — a readiness meter for the first session.
// Auto-measures what the app can see (joins, divinations, forged
// characters, Lost Things, threads); the rest are one-tap checkboxes
// persisted on this device.

import { useEffect, useMemo, useState } from 'react'
import { PARTY_SIZE } from '../data/campaign'
import { readCache, writeCache } from '../lib/storage'
import type { RosterEntry, Store } from '../lib/store'
import { C, display } from './ui'

interface ManualItem {
  id: string
  label: string
}

interface Group {
  id: string
  title: string
  glyph: string
  /** [done, total] pairs contributed by automatic measurements. */
  auto: { label: string; done: number; total: number }[]
  manual: ManualItem[]
}

function Bar({ pct, height = 10, gold = false }: { pct: number; height?: number; gold?: boolean }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ height, background: C.night, border: `1px solid ${C.panelEdge}` }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: gold
            ? `linear-gradient(90deg, ${C.sea}, ${C.gold})`
            : pct >= 100
              ? C.sea
              : C.gold,
          transition: 'width .6s ease',
        }}
      />
    </div>
  )
}

export function NightOne({ store, roster }: { store: Store; roster: RosterEntry[] }) {
  const [lostFilled, setLostFilled] = useState(0)
  const [threadsLaid, setThreadsLaid] = useState(false)
  const [openGroup, setOpenGroup] = useState<string | null>(null)
  const [checked, setChecked] = useState<Record<string, boolean>>(() => readCache('prep') ?? {})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const withChar = roster.filter((r) => r.characterId)
      const lost = await Promise.all(withChar.map((r) => store.getLostThings(r.characterId!)))
      const clues = await store.listClues()
      if (cancelled) return
      setLostFilled(lost.filter((l) => l && l.taken.trim()).length)
      setThreadsLaid(clues.length > 0)
    })()
    return () => {
      cancelled = true
    }
  }, [store, roster])

  const toggle = (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    writeCache('prep', next)
  }

  const groups: Group[] = useMemo(
    () => [
      {
        id: 'party',
        title: 'The four travelers',
        glyph: '❖',
        auto: [
          { label: 'walked through the gate', done: roster.length, total: PARTY_SIZE },
          { label: 'told the lanterns their fortune', done: roster.filter((r) => r.quiz).length, total: PARTY_SIZE },
          { label: 'forged their character', done: roster.filter((r) => r.character).length, total: PARTY_SIZE },
        ],
        manual: [],
      },
      {
        id: 'lost',
        title: 'The Lost Things',
        glyph: '🔒',
        auto: [{ label: 'secrets written (what was taken / believed / true)', done: lostFilled, total: PARTY_SIZE }],
        manual: [],
      },
      {
        id: 'threads',
        title: "The Book's threads",
        glyph: '🕯',
        auto: [{ label: 'Witchlight threads laid in the clue tracker', done: threadsLaid ? 1 : 0, total: 1 }],
        manual: [
          { id: 'ch1', label: "Skimmed Chapter 1's eight attractions" },
          { id: 'derby-moment', label: 'Picked the moment the Snail Derby fires' },
          { id: 'whispers', label: 'Drafted one opening whisper per player' },
        ],
      },
      {
        id: 'witness',
        title: 'The witness protocol (two devices)',
        glyph: '👁',
        auto: [],
        manual: [
          { id: 'w-whisper', label: 'A sealed whisper crossed devices' },
          { id: 'w-derby', label: 'The Snail Derby raced on two screens' },
          { id: 'w-dice', label: "A phone's roll appeared in the iPad feed" },
          { id: 'w-cond', label: 'A condition landed on a player sheet' },
          { id: 'w-contract', label: 'A contract was signed and resolved live' },
        ],
      },
      {
        id: 'table',
        title: 'The table itself',
        glyph: '🕰',
        auto: [],
        manual: [
          { id: 't-wifi', label: 'Wifi (or hotspot) confirmed where you play' },
          { id: 't-chargers', label: 'Chargers on the table' },
          { id: 't-dnd', label: 'Everyone briefed: Do Not Disturb on' },
          { id: 't-ipad', label: 'iPad volume, brightness, and stand ready' },
          { id: 't-install', label: 'Everyone adds the app to their Home Screen' },
        ],
      },
    ],
    [roster, lostFilled, threadsLaid],
  )

  const groupPct = (g: Group) => {
    const autoDone = g.auto.reduce((s, a) => s + a.done, 0)
    const autoTotal = g.auto.reduce((s, a) => s + a.total, 0)
    const manDone = g.manual.filter((m) => checked[m.id]).length
    const done = autoDone + manDone
    const total = autoTotal + g.manual.length
    return total === 0 ? 0 : (done / total) * 100
  }

  const overall = groups.reduce((s, g) => s + groupPct(g), 0) / groups.length

  return (
    <div className="rounded-xl p-4 mb-4" style={{ background: C.panel, border: `1px solid ${C.gold}66` }}>
      <div className="flex items-baseline justify-between">
        <p className="uppercase text-xs tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
          The road to Night One
        </p>
        <p style={{ ...display, fontSize: 26, fontWeight: 700, color: overall >= 100 ? C.sea : C.gold }}>
          {Math.round(overall)}%
        </p>
      </div>
      <Bar pct={overall} height={14} gold />
      {overall >= 100 && (
        <p className="text-sm mt-2 italic" style={{ color: C.sea }}>
          ✦ The lanterns are lit, the chairs are full, the Book is ready. Play.
        </p>
      )}

      <div className="mt-3 grid gap-2">
        {groups.map((g) => {
          const pct = groupPct(g)
          const open = openGroup === g.id
          return (
            <div key={g.id}>
              <button
                type="button"
                onClick={() => setOpenGroup(open ? null : g.id)}
                aria-expanded={open}
                className="w-full text-left"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.parchment, minHeight: 44, padding: 0 }}
              >
                <div className="flex items-center justify-between text-sm mb-1">
                  <span>
                    <span aria-hidden="true">{g.glyph}</span> {g.title}
                  </span>
                  <span style={{ color: pct >= 100 ? C.sea : C.faint }}>
                    {pct >= 100 ? '✓' : `${Math.round(pct)}%`} {open ? '−' : '+'}
                  </span>
                </div>
                <Bar pct={pct} />
              </button>
              {open && (
                <div className="mt-2 mb-1 pl-1">
                  {g.auto.map((a) => (
                    <p key={a.label} className="text-xs mb-1" style={{ color: a.done >= a.total ? C.sea : C.faint }}>
                      {a.done >= a.total ? '✓' : `${a.done}/${a.total}`} — {a.label}
                    </p>
                  ))}
                  {g.manual.map((m) => (
                    <label key={m.id} className="flex items-center gap-2 text-xs mb-1" style={{ minHeight: 36, cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={!!checked[m.id]}
                        onChange={() => toggle(m.id)}
                        style={{ width: 20, height: 20, accentColor: C.gold, flexShrink: 0 }}
                      />
                      <span style={{ color: checked[m.id] ? C.sea : C.parchment }}>{m.label}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
