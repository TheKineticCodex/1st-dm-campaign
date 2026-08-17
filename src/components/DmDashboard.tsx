// The Lantern-Keeper's Book — three doors, not eleven.
//
//   Tonight     the night in the order it happens. He opens here.
//   Table       everything that reaches the five phones and the big screen.
//   Look it up  the answer to anything a player asks, and the sitting-down work.
//
// Everything that used to be its own tab is still here — it is a fold now,
// and every old destination still works through LANDS_ON / OPENS_FOLD below,
// which also opens the right panel when it arrives. All three tabs stay
// mounted and hide with display:none: leaving the Table used to tear down the
// realtime channel and the game host, which killed a running derby and wiped
// the dice feed. All components live at module level.

import { useEffect, useMemo, useRef, useState } from 'react'
import { QUIZ } from '../data/quiz'
import { CONDITIONS, fmt, mod } from '../data/rules'
import { computeSheet, skillMod } from '../lib/compute'
import { joinTableChannelLazy, type TableChannel } from '../lib/realtime'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'
import { keepGlassLit } from '../lib/wakeLock'
import { PARTY_SIZE, partyWord } from '../data/campaign'
import { getStore, type RosterEntry, type Store } from '../lib/store'
import type { Clue, LostThing, Npc, SessionNote } from '../types'
import { CheatSheet } from './CheatSheet'
import { RunbookSection } from './RunbookSection'
import { BeforeTheLanterns } from './BeforeTheLanterns'
import { NightPath } from './NightPath'
import { TheRhyme } from './TheRhyme'
import { StageScreen } from './StageScreen'
import { TableSection } from './TableSection'
import { PartyStrip, RunNight, StoryTimeline, TheThingWithNoName } from './TonightSection'
import { NIGHT_PATH } from '../data/nightPath'
import { readNightProgress } from '../lib/night'
import { PANIC_LINES } from '../data/cheatSheet'
import type { VitalsEvent } from '../types'
import { Btn, C, CalmToggle, Eyebrow, Fold, H, Section, TextArea, TextInput, body, display, eyebrow, nightGround, onState, seaLit, bloodLit, wellSurface, numerals } from './ui'
import { Icon, Lantern, Spark, type IconName } from './icons'

type DmSection = 'tonight' | 'table' | 'look'

// The label strings are load-bearing — three live specs drive the nav by them.
// 'table' as a glyph reads as a close ✕ at 19px, so the Table wears the die.
const SECTIONS: [DmSection, IconName, string][] = [
  ['tonight', 'tonight', 'Tonight'],
  ['table', 'die', 'Table'],
  ['look', 'cheat', 'Look it up'],
]

/**
 * Every destination anything in the Book has ever asked for, and where it
 * lives now. Nothing that used to be reachable stopped being reachable.
 */
const LANDS_ON: Record<string, DmSection> = {
  home: 'tonight', tonight: 'tonight',
  table: 'table', roster: 'table', level: 'table', stage: 'table',
  look: 'look', run: 'look', cheat: 'look',
  vault: 'look', lost: 'look', notes: 'look', npcs: 'look', clues: 'look', story: 'look',
}

/** And which panel to open when it gets there, so nothing lands on a closed fold. */
const OPENS_FOLD: Record<string, string> = {
  roster: 'table-troupe', level: 'dm-level', stage: 'dm-stage',
  run: 'look-runbook', vault: 'look-vault', lost: 'look-lost',
  notes: 'look-notes', npcs: 'look-npcs', clues: 'look-clues', story: 'look-story',
}

export interface WhisperPrefill {
  target: string
  title: string
  body: string
}

interface DmDashboardProps {
  session: DeviceSession
  onLeave: () => void
}

