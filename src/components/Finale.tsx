// 🌕 The finale — the song, whole, on every phone at once.
//
// Three screens, one moment:
//   Book   → "Ready the phones" (arm) … counts who is ready … "Sing it" (start in N ms)
//   phones → a dark screen and one tap ("wake your phone's voice") that unlocks
//            audio and answers `ready`; on `start` each phone waits its N ms and
//            plays the whole song. Slight drift between phones is the point —
//            five voices, one chord, not a machine.
//   stage  → the Moon rises when the song does.
//
// The whole song is the one thing that must never sound by accident: the
// Book asks twice, and phones only play after they've been armed by a tap.

import { useEffect, useRef, useState } from 'react'
import { armSong, playWhole } from '../lib/song'
import type { FinaleEvent } from '../types'
import { Btn, C, display } from './ui'

// ------------------------------------------------------------ phone

export function FinalePhone({ event, me, send }: { event: FinaleEvent; me: string; send: (f: FinaleEvent) => void }) {
  const [armed, setArmed] = useState(false)
  const armedRef = useRef(false)
  const [singing, setSinging] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const started = useRef<string | null>(null)

  useEffect(() => {
    if (event.phase !== 'start' || started.current === event.finaleId) return
    started.current = event.finaleId
    const wait = Math.max(0, event.inMs ?? 0)
    timer.current = setTimeout(() => {
      setSinging(true)
      if (armedRef.current) playWhole()
    }, wait)
    return () => {
      if (timer.current) clearTimeout(timer.current)
    }
  }, [event.phase, event.finaleId, event.inMs])

  const wake = async () => {
    await armSong() // even if the phone is on silent, report ready — the DM decides
    armedRef.current = true
    setArmed(true)
    send({ finaleId: event.finaleId, phase: 'ready', from: me })
  }

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-8 text-center"
      style={{ background: 'radial-gradient(ellipse at 50% 20%, #17123A 0%, #05040F 70%)', zIndex: 80, color: C.parchment }}
      role="dialog"
      aria-label="The finale"
    >
      <div
        aria-hidden="true"
        style={{
          width: singing ? 180 : 90,
          height: singing ? 180 : 90,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #FFF8E6, #E6DFC8 60%, #B8B09A)',
          boxShadow: singing ? '0 0 120px 40px rgba(240,236,220,.5)' : '0 0 40px 10px rgba(240,236,220,.2)',
          transition: 'all 6s ease-out',
          marginBottom: 28,
        }}
      />
      {!armed && event.phase !== 'start' && (
        <>
          <p style={{ ...display, fontSize: 28, color: C.gold }}>The tide is in.</p>
          <p className="mt-2 text-sm" style={{ color: C.faint, maxWidth: 320 }}>
            Turn your ringer on. Then tap once — to wake your phone’s voice — and hold it up.
          </p>
          <button
            type="button"
            onClick={wake}
            className="rounded-full mt-6"
            style={{ ...display, fontSize: 22, fontWeight: 700, background: C.gold, color: C.ink, border: 'none', minHeight: 64, minWidth: 240, cursor: 'pointer', boxShadow: `0 0 30px ${C.gold}66` }}
          >
            ♪ wake it
          </button>
        </>
      )}
      {armed && !singing && (
        <>
          <p style={{ ...display, fontSize: 28, color: C.gold }}>Ready.</p>
          <p className="mt-2 text-sm" style={{ color: C.faint, maxWidth: 320 }}>
            Hold it up. Don’t look at it. Listen.
          </p>
        </>
      )}
      {singing && (
        <p style={{ ...display, fontSize: 30, color: C.gold, animation: 'cardRise 2s ease-out' }}>
          {armed ? 'The song, whole.' : 'Listen — the others have it.'}
        </p>
      )}
      {!armed && event.phase === 'start' && !singing && (
        <p className="mt-2 text-sm" style={{ color: C.faint }}>
          Too late to wake this one — listen to the others.
        </p>
      )}
    </div>
  )
}

// ------------------------------------------------------------ stage

