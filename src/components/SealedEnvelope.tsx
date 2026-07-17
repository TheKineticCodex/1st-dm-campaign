// A2 — Sealed Whispers. A handout arrives as a sealed envelope: swipe to
// break the wax, typewriter reveal, optional 60-second ephemeral mode for
// dreams and whispers the character can't hold onto.
// Respects prefers-reduced-motion (instant reveal, no typewriter).

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Handout } from '../types'
import { Btn, C, display } from './ui'

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

const EPHEMERAL_SECONDS = 60

interface SealedEnvelopeProps {
  handout: Handout
  onDismiss: () => void
}

export function SealedEnvelope({ handout, onDismiss }: SealedEnvelopeProps) {
  const [stage, setStage] = useState<'sealed' | 'breaking' | 'open'>('sealed')
  const [typed, setTyped] = useState(0)
  const [secondsLeft, setSecondsLeft] = useState(EPHEMERAL_SECONDS)
  const dragStart = useRef<number | null>(null)

  const fullText = handout.body

  // Typewriter reveal.
  useEffect(() => {
    if (stage !== 'open') return
    if (reducedMotion()) {
      setTyped(fullText.length)
      return
    }
    if (typed >= fullText.length) return
    const t = setTimeout(() => setTyped((n) => Math.min(fullText.length, n + 2)), 28)
    return () => clearTimeout(t)
  }, [stage, typed, fullText])

  // Ephemeral countdown starts once open.
  useEffect(() => {
    if (stage !== 'open' || !handout.ephemeral) return
    if (secondsLeft <= 0) {
      onDismiss()
      return
    }
    const t = setTimeout(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [stage, handout.ephemeral, secondsLeft, onDismiss])

  const breakSeal = () => {
    if (stage !== 'sealed') return
    setStage('breaking')
    setTimeout(() => setStage('open'), reducedMotion() ? 0 : 550)
  }

  const onPointerDown = (e: PointerEvent) => {
    dragStart.current = e.clientX
  }
  const onPointerMove = (e: PointerEvent) => {
    if (dragStart.current !== null && Math.abs(e.clientX - dragStart.current) > 70) {
      dragStart.current = null
      breakSeal()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-6"
      style={{ background: 'rgba(12, 8, 24, 0.85)', zIndex: 70 }}
      role="dialog"
      aria-label={handout.target ? 'A sealed whisper, for you alone' : 'A sealed envelope arrives'}
    >
      {stage !== 'open' ? (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          className="rounded-xl p-6 w-full text-center select-none"
          style={{
            maxWidth: 420,
            background: C.parchment,
            color: C.ink,
            border: `2px solid ${C.goldDim}`,
            boxShadow: '0 12px 48px rgba(0,0,0,.6)',
            animation: 'cardRise .35s ease-out',
            touchAction: 'pan-y',
          }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: C.goldDim }}>
            {handout.target ? '🤫 for your eyes only' : '✦ sealed by the carnival'}
          </p>
          <div
            aria-hidden="true"
            className="mx-auto my-6 rounded-full flex items-center justify-center"
            style={{
              width: 84,
              height: 84,
              background: stage === 'breaking' ? 'transparent' : '#8E2F3C',
              color: C.parchment,
              fontSize: 34,
              ...display,
              boxShadow: stage === 'breaking' ? 'none' : 'inset 0 -4px 10px rgba(0,0,0,.35), 0 2px 8px rgba(0,0,0,.3)',
              transition: 'transform .5s ease, opacity .5s ease',
              transform: stage === 'breaking' ? 'scale(1.6) rotate(18deg)' : 'none',
              opacity: stage === 'breaking' ? 0 : 1,
            }}
          >
            ✦
          </div>
          {handout.title && (
            <p style={{ ...display, fontSize: 22, fontWeight: 700 }}>{handout.title}</p>
          )}
          <p className="text-sm mt-2" style={{ color: C.goldDim }}>
            Swipe across the seal to break it
          </p>
          <button
            type="button"
            onClick={breakSeal}
            className="text-xs underline mt-2"
            style={{ background: 'none', border: 'none', color: C.goldDim, minHeight: 44, cursor: 'pointer' }}
          >
            or tap here
          </button>
        </div>
      ) : (
        <div
          className="rounded-xl p-5 w-full"
          style={{
            maxWidth: 440,
            background: C.parchment,
            color: C.ink,
            border: `2px solid ${C.gold}`,
            boxShadow: '0 12px 48px rgba(0,0,0,.6)',
            animation: 'cardRise .35s ease-out',
          }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: C.goldDim }}>
            {handout.target ? '🤫 For your eyes only' : '✦ The carnival presents'}
          </p>
          {handout.title && (
            <h2 style={{ ...display, fontSize: 26, fontWeight: 700, marginTop: 4 }}>{handout.title}</h2>
          )}
          {handout.imageDataUrl && (
            <img
              src={handout.imageDataUrl}
              alt=""
              className="w-full rounded-lg mt-3"
              style={{ border: `1px solid ${C.goldDim}` }}
            />
          )}
          {fullText && (
            <p className="mt-3 leading-relaxed" style={{ fontSize: 17, minHeight: 48, whiteSpace: 'pre-wrap' }}>
              {fullText.slice(0, typed)}
              {typed < fullText.length && <span style={{ color: C.goldDim }}>▎</span>}
            </p>
          )}
          {handout.ephemeral ? (
            <p className="text-xs mt-3 text-center" style={{ color: '#8E2F3C' }}>
              This whisper fades in {secondsLeft}s — like breath on glass.
            </p>
          ) : (
            <Btn onClick={onDismiss}>Tuck it away</Btn>
          )}
        </div>
      )}
    </div>
  )
}