export function DmDashboard({ session, onLeave }: DmDashboardProps) {
  const store = useMemo(() => getStore(session), [session])
  const [section, setSection] = useState<DmSection>('tonight')
  const [openFold, setOpenFold] = useState<string | null>(null)
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [whisperPrefill, setWhisperPrefill] = useState<WhisperPrefill | null>(null)
  const [ambient, setAmbient] = useState(false)
  const [frozen, setFrozen] = useState(false)
  const [live, setLive] = useState<Record<string, VitalsEvent>>({})
  // The Table and Look it up are heavy; don't build them at boot, but once
  // they exist keep them alive so nothing in them dies on a tab tap.
  const [seen, setSeen] = useState<Record<DmSection, boolean>>({ tonight: true, table: false, look: false })

  useEffect(() => keepGlassLit(), [])

  // The strip at the top of every screen shows the table's own numbers.
  // Joins are ref-counted, so this sits happily beside the Table's.
  useEffect(() => {
    const ch = joinTableChannelLazy(store.getChannelId(), {
      vitals: (v: VitalsEvent) => setLive((cur) => ({ ...cur, [v.playerName]: v })),
    })
    return () => ch.close()
  }, [store])

  // A fold asked to open should be able to be asked again later.
  useEffect(() => {
    if (!openFold) return
    const t = setTimeout(() => setOpenFold(null), 300)
    return () => clearTimeout(t)
  }, [openFold])

  useEffect(() => {
    if (!seen[section]) setSeen((cur) => ({ ...cur, [section]: true }))
  }, [section, seen])

  // Roster keeps itself fresh — no more tapping refresh to see a new player.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const r = await store.listRoster()
      if (!cancelled) {
        setRoster(r)
        setLoaded(true)
      }
    }
    void load()
    const interval = setInterval(() => void load(), 30000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [store])

  const refreshRoster = async () => setRoster(await store.listRoster())

  /** Take him anywhere, by any name the Book has ever used for it. */
  const go = (id: string) => {
    setSection(LANDS_ON[id] ?? 'tonight')
    setOpenFold(OPENS_FOLD[id] ?? null)
  }

  const forgeWhisper = (target: string, quote: string) => {
    setWhisperPrefill({
      target,
      title: 'The lanterns remember',
      body: `You once told the lanterns: “${quote}”\n\n`,
    })
    go('table')
  }

  const handleLeave = () => {
    if (window.confirm('Hang up the lantern-keeper’s coat? (You can sign back in with the DM code.)')) {
      clearDeviceSession()
      onLeave()
    }
  }

  if (ambient) {
    return <StageScreen store={store} roster={roster} onClose={() => setAmbient(false)} />
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: nightGround,
        ...body,
        color: C.parchment,
      }}
      className="flex flex-col items-center px-4 pt-4 pb-24"
    >
      <div className="w-full" style={{ maxWidth: 900 }}>
        {/* the Book's plate: emblem, Fraunces title, a hairline rule beneath */}
        <div
          className="flex items-center justify-between gap-x-4 gap-y-1 flex-wrap mb-1"
          style={{ borderBottom: `1px solid ${C.panelEdge}`, boxShadow: `0 1px 0 ${C.hairline}`, paddingBottom: 8 }}
        >
          <h1
            className="flex items-center gap-3"
            style={{ ...display, fontVariationSettings: "'opsz' 96", fontSize: 'clamp(21px, 4.4vw, 28px)', fontWeight: 700, color: C.gold, textShadow: '0 1px 0 rgba(90,55,10,0.4), 0 0 18px rgba(240,181,79,0.16)', minWidth: 0, flex: '1 1 auto' }}
          >
            <Lantern size={34} style={{ flexShrink: 0 }} />
            The Lantern-Keeper's Book
          </h1>
          <span className="flex items-center gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={() => setFrozen(!frozen)}
              aria-pressed={frozen}
              className="text-xs"
              style={{ ...body, fontWeight: 600, color: frozen ? C.sea : C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
            >
              if you freeze
            </button>
            <button
              type="button"
              onClick={() => setAmbient(true)}
              className="inline-flex items-center gap-1.5"
              style={{ ...body, ...onState, fontSize: 12, fontWeight: 600, borderRadius: 999, padding: '0 14px', minHeight: 36, cursor: 'pointer' }}
            >
              <Icon name="stage" size={15} /> stage
            </button>
            <CalmToggle />
            <button
              type="button"
              onClick={handleLeave}
              className="text-xs"
              style={{ ...body, fontWeight: 600, color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
            >
              leave
            </button>
          </span>
        </div>
        <p className="mb-4 mt-2" style={{ ...eyebrow, letterSpacing: '0.18em' }}>
          Dungeon Master view · {store.shared ? 'campaign-wide' : 'offline — showing this device only'}
        </p>

        {!loaded ? (
          <p style={{ color: C.faint }}>The book is opening…</p>
        ) : (
          <>
            {frozen && (
              <div className="rounded-xl p-4 mb-3" style={{ ...seaLit }}>
                <Eyebrow style={{ color: C.sea }}>if you freeze — any one of these buys you a minute</Eyebrow>
                {PANIC_LINES.slice(0, 3).map((l) => (
                  <p key={l} className="text-base flex items-start gap-2" style={{ color: C.parchment }}>
                    <Spark size={12} style={{ color: C.sea, marginTop: 7, flexShrink: 0 }} />
                    <span>{l}</span>
                  </p>
                ))}
                <p className="text-sm mt-2" style={{ ...numerals, color: C.sea }}>
                  And when they try something: “Yes — give me a roll.” Easy 10 · Medium 15 · Hard 20.
                </p>
              </div>
            )}

            <PartyStrip roster={roster} live={live} onTap={() => go('roster')} />

            <div style={{ display: section === 'tonight' ? 'block' : 'none' }}>
              <TonightTab store={store} roster={roster} onGo={go} />
            </div>
            {seen.table && (
              <div style={{ display: section === 'table' ? 'block' : 'none' }}>
                <TableTab
                  store={store}
                  roster={roster}
                  whisperPrefill={whisperPrefill}
                  onPrefillUsed={() => setWhisperPrefill(null)}
                  onRefresh={refreshRoster}
                  openFold={openFold}
                />
              </div>
            )}
            {seen.look && (
              <div style={{ display: section === 'look' ? 'block' : 'none' }}>
                <LookTab
                  store={store}
                  roster={roster}
                  onForgeWhisper={forgeWhisper}
                  onRefresh={refreshRoster}
                  openFold={openFold}
                />
              </div>
            )}
          </>
        )}
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-center"
        style={{
          background: `linear-gradient(180deg, ${C.panel}F2, ${C.nightDeep}F8)`,
          borderTop: `1px solid ${C.panelEdge}`,
          boxShadow: 'inset 0 1px 0 rgba(255,214,150,0.08), 0 -10px 30px rgba(0,0,0,0.35)',
          backdropFilter: 'blur(10px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 50,
        }}
        aria-label="DM sections"
      >
        <div className="flex w-full overflow-x-auto" style={{ maxWidth: 900 }}>
          {SECTIONS.map(([id, glyph, label]) => {
            const on = section === id
            return (
              <button
                key={id}
                type="button"
                onClick={() => setSection(id)}
                className="flex-1 pt-2 pb-1.5 text-center"
                style={{
                  ...body,
                  fontSize: 12,
                  fontWeight: 600,
                  color: on ? C.goldHi : C.faint,
                  background: 'none',
                  border: 'none',
                  minHeight: 52,
                  minWidth: 64,
                  cursor: 'pointer',
                  position: 'relative',
                }}
                aria-current={on ? 'page' : undefined}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 24, height: 2, borderRadius: 2,
                    background: on ? C.gold : 'transparent',
                    boxShadow: on ? `0 0 10px ${C.gold}` : 'none',
                  }}
                />
                <span className="block" aria-hidden="true" style={{ lineHeight: 0, filter: on ? `drop-shadow(0 0 6px ${C.gold}66)` : 'none' }}>
                  <Icon name={glyph} size={19} />
                </span>
                <span className="block" style={{ marginTop: 2 }}>{label}</span>
              </button>
            )
          })}
        </div>
      </nav>
    </div>
  )
}

