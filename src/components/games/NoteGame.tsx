// 🎵 Hold the Note — the campaign as a game. Every phone holds one note of
// the Sea's song; the chord assembles on the iPad while everyone holds. The
// Fair tries to distract you. Hold together long enough and the tune plays
// clean — except the missing note, which stays silent. Nobody says why.

import { useEffect, useRef, useState } from 'react'
import type { NoteInput, NoteState } from '../../lib/games'
import { C, bloodLit, display, eyebrow, numerals } from '../ui'
import { Icon } from '../icons'

// A soft sustained tone on the phone while you hold. Needs audio unlocked —
// which the hold itself provides (it is a tap).
let AC: AudioContext | null = null
let osc: OscillatorNode | null = null
let gain: GainNode | null = null
function startTone(midi: number) {
  try {
    AC ??= new AudioContext()
    if (AC.state === 'suspended') void AC.resume()
    stopTone()
    osc = AC.createOscillator()
    gain = AC.createGain()
    osc.type = 'sine'
    osc.frequency.value = 440 * Math.pow(2, (midi - 69) / 12)
    gain.gain.setValueAtTime(0.0001, AC.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.12, AC.currentTime + 0.25)
    osc.connect(gain).connect(AC.destination)
    osc.start()
  } catch {
    /* no sound here */
  }
}
function stopTone() {
  if (!AC || !osc || !gain) return
  try {
    const t = AC.currentTime
    gain.gain.cancelScheduledValues(t)
    gain.gain.setValueAtTime(gain.gain.value, t)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    osc.stop(t + 0.25)
  } catch {
    /* already stopped */
  }
  osc = null
  gain = null
}

const NOTE_NAMES: Record<number, string> = { 62: 'D', 67: 'G', 69: 'A', 71: 'B', 72: 'C', 74: 'D', 79: 'G' }
// one voice per phone, all from the Fair's own paint
const COLORS = [C.gold, C.sea, C.copper, C.blood, C.goldHi, C.parchment, C.brassDim]

export function NotePhone({ state, me, send }: { state: NoteState; me: string; send: (i: NoteInput) => void }) {
  const mine = state.notes[me]
  const [localHold, setLocalHold] = useState(false)
  const holding = localHold || !!state.held[me]
  const distracted = state.distract?.target === me
  const holdRef = useRef(false)

  useEffect(() => () => stopTone(), [])
  useEffect(() => {
    if (state.phase === 'end') {
      stopTone()
      holdRef.current = false
      setLocalHold(false)
    }
  }, [state.phase])

  const down = () => {
    if (state.phase !== 'holding' || holdRef.current) return
    holdRef.current = true
    setLocalHold(true)
    if (mine) startTone(mine)
    send({ type: 'hold', held: true })
  }
  const up = () => {
    if (!holdRef.current) return
    holdRef.current = false
    setLocalHold(false)
    stopTone()
    send({ type: 'hold', held: false })
  }

  const idx = state.players.indexOf(me)
  const color = COLORS[Math.max(0, idx) % COLORS.length]

  return (
    <div className="w-full flex flex-col items-center" onPointerUp={up} onPointerCancel={up}>
      <p style={{ ...eyebrow, ...numerals, color: C.sea }}>
        {state.phase === 'holding' ? `${Math.ceil(state.timeLeft)}s · chord ${Math.round(state.chord)}%` : state.phase === 'intro' ? 'listen…' : 'the end'}
      </p>
      {state.phase === 'intro' && (
        <p className="text-sm mt-2 text-center" style={{ color: C.faint, maxWidth: 320 }}>
          Each of you holds one note. Hold it TOGETHER and the tune comes. Let go — and it falls apart. The Fair will try to make you look away.
        </p>
      )}
      {state.phase === 'end' && (
        <p className="mt-3 text-center" style={{ ...display, fontSize: 24, color: state.won ? C.gold : C.faint, maxWidth: 340 }}>
          {state.won ? 'You held it. The tune came — all but one note, which stayed silent. Nobody says why.' : 'It fell apart. The Fair smiles. Again, sometime.'}
        </p>
      )}
      {distracted && state.phase === 'holding' && (
        <div className="mt-2 rounded-lg px-4 py-3 text-center" style={{ ...bloodLit, animation: 'dyingPulse .6s ease-in-out infinite', maxWidth: 320 }}>
          <strong>{state.distract?.text}</strong>
          <p className="text-xs" style={{ color: C.faint }}>…don’t let go.</p>
        </div>
      )}
      {(state.phase === 'holding' || state.phase === 'intro') && (
        <button
          type="button"
          onPointerDown={down}
          onPointerUp={up}
          onPointerCancel={up}
          onContextMenu={(e) => e.preventDefault()}
          disabled={state.phase !== 'holding'}
          className="mt-6 rounded-full"
          style={{
            width: 220,
            height: 220,
            border: `6px solid ${color}`,
            // held = LIT (a wash of your voice's colour over night-deep + a glow), never a fill
            background: holding ? `linear-gradient(${color}2E, ${color}2E), ${C.nightDeep}` : C.panel,
            color,
            boxShadow: holding ? `0 0 60px ${color}99, inset 0 0 0 2px ${color}55` : 'none',
            ...display,
            fontSize: 44,
            fontWeight: 700,
            cursor: 'pointer',
            touchAction: 'none',
            userSelect: 'none',
            WebkitUserSelect: 'none',
            transition: 'background .15s, box-shadow .15s',
          }}
          aria-pressed={holding}
          aria-label={`Hold your note${mine ? ` (${NOTE_NAMES[mine] ?? ''})` : ''}`}
        >
          {holding ? <Icon name="note" size={64} /> : 'HOLD'}
        </button>
      )}
      <p className="text-xs mt-3" style={{ color: C.faint }}>
        your note: <strong style={{ color }}>{mine ? NOTE_NAMES[mine] ?? '?' : '—'}</strong> · {state.players.filter((p) => state.held[p]).length}/{state.players.length} holding
      </p>
    </div>
  )
}

