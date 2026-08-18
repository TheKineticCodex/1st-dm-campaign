// ⚑ The pieces the Book arranges: the run-the-night panel, the Alignment,
// the party strip, the story timeline, and the stage controls that drive
// what the iPad shows the table.
//
// This file no longer owns a tab. DmDashboard mounts these five where they
// are actually needed — the party strip on every screen, the timeline under
// "Look it up", the stage beside the initiative order on the Table.

import { useEffect, useRef, useState } from 'react'
import { ACT1_SCENES, type SceneCue } from '../data/act1Scenes'
import { DM_BASICS } from '../data/dmBasics'
import {
  ECLIPSE_MAX,
  ECLIPSE_TEST,
  ECLIPSE_WHISPER,
  beatFor,
  openTheNight,
  spent,
  theRoll,
  whoseTurn,
  type EclipseState,
} from '../data/eclipse'
import { seedStory } from '../data/storySeeds'
import { WONDER } from '../data/wonder'
import { computeSheet } from '../lib/compute'
import { joinTableChannelLazy, type TableChannel } from '../lib/realtime'
import { SFX } from '../lib/sfx'
import { fireCue } from '../lib/cues'
import { readNightProgress } from '../lib/night'
import { seatNameFor } from '../data/campaign'
import { cardsFor } from '../data/stageCards'
import { readCache, writeCache } from '../lib/storage'
import { SCENES, ambienceVolume, currentScene, duck, setScene, setVolume, subscribeAmbience, type SceneId } from '../lib/ambience'
import { isCarouselPlaying, playMissingNote, stopSong, subscribeSong, toggleCarousel } from '../lib/song'
import type { RosterEntry, Store } from '../lib/store'
import type { Handout, Npc, StageState, StageToken, StoryNode, VitalsEvent } from '../types'
import { FogOverlay, TINTS, TintOverlay } from './Battlefield'
import { Btn, C, Eyebrow, Fold, TextArea, TextInput, bloodLit, body, display, eyebrow, goldAction, leftRule, numerals, onState, panelSurface, seaLit, splitLeadGlyph, wellSurface } from './ui'
import { Icon, Spark, type IconName } from './icons'

const TOKEN_COLORS = [C.sea, C.gold, '#C08BE0', '#E08BA8', C.blood, '#8BB8E0']

/** A data label like "🔔 The Toll Bell" → drawn glyph + the words (never a colour emoji as UI). */
function GlyphLabel({ text, size = 14, glyphColor, fallback }: { text: string; size?: number; glyphColor?: string; fallback?: IconName }) {
  const [glyph, words] = splitLeadGlyph(text)
  const name = glyph ?? fallback ?? null
  return (
    <span className="inline-flex items-center gap-1.5">
      {name && <Icon name={name} size={size} style={{ color: glyphColor, flexShrink: 0 }} />}
      <span>{words}</span>
    </span>
  )
}

/** A recessed chip: night-deep well when off, lit (ember/sea) when on. */
const chipOff: React.CSSProperties = { ...wellSurface, color: C.parchment }

const EMPTY_STAGE: StageState = { mode: 'ambient', mapUrl: null, tokens: [] }
const FOG_SIZES: [number, string][] = [
  [0.08, 'small'],
  [0.14, 'lantern'],
  [0.24, 'wide'],
]

// ---------------------------------------------------------- run the night