// -------------------------------------------------------------------- Home

// ------------------------------------------------------------ the three tabs

/**
 * TONIGHT — the night in the order it happens, and the tab he lands on.
 * The path is the spine, unfolded. Nothing else opens by itself, which is
 * what makes a long page safe: the first screenful is the same shape at
 * every checkpoint.
 */
function TonightTab({ store, roster, onGo }: { store: Store; roster: RosterEntry[]; onGo: (s: string) => void }) {
  // The progress lives in a cache, and a cache cannot tell anybody it changed,
  // so the path reports up when a door is tapped.
  const [started, setStarted] = useState(() => Object.keys(readNightProgress().took).length > 0)
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <TheRhyme store={store} started={started} />
      <NightPath store={store} roster={roster} onGo={onGo} onWalked={setStarted} />

      <Fold id="tonight-align" title="🌕 A Freya called Sun, a Freya called Moon">
        <TheThingWithNoName store={store} />
      </Fold>

      <Fold id="tonight-clock" title="🗓 Tonight’s clock — when each part happens">
        <div className="grid gap-1 mt-1">
          {NIGHT_PATH.checkpoints.map((c, i) => (
            <div key={c.id} className="rounded-lg p-2 flex gap-3" style={wellSurface}>
              <span className="text-sm shrink-0" style={{ ...body, ...numerals, color: C.gold, fontWeight: 600, width: 20 }}>
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="text-sm" style={{ color: C.parchment, fontWeight: 600 }}>
                  {c.title} <span style={{ ...numerals, color: C.faint, fontWeight: 400 }}>· {c.minutes}</span>
                </p>
                <p className="text-xs mt-0.5" style={{ color: C.faint }}>
                  {c.doThis[0]}
                </p>
              </div>
            </div>
          ))}
        </div>
      </Fold>

      <Fold id="tonight-lanterns" title="🕯 Before the lanterns — the list" defaultOpen={!started}>
        <BeforeTheLanterns store={store} roster={roster} />
      </Fold>

      <Fold id="tonight-more" title="📖 More on this scene — the menu, the room, the soundboard">
        <RunNight store={store} roster={roster} onGo={onGo} />
      </Fold>
    </div>
  )
}

/** TABLE — everything that reaches the five phones and the big screen. */
function TableTab({
  store,
  roster,
  whisperPrefill,
  onPrefillUsed,
  onRefresh,
  openFold,
}: {
  store: Store
  roster: RosterEntry[]
  whisperPrefill: WhisperPrefill | null
  onPrefillUsed: () => void
  onRefresh: () => void
  openFold: string | null
}) {
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <TableSection
        store={store}
        roster={roster}
        whisperPrefill={whisperPrefill}
        onPrefillUsed={onPrefillUsed}
        openFold={openFold}
      />
      <Fold id="table-troupe" title="⚔ The troupe — hit points, conditions, bargains" forceOpen={openFold === 'table-troupe'}>
        <RosterSection roster={roster} onRefresh={onRefresh} store={store} />
      </Fold>
    </div>
  )
}

/**
 * LOOK IT UP — the answer to anything a player asks, and the sitting-down
 * work. The Cheat Sheet is first and open, because that is the panic surface
 * and the tab is named for the question.
 */
function LookTab({
  store,
  roster,
  onForgeWhisper,
  onRefresh,
  openFold,
}: {
  store: Store
  roster: RosterEntry[]
  onForgeWhisper: (target: string, quote: string) => void
  onRefresh: () => void
  openFold: string | null
}) {
  const open = (id: string) => openFold === id
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <CheatSheet />

      <Fold id="look-runbook" title="🧭 Every scene, act by act" forceOpen={open('look-runbook')}>
        <RunbookSection store={store} />
      </Fold>
      <Fold id="look-story" title="✦ The whole story — where they are, and every road ahead" forceOpen={open('look-story')}>
        <StoryTimeline store={store} />
      </Fold>
      <Fold id="look-npcs" title="🎭 Who is in the book" forceOpen={open('look-npcs')}>
        <NpcSection store={store} />
      </Fold>
      <Fold id="look-vault" title="☾ What they told the lanterns" forceOpen={open('look-vault')}>
        <VaultSection roster={roster} onForgeWhisper={onForgeWhisper} />
      </Fold>
      <Fold id="look-lost" title="🔑 What each of them lost" forceOpen={open('look-lost')}>
        <LostSection store={store} roster={roster} />
      </Fold>
      <Fold id="look-clues" title="🕯 What they have worked out" forceOpen={open('look-clues')}>
        <ClueSection store={store} />
      </Fold>
      <Fold id="look-notes" title="✒ Nights written down" forceOpen={open('look-notes')}>
        <NotesSection store={store} />
      </Fold>
      <Fold id="look-chairs" title="❖ The chairs — who has joined, who has forged" forceOpen={open('look-chairs')}>
        <Chairs roster={roster} onRefresh={onRefresh} />
      </Fold>
      <SeedTheBook store={store} />
    </div>
  )
}