export function FinaleStage({ event }: { event: FinaleEvent }) {
  const [risen, setRisen] = useState(false)
  useEffect(() => {
    if (event.phase !== 'start') return
    const t = setTimeout(() => setRisen(true), Math.max(0, event.inMs ?? 0))
    return () => clearTimeout(t)
  }, [event.phase, event.inMs, event.finaleId])
  return (
    <div className="w-full h-full relative overflow-hidden stage-fx" style={{ background: 'radial-gradient(ellipse at 50% 110%, #1B2A4A 0%, #05040F 55%)' }}>
      {/* the sea, breathing */}
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: '28%', background: 'linear-gradient(180deg, transparent, rgba(40,90,120,.35))' }} />
      {/* the moon */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '50%',
          top: risen ? '18%' : '62%',
          width: risen ? '34vmin' : '14vmin',
          height: risen ? '34vmin' : '14vmin',
          borderRadius: '50%',
          background: 'radial-gradient(circle at 40% 35%, #FFF8E6, #E6DFC8 60%, #B8B09A)',
          transform: 'translate(-50%, -50%)',
          boxShadow: risen ? '0 0 220px 90px rgba(240,236,220,.5)' : '0 0 60px 20px rgba(240,236,220,.2)',
          transition: 'top 9s cubic-bezier(.2,.7,.2,1), width 9s ease, height 9s ease, box-shadow 9s ease',
        }}
      />
      <div className="absolute left-0 right-0 text-center" style={{ bottom: '10%' }}>
        <p style={{ ...display, fontSize: risen ? 44 : 30, color: C.gold, transition: 'font-size 3s ease' }}>
          {risen ? 'The song, whole.' : event.phase === 'start' ? '…' : 'The tide is in.'}
        </p>
        {!risen && event.phase === 'arm' && (
          <p className="mt-2" style={{ color: C.faint, fontSize: 20 }}>
            Wake your phones. Hold them up.
          </p>
        )}
      </div>
    </div>
  )
}

// ------------------------------------------------------------ the Book

export function FinalePanel({
  players,
  ready,
  event,
  onArm,
  onStart,
  onClear,
}: {
  players: string[]
  ready: Set<string>
  event: FinaleEvent | null
  onArm: () => void
  onStart: (inMs: number) => void
  onClear: () => void
}) {
  const [countdown, setCountdown] = useState<number | null>(null)
  useEffect(() => {
    if (countdown === null) return
    if (countdown <= 0) {
      setCountdown(null)
      return
    }
    const t = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  if (!event) {
    return (
      <div>
        <p className="text-sm" style={{ color: C.faint }}>
          The Moon-Night. When all five sing, every phone sings with them — the whole song, the note in place, at once. Two steps, so it can never happen by accident: ready the phones (each player taps once to wake their phone’s voice), then sing it. Ringers on. Set the room to 🌕 first.
        </p>
        <Btn onClick={onArm} shimmer disabled={players.length === 0}>
          🌕 Ready the phones
        </Btn>
      </div>
    )
  }

  const readyCount = players.filter((p) => ready.has(p)).length
  return (
    <div>
      <p style={{ ...display, fontSize: 20, color: C.gold }}>
        {event.phase === 'start' ? (countdown ? `Singing in ${countdown}…` : 'The song, whole. ✦') : 'The phones are waking'}
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {players.map((p) => (
          <span key={p} className="text-xs rounded-full px-2 py-1" style={{ border: `1px solid ${ready.has(p) ? C.gold : C.panelEdge}`, color: ready.has(p) ? C.gold : C.faint, background: ready.has(p) ? `${C.gold}1A` : 'transparent' }}>
            {ready.has(p) ? '♪ ' : '· '}
            {p}
          </span>
        ))}
      </div>
      <p className="text-xs mt-2" style={{ color: C.faint }}>
        {readyCount}/{players.length} phones awake. Wait for as many as will come; a sleeping phone just listens.
      </p>
      <div className="flex gap-2 mt-3">
        {event.phase === 'arm' && (
          <Btn
            shimmer
            disabled={readyCount === 0}
            onClick={() => {
              if (window.confirm('This sings the Sea’s song WHOLE on every awake phone and this MacBook, in three seconds. Are you at the end?')) {
                setCountdown(3)
                onStart(3000)
              }
            }}
          >
            ✦ Sing it — in three
          </Btn>
        )}
        <Btn secondary onClick={onClear}>
          Return to the story
        </Btn>
      </div>
    </div>
  )
}