export function RunNight({
  store,
  roster,
  onGo,
}: {
  store: Store
  roster: RosterEntry[]
  onGo: (section: string) => void
}) {
  const channelRef = useRef<TableChannel | null>(null)
  useEffect(() => {
    channelRef.current = joinTableChannelLazy(store.getChannelId(), {})
    return () => {
      channelRef.current?.close()
    }
  }, [store])

  const [nodes, setNodes] = useState<StoryNode[]>([])
  const [npcs, setNpcs] = useState<Npc[]>([])
  const [wonder, setWonder] = useState<string | null>(null)
  const [sentNote, setSentNote] = useState<string | null>(null)
  const [carouselOn, setCarouselOn] = useState(isCarouselPlaying())
  useEffect(() => subscribeSong(() => setCarouselOn(isCarouselPlaying())), [])
  const [scene, setSceneState] = useState<SceneId>(currentScene())
  const [vol, setVol] = useState(ambienceVolume())
  useEffect(
    () =>
      subscribeAmbience(() => {
        setSceneState(currentScene())
        setVol(ambienceVolume())
      }),
    [],
  )
  const room = (id: SceneId) => {
    void setScene(id).catch(() => note('The room would not load — tap again.'))
  }

  const reload = async () => setNodes(await store.listStory())

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [n, p] = await Promise.all([store.listStory(), store.listNpcs()])
      if (!cancelled) {
        setNodes(n)
        setNpcs(p)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const current = nodes.find((n) => n.status === 'current') ?? null
  const guide = current ? ACT1_SCENES[current.title] : undefined
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const nextInAct = current
    ? nodes.find((n) => n.act === current.act && n.ord === current.ord + 1)
    : null
  const seatFor = (wanted?: string | null) => (wanted ? seatNameFor(roster, wanted) : null)

  const note = (msg: string) => {
    setSentNote(msg)
    setTimeout(() => setSentNote(null), 2500)
  }

  const fire = (cue: SceneCue) =>
    fireCue(cue, { store, channel: channelRef.current, note, onGo })

  const advanceTo = async (target: StoryNode) => {
    if (current && current.id !== target.id) await store.saveStoryNode({ ...current, status: 'done' })
    await store.saveStoryNode({ ...target, status: 'current' })
    await reload()
  }

  const sendWonder = (text: string) => {
    const h: Handout = {
      id: crypto.randomUUID(),
      target: null,
      title: 'The Feywild, meanwhile',
      body: text,
      ephemeral: true,
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    note('Wonder sent to every phone ✦')
  }

  return (
    <div className="mt-3">
      <p className="text-sm rounded-lg px-4 py-2 mb-3 flex items-start gap-2 italic" style={{ background: `${C.sea}14`, border: `1px solid ${C.sea}55`, borderLeft: `3px solid ${C.sea}`, color: C.sea }}>
        <Spark size={12} style={{ marginTop: 5, flexShrink: 0 }} />
        <span>
          Lost? Read the gold words aloud. Press a button. Then ask the table: “What do you do?”
          That is the entire job — the Book does the rest.
        </span>
      </p>
      {sentNote && (
        <p role="status" className="text-sm mb-2" style={{ color: C.gold }}>
          {sentNote}
        </p>
      )}

      {!current || !guide ? (
        <p style={{ color: C.faint }}>
          No current beat. Flip to planning and tap “go here” on a beat to begin.
        </p>
      ) : (
        <div className="rounded-xl p-5" style={{ ...panelSurface, border: `1px solid ${C.gold}66`, boxShadow: `inset 3px 0 0 ${C.gold}, inset 0 1px 0 ${C.hairline}, 0 0 24px ${C.gold}22` }}>
          <Eyebrow>now — act {current.act}</Eyebrow>
          <h3 style={{ ...display, fontSize: 26, fontWeight: 700, color: C.gold }}>{current.title}</h3>

          <p className="mb-1 mt-3" style={{ ...eyebrow, color: C.brassDim }}>
            the older wording — for you, not to read
          </p>
          <p className="rounded-lg px-3 py-2 text-sm" style={{ ...wellSurface, color: C.faint, fontStyle: 'italic', lineHeight: 1.55 }}>
            {guide.readAloud}
          </p>
          <p className="text-sm mt-3" style={{ color: C.parchment }}>
            <span style={{ ...eyebrow, color: C.sea }}>
              the truth ·{' '}
            </span>
            {guide.truth}
          </p>

          <div className="grid gap-1 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            {(
              [
                ['swords', 'If they fight', guide.doors.fight],
                ['mask', 'If they talk', guide.doors.talk],
                ['hush', 'If they sneak', guide.doors.sneak],
                ['scales', 'If they bargain', guide.doors.bargain],
                ['storm', 'If they go sideways', guide.doors.insane],
              ] as [IconName, string, string][]
            ).map(([glyph, label, text]) => (
              <div key={label} className="rounded-lg p-2" style={wellSurface}>
                <p className="text-xs flex items-center gap-1.5" style={{ ...body, fontWeight: 600, color: C.sea }}>
                  <Icon name={glyph} size={13} /> {label}
                </p>
                <p className="text-xs mt-1" style={{ color: C.parchment }}>
                  {text}
                </p>
              </div>
            ))}
          </div>

          {guide.moves && guide.moves.length > 0 && (
            <div className="mt-3">
              <p className="mb-1" style={{ ...eyebrow, color: C.gold }}>
                the menu — read these options aloud, reward invention
              </p>
              <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                {guide.moves.map((m) => (
                  <div key={m.label} className="rounded-lg p-2" style={{ ...wellSurface, border: `1px solid ${C.gold}44` }}>
                    <p className="text-sm" style={{ color: C.gold }}>
                      <GlyphLabel text={m.label} size={14} glyphColor={C.brassDim} />
                      <span className="text-xs" style={{ color: C.sea }}>
                        {' '}
                        · {m.roll}
                      </span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: C.parchment }}>
                      {m.effect}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guide.npcs.length > 0 && (
            <div className="mt-3">
              <p className="mb-1" style={{ ...eyebrow, color: C.sea }}>
                in this scene
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
                {guide.npcs.map((name) => {
                  const npc = npcs.find((p) => p.name === name)
                  return (
                    <div key={name} className="rounded-lg p-2" style={wellSurface}>
                      <p style={{ ...display, fontSize: 18, fontWeight: 600, color: C.gold }}>
                        {name}
                        {npc?.pronunciation && (
                          <span className="text-xs font-normal" style={{ ...body, color: C.faint }}>
                            {' '}
                            · “{npc.pronunciation}”
                          </span>
                        )}
                      </p>
                      {npc && (
                        <>
                          <p className="text-xs mt-1 flex items-start gap-1.5">
                            <Icon name="mask" size={13} style={{ color: C.brassDim, marginTop: 2 }} /> <span>{npc.trait}</span>
                          </p>
                          <p className="text-xs flex items-start gap-1.5" style={{ color: C.faint }}>
                            <Icon name="lost" size={13} style={{ marginTop: 2 }} /> <span>{npc.secret}</span>
                          </p>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {guide.ambience && (
            <div className="mt-4">
              <button
                type="button"
                onClick={() => room(scene === guide.ambience ? 'silence' : guide.ambience!)}
                aria-pressed={scene === guide.ambience}
                className="rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1.5"
                style={{
                  ...(scene === guide.ambience ? seaLit : chipOff),
                  minHeight: 44,
                  cursor: 'pointer',
                }}
              >
                {scene === guide.ambience ? (
                  '■ quiet the room'
                ) : (
                  <>
                    <Icon name="wave" size={14} style={{ color: C.sea }} /> set the room — <GlyphLabel text={SCENES.find((x) => x.id === guide.ambience)?.label ?? guide.ambience} size={13} glyphColor={C.brassDim} />
                  </>
                )}
              </button>
            </div>
          )}

          {guide.cues.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {guide.cues.map((cue) => {
                const missing =
                  cue.kind === 'whisper' && !!cue.whisper?.target && !seatFor(cue.whisper.target)
                const label =
                  cue.kind === 'song' && cue.song === 'carousel' && carouselOn ? '■ stop the carousel' : cue.label
                return (
                  <button
                    key={label}
                    type="button"
                    disabled={!!missing}
                    onClick={() => {
                      const seat = cue.kind === 'whisper' ? seatFor(cue.whisper?.target) : null
                      fire(seat && cue.whisper ? { ...cue, whisper: { ...cue.whisper, target: seat } } : cue)
                    }}
                    title={missing ? `${cue.whisper!.target} hasn't joined yet` : undefined}
                    className="rounded-lg px-3 py-2 text-sm"
                    style={{
                      ...(cue.kind === 'whisper' ? onState : chipOff),
                      ...(missing ? { color: C.faint, border: `1px dashed ${C.brassDim}` } : null),
                      minHeight: 44,
                      cursor: missing ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <GlyphLabel text={label} size={14} glyphColor={cue.kind === 'whisper' ? C.gold : C.brassDim} />
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-4">
            {current.branches.map((b) => {
              const target = byId.get(b.toId)
              return (
                <button
                  key={b.toId}
                  type="button"
                  onClick={() => {
                    if (target && window.confirm(`They chose: ${b.label}?`)) void advanceTo(target)
                  }}
                  className="rounded-lg px-4 py-3 inline-flex items-center gap-2"
                  style={{ ...display, fontSize: 18, fontWeight: 600, ...onState, minHeight: 48, cursor: 'pointer' }}
                >
                  <Icon name="arrow" size={16} /> {b.label}
                </button>
              )
            })}
            {current.branches.length === 0 && nextInAct && (
              <button
                type="button"
                onClick={() => void advanceTo(nextInAct)}
                className="rounded-lg px-4 py-3 inline-flex items-center gap-2"
                style={{ ...display, fontSize: 18, fontWeight: 600, ...goldAction, minHeight: 48, cursor: 'pointer' }}
              >
                next: {nextInAct.title} <Icon name="arrow" size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* the nervous-DM basics */}
      <div className="mt-3">
        <Fold id="dm-basics" title="📖 How to DM — the whole job on eight cards">
          <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {DM_BASICS.map((card) => (
              <div key={card.title} className="rounded-lg p-3" style={wellSurface}>
                <p style={{ ...display, fontSize: 18, fontWeight: 600, color: C.gold }}>
                  {card.title}
                </p>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: C.parchment }}>
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </Fold>
      </div>

      {/* the soundboard */}
      <div className="rounded-xl p-4 mt-3" style={panelSurface}>
        <Eyebrow>the soundboard — plays from this MacBook</Eyebrow>
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          the room — a bed under the scene; crossfades when you change it, ducks under stingers and the song
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1 mb-3">
          {SCENES.map((sc) => (
            <button
              key={sc.id}
              type="button"
              onClick={() => room(sc.id)}
              title={sc.hint || undefined}
              aria-pressed={scene === sc.id}
              className="rounded-lg px-3 py-2 text-sm"
              style={{
                ...(scene === sc.id ? seaLit : chipOff),
                ...(scene !== sc.id && sc.id === 'silence' ? { color: C.faint } : null),
                minHeight: 44,
                cursor: 'pointer',
              }}
            >
              <GlyphLabel text={sc.label} size={14} glyphColor={scene === sc.id ? C.sea : C.brassDim} />
            </button>
          ))}
          <label className="text-xs flex items-center gap-2" style={{ color: C.faint }}>
            room volume
            <input type="range" min={0} max={1} step={0.05} value={vol} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Room volume" style={{ width: 120, accentColor: C.sea }} />
          </label>
        </div>
        <div className="flex flex-wrap gap-2 mt-1 mb-3">
          <button
            type="button"
            onClick={() => {
              if (!carouselOn) duck(60, 0.35)
              toggleCarousel()
            }}
            aria-pressed={carouselOn}
            className="rounded-lg px-3 py-2 text-sm"
            style={{
              ...(carouselOn ? onState : chipOff),
              minHeight: 44,
              cursor: 'pointer',
            }}
          >
            {carouselOn ? '■ stop the carousel' : <GlyphLabel text="🎠 The carousel — the song with the hole (loops)" size={14} glyphColor={C.brassDim} />}
          </button>
          <button
            type="button"
            onClick={() => {
              duck(5)
              playMissingNote()
            }}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ ...chipOff, minHeight: 44, cursor: 'pointer' }}
          >
            <GlyphLabel text="♪ The missing note, alone" size={14} glyphColor={C.brassDim} />
          </button>
          <button
            type="button"
            onClick={stopSong}
            className="rounded-lg px-3 py-2 text-sm"
            style={{ ...chipOff, color: C.faint, minHeight: 44, cursor: 'pointer' }}
          >
            ■ silence the song
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-1">
          {Object.entries(SFX).map(([key, s]) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                duck(2.5)
                s.play()
              }}
              className="rounded-lg px-3 py-2 text-sm"
              style={{ ...chipOff, minHeight: 44, cursor: 'pointer' }}
            >
              <GlyphLabel text={s.label} size={14} glyphColor={C.brassDim} />
            </button>
          ))}
        </div>
      </div>

      {/* the wonder deck */}
      <div className="rounded-xl p-4 mt-3" style={panelSurface}>
        <Eyebrow>the wonder deck — ten seconds of Feywild, any time</Eyebrow>
        {wonder && (
          <p className="text-sm mt-2 italic" style={{ color: C.gold }}>
            “{wonder}”
          </p>
        )}
        <div className="flex gap-2 mt-2">
          <Btn secondary onClick={() => setWonder(WONDER[Math.floor(Math.random() * WONDER.length)])}>
            <Spark size={13} style={{ color: C.gold, marginRight: 6 }} />
            draw a wonder
          </Btn>
          {wonder && (
            <Btn secondary onClick={() => sendWonder(wonder)}>
              <Icon name="envelope" size={15} style={{ color: C.brassDim, marginRight: 6 }} />
              send it to every phone
            </Btn>
          )}
        </div>
      </div>

    </div>
  )
}

// ------------------------------------------------- the thing with no name

/**
 * The Alignment. A Freya called Sun, a Freya called Moon, and somebody in
 * the middle — and once in a while the sky agrees with the arrangement.
 * Tonight's number, one roll behind the screen, and the words to read.
 *
 * The word for it is never on this screen, because a player will glance at
 * the iPad. See src/data/eclipse.ts for every rule this panel obeys.
 */
const ECLIPSE_KEY = 'eclipse'

export function TheThingWithNoName({ store }: { store: Store }) {
  const [state, setState] = useState<EclipseState | null>(null)
  const [open, setOpen] = useState(false)
  const [said, setSaid] = useState<string | null>(null)
  const channelRef = useRef<TableChannel | null>(null)

  const note = (m: string) => {
    setSaid(m)
    setTimeout(() => setSaid(null), 2500)
  }

  useEffect(() => {
    channelRef.current = joinTableChannelLazy(store.getChannelId(), {})
    return () => {
      channelRef.current?.close()
    }
  }, [store])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const notes = await store.listSessionNotes()
      if (cancelled) return
      const played = notes.map((n) => n.sessionNumber)
      const night = (played.length ? Math.max(...played) : 0) + 1
      const next = openTheNight(readCache<EclipseState>(ECLIPSE_KEY), night)
      writeCache(ECLIPSE_KEY, next)
      setState(next)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  if (!state) return null

  const save = (next: EclipseState) => {
    writeCache(ECLIPSE_KEY, next)
    setState(next)
  }

  // Before the roll these describe what WOULD happen; after it fires tonight
  // they describe what just did.
  const behind = state.firedTonight ? state.fired - 1 : state.fired
  const beat = beatFor(behind)
  const shadow = whoseTurn({ ...state, fired: behind })
  const done = spent(state)
  const missed = state.lastRoll !== null && !state.firedTonight

  const sealIt = () => {
    if (!shadow) return
    const h: Handout = {
      id: crypto.randomUUID(),
      target: shadow.target,
      title: ECLIPSE_WHISPER.title,
      body: ECLIPSE_WHISPER.body,
      ephemeral: true,
      sentAt: new Date().toISOString(),
    }
    void store.sendHandout(h)
    channelRef.current?.sendHandout(h)
    note(`Sealed to ${shadow.who} ✦`)
  }

  return (
    <div className="rounded-xl p-4 mt-3" style={panelSurface}>
      <div className="flex items-baseline justify-between gap-3">
        <Eyebrow>🌑 the thing with no name</Eyebrow>
        <p style={{ ...display, ...numerals, fontSize: 22, fontWeight: 700, color: done ? C.faint : C.gold, whiteSpace: 'nowrap' }}>
          {done ? '—' : `${state.number}+`}
        </p>
      </div>
      <p className="text-xs" style={{ color: C.faint }}>
        {state.fired} of {ECLIPSE_MAX} ·{' '}
        {state.firedTonight
          ? 'that was tonight’s — one a night'
          : done
            ? 'nothing left to roll'
            : `roll ${state.number} or higher`}{' '}
        · never say what it is
      </p>

      {!done && (
        <>
          <p className="text-sm mt-2" style={{ color: C.parchment }}>
            Sun steps in front of an offer · Moon reaches for something taken · somebody who is not
            a Freya stands between them · <span style={{ color: C.sea }}>and nobody planned it</span>.
          </p>
          <div className="flex flex-wrap gap-2 items-center mt-2">
            <Btn secondary onClick={() => save(theRoll(state, 1 + Math.floor(Math.random() * 20)))}>
              <Icon name="die" size={15} style={{ color: C.brassDim, marginRight: 6 }} />
              roll it behind the screen
            </Btn>
            {missed && (
              <span className="text-sm" style={{ ...numerals, color: C.faint }}>
                {state.lastRoll}. Not tonight.
              </span>
            )}
          </div>
        </>
      )}

      {state.firedTonight && (
        <div className="rounded-lg p-3 mt-3" style={{ ...wellSurface, borderLeft: `3px solid ${C.gold}` }}>
          <p style={{ ...eyebrow, color: C.gold }}>
            {state.lastRoll} · {beat.name}
            {shadow && <span style={{ color: C.sea }}> · the shadow falls on {shadow.who}</span>}
          </p>
          <p className="mt-2 leading-relaxed" style={{ color: C.gold, fontStyle: 'italic', fontSize: 19, lineHeight: 1.65 }}>
            “{beat.readAloud}”
          </p>
          <p className="text-sm mt-3" style={{ color: C.parchment }}>
            <span style={{ ...eyebrow, color: C.sea }}>then · </span>
            {beat.thenWhat}
          </p>
          <p className="text-sm mt-2 italic" style={{ color: C.faint }}>
            {beat.comic}
          </p>
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            The two who caused it are the only two who do not see it. Everyone else describes it to
            them afterwards, badly.
          </p>
          {shadow && (
            <div className="mt-2">
              <Btn secondary onClick={sealIt}>
                <Icon name="envelope" size={15} style={{ color: C.brassDim, marginRight: 6 }} />
                seal it to {shadow.who}
              </Btn>
              {said && (
                <p role="status" className="text-xs mt-1.5" style={{ color: C.gold }}>
                  {said}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {done && !state.firedTonight && (
        <p className="text-sm mt-2" style={{ color: C.faint }}>
          Three is the lot. The last one is the Moon-Night, and it is already written.
        </p>
      )}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs mt-2"
        style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', minHeight: 36, padding: 0, textDecoration: 'underline' }}
      >
        {open ? 'hide the three things' : 'the three things that have to be true'}
      </button>
      {open && (
        <ul className="mt-1 space-y-1">
          {ECLIPSE_TEST.map((line, i) => (
            <li key={i} className="text-xs flex items-start gap-2" style={{ color: C.parchment }}>
              <Spark size={10} style={{ color: C.sea, marginTop: 5, flexShrink: 0 }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// -------------------------------------------------------------- party strip

/**
 * The five, on every screen. `live` is the phones' own broadcast, so the
 * numbers are the table's, not a roster row that reloads every 30 seconds;
 * tapping a face is the way to the sheet that can lay a condition on them.
 */
export function PartyStrip({ roster, live, onTap }: {
  roster: RosterEntry[]
  live?: Record<string, VitalsEvent>
  onTap?: () => void
}) {
  return (
    <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))' }}>
      {roster
        .filter((r) => r.character)
        .map((r) => {
          const sheet = computeSheet(r.character!.build)
          if (!sheet) return null
          const v = live?.[r.playerName]
          const hpMax = v?.hpMax ?? sheet.hpMax
          const hp = v ? Math.max(0, v.hp) : Math.max(0, sheet.hpMax - r.character!.state.damage)
          const hpPct = hpMax > 0 ? (hp / hpMax) * 100 : 0
          const conditions = v?.conditions ?? r.character!.state.conditions
          const Tag = (onTap ? 'button' : 'div') as 'button' | 'div'
          return (
            <Tag
              key={r.playerId}
              {...(onTap ? { type: 'button' as const, onClick: onTap } : {})}
              className="rounded-xl p-3 flex gap-3 items-center text-left w-full"
              style={{ ...panelSurface, borderColor: hp === 0 ? C.blood : C.panelEdge, minHeight: 44, cursor: onTap ? 'pointer' : undefined }}
            >
              {r.character!.build.portraitUrl ? (
                <img
                  src={r.character!.build.portraitUrl}
                  alt=""
                  style={{ width: 46, height: 46, borderRadius: '50%', objectFit: 'cover', border: `1.5px solid ${hp === 0 ? C.blood : hpPct > 50 ? C.sea : C.gold}`, boxShadow: `0 0 12px ${hp === 0 ? C.blood : hpPct > 50 ? C.sea : C.gold}55`, flexShrink: 0 }}
                />
              ) : (
                <span aria-hidden="true" className="inline-flex items-center justify-center rounded-full" style={{ ...(hp === 0 ? bloodLit : hpPct > 50 ? seaLit : onState), width: 46, height: 46, flexShrink: 0 }}>
                  <Icon name="roster" size={24} />
                </span>
              )}
              <div style={{ minWidth: 0, flex: 1 }}>
                <p style={{ ...display, fontSize: 18, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.character!.build.name}
                </p>
                <div className="rounded-full mt-1" style={{ height: 6, background: C.nightDeep, border: `1px solid ${C.panelEdge}`, overflow: 'hidden' }}>
                  <div style={{ width: `${hpPct}%`, height: '100%', background: hpPct > 50 ? C.sea : hpPct > 25 ? C.gold : C.blood }} />
                </div>
                <p className="text-xs mt-1" style={{ ...numerals, color: C.faint }}>
                  <span style={{ color: hp === 0 ? C.blood : hpPct > 50 ? C.sea : hpPct > 25 ? C.gold : C.blood }}>{hp}/{hpMax}</span> hp · AC {sheet.ac.val}
                  {conditions.length > 0 && (
                    <span style={{ color: C.gold }}> · {conditions.join(', ')}</span>
                  )}
                </p>
              </div>
            </Tag>
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
  done: { border: C.brassDim, opacity: 0.6 },
  current: { border: C.gold, opacity: 1 },
  possible: { border: C.panelEdge, opacity: 0.9 },
  skipped: { border: C.panelEdge, opacity: 0.4 },
}

export function StoryTimeline({ store }: { store: Store }) {
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
    <div className="rounded-xl p-4" style={panelSurface}>
      <Eyebrow>The story — where they are, and every road ahead</Eyebrow>
      {loaded && nodes.length === 0 && (
        <>
          <p className="text-sm mt-1" style={{ color: C.faint }}>
            The timeline is unwritten. Lay "The Song the Sea Forgot" — Act 1 in full, with the
            Three Gates branching into prepared roads — then bend it however you like.
          </p>
          {/* Ember-rim secondary: "Run the night" is the ONE brass on Tonight. */}
          <Btn
            secondary
            disabled={seeding}
            style={seeding ? undefined : onState}
            onClick={async () => {
              setSeeding(true)
              await seedStory(store)
              await reload()
              setSeeding(false)
            }}
          >
            {seeding ? 'The tide writes…' : <span className="inline-flex items-center gap-2">Lay the story of the Sea <Spark size={14} /></span>}
          </Btn>
        </>
      )}

      {acts.map((act) => (
        <div key={act} className="mt-3">
          <p className="mb-2" style={{ ...eyebrow, color: C.sea }}>
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
                    ...wellSurface,
                    border: `1px solid ${s.border}`,
                    opacity: s.opacity,
                    ...(n.status === 'current'
                      ? { ...onState, ...leftRule(C.gold), boxShadow: `inset 3px 0 0 ${C.gold}, inset 0 1px 0 ${C.hairline}, 0 0 18px ${C.gold}22` }
                      : null),
                  }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm inline-flex items-center gap-1.5" style={{ ...display, fontSize: 17, fontWeight: 600, color: n.status === 'current' ? C.goldHi : C.parchment }}>
                      {n.status === 'done' ? <Spark size={12} style={{ color: C.brassDim }} /> : n.status === 'current' ? <Icon name="arrow" size={14} /> : null}
                      {n.title}
                    </p>
                    <span className="flex gap-1 flex-shrink-0">
                      {n.status !== 'current' && (
                        <button
                          type="button"
                          onClick={() => void advanceTo(n)}
                          className="text-xs rounded px-2"
                          title="Make this the current beat"
                          style={{ background: 'transparent', border: `1px solid ${C.panelEdge}`, color: C.sea, minHeight: 32, cursor: 'pointer' }}
                        >
                          go here
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditing(n)}
                        className="text-xs rounded px-2"
                        style={{ background: 'transparent', border: `1px solid ${C.panelEdge}`, color: C.faint, minHeight: 32, cursor: 'pointer' }}
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
                          className="text-xs rounded-md px-2 py-1 inline-flex items-center gap-1.5"
                          style={{ ...onState, minHeight: 32, cursor: 'pointer' }}
                        >
                          <Icon name="arrow" size={12} /> {b.label}
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
        <div className="rounded-lg p-3 mt-2" style={{ ...wellSurface, border: `1px solid ${C.sea}` }}>
          <TextInput value={editing.title} onChange={(v) => setEditing({ ...editing, title: v })} placeholder="Beat title" />
          <div className="mt-2">
            <TextArea rows={4} value={editing.summary} onChange={(v) => setEditing({ ...editing, summary: v })} placeholder="What happens here — notes to yourself" />
          </div>
          <div className="flex gap-2 mt-1">
            <Btn
              secondary
              style={onState}
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

/**
 * What the iPad is showing, and one way back.
 *
 * The stage faces away from the Lantern-Keeper all night, so the Book has to
 * tell him what is on it. These are the four things that can be up, in the
 * order the stage itself prefers them (StageScreen renders the first that is
 * true), plus the initiative rail, which rides over any of them.
 */
export interface StageOverlays {
  game: boolean
  wheel: boolean
  finale: boolean
  fighting: boolean
  clearGame: () => void
  racing: boolean
  clearWheel: () => void
  clearFinale: () => void
}

export function StageControls({
  store,
  roster,
  channelRef,
  overlays,
}: {
  store: Store
  roster: RosterEntry[]
  channelRef: { current: TableChannel | null }
  overlays?: StageOverlays
}) {
  const [stage, setStage] = useState<StageState>(EMPTY_STAGE)
  const [loaded, setLoaded] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [fogRadius, setFogRadius] = useState(0.14)
  // Where the night is standing. The progress is a localStorage cache on this
  // same laptop with nobody to notify, so it is re-read rather than subscribed.
  const [at, setAt] = useState<string | null>(() => readNightProgress().at)
  const sentAt = useRef<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)
  const boardRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<string | null>(null)
  const lastSent = useRef(0)
  const persistTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await store.getStage()
      if (cancelled) return
      if (s && s.mode) setStage(s)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const push = (next: StageState, throttled = false) => {
    // Never write before we have read: an unloaded remount holds EMPTY_STAGE,
    // and pushing that wipes the map and every token on the table's screen.
    if (!loaded) return
    setStage(next)
    const now = Date.now()
    if (!throttled || now - lastSent.current > 100) {
      lastSent.current = now
      channelRef.current?.sendStage(next)
    }
    if (persistTimer.current) clearTimeout(persistTimer.current)
    persistTimer.current = setTimeout(() => void store.saveStage(next), 800)
  }

  useEffect(() => {
    const t = setInterval(() => setAt(readNightProgress().at), 2000)
    return () => clearInterval(t)
  }, [])

  // Tell the stage which room it is in — six times a night, not every two
  // seconds. A new room also wipes whatever was held up for the last one.
  useEffect(() => {
    if (!loaded || !at || sentAt.current === at) return
    sentAt.current = at
    push({ ...stage, at, card: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [at, loaded])

  useEffect(() => {
    if (!loaded) return
    if (!overlays?.fighting && stage.card?.kind === 'note') push({ ...stage, card: null })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overlays?.fighting, loaded])

  const summonParty = () => {
    const existing = new Set(stage.tokens.map((t) => t.id))
    const added: StageToken[] = roster
      .filter((r) => r.character && !existing.has(`pc-${r.playerId}`))
      .map((r, i) => ({
        id: `pc-${r.playerId}`,
        label: (r.character!.build.name || r.playerName).slice(0, 2),
        name: r.character!.build.name || r.playerName,
        playerName: r.playerName,
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

  // The stage renders the first of these that is true, so the readout has to
  // agree with StageScreen's own order or the Book would lie to him.
  const held = stage.card
  const showing = overlays?.finale
    ? { what: 'The finale — the Moon', tone: C.gold }
    : overlays?.racing
      ? { what: 'The Snail Derby', tone: C.gold }
      : overlays?.game
        ? { what: 'A carnival game', tone: C.gold }
      : held && held.kind === 'slate'
        ? { what: `The slate — ${held.lines.join(' ')}`, tone: C.parchment }
        : held && held.kind === 'gates'
          ? { what: 'Three lanterns, and no words', tone: C.parchment }
      : stage.mode === 'map' && stage.mapUrl
        ? { what: 'The battle map', tone: C.sea }
        : { what: 'The title screen', tone: C.faint }
  const covered = !!(overlays?.finale || overlays?.racing || overlays?.game || (held && held.kind !== 'note'))
  const anythingUp = covered || !!held || (stage.mode === 'map' && !!stage.mapUrl)

  const backToTitle = () => {
    overlays?.clearFinale()
    overlays?.clearWheel()
    overlays?.clearGame()
    push({ ...stage, mode: 'ambient', card: null })
  }

  return (
    <div className="rounded-xl p-4" style={panelSurface}>
      <Eyebrow>The stage — what the iPad shows the table</Eyebrow>
      {!store.shared && (
        <p className="text-xs mt-1" style={{ color: C.gold }}>
          The stage needs the campaign lantern (Supabase) to reach the iPad.
        </p>
      )}

      {/* The stage faces away from him all night. This is the only way he
          knows what five people are looking at. */}
      <div
        className="rounded-lg px-3 py-2.5 mt-2 flex flex-wrap items-center justify-between gap-2"
        style={{ ...wellSurface, borderLeft: `3px solid ${showing.tone}` }}
      >
        <span className="min-w-0">
          <span className="block" style={{ ...eyebrow, fontSize: 10.5, color: C.brassDim }}>
            they are looking at
          </span>
          <span style={{ ...display, fontSize: 19, fontWeight: 600, color: showing.tone }}>
            {showing.what}
          </span>
          {overlays?.fighting && (
            <span className="text-xs" style={{ color: C.copper }}> · with the turn order over it</span>
          )}
          {covered && stage.mode === 'map' && stage.mapUrl && (
            <span className="block text-xs" style={{ color: C.faint }}>
              your map is still loaded, underneath
            </span>
          )}
          {overlays?.wheel && (
            <span className="block text-xs" style={{ color: C.faint }}>
              the wheel is up on their phones, not the iPad
            </span>
          )}
        </span>
        {anythingUp && (
          <Btn secondary onClick={backToTitle}>
            <Icon name="lantern" size={15} style={{ color: C.brassDim, marginRight: 6 }} />
            back to the title screen
          </Btn>
        )}
      </div>
      {loaded && cardsFor(at, !!overlays?.fighting).length > 0 && (
        <div className="mt-3">
          <p style={{ ...eyebrow, color: C.brassDim }}>hold something up to them</p>
          <div className="flex flex-wrap gap-2 mt-1.5">
            {cardsFor(at, !!overlays?.fighting).map((d) => {
              const up = stage.card?.id === d.card.id
              return (
                <button
                  key={d.card.id}
                  type="button"
                  aria-pressed={up}
                  onClick={() => push({ ...stage, card: up ? null : d.card })}
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ ...(up ? onState : chipOff), minHeight: 44, cursor: 'pointer' }}
                >
                  {d.chip}
                </button>
              )
            })}
            {stage.card && (
              <button
                type="button"
                onClick={() => push({ ...stage, card: null })}
                className="rounded-lg px-3 py-2 text-sm"
                style={{ ...chipOff, color: C.faint, minHeight: 44, cursor: 'pointer' }}
              >
                wipe the screen
              </button>
            )}
          </div>
        </div>
      )}

      {/* Segmented control: lit, never a gold fill. */}
      <div className="flex gap-2 mt-2">
        <button
          type="button"
          onClick={() => push({ ...stage, mode: 'ambient' })}
          aria-pressed={stage.mode === 'ambient'}
          className="flex-1 rounded-md py-2 text-sm inline-flex items-center justify-center gap-1.5"
          style={{ ...(stage.mode === 'ambient' ? onState : chipOff), minHeight: 44, cursor: 'pointer' }}
        >
          <Icon name="clues" size={14} /> Ambient
        </button>
        <button
          type="button"
          onClick={() => push({ ...stage, mode: 'map' })}
          disabled={!stage.mapUrl}
          aria-pressed={stage.mode === 'map'}
          className="flex-1 rounded-md py-2 text-sm inline-flex items-center justify-center gap-1.5"
          style={{
            ...(stage.mode === 'map' ? onState : chipOff),
            ...(stage.mapUrl ? null : { background: 'transparent', color: C.faint, border: `1px dashed ${C.brassDim}`, boxShadow: 'none' }),
            minHeight: 44,
            cursor: stage.mapUrl ? 'pointer' : 'not-allowed',
          }}
        >
          <Icon name="map" size={14} /> Map
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
            <TintOverlay tint={stage.tint} tokens={stage.tokens} />
            <FogOverlay
              fog={stage.fog}
              opacity={0.55}
              onReveal={(x, y) => {
                const fog = stage.fog ?? { on: true, reveals: [] }
                push({ ...stage, fog: { ...fog, reveals: [...fog.reveals, { x, y, r: fogRadius }] } })
              }}
            />
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
                  width: 36,
                  height: 36,
                  background: t.color,
                  color: C.ink,
                  border: `2px solid ${C.nightDeep}`,
                  boxShadow: `0 0 12px ${t.color}55`,
                  cursor: 'grab',
                  touchAction: 'none',
                  ...display,
                  fontSize: 13,
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
                const name = (window.prompt('Name this enemy (as it appears in initiative):', `Enemy ${n}`) ?? '').trim() || `Enemy ${n}`
                push({ ...stage, tokens: [...stage.tokens, { id: `foe-${crypto.randomUUID()}`, label: name.slice(0, 2), name, color: '#C96A6A', x: 0.5, y: 0.12 }] })
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
      {stage.mapUrl && (
        <>
          <p className="mt-3 mb-1" style={eyebrow}>
            the light
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TINTS.map((t) => {
              const on = (stage.tint ?? 'none') === t.id
              return (
                <button
                  key={t.id}
                  type="button"
                  title={t.hint}
                  aria-pressed={on}
                  onClick={() => push({ ...stage, tint: t.id })}
                  className="text-xs rounded-full px-3"
                  style={{ ...(on ? onState : chipOff), borderRadius: 999, cursor: 'pointer', minHeight: 36 }}
                >
                  <GlyphLabel text={t.label} size={13} glyphColor={on ? C.gold : C.brassDim} />
                </button>
              )
            })}
          </div>
          <p className="mt-3 mb-1" style={eyebrow}>
            fog of war
          </p>
          <p className="text-xs mb-1" style={{ color: C.faint }}>
            when it’s on, tap the map above to reveal a circle
          </p>
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              aria-pressed={!!stage.fog?.on}
              onClick={() => push({ ...stage, fog: { on: !stage.fog?.on, reveals: stage.fog?.reveals ?? [] } })}
              className="text-xs rounded-full px-3 inline-flex items-center gap-1.5"
              style={{ ...(stage.fog?.on ? onState : chipOff), borderRadius: 999, cursor: 'pointer', minHeight: 36 }}
            >
              <Icon name="wave" size={13} /> fog {stage.fog?.on ? 'on' : 'off'}
            </button>
            {stage.fog?.on && (
              <>
                {FOG_SIZES.map(([r, label]) => (
                  <button
                    key={label}
                    type="button"
                    aria-pressed={fogRadius === r}
                    onClick={() => setFogRadius(r)}
                    className="text-xs rounded-full px-3"
                    style={{ ...(fogRadius === r ? seaLit : chipOff), borderRadius: 999, cursor: 'pointer', minHeight: 36 }}
                  >
                    {label}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => push({ ...stage, fog: { on: true, reveals: [] } })}
                  className="text-xs rounded-full px-3"
                  style={{ ...chipOff, color: C.faint, borderRadius: 999, cursor: 'pointer', minHeight: 36 }}
                >
                  re-fog everything
                </button>
              </>
            )}
          </div>
        </>
      )}
      <p className="text-xs mt-3" style={{ color: C.faint }}>
        Every move you make here appears on the iPad within a breath. On the iPad, tap{' '}
        <Icon name="stage" size={13} style={{ color: C.brassDim }} /> in the header to enter stage mode. In a fight the
        iPad shows the order, whose turn it is, and who’s bloodied — enemy tokens light up when
        their name matches the initiative row.
      </p>
    </div>
  )
}
