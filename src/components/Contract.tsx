// A1 — the illuminated fey contract. Ornate border, terms in legalese,
// the price in gold, a wax seal, and the finger-drawn signature that makes
// accepting a bargain a felt, physical commitment.
//
// The paper itself is theme.css `.paper` + `.sea-paper-ruled` (ONE source of
// truth for the artifact material); this file only adds the contract's own
// 3px double border, the seal and the signature line.

import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'
import type { Bargain } from '../types'
import { isCalm } from '../lib/storage'
import { Btn, C, body, display, eyebrow, phoneSafe } from './ui'
import { Icon, Spark, SparkRule } from './icons'

/** A brass-ink eyebrow set between two tiny sparks — labels ON PAPER only. */
function PaperEyebrow({ children, color = C.brassInk, center = true }: { children: string; color?: string; center?: boolean }) {
  return (
    <p className={`flex items-center gap-2 ${center ? 'justify-center' : ''}`} style={{ ...eyebrow, color, position: 'relative' }}>
      <Spark size={9} />
      <span>{children}</span>
      <Spark size={9} />
    </p>
  )
}

interface ContractViewProps {
  bargain: Bargain
  /** Signing enabled only for 'offered'; otherwise a display of the record. */
  onSign?: (signatureDataUrl: string) => void
  onClose: () => void
}

export function ContractView({ bargain, onSign, onClose }: ContractViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const padRef = useRef<SignaturePad | null>(null)
  const [hasInk, setHasInk] = useState(false)
  const signable = bargain.status === 'offered' && !!onSign

  // signature_pad setup with devicePixelRatio handling (research 8.2).
  useEffect(() => {
    if (!signable || !canvasRef.current) return
    const canvas = canvasRef.current
    const resize = () => {
      const ratio = Math.max(window.devicePixelRatio || 1, 1)
      const { offsetWidth, offsetHeight } = canvas
      canvas.width = offsetWidth * ratio
      canvas.height = offsetHeight * ratio
      canvas.getContext('2d')!.scale(ratio, ratio)
      padRef.current?.clear()
      setHasInk(false)
    }
    const pad = new SignaturePad(canvas, { penColor: C.ink, minWidth: 1, maxWidth: 2.6 })
    pad.addEventListener('endStroke', () => setHasInk(true))
    padRef.current = pad
    resize()
    window.addEventListener('resize', resize)
    return () => {
      window.removeEventListener('resize', resize)
      pad.off()
      padRef.current = null
    }
  }, [signable])

  const broken = bargain.status === 'broken'
  const fulfilled = bargain.status === 'fulfilled'
  const rim = broken ? C.wax : C.brassDim

  return (
    <div
      className="fixed inset-0 flex items-center justify-center overflow-y-auto"
      style={{ ...phoneSafe, background: 'rgba(6, 12, 14, 0.9)', zIndex: 78 }}
      role="dialog"
      aria-label={`Contract: ${bargain.title}`}
    >
      <div
        className="rounded-lg p-6 w-full my-6 paper sea-paper-ruled"
        style={{
          ...body,
          maxWidth: 460,
          border: `3px double ${rim}`,
          outlineOffset: -10, // the ruled edge sits 7px inside the double border
          boxShadow: '0 24px 60px rgba(0,0,0,.65), inset 0 0 0 1px rgba(255,255,255,.25)',
          animation: 'cardRise .4s ease-out',
          filter: fulfilled ? 'sepia(.25)' : undefined,
        }}
      >
        {broken && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: 0,
              display: 'grid',
              placeItems: 'center',
              color: C.wax,
              opacity: 0.16,
              pointerEvents: 'none',
              transform: 'rotate(-14deg)',
            }}
          >
            <Icon name="cross" size={150} />
          </span>
        )}
        <PaperEyebrow>Be it hereby recorded</PaperEyebrow>
        <h2 className="text-center mt-1" style={{ ...display, fontVariationSettings: "'opsz' 96", fontSize: 28, fontWeight: 700, color: C.ink }}>
          {bargain.title}
        </h2>
        <p className="text-center text-sm italic" style={{ color: C.brassInk }}>
          struck with {bargain.counterparty}
        </p>
        <SparkRule style={{ maxWidth: 180, margin: '10px auto 0' }} color={C.brassInk} />

        <div className="mt-4 leading-relaxed" style={{ whiteSpace: 'pre-wrap', fontSize: 16 }}>
          {bargain.terms}
        </div>

        {/* Received / Still owed — a plain-vellum inset with a gilt rule (no tint,
            so the brass-ink labels stay ≥5:1 on the paper) */}
        <div className="mt-4 rounded-sm px-3 py-3" style={{ border: `1px solid ${C.brassInk}66`, outline: `1px solid ${C.brassInk}2E`, outlineOffset: 3 }}>
          <p style={{ ...eyebrow, color: C.brassInk }}>Received</p>
          <p className="text-sm">{bargain.boon}</p>
          <p className="mt-2" style={{ ...eyebrow, color: broken ? C.wax : C.brassInk }}>
            {fulfilled ? 'The price, paid in full' : broken ? 'The price, unpaid' : 'Still owed'}
          </p>
          <p className="text-sm font-semibold" style={{ color: broken ? C.wax : C.ink }}>
            {bargain.price}
          </p>
        </div>

        {/* wax seal + signature line — the seal is pressed over the ruled edge */}
        <div className="flex items-end gap-4 mt-5">
          <div aria-hidden="true" className={`wax-seal${broken ? ' is-broken' : ''}`} style={{ width: 58, height: 58, marginLeft: -22, marginBottom: -4, transform: 'rotate(-8deg)' }}>
            {broken ? <Icon name="cross" size={22} /> : <Spark size={22} />}
          </div>
          <div className="flex-1">
            {signable ? (
              <>
                <canvas
                  ref={canvasRef}
                  style={{
                    width: '100%',
                    height: 90,
                    touchAction: 'none',
                    borderBottom: `1.5px solid ${C.ink}`,
                    // a shallow vellum well, not a white sticker on the paper
                    background: 'rgba(255,251,240,.34)',
                    boxShadow: 'inset 0 1px 3px rgba(110,74,27,.14)',
                    borderRadius: 4,
                  }}
                  aria-label="Sign here with your finger"
                />
                <p className="text-xs mt-1 italic" style={{ color: C.brassInk }}>
                  Sign in your own hand. Ink dries. Bargains do not.
                </p>
              </>
            ) : bargain.signatureDataUrl ? (
              <img
                src={bargain.signatureDataUrl}
                alt="The signature"
                style={{ width: '100%', maxHeight: 90, objectFit: 'contain', borderBottom: `1.5px solid ${C.ink}` }}
              />
            ) : (
              <p className="text-sm italic" style={{ color: C.brassInk }}>
                unsigned
              </p>
            )}
          </div>
        </div>

        {signable ? (
          <>
            <Btn
              tone="paper"
              shimmer
              disabled={!hasInk}
              onClick={() => {
                if (padRef.current && !padRef.current.isEmpty()) onSign!(padRef.current.toDataURL('image/png'))
              }}
            >
              Seal the bargain ✦
            </Btn>
            <div className="flex gap-2">
              <Btn tone="paper" secondary onClick={() => { padRef.current?.clear(); setHasInk(false) }}>
                Blot the ink
              </Btn>
              <Btn tone="paper" secondary onClick={onClose}>
                I must think on it
              </Btn>
            </div>
          </>
        ) : (
          <Btn tone="paper" secondary onClick={onClose}>
            Close the ledger
          </Btn>
        )}
      </div>
    </div>
  )
}

