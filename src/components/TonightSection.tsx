// ⚑ Tonight — the MacBook control room for a live session: the party at a
// glance, the branching story timeline (advance it as the table chooses),
// and the stage controls that drive what the iPad shows.

import { useEffect, useRef, useState } from 'react'
import { seedStory } from '../data/storySeeds'
import { computeSheet } from '../lib/compute'
import { joinTableChannel, type TableChannel } from '../lib/realtime'
import type { RosterEntry, Store } from '../lib/store'
import type { StageState, StageToken, StoryNode } from '../types'
import { Btn, C, Eyebrow, H, TextArea, TextInput, display } from './ui'

const TOKEN_COLORS = [C.sea, C.gold, '#C08BE0', '#E08BA8', '#C96A6A', '#8BB8E0']

const EMPTY_STAGE: StageState = { mode: 'ambient', mapUrl: null, tokens: [] }

export function TonightSection({ store, roster }: { store: Store; roster: RosterEntry[] }) {
  const channelRef = useRef<TableChannel | null>(null)

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

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>Tonight</H>
      <PartyStrip roster={roster} />
      <div
        className="grid gap-3 mt-3"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', alignItems: 'start' }}
      >
        <StoryTimeline store={store} />
        <StageControls store={store} roster={roster} channelRef={channelRef} />
      </div>
    </div>
  )
}

// -------------------------------------------------------------- party strip

