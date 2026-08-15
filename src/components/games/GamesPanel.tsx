// 🎪 The DM's game booth. Pick a game, set the table, start it — every phone
// gets its controller and the iPad becomes the board. The Book keeps the
// small controls (reveal, whisper the prize, return to the story).

import { useState } from 'react'
import { GAME_TITLES, TOLL_QUESTIONS, type GameKind, type GameState } from '../../lib/games'
import type { Host } from '../../lib/gameHost'
import { newDraw, newNote, newToll } from '../../lib/gameHost'
import type { RosterEntry, Store } from '../../lib/store'
import type { Handout } from '../../types'
import { Btn, C, TextArea, TextInput, display } from '../ui'
import { DrawCanvas } from './DrawGame'

const BLURB: Record<GameKind, string> = {
  draw: 'One phone draws, the rest guess, the iPad shows the picture forming. Everyone takes a turn with the charcoal. Party score.',
  note: 'Every phone holds one note of the tune. Hold together and the chord builds on the iPad; let go and it falls. The Fair whispers distractions to one phone at a time.',
  toll: 'The Twins ask a question. Everyone answers, sealed. Answers go up on the iPad without names — the table argues who said what; you reveal one by one.',
}

const PRIZE_DEFAULT: Record<GameKind, string> = {
  draw: 'The stall-keeper hands you a paper lantern with something folded inside.',
  note: 'For a moment the whole tune was almost there. You each remember one more bar of it than you did.',
  toll: 'Brother Hush writes something in his book, and tears out a page for you.',
}