/** Full-screen resolve ceremony: gold burn for fulfilled, crack for broken. */
export function BargainCeremony({ outcome, title, onDone }: { outcome: 'fulfilled' | 'broken'; title: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3400)
    return () => clearTimeout(t)
  }, [onDone])

  const gold = outcome === 'fulfilled'
  // Under calm (and under prefers-reduced-motion) the lines HOLD at rest —
  // ceremony-fade ends at opacity 0, and html.calm collapses every duration,
  // so running it there would delete the words instead of stilling them.
  const calm = isCalm() || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center text-center"
      style={{ ...phoneSafe, background: `${C.nightDeep}F5`, zIndex: 82 }}
      role="status"
    >
      <div style={{ position: 'relative' }}>
        {[0, 0.3].map((d) => (
          <div
            key={d}
            aria-hidden="true"
            style={{
              position: 'absolute',
              inset: -16,
              borderRadius: '50%',
              border: `2px solid ${gold ? C.gold : C.wax}`,
              animation: `ring-burst 1.5s ease-out ${d}s both`,
            }}
          />
        ))}
        <span style={{ color: gold ? C.gold : C.wax, lineHeight: 1, display: 'inline-block' }} aria-hidden="true">
          {gold ? <Spark size={72} /> : <Icon name="cross" size={72} />}
        </span>
      </div>
      <h2 className="mt-6" style={{ ...display, fontSize: 26, fontWeight: 700, color: gold ? C.gold : C.blood }}>
        {gold ? `"${title}" is fulfilled.` : `"${title}" lies broken.`}
      </h2>
      <p className="mt-2 text-sm italic ceremony-line" style={{ color: C.faint, animation: calm ? undefined : 'ceremony-fade 3.4s ease-out both' }}>
        {gold
          ? 'The contract burns gold, and the debt burns with it.'
          : 'The seal cracks. The Feywild keeps a long memory for broken promises.'}
      </p>
    </div>
  )
}
