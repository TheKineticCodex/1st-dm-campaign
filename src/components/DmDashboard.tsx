// Phase 2 — the DM Dashboard (spec §5). DM-code-gated; mobile-friendly,
// optimized for iPad. Six sections: Roster · Vault · Lost Things · Notes ·
// NPCs · Clues. All components live at module level.

import { useEffect, useMemo, useRef, useState } from 'react'
import { QUIZ } from '../data/quiz'
import { CONDITIONS, fmt, mod } from '../data/rules'
import { computeSheet, skillMod } from '../lib/compute'
import { joinTableChannel, type TableChannel } from '../lib/realtime'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'
import { PARTY_SIZE } from '../data/campaign'
import { getStore, type RosterEntry, type Store } from '../lib/store'
import type { Clue, LostThing, Npc, SessionNote } from '../types'
import { TableSection } from './TableSection'
import { Btn, C, CalmToggle, Eyebrow, H, Section, TextArea, TextInput, body, display } from './ui'

type DmSection = 'home' | 'roster' | 'vault' | 'lost' | 'notes' | 'npcs' | 'clues' | 'table'

const SECTIONS: [DmSection, string, string][] = [
  ['home', '✦', 'Book'],
  ['roster', '❖', 'Roster'],
  ['vault', '☾', 'Vault'],
  ['lost', '🔒', 'Lost'],
  ['notes', '✎', 'Notes'],
  ['npcs', '🎭', 'NPCs'],
  ['clues', '🕯', 'Clues'],
  ['table', '⚔', 'Table'],
]

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
  const [section, setSection] = useState<DmSection>('home')
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loaded, setLoaded] = useState(false)
  const [whisperPrefill, setWhisperPrefill] = useState<WhisperPrefill | null>(null)

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

  const forgeWhisper = (target: string, quote: string) => {
    setWhisperPrefill({
      target,
      title: 'The lanterns remember',
      body: `You once told the lanterns: “${quote}”\n\n`,
    })
    setSection('table')
  }

  const handleLeave = () => {
    if (window.confirm('Hang up the lantern-keeper’s coat? (You can sign back in with the DM code.)')) {
      clearDeviceSession()
      onLeave()
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: `radial-gradient(1200px 600px at 50% -10%, #2B1E55 0%, ${C.night} 55%)`,
        ...body,
        color: C.parchment,
      }}
      className="flex flex-col items-center px-4 pt-4 pb-24"
    >
      <div className="w-full" style={{ maxWidth: 900 }}>
        <div className="flex items-center justify-between mb-1">
          <h1 style={{ ...display, fontSize: 28, fontWeight: 700, color: C.gold }}>
            ✦ The Lantern-Keeper's Book
          </h1>
          <span className="flex items-center gap-3">
            <CalmToggle />
            <button
              type="button"
              onClick={handleLeave}
              className="text-xs"
              style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
            >
              leave
            </button>
          </span>
        </div>
        <p className="text-xs mb-4" style={{ color: C.faint }}>
          Dungeon Master view · {store.shared ? 'campaign-wide' : 'offline — showing this device only'}
        </p>

        {!loaded ? (
          <p style={{ color: C.faint }}>The book is opening…</p>
        ) : (
          <>
            {section === 'home' && (
              <HomeSection store={store} roster={roster} onGo={setSection} onRefresh={refreshRoster} />
            )}
            {section === 'roster' && <RosterSection roster={roster} onRefresh={refreshRoster} store={store} />}
            {section === 'vault' && <VaultSection roster={roster} onForgeWhisper={forgeWhisper} />}
            {section === 'lost' && <LostSection store={store} roster={roster} />}
            {section === 'notes' && <NotesSection store={store} />}
            {section === 'npcs' && <NpcSection store={store} />}
            {section === 'clues' && <ClueSection store={store} />}
            {section === 'table' && (
              <TableSection store={store} roster={roster} whisperPrefill={whisperPrefill} />
            )}
          </>
        )}
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-center"
        style={{
          background: `${C.night}F2`,
          borderTop: `1px solid ${C.panelEdge}`,
          backdropFilter: 'blur(8px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 50,
        }}
        aria-label="DM sections"
      >
        <div className="flex w-full overflow-x-auto" style={{ maxWidth: 900 }}>
          {SECTIONS.map(([id, glyph, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className="flex-1 py-2 text-center text-xs"
              style={{
                color: section === id ? C.gold : C.faint,
                background: 'none',
                border: 'none',
                minHeight: 44,
                minWidth: 64,
                cursor: 'pointer',
              }}
              aria-current={section === id ? 'page' : undefined}
            >
              <span className="block" aria-hidden="true" style={{ fontSize: 15 }}>
                {glyph}
              </span>
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// -------------------------------------------------------------------- Home

function HomeSection({
  store,
  roster,
  onGo,
  onRefresh,
}: {
  store: Store
  roster: RosterEntry[]
  onGo: (s: DmSection) => void
  onRefresh: () => void
}) {
  const [counts, setCounts] = useState<{ clues: number; npcs: number; notes: number } | null>(null)
  const [seeding, setSeeding] = useState(false)
  const [seeded, setSeeded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [clues, npcs, notes] = await Promise.all([store.listClues(), store.listNpcs(), store.listSessionNotes()])
      if (!cancelled) setCounts({ clues: clues.length, npcs: npcs.length, notes: notes.length })
    })()
    return () => {
      cancelled = true
    }
  }, [store, seeded])

  const activeBargains = roster.flatMap((r) => r.character?.notes.bargains ?? []).filter(
    (b) => b.status === 'sealed' || b.status === 'offered',
  ).length

  const seedBook = async () => {
    setSeeding(true)
    const { SEED_CLUES, SEED_NPCS } = await import('../data/witchlightSeeds')
    for (const c of SEED_CLUES) await store.saveClue({ ...c, id: crypto.randomUUID() })
    for (const n of SEED_NPCS) await store.saveNpc({ ...n, id: crypto.randomUUID() })
    setSeeding(false)
    setSeeded(true)
  }

  // One chair per protagonist, always — the Equal Protagonists rule
  // made visible. Extra joiners beyond the configured seats still show.
  const seatCount = Math.max(PARTY_SIZE, roster.length)
  const seats = Array.from({ length: seatCount }, (_, i) => roster[i] ?? null)

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>The Book opens</H>

      <Section style={{ marginTop: 12 }}>
        <div className="flex items-center justify-between">
          <p className="uppercase text-xs tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
            The {PARTY_SIZE === 4 ? 'four' : `${PARTY_SIZE}`} chairs
          </p>
          <button
            type="button"
            onClick={onRefresh}
            className="text-xs underline"
            style={{ color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            look again
          </button>
        </div>
        <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))' }}>
          {seats.map((r, i) => (
            <div
              key={r?.playerId ?? `empty-${i}`}
              className="rounded-xl p-3 text-center"
              style={{
                background: C.night,
                border: `1px dashed ${r ? C.gold : C.panelEdge}`,
                borderStyle: r ? 'solid' : 'dashed',
              }}
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
                    <span className="block" style={{ fontSize: 26 }} aria-hidden="true">
                      {r.character ? '❖' : '☾'}
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
                  <span className="block" style={{ fontSize: 26, opacity: 0.4 }} aria-hidden="true">
                    ✦
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
      </Section>

      <div className="grid grid-cols-2 gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
        {[
          ['vault' as DmSection, '☾ Vault', `${roster.filter((r) => r.quiz).length} divinations kept`],
          ['clues' as DmSection, '🕯 Clue paths', counts ? `${counts.clues} conclusions tracked` : '…'],
          ['npcs' as DmSection, '🎭 NPCs', counts ? `${counts.npcs} souls in the book` : '…'],
          ['notes' as DmSection, '✎ Sessions', counts ? `${counts.notes} nights recorded` : '…'],
          ['roster' as DmSection, '⚖ Bargains', `${activeBargains} in force`],
          ['table' as DmSection, '⚔ The Table', 'derby · dice · whispers · map'],
        ].map(([id, label, detail]) => (
          <button
            key={label as string}
            type="button"
            onClick={() => onGo(id as DmSection)}
            className="rounded-xl p-4 text-left"
            style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.parchment, cursor: 'pointer', minHeight: 44 }}
          >
            <p style={{ ...display, fontSize: 18, fontWeight: 600, color: C.gold }}>{label}</p>
            <p className="text-xs mt-1" style={{ color: C.faint }}>
              {detail}
            </p>
          </button>
        ))}
      </div>

      {counts !== null && counts.clues === 0 && !seeded && (
        <Section style={{ marginTop: 12, border: `1px solid ${C.sea}55` }}>
          <Eyebrow>Before the first night</Eyebrow>
          <p className="text-sm" style={{ color: C.parchment }}>
            The book can pre-thread the Witchlight long game for you: three clue paths worth
            tracking from Session 1 (the carnival's true power, the wording of wishes, who
            collects Lost Things) and four NPC cards including your homebrew merchant slot.
          </p>
          <Btn onClick={() => void seedBook()} disabled={seeding}>
            {seeding ? 'Threading the needle…' : 'Lay the Witchlight threads ✦'}
          </Btn>
        </Section>
      )}
      {seeded && (
        <p role="status" className="text-sm mt-3" style={{ color: C.sea }}>
          ✦ The threads are laid — see Clues and NPCs. Edit everything; it's your book.
        </p>
      )}
    </div>
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
    let cancelled = false
    ;(async () => {
      const id = await store.getChannelId()
      if (!cancelled) channelRef.current = joinTableChannel(id, {})
    })()
    return () => {
      cancelled = true
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
                  <div className="flex items-center gap-2">
                    {r.character.build.portraitUrl && (
                      <img
                        src={r.character.build.portraitUrl}
                        alt=""
                        style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${C.gold}` }}
                      />
                    )}
                    <p style={{ ...display, fontSize: 22, fontWeight: 700 }}>{r.character.build.name}</p>
                  </div>
                  <p className="text-xs mb-2" style={{ color: C.faint }}>
                    Level {sheet.level} {r.character.build.species} {r.character.build.klass} ·{' '}
                    {r.character.build.bg}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                    <span>
                      HP{' '}
                      <strong style={{ color: hp === 0 ? '#C96A6A' : C.parchment }}>
                        {hp}/{sheet.hpMax}
                      </strong>
                    </span>
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
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-2">
                    {r.character.state.conditions.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => sendCondition(r.playerName, c, false)}
                        className="text-xs rounded-md px-2 py-1"
                        style={{ background: C.night, color: C.gold, border: `1px solid ${C.gold}`, minHeight: 32, cursor: 'pointer' }}
                        title={`Lift ${c}`}
                      >
                        {c} ✕
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
                            style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 32, cursor: 'pointer' }}
                          >
                            {c}
                          </button>
                        ))}
                    </div>
                  )}
                  {(r.character.notes.bargains ?? []).length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs uppercase tracking-widest" style={{ color: C.gold, letterSpacing: '0.15em' }}>
                        ⚖ Bargains
                      </p>
                      {r.character.notes.bargains!.map((b) => (
                        <div key={b.id} className="flex items-center justify-between text-xs mt-1">
                          <span style={{ color: b.status === 'broken' ? '#C96A6A' : C.parchment }}>
                            {b.status === 'fulfilled' ? '✦ ' : b.status === 'broken' ? '💔 ' : ''}
                            {b.title}
                            <span style={{ color: C.faint }}> · {b.status}</span>
                          </span>
                          {b.status === 'sealed' && (
                            <span className="flex gap-1">
                              <button
                                type="button"
                                onClick={() => void resolveBargain(r.playerName, b, 'fulfilled')}
                                className="rounded px-2"
                                style={{ background: C.gold, color: C.ink, border: 'none', minHeight: 30, cursor: 'pointer' }}
                              >
                                fulfill
                              </button>
                              <button
                                type="button"
                                onClick={() => void resolveBargain(r.playerName, b, 'broken')}
                                className="rounded px-2"
                                style={{ background: '#3d2030', color: '#C96A6A', border: '1px solid #C96A6A', minHeight: 30, cursor: 'pointer' }}
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
                    <p className="text-xs mt-2" style={{ color: C.faint }}>
                      🔒 What they lost: <em style={{ color: C.parchment }}>{r.character.notes.lost}</em>
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
        Raw material for each Lost Thing — the gold ✦ questions most of all. The ✉ beside any
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
                <p className="text-xs" style={{ color: key ? C.gold : C.faint }}>
                  {key ? '✦ ' : ''}
                  {q.prompt}
                </p>
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm" style={{ color: C.parchment }}>
                    → {a}
                  </p>
                  <button
                    type="button"
                    onClick={() => onForgeWhisper(r.playerName, a)}
                    aria-label={`Forge this answer into a whisper for ${r.playerName}`}
                    title="Forge into a sealed whisper"
                    className="text-sm flex-shrink-0"
                    style={{ background: 'none', border: 'none', color: C.sea, minWidth: 40, minHeight: 40, cursor: 'pointer' }}
                  >
                    ✉✦
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
            {n.trait && <p className="text-sm mt-1">🎭 {n.trait}</p>}
            {n.motivation && <p className="text-sm">✦ {n.motivation}</p>}
            {n.secret && (
              <p className="text-sm" style={{ color: C.faint }}>
                🔒 {n.secret}
              </p>
            )}
            {n.connection && (
              <p className="text-xs mt-1" style={{ color: C.sea }}>
                ↪ {n.connection}
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
              ✕
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
                  border: `2px solid ${cl.found ? C.sea : C.panelEdge}`,
                  background: cl.found ? C.sea : 'transparent',
                  color: C.ink,
                  fontSize: 18,
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
