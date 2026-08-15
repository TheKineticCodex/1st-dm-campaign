// 🎨 Draw the Missing Piece — one phone draws, the rest guess, the iPad
// shows the picture forming stroke by stroke. Cooperative: the party's
// score is how many of the round's words they got.

import { useEffect, useRef, useState } from 'react'
import type { DrawInput, DrawState, Stroke } from '../../lib/games'
import { C, display } from '../ui'

// ------------------------------------------------------------ canvas (shared)

function paint(canvas: HTMLCanvasElement, strokes: Stroke[], live?: Stroke | null) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const W = canvas.width
  const H = canvas.height
  ctx.clearRect(0, 0, W, H)
  ctx.fillStyle = '#F2E9D8'
  ctx.fillRect(0, 0, W, H)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.strokeStyle = '#241A42'
  const draw = (s: Stroke) => {
    if (s.p.length < 2) return
    ctx.lineWidth = s.w * Math.min(W, H)
    ctx.beginPath()
    ctx.moveTo(s.p[0] * W, s.p[1] * H)
    if (s.p.length === 2) ctx.lineTo(s.p[0] * W + 0.1, s.p[1] * H + 0.1)
    for (let i = 2; i < s.p.length; i += 2) ctx.lineTo(s.p[i] * W, s.p[i + 1] * H)
    ctx.stroke()
  }
  for (const s of strokes) draw(s)
  if (live) draw(live)
}

export function DrawCanvas({ strokes, size, live }: { strokes: Stroke[]; size: number; live?: Stroke | null }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    if (ref.current) paint(ref.current, strokes, live)
  }, [strokes, live, size])
  return <canvas ref={ref} width={size} height={size} style={{ width: size, height: size, borderRadius: 12, border: `3px solid ${C.gold}`, touchAction: 'none', display: 'block', margin: '0 auto' }} />
}

// ------------------------------------------------------------ phone

