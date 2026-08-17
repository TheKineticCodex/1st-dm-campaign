// A2 — Sealed Whispers. A handout arrives as a sealed envelope: swipe to
// break the wax, typewriter reveal, optional 60-second ephemeral mode for
// dreams and whispers the character can't hold onto.
// Respects prefers-reduced-motion (instant reveal, no typewriter).
//
// The paper is theme.css `.paper` + `.sea-paper-ruled`; the seal is `.wax-seal`.

import { useEffect, useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import type { Handout } from '../types'
import { Btn, C, body, display, eyebrow, phoneSafe } from './ui'
import { Spark } from './icons'

const paperShadow = '0 24px 60px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.3)'

/** A brass-ink eyebrow set between two tiny sparks — labels ON PAPER only. */
function PaperEyebrow({ children, center }: { children: string; center?: boolean }) {
  return (
    <p className={`flex items-center gap-2 ${center ? 'justify-center' : ''}`} style={{ ...eyebrow, color: C.brassInk, position: 'relative' }}>
      <Spark size={9} />
      <span>{children}</span>
      <Spark size={9} />
    </p>
  )
}

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
      className="fixed inset-0 flex items-center justify-center"
      style={{ ...phoneSafe, background: 'rgba(6, 12, 14, 0.88)', zIndex: 70, overflowY: 'auto' }}
      role="dialog"
      aria-label={handout.target ? 'A sealed whisper, for you alone' : 'A sealed envelope arrives'}
    >
      {stage !== 'open' ? (
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          className="rounded-lg px-6 pb-6 pt-5 w-full text-center select-none paper sea-paper-ruled"
          style={{
            ...body,
            maxWidth: 420,
            boxShadow: paperShadow,
            border: `1px solid ${C.brassDim}`,
            animation: 'cardRise .35s ease-out',
            touchAction: 'pan-y',
          }}
        >
          {/* the envelope flap: a V of shadow across the top whose point lands under the seal */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', left: 0, right: 0, top: 0, height: 128, pointerEvents: 'none',
              background: 'linear-gradient(to bottom right, rgba(110,74,27,.11) 0%, transparent 52%), linear-gradient(to bottom left, rgba(110,74,27,.11) 0%, transparent 52%)',
              clipPath: 'polygon(0 0, 100% 0, 50% 100%)',
            }}
          />
          <span
            aria-hidden="true"
            style={{
              position: 'absolute', left: 0, right: 0, top: 0, height: 128, pointerEvents: 'none',
              background: 'rgba(110,74,27,.28)',
              clipPath: 'polygon(0 0, 1px 0, 50% calc(100% - 1.5px), calc(100% - 1px) 0, 100% 0, 50% 100%)',
            }}
          />
          <PaperEyebrow center>{handout.target ? 'for your eyes only' : 'sealed by the carnival'}</PaperEyebrow>
          <div
            aria-hidden="true"
            className="wax-seal mx-auto"
            style={{
              width: 76,
              height: 76,
              marginTop: 42,
              marginBottom: 20,
              transform: stage === 'breaking' ? 'scale(1.6) rotate(18deg)' : 'rotate(-6deg)',
              opacity: stage === 'breaking' ? 0 : 1,
              transition: 'transform .5s ease, opacity .5s ease',
              position: 'relative',
            }}
          >
            <Spark size={30} />
          </div>
          {handout.title && (
            <p style={{ ...display, fontVariationSettings: "'opsz' 96", fontSize: 24, fontWeight: 700, color: C.ink, position: 'relative' }}>{handout.title}</p>
          )}
          <p className="text-sm mt-2 italic" style={{ color: C.brassInk, position: 'relative' }}>
            Swipe across the seal to break it
          </p>
          <button
            type="button"
            onClick={breakSeal}
            data-testid="envelope-tap-open"
            className="text-sm underline mt-1"
            style={{ ...body, fontWeight: 600, background: 'none', border: 'none', color: C.brassInk, minHeight: 44, cursor: 'pointer', position: 'relative' }}
          >
            or tap here
          </button>
        </div>
      ) : (
        <div
          className="rounded-lg p-5 w-full paper sea-paper-ruled"
          style={{
            ...body,
            maxWidth: 440,
            boxShadow: paperShadow,
            border: `1px solid ${C.brassDim}`,
            animation: 'cardRise .35s ease-out',
          }}
        >
          <PaperEyebrow>{handout.target ? 'For your eyes only' : 'The carnival presents'}</PaperEyebrow>
          {handout.title && (
            <h2 style={{ ...display, fontVariationSettings: "'opsz' 96", fontSize: 26, fontWeight: 700, marginTop: 4, color: C.ink }}>{handout.title}</h2>
          )}
          {handout.imageDataUrl && (
            <img
              src={handout.imageDataUrl}
              alt=""
              className="w-full rounded-lg mt-3"
              style={{ border: `1px solid ${C.brassInk}66` }}
            />
          )}
          {fullText && (
            <p className="mt-3 leading-relaxed" style={{ fontSize: 17, minHeight: 48, whiteSpace: 'pre-wrap' }}>
              {fullText.slice(0, typed)}
              {typed < fullText.length && <span style={{ color: C.brassInk }}>▎</span>}
            </p>
          )}
          {handout.ephemeral ? (
            <p className="text-xs mt-3 text-center italic" style={{ color: C.wax }}>
              This whisper fades in {secondsLeft}s — like breath on glass.
            </p>
          ) : (
            <Btn tone="paper" secondary onClick={onDismiss}>Tuck it away</Btn>
          )}
        </div>
      )}
    </div>
  )
}
