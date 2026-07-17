// Phase 3 — Table Mode, DM side: initiative tracker (broadcasts to player
// phones in shared mode), handout composer (all or secretly one player),
// and the map board. Initiative and the map work fully offline; delivery
// to phones needs Supabase.

import { useEffect, useMemo, useRef, useState } from 'react'
import { joinTableChannel, type TableChannel } from '../lib/realtime'
import type { RosterEntry, Store } from '../lib/store'
import type { Bargain, Encounter, Handout, InitiativeRow, RaceEvent, RollEvent } from '../types'
import { MapBoard } from './MapBoard'
import { Btn, C, Eyebrow, H, Section, TextArea, TextInput, display } from './ui'

interface DmRace {
  raceId: string
  lanes: Record<string, number>
  finished: string[]
  ended: boolean
}

const RACE_GOAL = 40

interface TableSectionProps {
  store: Store
  roster: RosterEntry[]
}

export function TableSection({ store, roster }: TableSectionProps) {
  const channelRef = useRef<TableChannel | null>(null)
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [feed, setFeed] = useState<RollEvent[]>([])
  const [race, setRace] = useState<DmRace | null>(null)
  const raceRef = useRef<DmRace | null>(null)
  raceRef.current = race

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [channelId, active] = await Promise.all([store.getChannelId(), store.getActiveEncounter()])
      if (cancelled) return
      channelRef.current = joinTableChannel(channelId, {
        roll: (r: RollEvent) => setFeed((f) => [r, ...f].slice(0, 14)),
        race: (r: RaceEvent) => {
          const cur = raceRef.current
          if (!cur || r.raceId !== cur.raceId || cur.ended) return
          if (r.phase === 'progress' && r.playerName) {
            setRace({ ...cur, lanes: { ...cur.lanes, [r.playerName]: r.progress ?? 0 } })
          } else if (r.phase === 'finish' && r.playerName && !cur.finished.includes(r.playerName)) {
            setRace({
              ...cur,
              lanes: { ...cur.lanes, [r.playerName]: RACE_GOAL },
              finished: [...cur.finished, r.playerName],
            })
          }
        },
      })
      if (active) setEncounter(active)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
      channelRef.current?.close()
    }
  }, [store])

  const startRace = () => {
    const lanes: Record<string, number> = {}
    roster.forEach((r) => (lanes[r.playerName] = 0))
    const raceId = crypto.randomUUID()
    setRace({ raceId, lanes, finished: [], ended: false })
    channelRef.current?.sendRace({ raceId, phase: 'start' })
  }

  const endRace = () => {
    if (!race) return
    const stragglers = Object.entries(race.lanes)
      .filter(([n]) => !race.finished.includes(n))
      .sort((a, b) => b[1] - a[1])
      .map(([n]) => n)
    const results = [...race.finished, ...stragglers]
    channelRef.current?.sendRace({ raceId: race.raceId, phase: 'end', results })
    setRace({ ...race, ended: true, finished: results })
  }

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
        <Eyebrow>Carnival games — the Snail Derby 🐌</Eyebrow>
        {!race && (
          <>
            <p className="text-sm" style={{ color: C.faint }}>
              Every player's phone becomes a sprinting snail. First across the line takes the
              glory; the carnival remembers.
            </p>
            <Btn shimmer onClick={startRace} disabled={roster.length === 0 || !store.shared}>
              Start the Snail Derby ✦
            </Btn>
            {!store.shared && (
              <p className="text-xs" style={{ color: C.faint }}>
                (Needs the campaign lantern — Supabase — to reach the phones.)
              </p>
            )}
          </>
        )}
        {race && (
          <>
            {Object.entries(race.lanes).map(([name, progress]) => {
              const place = race.finished.indexOf(name)
              return (
                <div key={name} className="mb-2">
                  <div className="flex justify-between text-xs mb-1">
                    <span>
                      {name}
                      {place === 0 ? ' 🥇' : place === 1 ? ' 🥈' : place === 2 ? ' 🥉' : ''}
                    </span>
                    <span style={{ color: C.faint }}>
                      {progress}/{RACE_GOAL}
                    </span>
                  </div>
                  <div
                    className="relative rounded-full"
                    style={{ height: 22, background: C.night, border: `1px solid ${C.panelEdge}` }}
                  >
                    <span
                      aria-hidden="true"
                      style={{
                        position: 'absolute',
                        left: `${Math.min(96, (progress / RACE_GOAL) * 96)}%`,
                        top: -1,
                        fontSize: 17,
                        transition: 'left .2s linear',
                      }}
                    >
                      🐌
                    </span>
                  </div>
                </div>
              )
            })}
            {!race.ended ? (
              <Btn onClick={endRace}>Call the race — judges' decision 🏁</Btn>
            ) : (
              <>
                <p className="text-sm mt-2" style={{ color: C.gold }}>
                  Final order: {race.finished.map((n, i) => `${i + 1}. ${n}`).join(' · ')}
                </p>
                <Btn secondary onClick={() => setRace(null)}>
                  Clear the track
                </Btn>
              </>
            )}
          </>
        )}
      </Section>

      <Section>
        <Eyebrow>The table's dice — live</Eyebrow>
        {feed.length === 0 ? (
          <p className="text-sm" style={{ color: C.faint }}>
            The dice are quiet. Every roll from every phone lands here.
          </p>
        ) : (
          feed.map((r, i) => (
            <div
              key={`${r.at}-${i}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 mb-1"
              style={{
                background: r.isNat20 ? C.gold : r.isNat1 ? '#3d2030' : C.night,
                color: r.isNat20 ? C.ink : C.parchment,
                border: `1px solid ${r.isNat20 ? C.gold : r.isNat1 ? '#C96A6A' : C.panelEdge}`,
                boxShadow: r.isNat20 && i === 0 ? `0 0 22px ${C.gold}88` : 'none',
              }}
            >
              <span className="text-sm">
                <strong>{r.characterName || r.playerName}</strong>{' '}
                <span style={{ opacity: 0.75 }}>· {r.label}</span>
                {r.mode !== 'normal' && <span style={{ opacity: 0.6 }}> · {r.mode}</span>}
              </span>
              <span style={{ ...display, fontSize: 22, fontWeight: 700 }}>
                {r.total}
                {r.isNat20 ? ' ✦' : r.isNat1 ? ' 🎺' : ''}
              </span>
            </div>
          ))
        )}
      </Section>

      <Section>
        <HandoutComposer store={store} roster={roster} channelRef={channelRef} />
      </Section>

      <Section style={{ border: `1px solid ${C.gold}44` }}>
        <BargainComposer store={store} roster={roster} channelRef={channelRef} />
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

// ---------------------------------------------------------------- bargains

function legalese(name: string, counterparty: string, boon: string, price: string): string {
  return (
    `Let it be known to all lights of the twilight realm that ${name || 'the Undersigned'}, ` +
    `of their own free and unclouded will, does hereby accept from ${counterparty || 'the carnival'}: ` +
    `${boon || 'a gift yet unnamed'}.\n\n` +
    `In consideration whereof, the Undersigned shall render unto ${counterparty || 'the carnival'}: ` +
    `${price || 'a price yet unnamed'}, payable when and as the Feywild wills it, ` +
    `without complaint, delay, or clever interpretation.\n\n` +
    `The terms bind the name, and the name binds the bearer. Ink dries. Bargains do not.`
  )
}

function BargainComposer({
  store,
  roster,
  channelRef,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
}) {
  const [target, setTarget] = useState('')
  const [title, setTitle] = useState('')
  const [counterparty, setCounterparty] = useState('')
  const [boon, setBoon] = useState('')
  const [price, setPrice] = useState('')
  const [terms, setTerms] = useState('')
  const [sent, setSent] = useState(false)

  const targetEntry = roster.find((r) => r.playerName === target)
  const characterName = targetEntry?.character?.build.name ?? target
  const ready = target && title.trim() && price.trim()

  const send = () => {
    if (!ready) return
    const bargain: Bargain = {
      id: crypto.randomUUID(),
      title: title.trim(),
      counterparty: counterparty.trim() || 'the carnival itself',
      boon: boon.trim() || 'a favor already granted',
      price: price.trim(),
      terms: terms.trim() || legalese(characterName, counterparty, boon, price),
      status: 'offered',
    }
    const h: Handout = {
      id: bargain.id,
      target,
      title: bargain.title,
      body: '',
      bargain,
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    setTitle('')
    setBoon('')
    setPrice('')
    setTerms('')
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  return (
    <div>
      <Eyebrow>Strike a bargain — the illuminated contract ⚖</Eyebrow>
      <div className="grid gap-2 mt-1">
        <select
          aria-label="Bargain target"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-md px-3 py-2"
          style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
        >
          <option value="">Who signs?</option>
          {roster
            .filter((r) => r.character)
            .map((r) => (
              <option key={r.playerId} value={r.playerName}>
                {r.character!.build.name} ({r.playerName})
              </option>
            ))}
        </select>
        <TextInput value={title} onChange={setTitle} placeholder="Title (e.g. The Bargain of the Borrowed Voice)" />
        <TextInput value={counterparty} onChange={setCounterparty} placeholder="Struck with… (a hag, a pixie, the carnival itself)" />
        <TextInput value={boon} onChange={setBoon} placeholder="What they receive" />
        <TextInput value={price} onChange={setPrice} placeholder="What is owed (this burns gold in their ledger)" />
        <TextArea rows={4} value={terms} onChange={setTerms} placeholder="The terms — or let the quill write them…" />
        <Btn secondary onClick={() => setTerms(legalese(characterName, counterparty, boon, price))}>
          Let the quill write the legalese ✒
        </Btn>
        <Btn shimmer onClick={send} disabled={!ready}>
          {sent ? 'The contract flies to their phone ✦' : target ? `Offer it to ${characterName}` : 'Offer the contract'}
        </Btn>
        {!store.shared && (
          <p className="text-xs" style={{ color: C.faint }}>
            (Offline: saved on this device — rehearse by rejoining as the player.)
          </p>
        )}
      </div>
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
