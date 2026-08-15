// 🧭 Run — the whole campaign as a walk: how to run it on one page, then
// every scene in order with its beats, the five doors, the players' threads,
// who they might fight (numbers included), and what carries forward.
// Marks "you are here" from the live story timeline; "make this the scene"
// moves the timeline so Tonight → Run the night follows.

import { useEffect, useMemo, useState } from 'react'
import { RUN_CAST, RUN_PRIMER, RUN_SCENES, type Battle, type Foe, type RunScene } from '../data/runbook'
import type { Store } from '../lib/store'
import type { StoryNode } from '../types'
import { Btn, C, Eyebrow, Fold, H, display } from './ui'

const ACT_NAMES: Record<number, string> = { 1: 'Act 1 — Saltmere and the Fair', 2: 'Act 2 — the Three Roads', 3: 'Act 3 — the Moon-Night' }

function FoeTable({ foes }: { foes: Foe[] }) {
  return (
    <div className="overflow-x-auto mt-2">
      <table className="text-xs" style={{ borderCollapse: 'collapse', width: '100%', minWidth: 640 }}>
        <thead>
          <tr style={{ color: C.sea, textAlign: 'left' }}>
            {['who', 'AC', 'HP', 'speed', 'attack', 'special', 'how it fights'].map((h) => (
              <th key={h} style={{ padding: '4px 8px', borderBottom: `1px solid ${C.panelEdge}`, fontWeight: 600, whiteSpace: 'nowrap' }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {foes.map((f, i) => (
            <tr key={i} style={{ verticalAlign: 'top', color: C.parchment }}>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, minWidth: 150 }}>
                <strong style={{ color: C.gold }}>{f.name}</strong>
                <br />
                <span style={{ color: C.faint }}>{f.look}</span>
                <br />
                <span style={{ color: C.faint, fontSize: 11 }}>{f.block}</span>
              </td>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, ...display, fontSize: 18, fontWeight: 700 }}>{f.ac}</td>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, ...display, fontSize: 18, fontWeight: 700 }}>{f.hp}</td>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, whiteSpace: 'nowrap' }}>{f.speed}</td>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, minWidth: 150 }}>{f.attack}</td>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, color: C.faint, minWidth: 150 }}>{f.special ?? '—'}</td>
              <td style={{ padding: '6px 8px', borderBottom: `1px solid ${C.panelEdge}44`, minWidth: 220 }}>{f.tactics}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function BattleCard({ b }: { b: Battle }) {
  return (
    <div className="rounded-lg px-3 py-3 mt-2" style={{ background: C.night, border: `1px solid ${b.major ? C.gold : C.panelEdge}`, boxShadow: b.major ? `0 0 18px ${C.gold}22` : 'none' }}>
      <div className="flex flex-wrap items-baseline gap-2">
        <span className="text-xs rounded-full px-2" style={{ border: `1px solid ${b.major ? C.gold : C.panelEdge}`, color: b.major ? C.gold : C.faint }}>
          {b.major ? '⚔ MAJOR BATTLE' : 'skirmish'} · {b.code}
        </span>
        <strong style={{ ...display, fontSize: 19, color: C.gold }}>{b.name}</strong>
        <span className="text-xs" style={{ color: C.faint }}>
          {b.when}
        </span>
      </div>
      <p className="text-sm mt-1" style={{ color: C.parchment }}>
        <span style={{ color: C.sea }}>force · </span>
        {b.force}
      </p>
      <p className="text-sm" style={{ color: C.parchment }}>
        <span style={{ color: C.sea }}>arena · </span>
        {b.arena}
      </p>
      <ul className="text-sm mt-1" style={{ color: C.parchment, paddingLeft: 18, listStyle: 'disc' }}>
        {b.tricks.map((t, i) => (
          <li key={i}>{t}</li>
        ))}
      </ul>
      <div className="grid gap-x-4 gap-y-1 mt-2 text-sm" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        <p>
          <span style={{ color: C.sea }}>their goal · </span>
          {b.goal}
        </p>
        <p>
          <span style={{ color: '#E0928F' }}>retreat (your throttle) · </span>
          {b.retreat}
        </p>
        <p>
          <span style={{ color: C.gold }}>win · </span>
          {b.win}
        </p>
        <p>
          <span style={{ color: C.faint }}>loss · </span>
          {b.loss}
        </p>
        {b.draw && (
          <p>
            <span style={{ color: C.faint }}>draw · </span>
            {b.draw}
          </p>
        )}
      </div>
      <FoeTable foes={b.foes} />
    </div>
  )
}

