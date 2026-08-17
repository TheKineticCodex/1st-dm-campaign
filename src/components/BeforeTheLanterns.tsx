// Before the lanterns light — the pre-session list.
//
// Replaces the old one-time "Road to Night One" meter. This one comes back
// every session: the Book ticks what it can see for itself (seats, forged
// characters, tonight's beat, last night's page, whether the campaign
// lantern is lit), and the Lantern-Keeper ticks the things only a person
// standing in the room can know. The hand-ticked half clears itself when a
// new night begins, so the list is never stale.

import { useEffect, useMemo, useState } from 'react'
import { PARTY_SIZE, partyWord } from '../data/campaign'
import { readCache, writeCache } from '../lib/storage'
import type { RosterEntry, Store } from '../lib/store'
import { C, display, eyebrow, numerals, onState, panelSurface, wellSurface } from './ui'
import { Icon, Spark, type IconName } from './icons'

interface Seen {
  id: string
  glyph: IconName
  label: string
  done: boolean
  /** Shown instead of a tick while unfinished, e.g. "3/5". */
  tally?: string
  note?: string
}

interface ByHand {
  id: string
  glyph: IconName
  label: string
  note?: string
}

/** What only a person in the room can answer. Ticks clear each new night. */
const BY_HAND: ByHand[] = [
  { id: 'names', glyph: 'roster', label: 'The Roster names match the whispers', note: 'a reading finds its phone by name — check the spelling of all five' },
  { id: 'witness', glyph: 'stage', label: 'Two devices witnessed anything new', note: 'never take an unwitnessed thing to the table' },
  { id: 'room', glyph: 'note', label: 'The room was heard at table volume', note: 'beds, the carousel, one stinger' },
  { id: 'stage', glyph: 'tent', label: 'The iPad stands on the stage, reloaded' },
  { id: 'table', glyph: 'table', label: 'Wifi and chargers where you play' },
  { id: 'quiet', glyph: 'hush', label: 'Phones on Do Not Disturb' },
]

function Bar({ pct }: { pct: number }) {
  return (
    <div
      className="w-full rounded-full overflow-hidden"
      style={{ ...wellSurface, height: 12 }}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label="Ready for tonight"
    >
      <div
        style={{
          width: `${pct}%`,
          height: '100%',
          background: pct >= 100 ? C.sea : `linear-gradient(90deg, ${C.copper}, ${C.gold})`,
          transition: 'width .6s var(--ease-lantern, ease)',
        }}
      />
    </div>
  )
}

/** A drawn tick-box — a lit square with a spark in it, never a filled slab. */
function TickBox({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className="inline-flex items-center justify-center rounded-md"
      style={{
        width: 24,
        height: 24,
        flexShrink: 0,
        ...(on ? onState : { background: 'transparent', border: `1px solid ${C.brassDim}` }),
      }}
    >
      {on && <Spark size={13} />}
    </span>
  )
}

