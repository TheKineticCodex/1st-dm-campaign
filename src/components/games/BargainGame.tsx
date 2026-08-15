// ⚖ The Bargain — the Buyer puts something on the table. Every phone bids
// what they'd give for it, sealed: pick a COIN (a memory, a name, a promise…)
// and write the words. The stage shows the envelopes with only the coin on
// the outside. When the bids close, the Buyer (the DM) opens whichever he
// likes and takes ONE. He keeps the rest unopened. He remembers them.

import { useState } from 'react'
import { COINS, type BargainInput, type BargainState, type Coin } from '../../lib/games'
import { C, display } from '../ui'

const coinOf = (id: Coin) => COINS.find((c) => c.id === id) ?? COINS[0]

export function BargainPhone({ state, me, send }: { state: BargainState; me: string; send: (i: BargainInput) => void }) {
  const mine = state.bids.find((b) => b.by === me)
  const [coin, setCoin] = useState<Coin>(mine?.coin ?? 'memory')
  const [text, setText] = useState(mine?.text ?? '')
  const [sent, setSent] = useState(!!mine)
  const took = state.accepted
  const iWon = took === me

  return (
    <div className="w-full flex flex-col items-center" style={{ maxWidth: 380 }}>
      <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
        the Buyer puts on the table
      </p>
      <p className="mt-1 text-center" style={{ ...display, fontSize: 22, color: C.gold }}>
        {state.offer}
      </p>

      {state.phase === 'bid' && (
        <>
          <p className="text-xs mt-3 mb-1 text-center" style={{ color: C.faint }}>
            What would you give for it? Choose the coin, then say it. Sealed until the Buyer opens it — if he ever does.
          </p>
          <div className="grid grid-cols-3 gap-2 w-full">
            {COINS.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setCoin(c.id)}
                aria-pressed={coin === c.id}
                className="rounded-lg px-2 py-2 text-xs"
                style={{ background: coin === c.id ? `${C.gold}22` : C.night, border: `1px solid ${coin === c.id ? C.gold : C.panelEdge}`, color: C.parchment, minHeight: 56, cursor: 'pointer' }}
              >
                <span style={{ fontSize: 20, display: 'block' }}>{c.glyph}</span>
                {c.label}
              </button>
            ))}
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={3}
            placeholder={`${coinOf(coin).label} — which one? Say it plainly.`}
            className="w-full rounded-md px-3 py-2 mt-2"
            style={{ background: C.night, color: C.parchment, border: `1px solid ${sent ? C.sea : C.panelEdge}` }}
          />
          <button
            type="button"
            onClick={() => {
              if (!text.trim()) return
              send({ type: 'bid', coin, text })
              setSent(true)
            }}
            className="w-full rounded-md py-3 mt-2"
            style={{ ...display, fontWeight: 700, background: C.gold, color: C.ink, border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            {sent ? 'Sealed ⚖ (tap to change)' : 'Seal the bid ⚖'}
          </button>
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            {state.bids.length}/{state.players.length} sealed
          </p>
        </>
      )}

      {state.phase !== 'bid' && (
        <div className="w-full mt-3">
          {state.phase === 'end' && (
            <p className="text-center mb-3" style={{ ...display, fontSize: 24, color: took ? (iWon ? C.gold : C.parchment) : C.faint }}>
              {took ? (iWon ? 'The Buyer takes yours. It is his now.' : `The Buyer takes ${took}’s. Yours stays sealed. He keeps it.`) : 'The Buyer closes his book. He takes nothing tonight — and keeps every envelope.'}
            </p>
          )}
          <p className="text-xs mb-1" style={{ color: C.faint }}>
            The envelopes, on his table.
          </p>
          {state.bids.map((b) => {
            const open = state.opened.includes(b.by)
            const taken = state.accepted === b.by
            return (
              <div key={b.by} className="rounded-lg px-3 py-2 mb-2 flex items-start gap-3" style={{ background: C.panel, border: `1px solid ${taken ? C.gold : open ? C.sea : C.panelEdge}` }}>
                <span style={{ fontSize: 22, color: taken ? C.gold : C.parchment }}>{coinOf(b.coin).glyph}</span>
                <div className="flex-1">
                  <p className="text-xs" style={{ color: C.faint }}>
                    {coinOf(b.coin).label}
                    {b.by === me ? ' · yours' : ''}
                  </p>
                  {open ? (
                    <>
                      <p className="text-sm" style={{ color: C.parchment }}>
                        {b.text}
                      </p>
                      <p className="text-xs" style={{ color: taken ? C.gold : C.sea }}>
                        — {b.by}
                        {taken ? ' · taken' : ''}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm" style={{ color: C.faint }}>
                      {b.by === me ? b.text : 'sealed'}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function BargainStage({ state }: { state: BargainState }) {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center px-16">
      <p className="text-sm uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.3em' }}>
        the Buyer puts on the table
      </p>
      <h1 style={{ ...display, fontSize: 40, fontWeight: 700, color: C.gold, textAlign: 'center', maxWidth: 900 }}>{state.offer}</h1>
      {state.phase === 'bid' && (
        <p className="mt-6" style={{ color: C.parchment, fontSize: 24 }}>
          {state.bids.length} of {state.players.length} sealed
        </p>
      )}
      <div className="mt-6 flex flex-wrap justify-center gap-4 w-full" style={{ maxWidth: 1100 }}>
        {state.bids.map((b) => {
          const open = state.opened.includes(b.by)
          const taken = state.accepted === b.by
          const dim = state.phase === 'end' && !taken && state.accepted
          return (
            <div
              key={b.by}
              className="rounded-xl px-5 py-4"
              style={{
                width: 250,
                minHeight: 150,
                background: taken ? `${C.gold}22` : C.panel,
                border: `2px solid ${taken ? C.gold : open ? C.sea : C.panelEdge}`,
                boxShadow: taken ? `0 0 40px ${C.gold}66` : open ? `0 0 20px ${C.sea}44` : 'none',
                opacity: dim ? 0.55 : 1,
                transition: 'all .4s ease',
              }}
            >
              <p style={{ fontSize: 40, lineHeight: 1, color: taken ? C.gold : C.parchment }}>{coinOf(b.coin).glyph}</p>
              <p className="mt-1" style={{ ...display, fontSize: 20, color: C.parchment }}>
                {coinOf(b.coin).label}
              </p>
              {open ? (
                <>
                  <p className="mt-2" style={{ color: C.parchment, fontSize: 17 }}>
                    {b.text}
                  </p>
                  <p className="mt-1" style={{ ...display, fontSize: 20, color: taken ? C.gold : C.sea }}>
                    — {b.by}
                    {taken ? ' · taken' : ''}
                  </p>
                </>
              ) : (
                <p className="mt-2" style={{ color: C.faint, fontSize: 16 }}>
                  {state.phase === 'bid' ? 'sealed' : 'sealed — he keeps it'}
                </p>
              )}
            </div>
          )
        })}
      </div>
      {state.phase === 'closed' && (
        <p className="mt-6" style={{ color: C.faint, fontSize: 20 }}>
          The bids are closed. The Buyer reads the outsides of the envelopes for a long time.
        </p>
      )}
      {state.phase === 'end' && (
        <p className="mt-6" style={{ ...display, color: state.accepted ? C.gold : C.faint, fontSize: 26 }}>
          {state.accepted ? `The Buyer takes ${state.accepted}’s. The rest he keeps, unopened.` : 'The Buyer takes nothing. He keeps every envelope.'}
        </p>
      )}
    </div>
  )
}
