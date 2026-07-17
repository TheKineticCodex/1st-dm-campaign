// A1 — the player's Bargain Ledger tab: every deal, and what remains owed.

import { useState } from 'react'
import type { Bargain } from '../types'
import { ContractView } from './Contract'
import { C, Eyebrow, H, display } from './ui'

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
                background: C.panel,
                border: `1px solid ${b.status === 'offered' ? C.gold : C.panelEdge}`,
                boxShadow: b.status === 'offered' ? `0 0 16px ${C.gold}44` : 'none',
                color: C.parchment,
                cursor: 'pointer',
              }}
            >
              <div className="flex items-center justify-between">
                <strong style={{ ...display, fontSize: 19 }}>{b.title}</strong>
                <span className="text-xs" style={{ color: b.status === 'offered' ? C.gold : C.faint }}>
                  {STATUS_LABEL[b.status]}
                </span>
              </div>
              <p className="text-xs mt-1" style={{ color: C.faint }}>
                with {b.counterparty}
              </p>
              <p className="text-sm mt-2">
                <span className="text-xs uppercase tracking-widest" style={{ color: C.gold }}>
                  owed:{' '}
                </span>
                <span style={{ color: C.gold }}>{b.price}</span>
              </p>
            </button>
          ))}
        </div>
      )}

      {settled.length > 0 && (
        <>
          <p className="text-xs uppercase tracking-widest mt-5 mb-2" style={{ color: C.faint, letterSpacing: '0.2em' }}>
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
                  background: C.panel,
                  border: `1px solid ${C.panelEdge}`,
                  color: C.faint,
                  opacity: 0.85,
                  cursor: 'pointer',
                }}
              >
                <div className="flex items-center justify-between">
                  <span style={{ ...display, fontSize: 17, textDecoration: b.status === 'fulfilled' ? 'line-through' : 'none' }}>
                    {b.status === 'broken' ? '💔 ' : '✦ '}
                    {b.title}
                  </span>
                  <span className="text-xs">{STATUS_LABEL[b.status]}</span>
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
