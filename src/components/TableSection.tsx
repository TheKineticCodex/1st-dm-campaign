// Phase 3 — Table Mode, DM side: initiative tracker (broadcasts to player
// phones in shared mode), handout composer (all or secretly one player),
// and the map board. Initiative and the map work fully offline; delivery
// to phones needs Supabase.

import { useEffect, useMemo, useRef, useState } from 'react'
import { joinTableChannel, type TableChannel } from '../lib/realtime'
import type { RosterEntry, Store } from '../lib/store'
import type { Encounter, Handout, InitiativeRow } from '../types'
import { MapBoard } from './MapBoard'
import { Btn, C, Eyebrow, H, Section, TextArea, TextInput, display } from './ui'

interface TableSectionProps {
  store: Store
  roster: RosterEntry[]
}

export function TableSection({ store, roster }: TableSectionProps) {
  const channelRef = useRef<TableChannel | null>(null)
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [channelId, active] = await Promise.all([store.getChannelId(), store.getActiveEncounter()])
      if (cancelled) return
      channelRef.current = joinTableChannel(channelId, {})
      if (active) setEncounter(active)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
      channelRef.current?.close()
    }
  }, [store])

  const pcRows: InitiativeRow[] = useMemo(
    () =>
      roster
        .filter((r) => r.character)
        .map((r) => ({
          id: `pc-${r.playerId}`,
          name: r.character!.build.name || r.playerName,
          init: 0,
          isPc: true,
          playerName: r.playerName,
        })),
    [roster],
  )

  const update = (e: Encounter | null) => {
    setEncounter(e)
    if (e) {
      void store.saveEncounter(e)
      channelRef.current?.sendEncounter(e)
    }
  }

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>The table</H>
      {!store.shared && (
        <p className="text-xs mt-1" style={{ color: C.gold }}>
          Offline mode: initiative and the map work on this device, but nothing reaches the
          players' phones until Supabase is set up (see README).
        </p>
      )}

      <Section style={{ marginTop: 12 }}>
        {loaded && (
          <InitiativePanel encounter={encounter} pcRows={pcRows} onChange={update} />
        )}
      </Section>

      <Section>
        <HandoutComposer store={store} roster={roster} channelRef={channelRef} />
      </Section>

      <Section>
        <MapBoard pcNames={pcRows.map((r) => r.name)} />
      </Section>
    </div>
  )
}

// -------------------------------------------------------------- initiative

function InitiativePanel({
  encounter,
  pcRows,
  onChange,
}: {
  encounter: Encounter | null
  pcRows: InitiativeRow[]
  onChange: (e: Encounter | null) => void
}) {
  const [draft, setDraft] = useState<InitiativeRow[]>(pcRows)
  const [enemyName, setEnemyName] = useState('')

  // Refresh the draft with newly-joined PCs while not mid-encounter.
  useEffect(() => {
    if (!encounter?.active) {
      setDraft((d) => {
        const known = new Set(d.map((r) => r.id))
        return [...d, ...pcRows.filter((r) => !known.has(r.id))]
      })
    }
  }, [pcRows, encounter])

  if (encounter?.active) {
    const current = encounter.order[encounter.activeIndex]
    const next = encounter.order[(encounter.activeIndex + 1) % encounter.order.length]
    return (
      <div>
        <Eyebrow>Initiative — round order</Eyebrow>
        {encounter.order.map((r, i) => (
          <div
            key={r.id}
            className="flex items-center justify-between rounded-lg px-3 py-2 mb-1"
            style={{
              background: i === encounter.activeIndex ? C.gold : C.night,
              color: i === encounter.activeIndex ? C.ink : C.parchment,
              border: `1px solid ${C.panelEdge}`,
            }}
          >
            <span style={{ ...display, fontSize: 18, fontWeight: 600 }}>
              {i === encounter.activeIndex ? '➤ ' : ''}
              {r.name}
              {r.isPc ? '' : ' 🗡'}
            </span>
            <span>{r.init}</span>
          </div>
        ))}
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          {current?.name} is up · {next?.name} is on deck
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Btn
            onClick={() =>
              onChange({ ...encounter, activeIndex: (encounter.activeIndex + 1) % encounter.order.length })
            }
          >
            Next turn →
          </Btn>
          <Btn
            secondary
            onClick={() => {
              if (window.confirm('End the encounter?')) onChange({ ...encounter, active: false })
            }}
          >
            End encounter
          </Btn>
        </div>
      </div>
    )
  }

  return (
    <div>
      <Eyebrow>Initiative — set the order, then begin</Eyebrow>
      {draft.length === 0 && (
        <p className="text-sm" style={{ color: C.faint }}>
          No combatants yet — characters appear here once forged; add enemies below.
        </p>
      )}
      {draft.map((r) => (
        <div key={r.id} className="flex items-center gap-2 mb-1">
          <span className="flex-1 text-sm">
            {r.name}
            {r.isPc ? '' : ' 🗡'}
          </span>
          <input
            type="number"
            inputMode="numeric"
            aria-label={`Initiative for ${r.name}`}
            value={r.init || ''}
            onChange={(e) =>
              setDraft(draft.map((x) => (x.id === r.id ? { ...x, init: Number(e.target.value) || 0 } : x)))
            }
            className="rounded-md px-2 py-2 text-center"
            style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, width: 64, minHeight: 44 }}
          />
          {!r.isPc && (
            <button
              type="button"
              aria-label={`Remove ${r.name}`}
              onClick={() => setDraft(draft.filter((x) => x.id !== r.id))}
              style={{ color: C.faint, background: 'none', border: 'none', minWidth: 44, minHeight: 44, cursor: 'pointer' }}
            >
              ✕
            </button>
          )}
        </div>
      ))}
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1">
          <TextInput value={enemyName} onChange={setEnemyName} placeholder="Add an enemy (e.g. Bogwart)" />
        </div>
        <button
          type="button"
          onClick={() => {
            if (!enemyName.trim()) return
            setDraft([
              ...draft,
              { id: `foe-${crypto.randomUUID()}`, name: enemyName.trim(), init: 0, isPc: false },
            ])
            setEnemyName('')
          }}
          className="rounded-md px-4"
          style={{ background: C.panelEdge, color: C.parchment, border: 'none', minHeight: 44, cursor: 'pointer' }}
        >
          add
        </button>
      </div>
      <Btn
        onClick={() =>
          onChange({
            id: crypto.randomUUID(),
            order: [...draft].sort((a, b) => b.init - a.init),
            activeIndex: 0,
            active: true,
          })
        }
        disabled={draft.length === 0}
      >
        Begin the encounter ⚔
      </Btn>
    </div>
  )
}

