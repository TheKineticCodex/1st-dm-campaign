// Phase 3 — Table Mode, DM side: initiative tracker (broadcasts to player
// phones in shared mode), handout composer (all or secretly one player),
// and the map board. Initiative and the map work fully offline; delivery
// to phones needs Supabase.

import { useEffect, useMemo, useRef, useState } from 'react'
import { computeSheet } from '../lib/compute'
import { joinTableChannelLazy, type TableChannel } from '../lib/realtime'
import type { RosterEntry, Store } from '../lib/store'
import { SONGS } from '../data/songPieces'
import { readCache, writeCache } from '../lib/storage'
import type { Bargain, Encounter, FinaleEvent, Handout, InitiativeRow, RaceEvent, RollEvent, VitalsEvent, WheelEvent } from '../types'
import { MapBoard } from './MapBoard'
import { createHost, type Host } from '../lib/gameHost'
import type { GameEvent, GameState } from '../lib/games'
import { GamesPanel } from './games/GamesPanel'
import { FinalePanel } from './Finale'
import { playWhole } from '../lib/song'
import { duck } from '../lib/ambience'
import { DEFAULT_WEDGES, Wheel } from './Wheel'
import { Btn, C, Eyebrow, Fold, H, HintOnce, TextArea, TextInput, display } from './ui'

interface DmRace {
  raceId: string
  lanes: Record<string, number>
  finished: string[]
  ended: boolean
}

const RACE_GOAL = 40

export interface WhisperPrefill {
  target: string
  title: string
  body: string
}

interface TableSectionProps {
  store: Store
  roster: RosterEntry[]
  /** Callback engine: a Vault answer forged into a ready-to-send whisper. */
  whisperPrefill?: WhisperPrefill | null
}