export function NoteStage({ state }: { state: NoteState }) {
  const n = Math.max(1, state.players.length)
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-10">
      <p style={{ ...eyebrow, fontSize: 14, letterSpacing: '0.3em' }}>
        the carnival presents
      </p>
      <h1 style={{ ...display, fontSize: 48, fontWeight: 700, color: C.gold }}>Hold the Note</h1>
      <div className="flex items-end justify-center gap-6 mt-8" style={{ height: 320, width: '100%', maxWidth: 900 }}>
        {state.players.map((p, i) => {
          const on = !!state.held[p]
          const color = COLORS[i % COLORS.length]
          const h = on ? 60 + state.chord * 2.4 : 24
          return (
            <div key={p} className="flex flex-col items-center" style={{ flex: 1, maxWidth: 140 }}>
              <div style={{ width: '100%', height: h, background: on ? color : `${color}33`, borderRadius: 12, boxShadow: on ? `0 0 40px ${color}88` : 'none', transition: 'height .25s ease, box-shadow .25s' }} />
              <p className="mt-2" style={{ ...display, fontSize: 20, color: on ? color : C.faint }}>
                {p}
              </p>
              <p style={{ color: C.faint, fontSize: 14 }}>{NOTE_NAMES[state.notes[p]] ?? ''}</p>
            </div>
          )
        })}
      </div>
      <div className="mt-8 w-full" style={{ maxWidth: 900 }}>
        <div className="rounded-full" style={{ height: 14, background: C.panel, overflow: 'hidden', border: `1px solid ${C.panelEdge}` }}>
          <div style={{ width: `${state.chord}%`, height: '100%', background: `linear-gradient(90deg, ${C.sea}, ${C.gold})`, transition: 'width .12s linear' }} />
        </div>
        <p className="mt-2 text-center" style={{ ...numerals, color: C.parchment, fontSize: 22 }}>
          {state.phase === 'holding' && `${Math.ceil(state.timeLeft)}s · held together ${state.heldTogether.toFixed(0)}s of ${Math.ceil(state.totalSeconds * 0.55)} needed`}
          {state.phase === 'intro' && 'Everyone: find the HOLD button. On the count of three.'}
          {state.phase === 'end' && (state.won ? 'The tune came — all but one note. Nobody says why.' : 'It fell apart. The Fair smiles.')}
        </p>
        <p className="text-center" style={{ color: C.faint }}>{state.players.filter((p) => state.held[p]).length}/{n} holding</p>
      </div>
    </div>
  )
}