/** One chair per protagonist, always — the Equal Protagonists rule, visible. */
function Chairs({ roster, onRefresh }: { roster: RosterEntry[]; onRefresh: () => void }) {
  const seatCount = Math.max(PARTY_SIZE, roster.length)
  const seats = Array.from({ length: seatCount }, (_, i) => roster[i] ?? null)
  return (
    <div>
      <div className="flex items-center justify-between">
        <p style={{ ...eyebrow, letterSpacing: '0.22em' }}>The {partyWord} chairs</p>
        <button
          type="button"
          onClick={onRefresh}
          className="text-xs underline"
          style={{ ...body, fontWeight: 600, color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
        >
          look again
        </button>
      </div>
      <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
        {seats.map((r, i) => (
          <div
            key={r?.playerId ?? `empty-${i}`}
            className="rounded-xl p-3 text-center"
            style={r ? { ...onState, color: C.parchment } : { ...wellSurface, border: `1px dashed ${C.panelEdge}` }}
          >
            {r ? (
              <>
                {r.character?.build.portraitUrl ? (
                  <img
                    src={r.character.build.portraitUrl}
                    alt=""
                    className="mx-auto"
                    style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${C.gold}` }}
                  />
                ) : (
                  <span className="block" style={{ lineHeight: 0, color: C.gold }} aria-hidden="true">
                    <Icon name={r.character ? 'roster' : 'vault'} size={26} />
                  </span>
                )}
                <p className="text-sm mt-1" style={{ color: C.parchment, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.character?.build.name || r.playerName}
                </p>
                <p className="text-xs" style={{ color: C.faint }}>
                  {r.character ? 'forged ✓' : r.quiz ? 'divined — not yet forged' : 'at the gate'}
                </p>
              </>
            ) : (
              <>
                <span className="block" style={{ lineHeight: 0, opacity: 0.4, color: C.gold }} aria-hidden="true">
                  <Spark size={26} />
                </span>
                <p className="text-xs mt-1 italic" style={{ color: C.faint }}>
                  an empty chair,
                  <br />
                  waiting
                </p>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

/** First run only: lay the cast and the clue cards. Gone once they exist. */
function SeedTheBook({ store }: { store: Store }) {
  const [clues, setClues] = useState<number | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const c = await store.listClues()
      if (!cancelled) setClues(c.length)
    })()
    return () => {
      cancelled = true
    }
  }, [store, seeded])

  const seedBook = async () => {
    setSeeding(true)
    const { SEED_CLUES, SEED_NPCS } = await import('../data/campaignSeeds')
    for (const c of SEED_CLUES) await store.saveClue({ ...c, id: crypto.randomUUID() })
    for (const n of SEED_NPCS) await store.saveNpc({ ...n, id: crypto.randomUUID() })
    setSeeding(false)
    setSeeded(true)
  }

  if (seeded)
    return (
      <p role="status" className="text-sm mt-3 flex items-center gap-1.5" style={{ color: C.sea }}>
        <Spark size={12} /> The threads are laid — see the panels above. Edit everything; it is your book.
      </p>
    )
  if (clues === null || clues > 0) return null
  return (
    <Section style={{ marginTop: 12, border: `1px solid ${C.sea}55` }}>
      <Eyebrow>Before the first night</Eyebrow>
      <p className="text-sm" style={{ color: C.parchment }}>
        The book can lay the campaign’s threads for you: the cast (the Twins, Grey-Gill, the Buyer, the three keepers,
        Saltmere) and four clue cards that track the pieces of the song, the proof, the Ones Below, and the Moon.
      </p>
      <Btn onClick={() => void seedBook()} disabled={seeding}>
        {seeding ? 'Threading the needle…' : <>Lay the threads <Spark size={14} /> (cast + clues)</>}
      </Btn>
    </Section>
  )
}

// ------------------------------------------------------------------ Roster

function RosterSection({
  roster,
  onRefresh,
  store,
}: {
  roster: RosterEntry[]
  onRefresh: () => void
  store: Store
}) {
  const channelRef = useRef<TableChannel | null>(null)
  const [pickerFor, setPickerFor] = useState<string | null>(null)
  const [sentNote, setSentNote] = useState<string | null>(null)

  useEffect(() => {
    channelRef.current = joinTableChannelLazy(store.getChannelId(), {})
    return () => {
      channelRef.current?.close()
    }
  }, [store])

  const sendCondition = (targetPlayer: string, condition: string, active: boolean) => {
    channelRef.current?.sendCondition({ targetPlayer, condition, active })
    setSentNote(`${condition} ${active ? 'laid upon' : 'lifted from'} ${targetPlayer} ✦`)
    setTimeout(() => setSentNote(null), 2500)
    setPickerFor(null)
  }

  const resolveBargain = async (
    targetPlayer: string,
    bargain: { id: string; title: string },
    outcome: 'fulfilled' | 'broken',
  ) => {
    if (!window.confirm(outcome === 'fulfilled' ? `Burn "${bargain.title}" gold — fulfilled?` : `Crack the seal on "${bargain.title}" — broken?`)) return
    channelRef.current?.sendBargain({ kind: 'resolve', targetPlayer, bargainId: bargain.id, outcome, title: bargain.title })
    // Offline rehearsal: same-device character is ours to update directly.
    if (!store.shared) {
      const c = await store.getCharacter()
      if (c?.notes.bargains) {
        await store.saveCharacter({
          ...c,
          notes: {
            ...c.notes,
            bargains: c.notes.bargains.map((b) =>
              b.id === bargain.id ? { ...b, status: outcome, resolvedAt: new Date().toISOString() } : b,
            ),
          },
          updatedAt: new Date().toISOString(),
        })
      }
    }
    setSentNote(`"${bargain.title}" — ${outcome === 'fulfilled' ? 'burned gold' : 'the seal cracked'} ✦`)
    setTimeout(() => setSentNote(null), 2500)
    onRefresh()
  }

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <div className="flex items-center justify-between">
        <H>The troupe</H>
        <button
          type="button"
          onClick={onRefresh}
          className="text-sm underline"
          style={{ color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
        >
          refresh
        </button>
      </div>
      {sentNote && (
        <p role="status" className="text-xs mt-1" style={{ color: C.sea }}>
          {sentNote} — their sheet explains it in plain words.
        </p>
      )}
      {roster.length === 0 && (
        <p className="mt-2" style={{ color: C.faint }}>
          No travelers yet. Text your players the link and the join code.
        </p>
      )}
      <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {roster.map((r) => {
          const sheet = r.character ? computeSheet(r.character.build) : null
          const hp = sheet && r.character ? Math.max(0, sheet.hpMax - r.character.state.damage) : null
          return (
            <Section key={r.playerId} style={{ marginBottom: 0 }}>
              <p className="text-xs" style={{ color: C.sea }}>
                {r.playerName}
              </p>
              {!sheet || !r.character ? (
                <p className="text-sm mt-1" style={{ color: C.faint }}>
                  Still at the divination booth — no character forged yet.
                </p>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    {r.character.build.portraitUrl && (
                      <img
                        src={r.character.build.portraitUrl}
                        alt=""
                        style={{
                          width: 54,
                          height: 54,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: `2px solid ${hp === 0 ? C.blood : C.gold}`,
                          boxShadow: `0 0 10px ${hp === 0 ? `${C.blood}44` : `${C.gold}33`}`,
                        }}
                      />
                    )}
                    <p style={{ ...display, fontSize: 22, fontWeight: 700 }}>{r.character.build.name}</p>
                  </div>
                  <p className="text-xs mb-2" style={{ color: C.faint }}>
                    Level {sheet.level} {r.character.build.species} {r.character.build.klass} ·{' '}
                    {r.character.build.bg}
                  </p>
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 rounded-full" style={{ height: 7, background: C.nightDeep, border: `1px solid ${C.panelEdge}`, overflow: 'hidden' }}>
                      <div
                        style={{
                          width: `${((hp ?? 0) / sheet.hpMax) * 100}%`,
                          height: '100%',
                          background: hp === 0 ? C.blood : (hp ?? 0) <= sheet.hpMax / 3 ? C.blood : C.sea,
                          transition: 'width .3s ease',
                        }}
                      />
                    </div>
                    <span className="text-xs inline-flex items-center gap-1" style={{ ...numerals, color: hp === 0 ? C.blood : C.sea, whiteSpace: 'nowrap' }}>
                      <Icon name="heart" size={12} /> {hp}/{sheet.hpMax}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    <span>
                      AC <strong>{sheet.ac.val}</strong>
                    </span>
                    <span>
                      Passive Perception <strong>{10 + skillMod(sheet, 'Perception')}</strong>
                    </span>
                    <span>
                      Init <strong>{fmt(mod(sheet.A.DEX))}</strong>
                    </span>
                    {sheet.spellDc !== null && (
                      <span>
                        Spell DC <strong>{sheet.spellDc}</strong>
                      </span>
                    )}
                    {r.character.state.coins && (
                      <span className="inline-flex items-center gap-1" style={{ ...numerals, color: C.faint }}>
                        <Icon name="purse" size={13} /> <strong style={{ color: C.gold }}>{r.character.state.coins.gp}</strong>g{' '}
                        {r.character.state.coins.sp}s {r.character.state.coins.cp}c
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {r.character.state.conditions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => sendCondition(r.playerName, c, false)}
                        className="text-xs rounded-md px-2 py-1 inline-flex items-center gap-1"
                        style={{ ...onState, minHeight: 32, cursor: 'pointer' }}
                        title={`Lift ${c}`}
                      >
                        {c} <Icon name="cross" size={11} />
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setPickerFor(pickerFor === r.playerId ? null : r.playerId)}
                      className="text-xs underline"
                      style={{ background: 'none', border: 'none', color: C.sea, minHeight: 32, cursor: 'pointer' }}
                    >
                      + condition
                    </button>
                  </div>
                  {pickerFor === r.playerId && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {Object.keys(CONDITIONS)
                        .filter((c) => !r.character!.state.conditions.includes(c))
                        .map((c) => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => sendCondition(r.playerName, c, true)}
                            className="text-xs rounded-md px-2 py-1"
                            style={{ ...wellSurface, color: C.parchment, minHeight: 32, cursor: 'pointer' }}
                          >
                            {c}
                          </button>
                        ))}
                    </div>
                  )}
                  {(r.character.notes.bargains ?? []).length > 0 && (
                    <div className="mt-2">
                      <Eyebrow style={{ letterSpacing: '0.15em' }}>⚖ Bargains</Eyebrow>
                      {r.character.notes.bargains!.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-xs mt-1">
                          <span className="inline-flex items-center gap-1" style={{ color: b.status === 'broken' ? C.blood : C.parchment }}>
                            {b.status === 'fulfilled' ? <Spark size={11} style={{ color: C.gold }} /> : b.status === 'broken' ? <Icon name="heartBroken" size={12} /> : null}
                            <span>
                              {b.title}
                              <span style={{ color: C.faint }}> · {b.status}</span>
                            </span>
                          </span>
                          {b.status === 'sealed' && (
                            <span className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => void resolveBargain(r.playerName, b, 'fulfilled')}
                                className="rounded px-2"
                                style={{ ...onState, minHeight: 30, cursor: 'pointer' }}
                              >
                                fulfill
                              </button>
                              <button
                                type="button"
                                onClick={() => void resolveBargain(r.playerName, b, 'broken')}
                                className="rounded px-2"
                                style={{ ...bloodLit, minHeight: 30, cursor: 'pointer' }}
                              >
                                break
                              </button>
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {r.character.notes.lost && (
                    <p className="text-xs mt-2 flex items-center gap-1" style={{ color: C.faint }}>
                      <Icon name="lost" size={12} /> <span>What they lost: <em style={{ color: C.parchment }}>{r.character.notes.lost}</em></span>
                    </p>
                  )}
                </>
              )}
            </Section>
          )
        })}
      </div>
    </div>
  )
}

// ------------------------------------------------------------------- Vault

const KEY_QUESTIONS = new Set(['recover', 'fear'])

function VaultSection({
  roster,
  onForgeWhisper,
}: {
  roster: RosterEntry[]
  onForgeWhisper: (target: string, quote: string) => void
}) {
  const withQuiz = roster.filter((r) => r.quiz)
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>The quiz vault</H>
      <p className="text-sm mb-3" style={{ color: C.faint }}>
        Raw material for each Lost Thing — the gold <Spark size={12} style={{ color: C.gold }} /> questions most of all. The <Icon name="envelope" size={13} style={{ color: C.sea }} /> beside any
        answer forges it into a sealed whisper, their own words returned to them.
      </p>
      {withQuiz.length === 0 && <p style={{ color: C.faint }}>No divinations recorded yet.</p>}
      {withQuiz.map((r) => (
        <Section key={r.playerId}>
          <p style={{ ...display, fontSize: 20, fontWeight: 700, color: C.gold }}>
            {r.playerName}
            <span className="text-sm font-normal" style={{ color: C.faint }}>
              {' '}
              · callings: {r.quiz!.topClasses.join(', ') || '—'}
            {r.quiz!.topSpecies?.length ? ` · mirror: ${r.quiz!.topSpecies.join(' or ')}` : ''}
            </span>
          </p>
          {QUIZ.map((q) => {
            const a = r.quiz!.answers[q.id]
            if (!a) return null
            const key = KEY_QUESTIONS.has(q.id)
            return (
              <div key={q.id} className="mt-2">
                <p className="text-xs flex items-center gap-1" style={{ color: key ? C.gold : C.faint }}>
                  {key && <Spark size={11} />}
                  <span>{q.prompt}</span>
                </p>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm flex items-start gap-1.5" style={{ color: C.parchment }}>
                    <Icon name="arrow" size={13} style={{ color: C.brassDim, marginTop: 4 }} /> <span>{a}</span>
                  </p>
                  <button
                    type="button"
                    onClick={() => onForgeWhisper(r.playerName, a)}
                    aria-label={`Forge this answer into a whisper for ${r.playerName}`}
                    title="Forge into a sealed whisper"
                    className="text-sm flex-shrink-0 inline-flex items-center justify-center gap-0.5"
                    style={{ background: 'none', border: 'none', color: C.sea, minWidth: 44, minHeight: 44, cursor: 'pointer' }}
                  >
                    <Icon name="envelope" size={16} />
                    <Spark size={10} />
                  </button>
                </div>
              </div>
            )
          })}
        </Section>
      ))}
    </div>
  )
}

// ------------------------------------------------------------- Lost Things

function LostSection({ store, roster }: { store: Store; roster: RosterEntry[] }) {
  const withCharacter = roster.filter((r) => r.characterId)
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>Lost Things</H>
      <p className="text-sm mb-3" style={{ color: C.faint }}>
        Never visible to players. Taken · what they believe · the truth.
      </p>
      {withCharacter.length === 0 && (
        <p style={{ color: C.faint }}>No characters forged yet — nothing to steal.</p>
      )}
      {withCharacter.map((r) => (
        <LostThingCard key={r.characterId} store={store} entry={r} />
      ))}
    </div>
  )
}

function LostThingCard({ store, entry }: { store: Store; entry: RosterEntry }) {
  const characterId = entry.characterId!
  const [lost, setLost] = useState<LostThing>({ characterId, taken: '', believed: '', truth: '' })
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const l = await store.getLostThings(characterId)
      if (!cancelled) {
        if (l) setLost(l)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [store, characterId])

  const save = () => void store.saveLostThings(lost)

  if (!loaded) return null
  return (
    <Section>
      <p style={{ ...display, fontSize: 20, fontWeight: 700, color: C.gold }}>
        {entry.character?.build.name ?? entry.playerName}
        <span className="text-sm font-normal" style={{ color: C.faint }}>
          {' '}
          · {entry.playerName}
        </span>
      </p>
      {entry.quiz?.answers.recover && (
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          Their answer, for reference: <em>“{entry.quiz.answers.recover}”</em>
        </p>
      )}
      <div className="grid gap-2 mt-2">
        <label className="grid gap-1">
          <span className="text-xs" style={{ color: C.sea }}>
            What was taken
          </span>
          <TextArea rows={2} value={lost.taken} onChange={(v) => setLost({ ...lost, taken: v })} onBlur={save} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs" style={{ color: C.sea }}>
            What they believe happened
          </span>
          <TextArea rows={2} value={lost.believed} onChange={(v) => setLost({ ...lost, believed: v })} onBlur={save} />
        </label>
        <label className="grid gap-1">
          <span className="text-xs" style={{ color: C.sea }}>
            What actually happened
          </span>
          <TextArea rows={2} value={lost.truth} onChange={(v) => setLost({ ...lost, truth: v })} onBlur={save} />
        </label>
      </div>
    </Section>
  )
}

// ------------------------------------------------------------ Session notes

const EMPTY_NOTE = (n: number): SessionNote => ({
  id: crypto.randomUUID(),
  sessionNumber: n,
  whatHappened: '',
  cluesFound: '',
  cluesMissed: '',
  npcsMet: '',
  threadsOpen: '',
})

function NotesSection({ store }: { store: Store }) {
  const [notes, setNotes] = useState<SessionNote[]>([])
  const [editing, setEditing] = useState<SessionNote | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const n = await store.listSessionNotes()
      if (!cancelled) setNotes(n)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const save = async (n: SessionNote) => {
    await store.saveSessionNote(n)
    setNotes(await store.listSessionNotes())
  }

  if (editing) {
    const set = (patch: Partial<SessionNote>) => setEditing({ ...editing, ...patch })
    const fields: [keyof SessionNote, string][] = [
      ['whatHappened', 'What happened'],
      ['cluesFound', 'Clues found'],
      ['cluesMissed', 'Clues missed'],
      ['npcsMet', 'NPCs met'],
      ['threadsOpen', 'Threads open'],
    ]
    return (
      <div style={{ animation: 'cardRise .4s ease-out' }}>
        <H>Session {editing.sessionNumber}</H>
        {fields.map(([key, label]) => (
          <label key={key} className="grid gap-1 mt-3">
            <span className="text-xs" style={{ color: C.sea }}>
              {label}
            </span>
            <TextArea rows={3} value={editing[key] as string} onChange={(v) => set({ [key]: v })} />
          </label>
        ))}
        <Btn
          onClick={() => {
            void save(editing)
            setEditing(null)
          }}
        >
          Save session {editing.sessionNumber}
        </Btn>
        <Btn secondary onClick={() => setEditing(null)}>
          Back without saving
        </Btn>
      </div>
    )
  }

  const nextNumber = notes.length ? Math.max(...notes.map((n) => n.sessionNumber)) + 1 : 1
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>Session notes</H>
      {notes.length === 0 && (
        <p className="mt-2" style={{ color: C.faint }}>
          The book's pages are blank. Session 1 awaits.
        </p>
      )}
      {notes.map((n) => (
        <Section key={n.id}>
          <div className="flex items-center justify-between">
            <p style={{ ...display, fontSize: 20, fontWeight: 700 }}>Session {n.sessionNumber}</p>
            <button
              type="button"
              onClick={() => setEditing(n)}
              className="text-sm underline"
              style={{ color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
            >
              open
            </button>
          </div>
          {n.whatHappened && (
            <p className="text-sm" style={{ color: C.faint }}>
              {n.whatHappened.slice(0, 140)}
              {n.whatHappened.length > 140 ? '…' : ''}
            </p>
          )}
        </Section>
      ))}
      <Btn onClick={() => setEditing(EMPTY_NOTE(nextNumber))}>+ New session note</Btn>
    </div>
  )
}

// -------------------------------------------------------------------- NPCs

const EMPTY_NPC = (): Npc => ({
  id: crypto.randomUUID(),
  name: '',
  pronunciation: '',
  trait: '',
  motivation: '',
  secret: '',
  connection: '',
})

function NpcSection({ store }: { store: Store }) {
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<Npc | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const n = await store.listNpcs()
      if (!cancelled) setNpcs(n)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const save = async (n: Npc) => {
    await store.saveNpc(n)
    setNpcs(await store.listNpcs())
  }
  const remove = async (id: string) => {
    if (!window.confirm('Strike this soul from the book?')) return
    await store.deleteNpc(id)
    setNpcs(await store.listNpcs())
    setEditing(null)
  }

  if (editing) {
    const set = (patch: Partial<Npc>) => setEditing({ ...editing, ...patch })
    const fields: [keyof Npc, string, string][] = [
      ['name', 'Name', 'Zybilna, Mister Witch…'],
      ['pronunciation', 'Pronunciation', 'zih-BILL-nah'],
      ['trait', 'One performable trait', 'Speaks only in questions'],
      ['motivation', 'Motivation', 'What do they want?'],
      ['secret', 'Secret', 'What are they hiding?'],
      ['connection', 'Connection to the mystery', 'How do they touch the Lost Things?'],
    ]
    return (
      <div style={{ animation: 'cardRise .4s ease-out' }}>
        <H>{editing.name || 'A new face at the carnival'}</H>
        {fields.map(([key, label, ph]) => (
          <label key={key} className="grid gap-1 mt-3">
            <span className="text-xs" style={{ color: C.sea }}>
              {label}
            </span>
            <TextInput value={editing[key] as string} onChange={(v) => set({ [key]: v })} placeholder={ph} />
          </label>
        ))}
        <Btn
          onClick={() => {
            if (!editing.name.trim()) return
            void save(editing)
            setEditing(null)
          }}
          disabled={!editing.name.trim()}
        >
          Save NPC
        </Btn>
        <Btn secondary onClick={() => setEditing(null)}>
          Back
        </Btn>
        <Btn secondary onClick={() => void remove(editing.id)}>
          Delete
        </Btn>
      </div>
    )
  }

  const filtered = npcs.filter((n) =>
    [n.name, n.trait, n.motivation, n.connection].join(' ').toLowerCase().includes(query.toLowerCase()),
  )
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>NPC cards</H>
      <div className="mt-2">
        <TextInput value={query} onChange={setQuery} placeholder="Search names, traits, motivations…" />
      </div>
      <div className="grid gap-3 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
        {filtered.map((n) => (
          <Section key={n.id} style={{ marginBottom: 0 }}>
            <div className="flex items-center justify-between">
              <p style={{ ...display, fontSize: 20, fontWeight: 700, color: C.gold }}>{n.name}</p>
              <button
                type="button"
                onClick={() => setEditing(n)}
                className="text-sm underline"
                style={{ color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
              >
                edit
              </button>
            </div>
            {n.pronunciation && (
              <p className="text-xs" style={{ color: C.faint }}>
                “{n.pronunciation}”
              </p>
            )}
            {n.trait && (
              <p className="text-sm mt-1 flex items-start gap-1.5">
                <Icon name="mask" size={14} style={{ color: C.brassDim, marginTop: 3 }} /> <span>{n.trait}</span>
              </p>
            )}
            {n.motivation && (
              <p className="text-sm flex items-start gap-1.5">
                <Spark size={12} style={{ color: C.gold, marginTop: 4 }} /> <span>{n.motivation}</span>
              </p>
            )}
            {n.secret && (
              <p className="text-sm flex items-start gap-1.5" style={{ color: C.faint }}>
                <Icon name="lost" size={14} style={{ marginTop: 3 }} /> <span>{n.secret}</span>
              </p>
            )}
            {n.connection && (
              <p className="text-xs mt-1 flex items-start gap-1.5" style={{ color: C.sea }}>
                <Icon name="arrow" size={12} style={{ marginTop: 3 }} /> <span>{n.connection}</span>
              </p>
            )}
          </Section>
        ))}
      </div>
      {filtered.length === 0 && (
        <p className="mt-3" style={{ color: C.faint }}>
          {npcs.length === 0 ? 'No one in the book yet.' : 'No match in the book.'}
        </p>
      )}
      <Btn onClick={() => setEditing(EMPTY_NPC())}>+ Quick-add NPC</Btn>
    </div>
  )
}

// ------------------------------------------------------------------- Clues

const EMPTY_CLUE = (): Clue => ({
  id: crypto.randomUUID(),
  conclusion: '',
  clues: [
    { text: '', found: false },
    { text: '', found: false },
    { text: '', found: false },
  ],
})

function ClueSection({ store }: { store: Store }) {
  const [clues, setClues] = useState<Clue[]>([])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const c = await store.listClues()
      if (!cancelled) setClues(c)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const update = (c: Clue) => {
    setClues(clues.map((x) => (x.id === c.id ? c : x)))
  }
  const persist = (c: Clue) => void store.saveClue(c)
  const add = async () => {
    const c = EMPTY_CLUE()
    setClues([...clues, c])
    await store.saveClue(c)
  }
  const remove = async (id: string) => {
    if (!window.confirm('Burn this line of investigation?')) return
    await store.deleteClue(id)
    setClues(await store.listClues())
  }

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>The three-clue ledger</H>
      <p className="text-sm mb-3" style={{ color: C.faint }}>
        For every conclusion the players must reach, three ways to reach it. Tick clues as the
        table finds them.
      </p>
      {clues.map((c) => (
        <Section key={c.id}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex-1">
              <span className="text-xs" style={{ color: C.sea }}>
                Conclusion
              </span>
              <TextInput
                value={c.conclusion}
                onChange={(v) => update({ ...c, conclusion: v })}
                placeholder="What must they figure out?"
              />
            </div>
            <button
              type="button"
              onClick={() => void remove(c.id)}
              aria-label="Delete this conclusion"
              style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, minWidth: 44, cursor: 'pointer' }}
            >
              <Icon name="cross" size={16} />
            </button>
          </div>
          {c.clues.map((cl, i) => (
            <div key={i} className="flex items-center gap-2 mt-2">
              <button
                type="button"
                role="checkbox"
                aria-checked={cl.found}
                aria-label={`Clue ${i + 1} found`}
                onClick={() => {
                  const next = {
                    ...c,
                    clues: c.clues.map((x, j) => (j === i ? { ...x, found: !x.found } : x)) as Clue['clues'],
                  }
                  update(next)
                  persist(next)
                }}
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  ...(cl.found ? seaLit : { ...wellSurface, border: `1px dashed ${C.brassDim}` }),
                  fontSize: 18,
                  fontWeight: 700,
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
              >
                {cl.found ? '✓' : ''}
              </button>
              <div className="flex-1">
                <TextInput
                  value={cl.text}
                  onChange={(v) =>
                    update({ ...c, clues: c.clues.map((x, j) => (j === i ? { ...x, text: v } : x)) as Clue['clues'] })
                  }
                  placeholder={`Clue ${i + 1}`}
                />
              </div>
            </div>
          ))}
          <div className="mt-2 text-right">
            <button
              type="button"
              onClick={() => persist(c)}
              className="text-sm underline"
              style={{ color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
            >
              save changes
            </button>
          </div>
        </Section>
      ))}
      <Btn onClick={() => void add()}>+ New conclusion</Btn>
    </div>
  )
}