/** Combat glance-strip: every character's HP, AC, and conditions in one line. */
function PartyGlance({ roster, live }: { roster: RosterEntry[]; live: Record<string, VitalsEvent> }) {
  const chars = roster.filter((r) => r.character)
  if (chars.length === 0) return null
  return (
    <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
      {chars.map((r) => {
        const sheet = computeSheet(r.character!.build)
        if (!sheet) return null
        const v = live[r.playerName]
        // Live vitals from the phone win over the (30s-old) roster row.
        const st = v
          ? { damage: v.hpMax - v.hp, conditions: v.conditions, concentrating: v.concentrating, deathSaves: v.deathSaves }
          : r.character!.state
        const hpMax = v?.hpMax ?? sheet.hpMax
        const hp = Math.max(0, hpMax - (st?.damage ?? 0))
        const frac = hp / hpMax
        const barColor = hp === 0 ? '#C96A6A' : frac <= 1 / 3 ? '#E0928F' : C.sea
        return (
          <div
            key={r.playerId}
            className="rounded-lg px-3 py-2 shrink-0"
            style={{ background: C.panel, border: `1px solid ${hp === 0 ? '#C96A6A' : C.panelEdge}`, minWidth: 150 }}
          >
            <div className="flex items-baseline justify-between gap-2">
              <p className="text-sm" style={{ ...display, fontWeight: 700, color: C.gold, whiteSpace: 'nowrap' }}>
                {r.character!.build.name || r.playerName}
              </p>
              <p className="text-xs" style={{ color: C.faint, whiteSpace: 'nowrap' }}>
                🛡 {sheet.ac.val}
              </p>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 rounded-full" style={{ height: 7, background: C.night, overflow: 'hidden' }}>
                <div style={{ width: `${frac * 100}%`, height: '100%', background: barColor, transition: 'width .3s ease' }} />
              </div>
              <p className="text-xs" style={{ color: barColor, whiteSpace: 'nowrap' }}>
                {hp}/{hpMax}
              </p>
            </div>
            {hp === 0 && (
              <p className="text-xs mt-1" style={{ color: '#E0928F' }}>
                dying · {'✦'.repeat(st?.deathSaves?.successes ?? 0)}{'·'.repeat(3 - (st?.deathSaves?.successes ?? 0))} saves ·{' '}
                {'✕'.repeat(st?.deathSaves?.failures ?? 0)}{'·'.repeat(3 - (st?.deathSaves?.failures ?? 0))} fails
              </p>
            )}
            {((st?.conditions?.length ?? 0) > 0 || st?.concentrating) && (
              <div className="flex flex-wrap gap-1 mt-1">
                {st?.concentrating && (
                  <span className="text-xs rounded-full px-1.5" style={{ border: `1px solid ${C.sea}66`, color: C.sea }}>
                    ◐ conc.
                  </span>
                )}
                {(st?.conditions ?? []).map((c) => (
                  <span key={c} className="text-xs rounded-full px-1.5" style={{ border: `1px solid ${C.gold}66`, color: C.gold }}>
                    {c}
                  </span>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

export function TableSection({ store, roster, whisperPrefill }: TableSectionProps) {
  const channelRef = useRef<TableChannel | null>(null)
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [feed, setFeed] = useState<RollEvent[]>([])
  const [live, setLive] = useState<Record<string, VitalsEvent>>({})
  const [wheel, setWheel] = useState<WheelEvent | null>(null)
  const wheelRef = useRef<WheelEvent | null>(null)
  wheelRef.current = wheel
  const rigRef = useRef<number | null>(null)
  const [race, setRace] = useState<DmRace | null>(null)
  const raceRef = useRef<DmRace | null>(null)
  raceRef.current = race
  const hostRef = useRef<Host | null>(null)
  const [game, setGame] = useState<GameState | null>(null)
  const [finale, setFinale] = useState<FinaleEvent | null>(null)
  const finaleRef = useRef<FinaleEvent | null>(null)
  finaleRef.current = finale
  const [finaleReady, setFinaleReady] = useState<Set<string>>(new Set())

  useEffect(() => {
    let cancelled = false
    channelRef.current = joinTableChannelLazy(store.getChannelId(), {
        roll: (r: RollEvent) => setFeed((f) => [r, ...f].slice(0, 14)),
        game: (g: GameEvent) => hostRef.current?.input(g),
        finale: (f: FinaleEvent) => {
          if (f.phase === 'ready' && f.from && finaleRef.current && f.finaleId === finaleRef.current.finaleId) {
            setFinaleReady((cur) => new Set(cur).add(f.from!))
          }
        },
        vitals: (v: VitalsEvent) => setLive((cur) => ({ ...cur, [v.playerName]: v })),
        wheel: (w: WheelEvent) => {
          const cur = wheelRef.current
          if (w.phase === 'spin' && cur && cur.wheelId === w.wheelId && cur.phase === 'arm') {
            // The Book decides where it lands: a pre-picked wedge, or fate.
            const n = cur.wedges?.length ?? 1
            const target = rigRef.current !== null && rigRef.current < n ? rigRef.current : Math.floor(Math.random() * n)
            const end: WheelEvent = { wheelId: cur.wheelId, phase: 'end', wedges: cur.wedges, spinner: cur.spinner, spunBy: w.spunBy, target, turns: 5 + Math.floor(Math.random() * 3), duration: 5.5 }
            setWheel(end)
            channelRef.current?.sendWheel(end)
          }
        },
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
    hostRef.current = createHost((ev) => channelRef.current?.sendGame(ev), setGame)
    ;(async () => {
      const active = await store.getActiveEncounter()
      if (cancelled) return
      if (active) setEncounter(active)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
      hostRef.current?.stop()
      hostRef.current = null
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
      <div className="mt-2">
        <HintOnce id="dm-table-folds">
          Each panel below folds — tap its title. The Book remembers which you keep open.
        </HintOnce>
      </div>

      <PartyGlance roster={roster} live={live} />

      <div className="mt-3" />
      <Fold id="dm-initiative" title="⚔ Initiative" defaultOpen>
        {loaded && <InitiativePanel encounter={encounter} pcRows={pcRows} onChange={update} />}
      </Fold>

      <Fold id="dm-games" title="🐌 Carnival games — the Snail Derby">
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
      </Fold>

      <Fold id="dm-dice" title="🎲 The table's dice — live" defaultOpen>
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
      </Fold>

      <Fold id="dm-whispers" title="✉ Whispers & handouts" forceOpen={!!whisperPrefill}>
        <HandoutComposer
          key={whisperPrefill ? `${whisperPrefill.target}-${whisperPrefill.body.slice(0, 24)}` : 'blank'}
          store={store}
          roster={roster}
          channelRef={channelRef}
          prefill={whisperPrefill ?? undefined}
        />
      </Fold>

      <Fold id="dm-bargains" title="⚖ Strike a bargain">
        <BargainComposer store={store} roster={roster} channelRef={channelRef} />
      </Fold>

      <Fold id="dm-level" title="✦ Level up the party">
        <LevelUpComposer store={store} roster={roster} channelRef={channelRef} />
      </Fold>

      <Fold id="dm-song" title="🎵 A piece comes home">
        <SongComposer store={store} channelRef={channelRef} />
      </Fold>

      <Fold id="dm-wheel" title="🎡 The Fortune Wheel" forceOpen={!!wheel}>
        <WheelPanel
          store={store}
          roster={roster}
          channelRef={channelRef}
          wheel={wheel}
          onArm={(w, rig) => {
            rigRef.current = rig
            setWheel(w)
            channelRef.current?.sendWheel(w)
          }}
          onClear={() => {
            const id = wheel?.wheelId ?? 'none'
            setWheel(null)
            channelRef.current?.sendWheel({ wheelId: id, phase: 'clear' })
          }}
        />
      </Fold>

      <Fold id="dm-games" title="🎪 The game booth — Draw · Hold the Note · The Toll · The Bargain" forceOpen={!!game}>
        <GamesPanel
          store={store}
          roster={roster}
          host={hostRef.current}
          game={game}
          onWhisper={(h) => {
            void store.sendHandout(h)
            channelRef.current?.sendHandout(h)
          }}
        />
      </Fold>

      <Fold id="dm-finale" title="🌕 The finale — the song on every phone" forceOpen={!!finale}>
        <FinalePanel
          players={roster.map((r) => r.playerName)}
          ready={finaleReady}
          event={finale}
          onArm={() => {
            const f: FinaleEvent = { finaleId: crypto.randomUUID(), phase: 'arm' }
            setFinaleReady(new Set())
            setFinale(f)
            channelRef.current?.sendFinale(f)
          }}
          onStart={(inMs) => {
            if (!finale) return
            const f: FinaleEvent = { finaleId: finale.finaleId, phase: 'start', inMs }
            setFinale(f)
            channelRef.current?.sendFinale(f)
            duck(14, 0.12)
            setTimeout(() => playWhole(), inMs)
          }}
          onClear={() => {
            const id = finale?.finaleId ?? 'none'
            setFinale(null)
            setFinaleReady(new Set())
            channelRef.current?.sendFinale({ finaleId: id, phase: 'clear' })
          }}
        />
      </Fold>

      <Fold id="dm-map" title="🗺 The table map">
        <MapBoard pcNames={pcRows.map((r) => r.name)} />
      </Fold>
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

// ---------------------------------------------------------------- level up

/**
 * Milestone leveling: the Lantern-Keeper announces; every phone rises. The
 * announcement rides on a persisted handout (level field) so a phone that
 * was asleep still hears it at next open, and it shows as an envelope too.
 */
function LevelUpComposer({
  store,
  roster,
  channelRef,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
}) {
  const current = Math.max(1, ...roster.map((r) => r.character?.build.level ?? 1))
  const [level, setLevel] = useState<number>(current + 1)
  const [sent, setSent] = useState<number | null>(null)

  const LINES: Record<number, string> = {
    2: 'The Feywild takes notice of you. Something in you answers.',
    3: 'You have cost them something real. You feel your path fork under your feet — choose it.',
    4: 'You are more yourself than you were. Grow — one way or another.',
    5: 'The pieces are pulling toward each other. So are you.',
  }

  const send = () => {
    const h: Handout = {
      id: crypto.randomUUID(),
      target: null,
      title: `✦ Level ${level}`,
      body: `${LINES[level] ?? 'The road has changed you.'} (Level ${level} — open your sheet.)`,
      level,
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    setSent(level)
    setTimeout(() => setSent(null), 3000)
  }

  return (
    <div>
      <p className="text-sm" style={{ color: C.faint }}>
        Milestone leveling. The party is level {current}. Announce the new level and every phone walks its
        player through what wakes — subclass at 3, a feat or ability boost at 4.
      </p>
      <div className="flex items-center gap-2 mt-2">
        {[2, 3, 4, 5, 6].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => setLevel(n)}
            className="rounded-md px-3 py-2 text-sm"
            style={{
              background: level === n ? C.gold : C.night,
              color: level === n ? C.ink : C.parchment,
              border: `1px solid ${level === n ? C.gold : C.panelEdge}`,
              minHeight: 44,
              cursor: 'pointer',
              opacity: n <= current ? 0.5 : 1,
            }}
          >
            {n}
          </button>
        ))}
      </div>
      <Btn onClick={send} disabled={level <= current} shimmer>
        {sent ? `Level ${sent} announced ✦` : `Announce level ${level} to the party`}
      </Btn>
    </div>
  )
}

// -------------------------------------------------------------- the wheel

function WheelPanel({
  store,
  roster,
  channelRef,
  wheel,
  onArm,
  onClear,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
  wheel: WheelEvent | null
  onArm: (w: WheelEvent, rig: number | null) => void
  onClear: () => void
}) {
  const [wedges, setWedges] = useState<string[]>(() => readCache<string[]>('wheel-wedges') ?? DEFAULT_WEDGES)
  const [spinner, setSpinner] = useState<string>('') // '' = anyone
  const [rig, setRig] = useState<number>(-1) // -1 = fate
  const [sent, setSent] = useState(false)

  const setWedge = (i: number, v: string) => {
    const next = wedges.map((w, j) => (j === i ? v : w))
    setWedges(next)
    writeCache('wheel-wedges', next)
  }
  const arm = () => {
    onArm({ wheelId: crypto.randomUUID(), phase: 'arm', wedges: wedges.filter((w) => w.trim()), spinner: spinner || null }, rig >= 0 ? rig : null)
  }
  const whisper = () => {
    if (!wheel || typeof wheel.target !== 'number') return
    const h: Handout = {
      id: crypto.randomUUID(),
      target: wheel.spunBy ?? null,
      title: '🎡 Your fortune',
      body: wheel.wedges?.[wheel.target] ?? '',
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  if (wheel) {
    return (
      <div>
        <p className="text-sm mb-2" style={{ color: C.faint }}>
          {wheel.phase === 'arm' && `Armed. ${wheel.spinner ? `${wheel.spinner} has the handle` : 'Anyone may spin'}. ${rig >= 0 ? `It will land on ${rig + 1}.` : 'Fate decides.'}`}
          {wheel.phase === 'spin' && 'Spinning…'}
          {wheel.phase === 'end' && typeof wheel.target === 'number' && `Landed on ${wheel.target + 1}: “${wheel.wedges?.[wheel.target]}” — spun by ${wheel.spunBy ?? '?'}.`}
        </p>
        <Wheel
          wedges={wheel.wedges ?? []}
          target={wheel.phase === 'end' && typeof wheel.target === 'number' ? wheel.target : null}
          turns={wheel.turns}
          duration={wheel.duration}
          spinKey={`${wheel.wheelId}:${wheel.phase}`}
          size={260}
        />
        <div className="flex gap-2 mt-3">
          {wheel.phase === 'end' && (
            <Btn onClick={whisper} shimmer>
              {sent ? 'Fortune whispered ✦' : `Whisper the fortune to ${wheel.spunBy ?? 'them'}`}
            </Btn>
          )}
          <Btn secondary onClick={onClear}>
            Return to the story
          </Btn>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm" style={{ color: C.faint }}>
        Eight fortunes with a cold edge. Edit them, choose who holds the handle, decide whether fate or you picks the wedge — then arm it. Every phone sees the wheel; the spinner gets the button; every screen watches the same spin.
      </p>
      <div className="grid gap-1 mt-2">
        {wedges.map((w, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: C.gold, width: 18, textAlign: 'right' }}>
              {i + 1}
            </span>
            <TextInput value={w} onChange={(v) => setWedge(i, v)} placeholder={`Fortune ${i + 1}`} />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2 mt-3">
        <select
          aria-label="Who spins"
          value={spinner}
          onChange={(e) => setSpinner(e.target.value)}
          className="rounded-md px-3 py-2"
          style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
        >
          <option value="">Anyone may spin</option>
          {roster.map((r) => (
            <option key={r.playerId} value={r.playerName}>
              {r.playerName} spins
            </option>
          ))}
        </select>
        <select
          aria-label="Where it lands"
          value={rig}
          onChange={(e) => setRig(Number(e.target.value))}
          className="rounded-md px-3 py-2"
          style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
        >
          <option value={-1}>Fate decides</option>
          {wedges.map((_, i) => (
            <option key={i} value={i}>
              Lands on {i + 1}
            </option>
          ))}
        </select>
      </div>
      <Btn onClick={arm} disabled={!store.shared || roster.length === 0} shimmer>
        Arm the wheel 🎡
      </Btn>
      {!store.shared && (
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          Needs the campaign lantern (Supabase) to reach the phones.
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------- the song

/**
 * Light a piece of one of the five songs on every phone. Travels as a
 * persisted handout with a `song` field (like level-ups), so it survives a
 * sleeping phone. The Story tab on each phone shows the same lit pieces.
 */
function SongComposer({ store, channelRef }: { store: Store; channelRef: { current: TableChannel | null } }) {
  const [lit, setLit] = useState<Set<string>>(new Set())
  const [sent, setSent] = useState<string | null>(null)
  useEffect(() => {
    // The DM has no player token; read what's lit from the DM's own device cache of sent pieces.
    setLit(new Set(readCache<string[]>('song-lit') ?? []))
  }, [])

  const light = (songKey: string, pieceKey: string, label: string, songName: string) => {
    const key = `${songKey}:${pieceKey}`
    const h: Handout = {
      id: crypto.randomUUID(),
      target: null,
      title: '🎵 A piece comes home',
      body: `${songName}: ${label}. Somewhere, something that had forgotten itself remembers a little.`,
      song: key,
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    const next = new Set(lit)
    next.add(key)
    setLit(next)
    writeCache('song-lit', [...next])
    setSent(key)
    setTimeout(() => setSent(null), 2500)
  }

  return (
    <div>
      <p className="text-sm mb-2" style={{ color: C.faint }}>
        Tap a piece when the party brings it home. It lights on every phone’s Story tab — the campaign’s progress, visible.
      </p>
      {SONGS.map((song) => (
        <div key={song.key} className="mb-3">
          <p className="text-sm">
            <strong style={{ ...display, fontSize: 16, color: C.parchment }}>{song.name}</strong>{' '}
            <span className="text-xs" style={{ color: C.faint }}>
              {song.holder}
            </span>
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {song.pieces.map((p) => {
              const on = lit.has(`${song.key}:${p.key}`)
              return (
                <button
                  key={p.key}
                  type="button"
                  disabled={on}
                  title={p.where}
                  onClick={() => light(song.key, p.key, p.label, song.name)}
                  className="rounded-md px-2.5 py-1.5 text-xs text-left"
                  style={{
                    background: on ? `${C.gold}33` : C.night,
                    color: on ? C.gold : C.parchment,
                    border: `1px solid ${on ? C.gold : C.panelEdge}`,
                    minHeight: 40,
                    cursor: on ? 'default' : 'pointer',
                  }}
                >
                  {on ? '✦ ' : '· '}
                  {p.label}
                </button>
              )
            })}
          </div>
        </div>
      ))}
      {sent && (
        <p className="text-xs" style={{ color: C.sea }}>
          Lit on every phone ✦
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------- handouts

function HandoutComposer({
  store,
  roster,
  channelRef,
  prefill,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
  prefill?: WhisperPrefill
}) {
  const [title, setTitle] = useState(prefill?.title ?? '')
  const [bodyText, setBodyText] = useState(prefill?.body ?? '')
  const [target, setTarget] = useState<string>(prefill?.target ?? '') // '' = everyone
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
