// 🕯 The Toll — the Twins ask a question; every phone answers, sealed; then
// the answers go up on the iPad without names, and the table has to agree —
// out loud, together — who said what. The DM reveals them one by one.
// The arguing is the game. (Honest answers are the toll.)

import { useState } from 'react'
import type { TollInput, TollState } from '../../lib/games'
import { C, display } from '../ui'

export function TollPhone({ state, me, send }: { state: TollState; me: string; send: (i: TollInput) => void }) {
  const mine = state.answers.find((a) => a.by === me)
  const [text, setText] = useState(mine?.text ?? '')
  const [sent, setSent] = useState(!!mine)

  return (
    <div className="w-full flex flex-col items-center" style={{ maxWidth: 380 }}>
      <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
        Sister Hum sings it · Brother Hush writes it
      </p>
      <p className="mt-2 text-center" style={{ ...display, fontSize: 22, color: C.gold }}>
        “{state.question}”
      </p>
      {state.phase === 'answer' && (
        <>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder="One true answer. Only Hush sees it, for now."
            className="w-full rounded-md px-3 py-2 mt-3"
            style={{ background: C.night, color: C.parchment, border: `1px solid ${sent ? C.sea : C.panelEdge}` }}
          />
          <button
            type="button"
            onClick={() => {
              if (!text.trim()) return
              send({ type: 'answer', text })
              setSent(true)
            }}
            className="w-full rounded-md py-3 mt-2"
            style={{ ...display, fontWeight: 700, background: C.gold, color: C.ink, border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            {sent ? 'Sealed ✦ (tap to change)' : 'Seal it ✦'}
          </button>
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            {state.answers.length}/{state.players.length} sealed
          </p>
        </>
      )}
      {(state.phase === 'reveal' || state.phase === 'end') && (
        <div className="w-full mt-3">
          <p className="text-xs mb-1" style={{ color: C.faint }}>
            The answers, in no order. Decide together who said what — then watch the slate.
          </p>
          {state.order.map((idx, i) => {
            const a = state.answers[idx]
            const shown = i < state.revealed
            return (
              <div key={idx} className="rounded-lg px-3 py-2 mb-2" style={{ background: C.panel, border: `1px solid ${shown ? C.gold : C.panelEdge}` }}>
                <p className="text-sm" style={{ color: C.parchment }}>
                  {a.text}
                </p>
                {shown && (
                  <p className="text-xs mt-1" style={{ color: C.gold }}>
                    — {a.by}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function TollStage({ state }: { state: TollState }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16">
      <p className="text-sm uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.3em' }}>
        the toll
      </p>
      <h1 style={{ ...display, fontSize: 40, fontWeight: 700, color: C.gold, textAlign: 'center', maxWidth: 900 }}>“{state.question}”</h1>
      {state.phase === 'answer' && (
        <p className="mt-6" style={{ color: C.parchment, fontSize: 24 }}>
          {state.answers.length} of {state.players.length} sealed
        </p>
      )}
      {(state.phase === 'reveal' || state.phase === 'end') && (
        <div className="mt-6 grid gap-3 w-full" style={{ maxWidth: 1000, gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          {state.order.map((idx, i) => {
            const a = state.answers[idx]
            const shown = i < state.revealed
            return (
              <div key={idx} className="rounded-xl px-5 py-4" style={{ background: C.panel, border: `2px solid ${shown ? C.gold : C.panelEdge}`, boxShadow: shown ? `0 0 30px ${C.gold}44` : 'none' }}>
                <p style={{ color: C.parchment, fontSize: 20 }}>{a.text}</p>
                <p className="mt-2" style={{ ...display, fontSize: 22, color: shown ? C.gold : C.faint }}>
                  {shown ? `— ${a.by}` : '— ?'}
                </p>
              </div>
            )
          })}
        </div>
      )}
      {state.phase === 'end' && (
        <p className="mt-6" style={{ color: C.faint, fontSize: 20 }}>
          Hush closes the book. He keeps these.
        </p>
      )}
    </div>
  )
}
