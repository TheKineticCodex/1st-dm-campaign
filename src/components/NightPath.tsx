// Tonight's path — the Lantern-Keeper's own choose-your-own-adventure, and
// the spine of the Tonight tab.
//
// One checkpoint open at a time: the gold words to read, the two or three
// things to do, the buttons those things need, the doors they might walk
// through, and — folded beside them — the small ones they might try that
// aren't on the list. Tap the door the party took; the Book writes it down
// and moves you on. Everything is kept per night, so a reload mid-scene
// loses nothing, and the trail at the end is the night as it happened.
//
// The progress lives in lib/night.ts, not here, so the Table can show the
// fight he is actually walking into.

import { useEffect, useMemo, useRef, useState } from 'react'
import { ACT1_SCENES, type SceneCue } from '../data/act1Scenes'
import { NIGHT_PATH, weigh, type Checkpoint, type NightBattle, type PathDoor } from '../data/nightPath'
import { SCENES, setScene } from '../lib/ambience'
import { fireCue } from '../lib/cues'
import { EMPTY_NIGHT, readNightProgress, writeNightProgress, type NightProgress } from '../lib/night'
import { joinTableChannelLazy, type TableChannel } from '../lib/realtime'
import { isCarouselPlaying, subscribeSong } from '../lib/song'
import { seatNameFor } from '../data/campaign'
import { whoCard } from '../data/cheatSheet'
import type { RosterEntry, Store } from '../lib/store'
import { Btn, C, display, eyebrow, numerals, onState, panelSurface, seaLit, splitLeadGlyph, wellSurface } from './ui'
import { Icon, Spark } from './icons'