export function GamesPanel({
  store,
  roster,
  host,
  game,
  onWhisper,
}: {
  store: Store
  roster: RosterEntry[]
  host: Host | null
  game: GameState | null
  onWhisper: (h: Handout) => void
}) {
  const [pick, setPick] = useState<GameKind>('draw')
  const [drawRounds, setDrawRounds] = useState<number>(Math.min(5, Math.max(1, roster.length)))
  const [drawSeconds, setDrawSeconds] = useState<number>(45)
  const [noteSeconds, setNoteSeconds] = useState<number>(25)
  const [tollQ, setTollQ] = useState<string>(TOLL_QUESTIONS[0])
  const [prizeTo, setPrizeTo] = useState<string>('') // '' = everyone
  const [prize, setPrize] = useState<string>('')
  const [sent, setSent] = useState(false)

  const players = roster.map((r) => r.playerName)
  const canStart = store.shared && players.length > 0 && !!host

  const start = () => {
    if (!host) return
    setPrize(PRIZE_DEFAULT[pick])
    setPrizeTo('')
    if (pick === 'draw') host.start(newDraw(players, { rounds: drawRounds, seconds: drawSeconds }))
    if (pick === 'note') host.start(newNote(players, { seconds: noteSeconds }))
    if (pick === 'toll') host.start(newToll(players, tollQ.trim() || TOLL_QUESTIONS[0]))
  }

  const whisper = () => {
    if (!game) return
    const h: Handout = {
      id: crypto.randomUUID(),
      target: prizeTo || null,
      title: `${GAME_TITLES[game.kind]} · the prize`,
      body: prize.trim() || PRIZE_DEFAULT[game.kind],
      sentAt: new Date().toISOString(),
    }
    onWhisper(h)
    setSent(true)
    setTimeout(() => setSent(false), 2500)
  }

  if (game && host) {
    return (
      <div>
        <p style={{ ...display, fontSize: 20, color: C.gold }}>{GAME_TITLES[game.kind]} — live</p>

        {game.kind === 'draw' && (
          <div className="flex gap-4 items-start mt-2">
            <DrawCanvas strokes={game.strokes} size={180} />
            <div className="text-sm" style={{ color: C.parchment }}>
              <p>
                round {game.round}/{game.totalRounds} · <strong>{game.artist}</strong> draws
              </p>
              <p>
                word: <strong style={{ color: C.gold }}>{game.word}</strong>
              </p>
              <p>
                {game.phase === 'drawing' ? `${game.timeLeft}s` : game.phase} · party {game.score}
              </p>
              <p className="text-xs mt-1" style={{ color: C.faint }}>
                {game.guesses.slice(-3).map((g) => `${g.by}: ${g.text}`).join(' · ')}
              </p>
            </div>
          </div>
        )}

        {game.kind === 'note' && (
          <div className="text-sm mt-2" style={{ color: C.parchment }}>
            <p>
              {game.phase === 'holding' ? `${Math.ceil(game.timeLeft)}s left` : game.phase} · chord {Math.round(game.chord)}% · held together {game.heldTogether.toFixed(0)}s
            </p>
            <p className="text-xs" style={{ color: C.faint }}>
              holding: {game.players.filter((p) => game.held[p]).join(', ') || '—'}
              {game.distract ? ` · the Fair is on ${game.distract.target}` : ''}
            </p>
            {game.phase === 'end' && <p style={{ color: game.won ? C.gold : C.faint }}>{game.won ? 'They held it. Play the carousel loop now — the tune, all but one note.' : 'It fell apart. The Fair smiles.'}</p>}
            {game.phase === 'holding' && (
              <p className="text-xs" style={{ color: C.faint }}>
                Tip: start the carousel loop from Sound when the chord passes 80%.
              </p>
            )}
          </div>
        )}

        {game.kind === 'toll' && (
          <div className="text-sm mt-2" style={{ color: C.parchment }}>
            <p style={{ ...display, fontSize: 18 }}>“{game.question}”</p>
            <p>
              {game.answers.length}/{game.players.length} sealed
              {game.phase !== 'answer' ? ` · ${game.revealed}/${game.answers.length} revealed` : ''}
            </p>
            {game.phase !== 'answer' && (
              <ul className="text-xs mt-1" style={{ color: C.faint }}>
                {game.order.map((idx, i) => {
                  const a = game.answers[idx]
                  return (
                    <li key={idx}>
                      {i < game.revealed ? '✦' : '·'} {a.text} — <strong style={{ color: C.gold }}>{a.by}</strong>
                    </li>
                  )
                })}
              </ul>
            )}
            {game.phase === 'answer' && (
              <p className="text-xs" style={{ color: C.faint }}>
                Only you can see who wrote what. When they’re sealed, put the answers up.
              </p>
            )}
            <div className="mt-2">
              {game.phase === 'answer' && (
                <Btn onClick={() => host.advance()} disabled={game.answers.length === 0} shimmer>
                  Put the answers up (no names)
                </Btn>
              )}
              {game.phase === 'reveal' && (
                <Btn onClick={() => host.advance()} shimmer>
                  Reveal the next name
                </Btn>
              )}
            </div>
          </div>
        )}

        <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${C.panelEdge}` }}>
          <p className="text-xs mb-1" style={{ color: C.faint }}>
            Whisper the prize (rides on a sealed envelope; survives a sleeping phone)
          </p>
          <div className="flex flex-wrap gap-2 items-start">
            <select
              aria-label="Prize to"
              value={prizeTo}
              onChange={(e) => setPrizeTo(e.target.value)}
              className="rounded-md px-3 py-2"
              style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
            >
              <option value="">Everyone</option>
              {roster.map((r) => (
                <option key={r.playerId} value={r.playerName}>
                  {r.playerName} only
                </option>
              ))}
            </select>
            <div style={{ flex: 1, minWidth: 220 }}>
              <TextArea value={prize} onChange={setPrize} rows={2} placeholder={PRIZE_DEFAULT[game.kind]} />
            </div>
          </div>
          <div className="flex gap-2 mt-2">
            <Btn onClick={whisper} shimmer>
              {sent ? 'Prize whispered ✦' : 'Whisper the prize'}
            </Btn>
            <Btn secondary onClick={() => host.stop()}>
              Return to the story
            </Btn>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <p className="text-sm" style={{ color: C.faint }}>
        Cooperative set-pieces. Every phone becomes a controller; the iPad stage becomes the board. Start one when the story arrives at a stall.
      </p>
      <div className="grid gap-2 mt-2">
        {(Object.keys(GAME_TITLES) as GameKind[]).map((k) => (
          <button
            key={k}
            type="button"
            onClick={() => setPick(k)}
            className="text-left rounded-lg px-3 py-2"
            style={{ background: pick === k ? `${C.gold}1A` : C.night, border: `1px solid ${pick === k ? C.gold : C.panelEdge}`, color: C.parchment, cursor: 'pointer' }}
            aria-pressed={pick === k}
          >
            <span style={{ ...display, fontSize: 18, color: pick === k ? C.gold : C.parchment }}>{GAME_TITLES[k]}</span>
            <p className="text-xs" style={{ color: C.faint }}>
              {BLURB[k]}
            </p>
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        {pick === 'draw' && (
          <>
            <label className="text-xs" style={{ color: C.faint }}>
              rounds{' '}
              <input type="number" min={1} max={12} value={drawRounds} onChange={(e) => setDrawRounds(Math.max(1, Math.min(12, Number(e.target.value) || 1)))} className="rounded-md px-2 py-1 ml-1" style={{ width: 64, background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 40 }} />
            </label>
            <label className="text-xs" style={{ color: C.faint }}>
              seconds each{' '}
              <input type="number" min={15} max={120} value={drawSeconds} onChange={(e) => setDrawSeconds(Math.max(15, Math.min(120, Number(e.target.value) || 45)))} className="rounded-md px-2 py-1 ml-1" style={{ width: 72, background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 40 }} />
            </label>
          </>
        )}
        {pick === 'note' && (
          <label className="text-xs" style={{ color: C.faint }}>
            seconds{' '}
            <input type="number" min={10} max={90} value={noteSeconds} onChange={(e) => setNoteSeconds(Math.max(10, Math.min(90, Number(e.target.value) || 25)))} className="rounded-md px-2 py-1 ml-1" style={{ width: 72, background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 40 }} />
          </label>
        )}
        {pick === 'toll' && (
          <div className="w-full">
            <div className="flex flex-wrap gap-1 mb-2">
              {TOLL_QUESTIONS.map((q) => (
                <button key={q} type="button" onClick={() => setTollQ(q)} className="text-xs rounded-full px-2 py-1" style={{ background: tollQ === q ? `${C.gold}22` : 'transparent', border: `1px solid ${tollQ === q ? C.gold : C.panelEdge}`, color: C.parchment, cursor: 'pointer' }}>
                  {q}
                </button>
              ))}
            </div>
            <TextInput value={tollQ} onChange={setTollQ} placeholder="Or ask your own…" />
          </div>
        )}
      </div>

      <Btn onClick={start} disabled={!canStart} shimmer>
        Start {GAME_TITLES[pick]}
      </Btn>
      {!store.shared && (
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          Needs the campaign lantern (Supabase) to reach the phones.
        </p>
      )}
      {store.shared && players.length === 0 && (
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          No one at the table yet.
        </p>
      )}
    </div>
  )
}