export function BeforeTheLanterns({ store, roster }: { store: Store; roster: RosterEntry[] }) {
  const [nightsPlayed, setNightsPlayed] = useState<number | null>(null)
  const [beat, setBeat] = useState<string | null>(null)
  const [lastNight, setLastNight] = useState<number | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [notes, story] = await Promise.all([store.listSessionNotes(), store.listStory()])
      if (cancelled) return
      const numbers = notes.map((n) => n.sessionNumber)
      setNightsPlayed(numbers.length)
      setLastNight(numbers.length ? Math.max(...numbers) : null)
      setBeat(story.find((n) => n.status === 'current')?.title ?? null)
    })()
    return () => {
      cancelled = true
    }
  }, [store, roster])

  // Tonight is the night after the last one written down.
  const tonight = (lastNight ?? nightsPlayed ?? 0) + 1
  const key = `prep:s${tonight}`
  const [checked, setChecked] = useState<Record<string, boolean>>({})

  // A new night starts a clean list (and remembers this night's ticks).
  useEffect(() => {
    setChecked(readCache<Record<string, boolean>>(key) ?? {})
  }, [key])

  const tick = (id: string) => {
    const next = { ...checked, [id]: !checked[id] }
    setChecked(next)
    writeCache(key, next)
  }

  const forged = roster.filter((r) => r.character).length

  const seen: Seen[] = useMemo(() => {
    const rows: Seen[] = [
      {
        id: 'seats',
        glyph: 'roster',
        label: `The ${partyWord} have their seats`,
        done: roster.length >= PARTY_SIZE,
        tally: `${roster.length}/${PARTY_SIZE}`,
        note: roster.length >= PARTY_SIZE ? undefined : 'they need only open the app once on wifi',
      },
      {
        id: 'forged',
        glyph: 'sheet',
        label: 'Every traveler has a character',
        done: forged >= PARTY_SIZE,
        tally: `${forged}/${PARTY_SIZE}`,
      },
      {
        id: 'beat',
        glyph: 'tonight',
        label: beat ? `Tonight opens at ${beat}` : 'Tonight has no beat yet',
        done: !!beat,
        note: beat ? undefined : 'set one in Look it up → the whole story: tap “go here” on a beat',
      },
      {
        id: 'page',
        glyph: 'notes',
        label: lastNight ? `Night ${lastNight} is written in the Book` : 'No night written yet',
        done: lastNight !== null,
        note: lastNight === null ? 'three lines in Notes is enough' : undefined,
      },
      {
        id: 'lantern',
        glyph: 'lantern',
        label: store.shared ? 'The campaign lantern is lit' : 'The campaign lantern is unlit',
        done: store.shared,
        note: store.shared ? 'the phones can hear this Book' : 'this device only — nothing reaches the phones',
      },
    ]
    return rows
  }, [roster.length, forged, beat, lastNight, store.shared])

  const doneCount = seen.filter((s) => s.done).length + BY_HAND.filter((h) => checked[h.id]).length
  const total = seen.length + BY_HAND.length
  const pct = (doneCount / total) * 100
  const ready = doneCount === total

  return (
    <div className="rounded-xl p-4 mb-4" style={{ ...panelSurface, border: `1px solid ${C.brassDim}` }}>
      <div className="flex items-baseline justify-between gap-3">
        <p style={{ ...eyebrow, letterSpacing: '0.22em' }}>Before the lanterns light</p>
        <p style={{ ...display, ...numerals, fontSize: 22, fontWeight: 700, color: ready ? C.sea : C.gold, whiteSpace: 'nowrap' }}>
          {doneCount}/{total}
        </p>
      </div>
      <p className="text-sm mb-2" style={{ color: C.faint }}>
        Night {tonight} · the list starts fresh each night
      </p>
      <Bar pct={pct} />

      {ready && (
        <p className="text-sm mt-2 italic flex items-center gap-1.5" style={{ color: C.sea }}>
          <Spark size={12} /> The lanterns are lit, the chairs are full, the Book is ready. Play.
        </p>
      )}

      <p className="text-xs uppercase mt-4 mb-1" style={{ ...eyebrow, fontSize: 11, letterSpacing: '0.18em' }}>
        What the Book can see
      </p>
      <div className="grid gap-0.5">
        {seen.map((s) => (
          <div key={s.id} className="flex items-start gap-2.5 py-1.5">
            <span
              aria-hidden="true"
              className="inline-flex items-center justify-center rounded-md"
              style={{ width: 24, height: 24, flexShrink: 0, ...(s.done ? { ...onState, borderColor: C.sea } : { background: 'transparent', border: `1px dashed ${C.brassDim}` }) }}
            >
              {s.done ? <Spark size={13} /> : <Icon name={s.glyph} size={13} style={{ color: C.brassDim }} />}
            </span>
            <span className="min-w-0">
              <span className="text-sm block" style={{ color: s.done ? C.sea : C.parchment }}>
                {s.label}
                {!s.done && s.tally && (
                  <span style={{ ...numerals, color: C.faint }}> · {s.tally}</span>
                )}
              </span>
              {s.note && (
                <span className="text-xs block" style={{ color: C.faint }}>
                  {s.note}
                </span>
              )}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs uppercase mt-4 mb-1" style={{ ...eyebrow, fontSize: 11, letterSpacing: '0.18em' }}>
        What only you can say
      </p>
      <div className="grid gap-0.5">
        {BY_HAND.map((h) => {
          const on = !!checked[h.id]
          return (
            <button
              key={h.id}
              type="button"
              role="checkbox"
              aria-checked={on}
              onClick={() => tick(h.id)}
              className="flex items-start gap-2.5 text-left w-full rounded-lg"
              style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44, padding: '6px 2px' }}
            >
              <TickBox on={on} />
              <span className="min-w-0">
                <span className="text-sm block" style={{ color: on ? C.sea : C.parchment }}>
                  {h.label}
                </span>
                {h.note && (
                  <span className="text-xs block" style={{ color: C.faint }}>
                    {h.note}
                  </span>
                )}
              </span>
            </button>
          )
        })}
      </div>

      {Object.values(checked).some(Boolean) && (
        <button
          type="button"
          onClick={() => {
            setChecked({})
            writeCache(key, {})
          }}
          className="text-xs mt-2"
          style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', minHeight: 36, padding: 0, textDecoration: 'underline' }}
        >
          start the list again
        </button>
      )}
    </div>
  )
}
