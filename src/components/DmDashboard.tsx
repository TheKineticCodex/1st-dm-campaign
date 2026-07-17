// Phase 2 — the DM Dashboard (spec §5). DM-code-gated; mobile-friendly,
// optimized for iPad. Six sections: Roster · Vault · Lost Things · Notes ·
// NPCs · Clues. All components live at module level.

import { useEffect, useMemo, useState } from 'react'
import { QUIZ } from '../data/quiz'
import { fmt, mod } from '../data/rules'
import { computeSheet, skillMod } from '../lib/compute'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'
import { getStore, type RosterEntry, type Store } from '../lib/store'
import type { Clue, LostThing, Npc, SessionNote } from '../types'
import { TableSection } from './TableSection'
import { Btn, C, H, Section, TextArea, TextInput, body, display } from './ui'

type DmSection = 'roster' | 'vault' | 'lost' | 'notes' | 'npcs' | 'clues' | 'table'

const SECTIONS: [DmSection, string][] = [
  ['roster', 'Roster'],
  ['vault', 'Vault'],
  ['lost', 'Lost Things'],
  ['notes', 'Notes'],
  ['npcs', 'NPCs'],
  ['clues', 'Clues'],
  ['table', 'Table ⚔'],
]

interface DmDashboardProps {
  session: DeviceSession
  onLeave: () => void
}

export function DmDashboard({ session, onLeave }: DmDashboardProps) {
  const store = useMemo(() => getStore(session), [session])
  const [section, setSection] = useState<DmSection>('roster')
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const r = await store.listRoster()
      if (!cancelled) {
        setRoster(r)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const refreshRoster = async () => setRoster(await store.listRoster())

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
          <button
            type="button"
            onClick={handleLeave}
            className="text-xs"
            style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            leave
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: C.faint }}>
          Dungeon Master view · {store.shared ? 'campaign-wide' : 'offline — showing this device only'}
        </p>

        {!loaded ? (
          <p style={{ color: C.faint }}>The book is opening…</p>
        ) : (
          <>
            {section === 'roster' && <RosterSection roster={roster} onRefresh={refreshRoster} />}
            {section === 'vault' && <VaultSection roster={roster} />}
            {section === 'lost' && <LostSection store={store} roster={roster} />}
            {section === 'notes' && <NotesSection store={store} />}
            {section === 'npcs' && <NpcSection store={store} />}
            {section === 'clues' && <ClueSection store={store} />}
            {section === 'table' && <TableSection store={store} roster={roster} />}
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
        <div className="flex w-full" style={{ maxWidth: 900 }}>
          {SECTIONS.map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setSection(id)}
              className="flex-1 py-3 text-center text-xs"
              style={{ color: section === id ? C.gold : C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
              aria-current={section === id ? 'page' : undefined}
            >
              {label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

// ------------------------------------------------------------------ Roster

function RosterSection({ roster, onRefresh }: { roster: RosterEntry[]; onRefresh: () => void }) {
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
                  <p style={{ ...display, fontSize: 22, fontWeight: 700 }}>{r.character.build.name}</p>
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
                  {r.character.state.conditions.length > 0 && (
                    <p className="text-xs mt-2" style={{ color: C.gold }}>
                      {r.character.state.conditions.join(' · ')}
                    </p>
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

function VaultSection({ roster }: { roster: RosterEntry[] }) {
  const withQuiz = roster.filter((r) => r.quiz)
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>The quiz vault</H>
      <p className="text-sm mb-3" style={{ color: C.faint }}>
        Raw material for each Lost Thing. The two questions that matter most burn gold.
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
                <p className="text-sm" style={{ color: C.parchment }}>
                  → {a}
                </p>
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