// ---------------------------------------------------------------- handouts

function HandoutComposer({
  store,
  roster,
  channelRef,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
}) {
  const [title, setTitle] = useState('')
  const [bodyText, setBodyText] = useState('')
  const [target, setTarget] = useState<string>('') // '' = everyone
  const [image, setImage] = useState<string | undefined>()
  const [ephemeral, setEphemeral] = useState(false)
  const [sent, setSent] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const send = () => {
    if (!title.trim() && !bodyText.trim() && !image) return
    const h: Handout = {
      id: crypto.randomUUID(),
      target: target || null,
      title: title.trim(),
      body: bodyText.trim(),
      imageDataUrl: image,
      ephemeral: ephemeral || undefined,
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    setTitle('')
    setBodyText('')
    setImage(undefined)
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  return (
    <div>
      <Eyebrow>Handouts — to every phone, or secretly to one</Eyebrow>
      <div className="grid gap-2 mt-1">
        <TextInput value={title} onChange={setTitle} placeholder="Title (e.g. A note pinned with a fishbone)" />
        <TextArea rows={3} value={bodyText} onChange={setBodyText} placeholder="The text they receive…" />
        <div className="flex items-center gap-2">
          <select
            aria-label="Handout target"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="flex-1 rounded-md px-3 py-2"
            style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
          >
            <option value="">Everyone at the table</option>
            {roster.map((r) => (
              <option key={r.playerId} value={r.playerName}>
                Only {r.playerName} 🤫
              </option>
            ))}
          </select>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0]
              if (!f) return
              const reader = new FileReader()
              reader.onload = () => setImage(reader.result as string)
              reader.readAsDataURL(f)
            }}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="rounded-md px-3"
            style={{ background: C.panelEdge, color: C.parchment, border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            {image ? 'image ✓' : '+ image'}
          </button>
        </div>
        <label className="flex items-center gap-2 text-sm" style={{ color: C.faint, minHeight: 44 }}>
          <input
            type="checkbox"
            checked={ephemeral}
            onChange={(e) => setEphemeral(e.target.checked)}
            style={{ width: 22, height: 22, accentColor: C.gold }}
          />
          Fades 60 seconds after the seal breaks (dreams & whispers)
        </label>
        <Btn onClick={send} disabled={!title.trim() && !bodyText.trim() && !image}>
          {sent ? 'Sent on lantern-light ✦' : target ? `Send secretly to ${target}` : 'Send to everyone'}
        </Btn>
        {!store.shared && (
          <p className="text-xs" style={{ color: C.faint }}>
            (Offline: saved on this device only — delivery needs Supabase.)
          </p>
        )}
      </div>
    </div>
  )
}
