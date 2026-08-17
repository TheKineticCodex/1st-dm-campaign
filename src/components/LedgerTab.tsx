// A1 — the player's Bargain Ledger tab: every deal, and what remains owed.

import { useState } from 'react'
import type { Bargain } from '../types'
import { ContractView } from './Contract'
import { C, Eyebrow, H, HintOnce, display, eyebrow, onState, panelSurface } from './ui'
import { Icon, Spark } from './icons'

const STATUS_LABEL: Record<Bargain['status'], string> = {
  offered: 'awaiting your hand',
  sealed: 'sealed — the debt stands',
  fulfilled: 'fulfilled — burned gold',
  broken: 'broken — the Feywild remembers',
}

interface LedgerTabProps {
  bargains: Bargain[]
  onSign: (bargainId: string, signatureDataUrl: string) => void
}

export function LedgerTab({ bargains, onSign }: LedgerTabProps) {
  const [openId, setOpenId] = useState<string | null>(null)
  const open = bargains.find((b) => b.id === openId) ?? null

  const active = bargains.filter((b) => b.status === 'offered' || b.status === 'sealed')
  const settled = bargains.filter((b) => b.status === 'fulfilled' || b.status === 'broken')

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>The Bargain Ledger</Eyebrow>
      <H>What is owed, and to whom</H>
      <div className="mt-2">
        <HintOnce id="ledger-first">
          Nothing to do here yet — contracts find you on their own. When one arrives, sign it (or
          don't), and this ledger keeps the record.
        </HintOnce>
      </div>

      {bargains.length === 0 && (
        <p className="mt-3" style={{ color: C.faint }}>
          No bargains yet. The carnival will offer — it always does. Read the terms twice.
        </p>
      )}

      {active.length > 0 && (
        <div className="mt-4 flex flex-col gap-2">
          {active.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setOpenId(b.id)}
              className="text-left rounded-xl p-4 w-full"
              style={{
                ...(b.status === 'offered' ? { ...onState, boxShadow: `${onState.boxShadow}, 0 0 16px rgba(240,181,79,0.18)` } : panelSurface),
                color: C.parchment,
                minHeight: 44,
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center justify-between gap-2">
                <strong style={{ ...display, fontSize: 19, color: b.status === 'offered' ? C.goldHi : C.parchment }}>{b.title}</strong>
                <span className="text-xs" style={{ color: b.status === 'offered' ? C.goldHi : C.faint }}>
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: C.faint }}>
                with {b.counterparty}
              </p>
              <p className="text-sm mt-2">
                <span style={{ ...eyebrow, color: b.status === 'offered' ? C.goldHi : C.brassDim }}>
                  owed:{' '}
                </span>
                <span style={{ color: b.status === 'offered' ? C.goldHi : C.parchment }}>{b.price}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <>
          <p className="mt-5 mb-2" style={{ ...eyebrow, color: C.faint }}>
            The settled pages
          </p>
          <div className="flex flex-col gap-2">
            {settled.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setOpenId(b.id)}
                className="text-left rounded-xl p-3 w-full"
                style={{
                  ...panelSurface,
                  color: C.faint,
                  minHeight: 44,
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="inline-flex items-center gap-1.5" style={{ ...display, fontSize: 17, textDecoration: b.status === 'fulfilled' ? 'line-through' : 'none' }}>
                    {b.status === 'broken' ? <Icon name="heartBroken" size={15} style={{ color: C.blood }} /> : <Spark size={13} style={{ color: C.brassDim }} />}
                    {b.title}
                  </span>
                  <span className="text-xs" style={{ color: b.status === 'broken' ? C.blood : C.faint }}>{STATUS_LABEL[b.status]}</span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {open && (
        <ContractView
          bargain={open}
          onSign={open.status === 'offered' ? (sig) => { onSign(open.id, sig); setOpenId(null) } : undefined}
          onClose={() => setOpenId(null)}
        />
      )}
    </div>
  )
}
