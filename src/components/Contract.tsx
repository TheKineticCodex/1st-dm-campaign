// A1 — the illuminated fey contract. Ornate border, terms in legalese,
// the price in gold, a wax seal, and the finger-drawn signature that makes
// accepting a bargain a felt, physical commitment.

import { useEffect, useRef, useState } from 'react'
import SignaturePad from 'signature_pad'
import type { Bargain } from '../types'
import { Btn, C, display } from './ui'

const INK = '#3B2418'

export function contractBorder(color: string) {
  return {
    background: C.parchment,
    color: INK,
    border: `3px double ${color}`,
    outline: `1px solid ${color}55`,
    outlineOffset: -8,
    boxShadow: `0 12px 48px rgba(0,0,0,.6), inset 0 0 60px rgba(181,138,46,.12)`,
  }
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
    const pad = new SignaturePad(canvas, { penColor: INK, minWidth: 1, maxWidth: 2.6 })
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

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 overflow-y-auto"
      style={{ background: 'rgba(12, 8, 24, 0.88)', zIndex: 78 }}
      role="dialog"
      aria-label={`Contract: ${bargain.title}`}
    >
      <div
        className="rounded-lg p-6 w-full my-6"
        style={{
          maxWidth: 460,
          ...contractBorder(broken ? '#8E2F3C' : C.goldDim),
          animation: 'cardRise .4s ease-out',
          filter: fulfilled ? 'sepia(.25)' : undefined,
          position: 'relative',
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
              fontSize: 120,
              color: '#8E2F3C',
              opacity: 0.18,
              pointerEvents: 'none',
              transform: 'rotate(-14deg)',
            }}
          >
            ✕
          </span>
        )}
        <p className="text-center text-xs uppercase" style={{ letterSpacing: '0.3em', color: C.goldDim }}>
          ✦ Be it hereby recorded ✦
        </p>
        <h2 className="text-center mt-1" style={{ ...display, fontSize: 26, fontWeight: 700 }}>
          {bargain.title}
        </h2>
        <p className="text-center text-xs italic" style={{ color: C.goldDim }}>
          struck with {bargain.counterparty}
        </p>

        <div className="mt-4 text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
          {bargain.terms}
        </div>

        <div className="mt-4 rounded-md p-3" style={{ background: 'rgba(181,138,46,.14)', border: `1px solid ${C.goldDim}` }}>
          <p className="text-xs uppercase tracking-widest" style={{ color: C.goldDim }}>
            Received
          </p>
          <p className="text-sm">{bargain.boon}</p>
          <p className="text-xs uppercase tracking-widest mt-2" style={{ color: broken ? '#8E2F3C' : C.goldDim }}>
            {fulfilled ? 'The price, paid in full' : broken ? 'The price, unpaid' : 'Still owed'}
          </p>
          <p className="text-sm font-semibold" style={{ color: broken ? '#8E2F3C' : '#7A5A14' }}>
            {bargain.price}
          </p>
        </div>

        {/* wax seal + signature line */}
        <div className="flex items-end gap-4 mt-5">
          <div
            aria-hidden="true"
            className="rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              width: 58,
              height: 58,
              background: broken ? 'transparent' : '#8E2F3C',
              border: broken ? '2px dashed #8E2F3C' : 'none',
              color: C.parchment,
              fontSize: 24,
              boxShadow: broken ? 'none' : 'inset 0 -3px 8px rgba(0,0,0,.35)',
            }}
          >
            {broken ? '💔' : '✦'}
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
                    borderBottom: `1.5px solid ${INK}`,
                    background: 'rgba(255,255,255,.25)',
                    borderRadius: 6,
                  }}
                  aria-label="Sign here with your finger"
                />
                <p className="text-xs mt-1" style={{ color: C.goldDim }}>
                  Sign in your own hand. Ink dries. Bargains do not.
                </p>
              </>
            ) : bargain.signatureDataUrl ? (
              <img
                src={bargain.signatureDataUrl}
                alt="The signature"
                style={{ width: '100%', maxHeight: 90, objectFit: 'contain', borderBottom: `1.5px solid ${INK}` }}
              />
            ) : (
              <p className="text-sm italic" style={{ color: C.goldDim }}>
                unsigned
              </p>
            )}
          </div>
        </div>

        {signable ? (
          <>
            <Btn
              shimmer
              disabled={!hasInk}
              onClick={() => {
                if (padRef.current && !padRef.current.isEmpty()) onSign!(padRef.current.toDataURL('image/png'))
              }}
            >
              Seal the bargain ✦
            </Btn>
            <div className="flex gap-2">
              <Btn secondary onClick={() => { padRef.current?.clear(); setHasInk(false) }}>
                Blot the ink
              </Btn>
              <Btn secondary onClick={onClose}>
                I must think on it
              </Btn>
            </div>
          </>
        ) : (
          <Btn secondary onClick={onClose}>
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
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center p-8 text-center"
      style={{ background: `${C.night}F5`, zIndex: 82 }}
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
              border: `2px solid ${gold ? C.gold : '#8E2F3C'}`,
              animation: `ring-burst 1.5s ease-out ${d}s both`,
            }}
          />
        ))}
        <span style={{ fontSize: 72 }} aria-hidden="true">
          {gold ? '🔥' : '💔'}
        </span>
      </div>
      <h2 className="mt-6" style={{ ...display, fontSize: 26, fontWeight: 700, color: gold ? C.gold : '#C96A6A' }}>
        {gold ? `"${title}" is fulfilled.` : `"${title}" lies broken.`}
      </h2>
      <p className="mt-2 text-sm italic" style={{ color: C.faint, animation: 'ceremony-fade 3.4s ease-out both' }}>
        {gold
          ? 'The contract burns gold, and the debt burns with it.'
          : 'The seal cracks. The Feywild keeps a long memory for broken promises.'}
      </p>
    </div>
  )
}
