// Pocket guide — ported verbatim from the prototype.

import { useState } from 'react'
import { GUIDE } from '../data/guide'
import { C, Eyebrow, H, display } from './ui'

export function GuideTab() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>Pocket guide</Eyebrow>
      <H>How to play, in ten small candles</H>
      <div className="mt-4">
        {GUIDE.map((g, i) => (
          <div
            key={i}
            className="rounded-lg mb-2 overflow-hidden"
            style={{ border: `1px solid ${C.panelEdge}`, background: C.panel }}
          >
            <button
              type="button"
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full text-left px-4 py-3 flex justify-between items-center"
              style={{ background: 'none', border: 'none', color: C.parchment, minHeight: 44, cursor: 'pointer' }}
              aria-expanded={open === i}
            >
              <span style={{ ...display, fontSize: 18, fontWeight: 600 }}>{g.t}</span>
              <span style={{ color: C.gold }}>{open === i ? '−' : '+'}</span>
            </button>
            {open === i && (
              <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: C.parchment, opacity: 0.9 }}>
                {g.b}
              </p>
            )}
          </div>
        ))}
      </div>
      <p className="text-sm mt-4" style={{ color: C.faint }}>
        Everything else, your Dungeon Master will teach you at the table. That's the fun part.
      </p>
    </div>
  )
}