function PartyStrip({ roster }: { roster: RosterEntry[] }) {
  return (
    <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
      {roster
        .filter((r) => r.character)
        .map((r) => {
          const sheet = computeSheet(r.character!.build)
          if (!sheet) return null
          const hp = Math.max(0, sheet.hpMax - r.character!.state.damage)
          const hpPct = (hp / sheet.hpMax) * 100
          return (
            <div key={r.playerId} className="rounded-xl p-3 flex gap-3 items-center" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
              {r.character!.build.portraitUrl ? (
                <img src={r.character!.build.portraitUrl} alt="" style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${C.gold}`, flexShrink: 0 }} />
              ) : (
                <span aria-hidden="true" style={{ fontSize: 28 }}>❖</span>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p className="text-sm" style={{ ...display, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.character!.build.name}
                </p>
                <div className="rounded-full mt-1" style={{ height: 6, background: C.night, overflow: 'hidden' }}>
                  <div style={{ width: `${hpPct}%`, height: '100%', background: hpPct > 50 ? C.sea : hpPct > 25 ? C.gold : '#C96A6A' }} />
                </div>
                <p className="text-xs mt-1" style={{ color: C.faint }}>
                  {hp}/{sheet.hpMax} hp · AC {sheet.ac.val}
                  {r.character!.state.conditions.length > 0 && (
                    <span style={{ color: C.gold }}> · {r.character!.state.conditions.join(', ')}</span>
                  )}
                </p>
              </div>
            </div>
          )
        })}
      {roster.filter((r) => r.character).length === 0 && (
        <p className="text-sm" style={{ color: C.faint }}>
          The party appears here as characters are forged.
        </p>
      )}
    </div>
  )
}

// ----------------------------------------------------------- story timeline

const STATUS_STYLE: Record<StoryNode['status'], { border: string; opacity: number }> = {
  done: { border: '#4a3d78', opacity: 0.55 },
  current: { border: '#E8B84B', opacity: 1 },
  possible: { border: '#3A2C66', opacity: 0.85 },
  skipped: { border: '#3A2C66', opacity: 0.35 },
}

function StoryTimeline({ store }: { store: Store }) {
  const [nodes, setNodes] = useState<StoryNode[]>([])
  const [loaded, setLoaded] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [editing, setEditing] = useState<StoryNode | null>(null)

  const reload = async () => setNodes(await store.listStory())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const n = await store.listStory()
      if (!cancelled) {
        setNodes(n)
        setLoaded(true)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const advanceTo = async (target: StoryNode) => {
    const current = nodes.find((n) => n.status === 'current')
    if (current && current.id !== target.id) await store.saveStoryNode({ ...current, status: 'done' })
    await store.saveStoryNode({ ...target, status: 'current' })
    await reload()
  }

  const byId = new Map(nodes.map((n) => [n.id, n]))
  const acts = [...new Set(nodes.map((n) => n.act))].sort((a, b) => a - b)

  return (
    <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
      <Eyebrow>The story — where they are, and every road ahead</Eyebrow>
      {loaded && nodes.length === 0 && (
        <>
          <p className="text-sm mt-1" style={{ color: C.faint }}>
            The timeline is unwritten. Lay "The Song the Sea Forgot" — Act 1 in full, with the
            Three Gates branching into prepared roads — then bend it however you like.
          </p>
          <Btn
            shimmer
            disabled={seeding}
            onClick={async () => {
              setSeeding(true)
              await seedStory(store)
              await reload()
              setSeeding(false)
            }}
          >
            {seeding ? 'The tide writes…' : 'Lay the story of the Sea ✦'}
          </Btn>
        </>
      )}

      {acts.map((act) => (
        <div key={act} className="mt-3">
          <p className="text-xs uppercase tracking-widest mb-2" style={{ color: C.sea, letterSpacing: '0.2em' }}>
            Act {act}
          </p>
          {nodes
            .filter((n) => n.act === act)
            .map((n) => {
              const s = STATUS_STYLE[n.status]
              return (
                <div
                  key={n.id}
                  className="rounded-lg p-3 mb-2"
                  style={{
                    background: C.night,
                    border: `1px solid ${s.border}`,
                    opacity: s.opacity,
                    boxShadow: n.status === 'current' ? `0 0 16px ${C.gold}44` : 'none',
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm" style={{ ...display, fontSize: 16, fontWeight: 600, color: n.status === 'current' ? C.gold : C.parchment }}>
                      {n.status === 'done' ? '✓ ' : n.status === 'current' ? '➤ ' : ''}
                      {n.title}
                    </p>
                    <span className="flex gap-1 flex-shrink-0">
                      {n.status !== 'current' && (
                        <button
                          type="button"
                          onClick={() => void advanceTo(n)}
                          className="text-xs rounded px-2"
                          title="Make this the current beat"
                          style={{ background: 'transparent', border: `1px solid ${C.panelEdge}`, color: C.sea, minHeight: 30, cursor: 'pointer' }}
                        >
                          go here
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(n)}
                        className="text-xs rounded px-2"
                        style={{ background: 'transparent', border: `1px solid ${C.panelEdge}`, color: C.faint, minHeight: 30, cursor: 'pointer' }}
                      >
                        edit
                      </button>
                    </span>
                  </div>
                  {(n.status === 'current' || n.branches.length > 0) && (
                    <p className="text-xs mt-1" style={{ color: C.faint, whiteSpace: 'pre-wrap' }}>
                      {n.summary}
                    </p>
                  )}
                  {n.branches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {n.branches.map((b) => (
                        <button
                          key={b.toId}
                          type="button"
                          onClick={() => {
                            const target = byId.get(b.toId)
                            if (target && window.confirm(`They chose: ${b.label}?`)) void advanceTo(target)
                          }}
                          className="text-xs rounded-md px-2 py-1"
                          style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}`, color: C.gold, minHeight: 32, cursor: 'pointer' }}
                        >
                          ⑂ {b.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      ))}

      {nodes.length > 0 && (
        <Btn
          secondary
          onClick={() => {
            const act = Math.max(...nodes.map((n) => n.act))
            const ord = Math.max(...nodes.filter((n) => n.act === act).map((n) => n.ord)) + 1
            setEditing({ id: crypto.randomUUID(), act, ord, title: '', summary: '', status: 'possible', branches: [] })
          }}
        >
          + a new beat
        </Btn>
      )}

      {editing && (
        <div className="rounded-lg p-3 mt-2" style={{ background: C.night, border: `1px solid ${C.sea}` }}>
          <TextInput value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Beat title" />
          <div className="mt-2">
            <TextArea rows={4} value={editing.summary} onChange={(v) => setEditing({ ...editing, summary: v })} placeholder="What happens here — notes to yourself" />
          </div>
          <div className="flex gap-2 mt-1">
            <Btn
              onClick={async () => {
                if (!editing.title.trim()) return
                await store.saveStoryNode(editing)
                setEditing(null)
                await reload()
              }}
            >
              Keep it
            </Btn>
            <Btn secondary onClick={() => setEditing(null)}>
              Never mind
            </Btn>
            <Btn
              secondary
              onClick={async () => {
                if (!window.confirm('Tear this page out?')) return
                await store.deleteStoryNode(editing.id)
                setEditing(null)
                await reload()
              }}
            >
              Delete
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// ----------------------------------------------------------- stage controls

function StageControls({
  store,
  roster,
  channelRef,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
}) {
  const [stage, setStage] = useState<StageState>(EMPTY_STAGE)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<string | null>(null)
  const lastSent = useRef(0)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await store.getStage()
      if (!cancelled && s && s.mode) setStage(s)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const push = (next: StageState, throttled = false) => {
    setStage(next)
    const now = Date.now()
    if (!throttled || now - lastSent.current > 100) {
      lastSent.current = now
      channelRef.current?.sendStage(next)
    }
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => void store.saveStage(next), 800)
  }

  const summonParty = () => {
    const existing = new Set(stage.tokens.map((t) => t.id))
    const added: StageToken[] = roster
      .filter((r) => r.character && !existing.has(`pc-${r.playerId}`))
      .map((r, i) => ({
        id: `pc-${r.playerId}`,
        label: (r.character!.build.name || r.playerName).slice(0, 2),
        color: TOKEN_COLORS[(stage.tokens.length + i) % TOKEN_COLORS.length],
        x: 0.12 + i * 0.08,
        y: 0.88,
      }))
    push({ ...stage, tokens: [...stage.tokens, ...added] })
  }

  const move = (e: React.PointerEvent) => {
    if (!dragging.current || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    push({ ...stage, tokens: stage.tokens.map((t) => (t.id === dragging.current ? { ...t, x, y } : t)) }, true)
  }

  return (
    <div className="rounded-xl p-4" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
      <Eyebrow>The stage — what the iPad shows the table</Eyebrow>
      {!store.shared && (
        <p className="text-xs mt-1" style={{ color: C.gold }}>
          The stage needs the campaign lantern (Supabase) to reach the iPad.
        </p>
      )}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => push({ ...stage, mode: 'ambient' })}
          className="flex-1 rounded-md py-2 text-sm"
          style={{ background: stage.mode === 'ambient' ? C.gold : C.night, color: stage.mode === 'ambient' ? C.ink : C.faint, border: `1px solid ${C.panelEdge}`, minHeight: 44, cursor: 'pointer' }}
        >
          🕯 Ambient
        </button>
        <button
          type="button"
          onClick={() => push({ ...stage, mode: 'map' })}
          disabled={!stage.mapUrl}
          className="flex-1 rounded-md py-2 text-sm"
          style={{ background: stage.mode === 'map' ? C.gold : C.night, color: stage.mode === 'map' ? C.ink : C.faint, border: `1px solid ${C.panelEdge}`, minHeight: 44, cursor: stage.mapUrl ? 'pointer' : 'not-allowed', opacity: stage.mapUrl ? 1 : 0.5 }}
        >
          🗺 Map
        </button>
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={async (e) => {
          const f = e.target.files?.[0]
          if (!f) return
          setUploading(true)
          const url = await store.uploadMapImage(f)
          setUploading(false)
          if (url) push({ ...stage, mapUrl: url, mode: 'map' })
        }}
      />
      <Btn secondary onClick={() => fileRef.current?.click()} disabled={uploading}>
        {uploading ? 'The map is sailing up…' : stage.mapUrl ? 'Change the map image' : 'Upload a map image'}
      </Btn>

      {stage.mapUrl && (
        <>
          <div
            ref={boardRef}
            onPointerMove={move}
            onPointerUp={() => (dragging.current = null)}
            onPointerLeave={() => (dragging.current = null)}
            className="relative w-full rounded-lg overflow-hidden select-none mt-2"
            style={{ border: `1px solid ${C.panelEdge}`, touchAction: 'none' }}
          >
            <img src={stage.mapUrl} alt="Stage map" className="w-full block" draggable={false} />
            {stage.tokens.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Token ${t.label}`}
                onPointerDown={(e) => {
                  dragging.current = t.id
                  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
                }}
                onPointerUp={() => (dragging.current = null)}
                className="absolute rounded-full font-bold flex items-center justify-center"
                style={{
                  left: `${t.x * 100}%`,
                  top: `${t.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 34,
                  height: 34,
                  background: t.color,
                  color: C.ink,
                  border: `2px solid ${C.night}`,
                  cursor: 'grab',
                  touchAction: 'none',
                  fontSize: 12,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 mt-2">
            <Btn secondary onClick={summonParty}>
              + party tokens
            </Btn>
            <Btn
              secondary
              onClick={() => {
                const n = stage.tokens.filter((t) => t.id.startsWith('foe-')).length + 1
                push({ ...stage, tokens: [...stage.tokens, { id: `foe-${crypto.randomUUID()}`, label: `E${n}`, color: '#C96A6A', x: 0.5, y: 0.12 }] })
              }}
            >
              + enemy
            </Btn>
            <Btn
              secondary
              onClick={() => {
                if (window.confirm('Clear all tokens?')) push({ ...stage, tokens: [] })
              }}
            >
              clear
            </Btn>
          </div>
        </>
      )}
      <p className="text-xs mt-2" style={{ color: C.faint }}>
        Every move you make here appears on the iPad within a breath. On the iPad, tap 🎭 in the
        header to enter stage mode.
      </p>
    </div>
  )
}