export function DrawPhone({ state, me, send }: { state: DrawState; me: string; send: (i: DrawInput) => void }) {
  const isArtist = state.artist === me
  const [live, setLive] = useState<Stroke | null>(null)
  const [guess, setGuess] = useState('')
  const canvasWrap = useRef<HTMLDivElement>(null)
  const size = Math.min(320, typeof window !== 'undefined' ? window.innerWidth - 48 : 300)
  const buffer = useRef<number[]>([])
  const flush = useRef<ReturnType<typeof setTimeout> | null>(null)

  const norm = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement
    const r = el.getBoundingClientRect()
    return [Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)), Math.max(0, Math.min(1, (e.clientY - r.top) / r.height))]
  }
  const onDown = (e: React.PointerEvent) => {
    if (!isArtist || state.phase !== 'drawing') return
    ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const [x, y] = norm(e)
    const s: Stroke = { p: [x, y], w: 0.02 }
    setLive(s)
    send({ type: 'stroke', stroke: s })
    buffer.current = []
  }
  const onMove = (e: React.PointerEvent) => {
    if (!isArtist || !live) return
    const [x, y] = norm(e)
    setLive((cur) => (cur ? { ...cur, p: [...cur.p, x, y] } : cur))
    buffer.current.push(x, y)
    if (!flush.current)
      flush.current = setTimeout(() => {
        flush.current = null
        if (buffer.current.length) {
          send({ type: 'stroke-append', p: buffer.current })
          buffer.current = []
        }
      }, 90)
  }
  const onUp = () => {
    if (!isArtist) return
    if (buffer.current.length) {
      send({ type: 'stroke-append', p: buffer.current })
      buffer.current = []
    }
    setLive(null)
  }

  const submitGuess = () => {
    const t = guess.trim()
    if (!t) return
    send({ type: 'guess', text: t })
    setGuess('')
  }

  const blanks = state.word.replace(/[^\s]/g, '_').replace(/\s/g, '  ')

  return (
    <div className="w-full flex flex-col items-center">
      <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
        round {state.round}/{state.totalRounds} · {state.timeLeft}s · party {state.score}
      </p>
      {state.phase === 'intro' && <p className="text-sm mt-2" style={{ color: C.faint }}>The stall-keeper hands {state.artist} a stick of charcoal…</p>}
      {state.phase === 'reveal' && (
        <p className="mt-2 text-center" style={{ ...display, fontSize: 22, color: C.gold }}>
          {state.solvedBy ? `${state.solvedBy} got it — “${state.word}”` : `Time. It was “${state.word}”.`}
        </p>
      )}
      {state.phase === 'end' && (
        <p className="mt-2 text-center" style={{ ...display, fontSize: 24, color: C.gold }}>
          {state.score} of {state.totalRounds}. {state.score >= state.totalRounds - 1 ? 'The Fair is impressed, and worried.' : 'The Fair keeps its prizes close.'}
        </p>
      )}
      {(state.phase === 'drawing' || state.phase === 'reveal') && (
        <>
          {isArtist ? (
            <p className="mt-2 text-center">
              <span className="text-xs" style={{ color: C.faint }}>draw </span>
              <strong style={{ ...display, fontSize: 22, color: C.gold }}>{state.word}</strong>
            </p>
          ) : (
            <p className="mt-2 text-center" style={{ ...display, fontSize: 20, letterSpacing: '0.15em', color: C.parchment }}>
              {blanks}
            </p>
          )}
          <div
            ref={canvasWrap}
            className="mt-2"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            style={{ touchAction: 'none', cursor: isArtist ? 'crosshair' : 'default' }}
          >
            <DrawCanvas strokes={state.strokes} live={live} size={size} />
          </div>
          {isArtist && state.phase === 'drawing' && (
            <button type="button" onClick={() => send({ type: 'clear' })} className="text-xs underline mt-2" style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}>
              wipe the slate
            </button>
          )}
          {!isArtist && state.phase === 'drawing' && !state.solvedBy && (
            <div className="flex gap-2 mt-3 w-full" style={{ maxWidth: 360 }}>
              <input
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                placeholder="What is it?"
                className="flex-1 rounded-md px-3 py-2"
                style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
              />
              <button type="button" onClick={submitGuess} className="rounded-md px-4" style={{ background: C.gold, color: C.ink, border: 'none', minHeight: 44, cursor: 'pointer', fontWeight: 700 }}>
                Guess
              </button>
            </div>
          )}
          <div className="mt-2 text-xs text-center" style={{ color: C.faint, maxWidth: 360 }}>
            {state.guesses.slice(-4).map((g, i) => (
              <span key={i} style={{ color: g.right ? C.sea : C.faint }}>
                {g.by}: {g.text}
                {i < Math.min(3, state.guesses.length - 1) ? ' · ' : ''}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// ------------------------------------------------------------ stage

export function DrawStage({ state }: { state: DrawState }) {
  const size = Math.min(typeof window !== 'undefined' ? Math.min(window.innerWidth * 0.55, window.innerHeight * 0.78) : 600, 720)
  const blanks = state.word.replace(/[^\s]/g, '_').replace(/\s/g, '   ')
  return (
    <div className="w-full h-full flex items-center justify-center gap-10 px-10">
      <div>
        <DrawCanvas strokes={state.strokes} size={size} />
      </div>
      <div style={{ maxWidth: 380 }}>
        <p className="text-sm uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.3em' }}>
          the carnival presents
        </p>
        <h1 style={{ ...display, fontSize: 44, fontWeight: 700, color: C.gold, lineHeight: 1.05 }}>Draw the Missing Piece</h1>
        <p className="mt-3" style={{ color: C.parchment, fontSize: 20 }}>
          <strong>{state.artist}</strong> draws · round {state.round}/{state.totalRounds}
        </p>
        <p style={{ ...display, fontSize: 40, letterSpacing: '0.2em', color: state.phase === 'reveal' || state.phase === 'end' ? C.gold : C.parchment, marginTop: 8 }}>
          {state.phase === 'reveal' || state.phase === 'end' ? state.word : blanks}
        </p>
        <p style={{ ...display, fontSize: 64, fontWeight: 700, color: state.timeLeft <= 10 ? '#E0928F' : C.parchment, lineHeight: 1 }}>{state.phase === 'drawing' ? state.timeLeft : ''}</p>
        <p className="mt-2" style={{ color: C.faint }}>party {state.score} · {state.phase === 'end' ? 'the end' : ''}</p>
        <div className="mt-3">
          {state.guesses.slice(-6).map((g, i) => (
            <p key={i} style={{ color: g.right ? C.sea : C.faint, fontSize: 18 }}>
              {g.by}: {g.text}
              {g.right ? ' ✦' : ''}
            </p>
          ))}
        </div>
      </div>
    </div>
  )
}