export function BattleCard({ b, level, heads, startOpen }: { b: NightBattle; level: number; heads: number; startOpen?: boolean }) {
  const [open, setOpen] = useState(!!startOpen)
  const w = weigh(b.xp, level, heads)
  const boss = b.kind === 'boss'
  return (
    <div className="rounded-xl mt-2" style={{ ...panelSurface, border: `1px solid ${boss ? C.blood : C.brassDim}` }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-3 text-left px-3.5 py-3"
        style={{ background: 'none', border: 'none', cursor: 'pointer', minHeight: 44 }}
      >
        <span className="min-w-0">
          <span className="text-xs uppercase block" style={{ ...eyebrow, color: boss ? C.blood : C.copper, fontSize: 11, letterSpacing: '0.18em' }}>
            <Icon name="swords" size={12} style={{ marginRight: 5, marginTop: -2 }} />
            {boss ? 'the boss of the night' : 'the easy fight'}
          </span>
          <span className="block" style={{ ...display, fontSize: 19, fontWeight: 600, color: C.parchment }}>
            {b.name}
          </span>
          <span className="text-xs block" style={{ color: C.faint }}>
            {b.force} · <span style={{ ...numerals }}>{b.xp} XP</span> — {w.label}
          </span>
        </span>
        <span style={{ color: C.brassDim, fontSize: 20, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="px-3.5 pb-3.5 grid gap-2.5">
          <p className="text-xs" style={{ color: C.faint }}>
            {w.budget}
          </p>
          <p className="text-sm">
            <span style={{ color: C.copper }}>When: </span>
            <span style={{ color: C.parchment }}>{b.when}</span>
          </p>
          <p className="text-sm">
            <span style={{ color: C.copper }}>The floor: </span>
            <span style={{ color: C.parchment }}>{b.arena}</span>
          </p>
          <div>
            <p className="text-xs uppercase mb-1" style={{ ...eyebrow, fontSize: 10.5, letterSpacing: '0.18em' }}>
              How to run it
            </p>
            {b.tricks.map((t) => (
              <p key={t} className="text-sm flex gap-1.5 mb-1" style={{ color: C.parchment }}>
                <Spark size={10} style={{ marginTop: 6, flexShrink: 0, color: C.brassDim }} />
                <span>{t}</span>
              </p>
            ))}
          </div>
          <p className="text-sm rounded-lg px-3 py-2" style={{ ...seaLit }}>
            <span style={{ color: C.sea }}>The way out: </span>
            {b.ends}
          </p>
          <p className="text-sm">
            <span style={{ color: C.sea }}>If they win: </span>
            <span style={{ color: C.parchment }}>{b.win}</span>
          </p>
          <p className="text-sm">
            <span style={{ color: C.blood }}>If they lose: </span>
            <span style={{ color: C.parchment }}>{b.loss}</span>
          </p>
          <p className="text-xs" style={{ color: C.faint }}>
            {b.ifStronger}
          </p>

          <div className="grid gap-2 mt-1">
            {b.foes.map((f) => (
              <div key={f.name} className="rounded-lg px-3 py-2" style={{ ...wellSurface }}>
                <p style={{ ...display, fontSize: 16, fontWeight: 600, color: C.gold }}>{f.name}</p>
                <p className="text-xs italic mb-1" style={{ color: C.faint }}>
                  {f.look}
                </p>
                <p className="text-sm" style={{ ...numerals, color: C.parchment }}>
                  AC {f.ac} · HP {f.hp} · {f.speed}
                </p>
                <p className="text-sm" style={{ ...numerals, color: C.parchment }}>
                  {f.attack}
                </p>
                {f.special && (
                  <p className="text-xs mt-1" style={{ color: C.copper }}>
                    {f.special}
                  </p>
                )}
                <p className="text-xs mt-1" style={{ color: C.faint }}>
                  {f.tactics}
                </p>
                <p className="text-xs mt-1" style={{ color: C.brassDim }}>
                  {f.block}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function DoorButton({ d, onTake }: { d: PathDoor; onTake: () => void }) {
  return (
    <button
      type="button"
      onClick={onTake}
      className="w-full text-left rounded-lg px-3.5 py-3 flex items-start gap-2.5"
      style={{ ...panelSurface, cursor: 'pointer', minHeight: 52 }}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center rounded-md"
        style={{ width: 22, height: 22, flexShrink: 0, marginTop: 1, background: 'transparent', border: `1px solid ${d.battle ? C.blood : C.brassDim}` }}
      >
        {d.battle && <Icon name="swords" size={12} style={{ color: C.blood }} />}
      </span>
      <span className="min-w-0">
        <span className="block text-sm" style={{ color: C.parchment, fontWeight: 600 }}>
          {d.label}
        </span>
        <span className="block text-xs" style={{ color: C.faint }}>
          {d.then}
        </span>
      </span>
    </button>
  )
}

/**
 * The scene's own buttons, directly under the bullet that tells him to press
 * them. They used to live a tab away from the instruction naming them, which
 * is how the heart of the night ended up with the words on one screen and the
 * five sealed readings on another.
 */
function CueRow({ store, roster, cues, ambience, note }: {
  store: Store
  roster: RosterEntry[]
  cues: SceneCue[]
  ambience?: string
  note: (m: string) => void
}) {
  const channel = useRef<TableChannel | null>(null)
  const [carouselOn, setCarouselOn] = useState(isCarouselPlaying())

  useEffect(() => subscribeSong(() => setCarouselOn(isCarouselPlaying())), [])
  useEffect(() => {
    // Joins are ref-counted (lib/realtime): co-mounting beside the Table's own
    // join is safe, and the socket only leaves with the last one.
    channel.current = joinTableChannelLazy(store.getChannelId(), {})
    return () => {
      channel.current?.close()
    }
  }, [store])

  const seatFor = (wanted?: string | null) => (wanted ? seatNameFor(roster, wanted) : null)
  const room = SCENES.find((s) => s.id === ambience)
  if (!cues.length && !room) return null

  return (
    <div className="flex flex-wrap gap-2 mt-2.5">
      {room && (
        <button
          type="button"
          onClick={() => void setScene(room.id).catch(() => note('The room would not load — tap again.'))}
          className="rounded-lg px-3 py-2 text-sm"
          style={{ ...wellSurface, color: C.parchment, minHeight: 44, cursor: 'pointer' }}
        >
          <Icon name="tent" size={14} style={{ color: C.brassDim, marginRight: 6 }} />
          set the room
        </button>
      )}
      {cues.map((cue) => {
        const seat = cue.kind === 'whisper' ? seatFor(cue.whisper?.target) : null
        const away = cue.kind === 'whisper' && !!cue.whisper?.target && !seat
        const text = cue.kind === 'song' && cue.song === 'carousel' && carouselOn ? '■ stop the carousel' : cue.label
        const [glyph, words] = splitLeadGlyph(text)
        return (
          <button
            key={cue.label}
            type="button"
            disabled={!!away}
            onClick={() =>
              fireCue(
                seat && cue.whisper ? { ...cue, whisper: { ...cue.whisper, target: seat } } : cue,
                { store, channel: channel.current, note },
              )
            }
            title={away ? `${cue.whisper!.target} hasn’t joined yet` : undefined}
            className="rounded-lg px-3 py-2 text-sm inline-flex items-center gap-1.5"
            style={{
              ...(cue.kind === 'whisper' ? onState : { ...wellSurface, color: C.parchment }),
              ...(away ? { color: C.faint, border: `1px dashed ${C.brassDim}` } : null),
              minHeight: 44,
              cursor: away ? 'not-allowed' : 'pointer',
            }}
          >
            {glyph && <Icon name={glyph} size={14} style={{ color: cue.kind === 'whisper' ? C.gold : C.brassDim, flexShrink: 0 }} />}
            <span>{words}</span>
          </button>
        )
      })}
    </div>
  )
}

/**
 * Whoever is standing in front of him, and everything the Book knows about
 * them — in the checkpoint, not on another tab. Open by default: this is the
 * thing he was hunting for mid-scene, so it does not get to be a fold.
 */
function WhoIsHere({ keys }: { keys: string[] }) {
  const cards = keys.map(whoCard).filter((c): c is NonNullable<typeof c> => !!c)
  if (!cards.length) return null
  return (
    <div className="mt-3">
      <p className="text-xs uppercase mb-1" style={{ ...eyebrow, fontSize: 10.5, letterSpacing: '0.18em', color: C.copper }}>
        Who is in front of you
      </p>
      {cards.map((c) => (
        <div key={c.title} className="rounded-lg px-3 py-2.5 mb-1.5" style={{ ...wellSurface, borderLeft: `3px solid ${C.copper}` }}>
          <p style={{ ...display, fontSize: 17, fontWeight: 600, color: C.parchment }}>{c.title}</p>
          {c.lines.map((l, i) => (
            <p key={i} className="text-sm mt-1" style={{ color: C.parchment, lineHeight: 1.45 }}>
              <span style={{ color: C.copper }}>·</span> {l}
            </p>
          ))}
        </div>
      ))}
    </div>
  )
}

export function NightPath({ store, roster, onGo, onWalked }: {
  store: Store
  roster: RosterEntry[]
  onGo?: (section: string) => void
  /** True once any door has been tapped. The rhyme above us steps aside on it. */
  onWalked?: (walked: boolean) => void
}) {
  const [p, setP] = useState<NightProgress>(() => readNightProgress())
  const [said, setSaid] = useState<string | null>(null)

  const save = (next: NightProgress) => {
    setP(next)
    writeNightProgress(next)
    onWalked?.(Object.keys(next.took).length > 0)
  }

  const note = (m: string) => {
    setSaid(m)
    setTimeout(() => setSaid(null), 2500)
  }

  // Their real level and headcount, straight off the roster.
  const levels = roster.map((r) => r.character?.build.level ?? 0).filter((n) => n > 0)
  const level = levels.length ? Math.min(...levels) : NIGHT_PATH.writtenFor
  const heads = Math.max(1, roster.length || 5)

  const cps = NIGHT_PATH.checkpoints
  const atIndex = Math.max(0, cps.findIndex((c) => c.id === p.at))
  const current: Checkpoint | undefined = p.done ? undefined : cps[atIndex]

  const battleFor = (id?: string) => NIGHT_PATH.battles.find((b) => b.id === id)

  const take = (cp: Checkpoint, d: PathDoor) => {
    const took = { ...p.took, [cp.id]: d.id }
    if (d.goes === 'END') return save({ took, at: cp.id, done: true })
    const nextIdx = d.goes ? cps.findIndex((c) => c.id === d.goes) : atIndex + 1
    if (nextIdx < 0 || nextIdx >= cps.length) return save({ took, at: cp.id, done: true })
    save({ took, at: cps[nextIdx]!.id })
  }

  const stepBack = () => {
    if (p.done) return save({ ...p, done: false })
    const prev = cps[atIndex - 1]
    if (!prev) return
    const took = { ...p.took }
    delete took[prev.id]
    save({ took, at: prev.id })
  }

  const walked = useMemo(() => cps.filter((c) => p.took[c.id]), [p.took, cps])

  return (
    <div className="rounded-xl p-4 mb-4" style={{ ...panelSurface, border: `1px solid ${C.brassDim}` }}>
      <div className="flex items-baseline justify-between gap-3">
        <p style={{ ...eyebrow, letterSpacing: '0.22em' }}>Tonight’s path</p>
        <p style={{ ...numerals, fontSize: 13, color: C.faint, whiteSpace: 'nowrap' }}>
          {walked.length}/{cps.length} checkpoints
        </p>
      </div>
      <p style={{ ...display, fontSize: 24, fontWeight: 700, color: C.parchment }}>
        Session {NIGHT_PATH.session} · {NIGHT_PATH.title}
      </p>
      <p className="text-sm italic mt-1" style={{ color: C.gold }}>
        <Icon name="moonNew" size={13} style={{ marginRight: 5, marginTop: -2 }} />
        {NIGHT_PATH.moon}
      </p>
      <p className="text-xs mt-1" style={{ color: C.faint }}>
        Written for level {NIGHT_PATH.writtenFor}
        {levels.length ? ` · your party reads as level ${level}` : ' · the roster has no characters yet'}
      </p>

      {/* the trail — where they have already been */}
      {walked.length > 0 && (
        <div className="mt-3 grid gap-1">
          {walked.map((c) => {
            const d = c.doors.find((x) => x.id === p.took[c.id])
            return (
              <div key={c.id} className="flex items-start gap-2 text-sm">
                <span
                  aria-hidden="true"
                  className="inline-flex items-center justify-center rounded-md"
                  style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1, ...onState, borderColor: C.sea }}
                >
                  <Spark size={11} />
                </span>
                <span className="min-w-0">
                  <span style={{ color: C.sea }}>{c.title}</span>
                  {d?.marks && <span style={{ color: C.faint }}> — {d.marks}</span>}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* the checkpoint you are standing on */}
      {current && (
        <div className="mt-3 rounded-xl p-3.5" style={{ ...wellSurface, border: `1px solid ${C.gold}` }}>
          <p className="text-xs uppercase" style={{ ...eyebrow, fontSize: 11, letterSpacing: '0.18em', color: C.gold }}>
            <Icon name="tonight" size={12} style={{ marginRight: 5, marginTop: -2 }} />
            checkpoint {atIndex + 1} of {cps.length} · {current.minutes}
          </p>
          <p style={{ ...display, fontSize: 22, fontWeight: 700, color: C.parchment }}>{current.title}</p>
          <p className="text-xs mb-2" style={{ color: C.faint }}>
            {current.where} — {current.oneBreath}
          </p>

          <p
            className="rounded-lg px-3 py-2.5 text-sm mb-2.5"
            style={{ ...seaLit, borderColor: C.gold, color: C.gold, fontStyle: 'italic', lineHeight: 1.5 }}
          >
            “{current.readAloud}”
          </p>

          <p className="text-xs uppercase mb-1" style={{ ...eyebrow, fontSize: 10.5, letterSpacing: '0.18em' }}>
            Do this
          </p>
          {current.doThis.map((t) => (
            <p key={t} className="text-sm flex gap-1.5 mb-1" style={{ color: C.parchment }}>
              <Spark size={10} style={{ marginTop: 6, flexShrink: 0, color: C.brassDim }} />
              <span>{t}</span>
            </p>
          ))}

          {current.lands?.map((l) => (
            <p key={l.who} className="text-xs mt-1" style={{ color: C.copper }}>
              <Icon name="roster" size={11} style={{ marginRight: 4, marginTop: -2 }} />
              {l.who}: {l.note}
            </p>
          ))}

          {/* the buttons the bullets above just asked for */}
          <CueRow
            store={store}
            roster={roster}
            cues={ACT1_SCENES[current.scene]?.cues ?? []}
            ambience={ACT1_SCENES[current.scene]?.ambience}
            note={note}
          />
          {said && (
            <p role="status" className="text-xs mt-1.5" style={{ color: C.gold }}>
              {said}
            </p>
          )}

          {current.who && <WhoIsHere keys={current.who} />}

          {/* the fights available here — open, because hunting for AC mid-fight
              was one of the four things that made session 3 messy */}
          {current.doors
            .map((d) => battleFor(d.battle))
            .filter((b): b is NightBattle => !!b)
            .map((b) => (
              <BattleCard key={b.id} b={b} level={level} heads={heads} startOpen />
            ))}

          <p className="text-xs uppercase mt-3 mb-1.5" style={{ ...eyebrow, fontSize: 10.5, letterSpacing: '0.18em' }}>
            Tap what they do
          </p>
          <div className="grid gap-1.5">
            {current.doors.map((d) => (
              <DoorButton key={d.id} d={d} onTake={() => take(current, d)} />
            ))}
          </div>

          <AlsoMight items={current.alsoMight} />

          <p className="text-xs mt-3" style={{ color: C.faint }}>
            {current.exit}
          </p>
        </div>
      )}

      {p.done && (
        <div className="mt-3 rounded-xl p-3.5" style={{ ...seaLit }}>
          <p style={{ ...display, fontSize: 20, fontWeight: 700, color: C.sea }}>
            <Spark size={14} style={{ marginRight: 6 }} />
            The music ends the session, not you.
          </p>
          <p className="text-sm mt-1" style={{ color: C.parchment }}>
            Let the carousel fade behind them and stop there. Then two things, while it is warm — the pre-session list
            clears itself the moment the night is written down.
          </p>
          <div className="flex flex-wrap gap-2 mt-2.5">
            <Btn secondary onClick={() => onGo?.('level')}>
              <Icon name="sheet" size={15} style={{ color: C.brassDim, marginRight: 6 }} />
              level them to 2
            </Btn>
            <Btn secondary onClick={() => onGo?.('notes')}>
              <Icon name="notes" size={15} style={{ color: C.brassDim, marginRight: 6 }} />
              write tonight’s three lines
            </Btn>
          </div>
        </div>
      )}

      <div className="flex items-center gap-4 mt-3">
        {(walked.length > 0 || p.done) && (
          <button
            type="button"
            onClick={stepBack}
            className="text-xs"
            style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', minHeight: 36, padding: 0, textDecoration: 'underline' }}
          >
            back a step
          </button>
        )}
        {walked.length > 0 && (
          <button
            type="button"
            onClick={() => save(EMPTY_NIGHT)}
            className="text-xs"
            style={{ background: 'none', border: 'none', color: C.faint, cursor: 'pointer', minHeight: 36, padding: 0, textDecoration: 'underline' }}
          >
            walk the night again
          </button>
        )}
      </div>
    </div>
  )
}

/** The small ones — not on the list, but they might. */
function AlsoMight({ items }: { items: { if: string; then: string }[] }) {
  const [open, setOpen] = useState(false)
  if (!items.length) return null
  return (
    <div className="mt-2.5">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="text-xs flex items-center gap-1.5"
        style={{ background: 'none', border: 'none', color: C.copper, cursor: 'pointer', minHeight: 36, padding: 0 }}
      >
        <Icon name="sparkOutline" size={12} />
        they might also… ({items.length}) {open ? '−' : '+'}
      </button>
      {open && (
        <div className="grid gap-1.5 mt-1 pl-1">
          {items.map((m) => (
            <p key={m.if} className="text-xs" style={{ color: C.faint }}>
              <span style={{ color: C.parchment }}>{m.if}</span> — {m.then}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}