function SceneCard({ s, here, onHere }: { s: RunScene; here: boolean; onHere?: () => void }) {
  const level3 = s.key.includes('LEVEL 3')
  const major = s.battles.some((b) => b.major)
  const title = `${here ? '📍 ' : ''}${s.key}${s.played ? '  · played' : ''}${major ? '  · ⚔ major battle' : ''}`
  return (
    <Fold id={`run-${s.key}`} title={title} forceOpen={here}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <span className="text-xs" style={{ color: C.faint }}>
          {s.where}
          {s.timing ? ` · ${s.timing}` : ''}
        </span>
        {level3 && (
          <span className="text-xs rounded-full px-2" style={{ border: `1px solid ${C.gold}`, color: C.gold }}>
            ✦ LEVEL 3 here
          </span>
        )}
        {here ? (
          <span className="text-xs rounded-full px-2" style={{ background: `${C.sea}22`, border: `1px solid ${C.sea}`, color: C.sea }}>
            you are here
          </span>
        ) : (
          onHere && (
            <button type="button" onClick={onHere} className="text-xs underline" style={{ color: C.faint, background: 'none', border: 'none', cursor: 'pointer', minHeight: 32 }}>
              make this the scene
            </button>
          )
        )}
      </div>
      <p style={{ ...display, fontSize: 20, color: C.gold, lineHeight: 1.2 }}>{s.goal}</p>
      <p className="text-sm italic mt-1" style={{ color: C.faint }}>
        {s.oneBreath}
      </p>

      <Eyebrow>
        <span style={{ marginTop: 12, display: 'inline-block' }}>the beats</span>
      </Eyebrow>
      <ol className="text-sm" style={{ color: C.parchment, paddingLeft: 20, listStyle: 'decimal' }}>
        {s.beats.map((b, i) => (
          <li key={i} className="mb-1">
            {b}
          </li>
        ))}
      </ol>

      {s.theyMight.length > 0 && (
        <>
          <Eyebrow>
            <span style={{ marginTop: 12, display: 'inline-block' }}>if they… → you</span>
          </Eyebrow>
          <div className="grid gap-1">
            {s.theyMight.map((t, i) => (
              <div key={i} className="grid gap-x-3 text-sm rounded-md px-3 py-1.5" style={{ gridTemplateColumns: 'minmax(140px, 1fr) 2fr', background: C.night, border: `1px solid ${C.panelEdge}` }}>
                <span style={{ color: C.gold }}>{t.if}</span>
                <span style={{ color: C.parchment }}>{t.then}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {s.players.length > 0 && (
        <>
          <Eyebrow>
            <span style={{ marginTop: 12, display: 'inline-block' }}>whose scene this is</span>
          </Eyebrow>
          <div className="flex flex-wrap gap-2">
            {s.players.map((p, i) => (
              <div key={i} className="text-sm rounded-md px-3 py-1.5" style={{ background: `${C.gold}12`, border: `1px solid ${C.gold}55`, maxWidth: 420 }}>
                <strong style={{ color: C.gold }}>{p.who}</strong> <span style={{ color: C.parchment }}>— {p.note}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {s.battles.length > 0 && (
        <>
          <Eyebrow>
            <span style={{ marginTop: 12, display: 'inline-block' }}>who they might fight</span>
          </Eyebrow>
          {s.battles.map((b) => (
            <BattleCard key={b.code} b={b} />
          ))}
        </>
      )}

      <p className="text-sm mt-3" style={{ color: C.sea }}>
        exit · <span style={{ color: C.parchment }}>{s.exit}</span>
      </p>
    </Fold>
  )
}

export function RunbookSection({ store }: { store: Store }) {
  const [nodes, setNodes] = useState<StoryNode[]>([])
  const [act, setAct] = useState<number>(0)
  const reload = async () => setNodes(await store.listStory())
  useEffect(() => {
    void reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store])
  const current = nodes.find((n) => n.status === 'current') ?? null
  const currentKey = current?.title ?? null

  const makeCurrent = async (title: string) => {
    const target = nodes.find((n) => n.title === title)
    if (!target) return
    if (current && current.id !== target.id) await store.saveStoryNode({ ...current, status: 'done' })
    await store.saveStoryNode({ ...target, status: 'current' })
    await reload()
  }

  const scenes = useMemo(() => (act ? RUN_SCENES.filter((s) => s.act === act) : RUN_SCENES), [act])
  const allFoes = useMemo(() => {
    const seen = new Map<string, Foe>()
    for (const s of RUN_SCENES) for (const b of s.battles) for (const f of b.foes) if (!seen.has(f.name)) seen.set(f.name, f)
    return [...seen.values()]
  }, [])
  const upNext = currentKey ? RUN_SCENES[RUN_SCENES.findIndex((s) => s.key === currentKey) + 1] : null

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        <H>Run the campaign</H>
        {current && (
          <span className="text-sm rounded-full px-3 py-1" style={{ background: `${C.sea}22`, border: `1px solid ${C.sea}`, color: C.sea }}>
            📍 {current.title}
          </span>
        )}
      </div>
      <p className="text-sm mt-1" style={{ color: C.faint, maxWidth: 720 }}>
        The whole night, and the whole campaign, in walking order. Read the one page below once; then open the scene you are in. Every scene has its beats, the five doors, whose scene it is, who they might fight (with the numbers), and what carries forward.
        {upNext ? ` Up next after this: ${upNext.key}.` : ''}
      </p>

      <div className="rounded-xl p-4 mt-3" style={{ background: C.panel, border: `1px solid ${C.gold}55` }}>
        <Eyebrow>how to run this — one page, five minutes</Eyebrow>
        <div className="grid gap-2 mt-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {RUN_PRIMER.map((p) => (
            <div key={p.title} className="rounded-lg px-3 py-2" style={{ background: C.night, border: `1px solid ${C.panelEdge}` }}>
              <p style={{ ...display, fontSize: 17, color: C.gold }}>{p.title}</p>
              <ul className="text-sm mt-1" style={{ color: C.parchment, paddingLeft: 16, listStyle: 'disc' }}>
                {p.lines.map((l, i) => (
                  <li key={i} className="mb-0.5">
                    {l}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mt-4 mb-2">
        {[0, 1, 2, 3].map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => setAct(a)}
            aria-pressed={act === a}
            className="rounded-full px-3 py-1 text-sm"
            style={{ background: act === a ? `${C.gold}22` : 'transparent', border: `1px solid ${act === a ? C.gold : C.panelEdge}`, color: act === a ? C.gold : C.parchment, cursor: 'pointer', minHeight: 36 }}
          >
            {a === 0 ? 'every scene' : ACT_NAMES[a]}
          </button>
        ))}
      </div>

      {[1, 2, 3]
        .filter((a) => !act || a === act)
        .map((a) => (
          <div key={a} className="mt-3">
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: C.sea, letterSpacing: '0.25em' }}>
              {ACT_NAMES[a]}
              {a === 2 ? ' — walk all three, in any order; each road is 2–3 nights' : ''}
            </p>
            {scenes
              .filter((s) => s.act === a)
              .map((s) => (
                <SceneCard key={s.key} s={s} here={s.key === currentKey} onHere={nodes.some((n) => n.title === s.key) ? () => void makeCurrent(s.key) : undefined} />
              ))}
          </div>
        ))}

      <div className="mt-6">
        <Fold id="run-cast" title="🎭 The cast, one line each">
          <div className="grid gap-1">
            {RUN_CAST.map((c) => (
              <div key={c.who} className="grid gap-x-3 text-sm rounded-md px-3 py-1.5" style={{ gridTemplateColumns: 'minmax(180px, 1fr) 2fr minmax(120px, .7fr)', background: C.night, border: `1px solid ${C.panelEdge}` }}>
                <strong style={{ color: C.gold }}>{c.who}</strong>
                <span style={{ color: C.parchment }}>{c.line}</span>
                <span style={{ color: C.faint }}>{c.where}</span>
              </div>
            ))}
          </div>
        </Fold>
        <Fold id="run-bestiary" title="🐍 Everything they might fight — the numbers on one page">
          <p className="text-xs mb-1" style={{ color: C.faint }}>
            SRD 5.2 blocks, reskinned for the Fair. Glance at the real block once before the night — a point of AC either way never ruined a game. Foes take, delay, repossess; they never murder.
          </p>
          <FoeTable foes={allFoes} />
        </Fold>
      </div>

      {nodes.length === 0 && (
        <p className="text-xs mt-3" style={{ color: C.faint }}>
          The story timeline is empty on this device — lay it in Tonight to get “you are here” and “make this the scene”.
        </p>
      )}
      <div className="mt-3">
        <Btn secondary onClick={() => void reload()}>
          refresh “you are here”
        </Btn>
      </div>
    </div>
  )
}
