// 🐌 The Snail Derby, on the table's own screen.
//
// Five lanes across a dark hall, a snail per player, and the finish line on
// the right. Read from across a table: names at 32px, lanes 56px tall, no
// numbers anywhere — how far along you are is where your snail is.

import { RACE_GOAL, type RaceBoard } from '../lib/race'
import type { RosterEntry } from '../lib/store'
import { AURAS, DEFAULT_AURA } from './glyphs'
import { C, body, display } from './ui'
import { Icon, Spark } from './icons'

export function RaceBoardView({ board, roster }: { board: RaceBoard; roster: RosterEntry[] }) {
  const named = Object.keys(board.lanes)
  const colourOf = (playerName: string) => {
    const r = roster.find((x) => x.playerName === playerName)
    return (AURAS[r?.character?.build.aura ?? DEFAULT_AURA] ?? AURAS[DEFAULT_AURA]).color
  }
  const shownAs = (playerName: string) =>
    roster.find((x) => x.playerName === playerName)?.character?.build.name || playerName

  return (
    <div
      className="fixed inset-0 flex flex-col justify-center"
      style={{ background: C.nightDeep, zIndex: 92, padding: 'clamp(24px, 4vw, 64px)' }}
    >
      <p className="text-center" style={{ ...body, fontSize: 'clamp(13px, 1.4vw, 17px)', letterSpacing: '0.3em', textTransform: 'uppercase', color: C.brassDim, fontWeight: 600 }}>
        the carnival presents
      </p>
      <p className="text-center" style={{ ...display, fontSize: 'clamp(38px, 5.2vw, 68px)', fontWeight: 700, color: C.gold, lineHeight: 1.05 }}>
        The Great Snail Derby
      </p>

      <div className="mt-6 grid" style={{ gap: 'clamp(10px, 1.4vw, 18px)' }}>
        {named.map((n) => {
          const at = Math.min(RACE_GOAL, board.lanes[n] ?? 0)
          const pct = (at / RACE_GOAL) * 100
          const place = board.finished.indexOf(n)
          const home = place >= 0
          const colour = colourOf(n)
          return (
            <div key={n} className="flex items-center" style={{ gap: 'clamp(12px, 1.6vw, 24px)' }}>
              <span
                style={{
                  ...display,
                  fontSize: 'clamp(20px, 2.4vw, 32px)',
                  fontWeight: 600,
                  color: home ? C.gold : C.parchment,
                  width: 'clamp(140px, 16vw, 240px)',
                  textAlign: 'right',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {shownAs(n)}
              </span>

              {/* the lane */}
              <span
                className="relative flex-1"
                style={{
                  height: 'clamp(38px, 5vw, 56px)',
                  borderRadius: 999,
                  background: C.night,
                  border: `1px solid ${C.panelEdge}`,
                  boxShadow: `inset 0 1px 0 ${C.hairline}`,
                }}
              >
                <span
                  aria-hidden="true"
                  className="absolute"
                  style={{
                    left: `calc(${pct}% - clamp(19px, 2.5vw, 28px))`,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    transition: 'left .45s cubic-bezier(.22,.9,.3,1)',
                    color: colour,
                    filter: `drop-shadow(0 0 14px ${colour}88)`,
                    lineHeight: 0,
                  }}
                >
                  <Icon name="snail" size={44} />
                </span>
              </span>

              {/* the post */}
              <span style={{ width: 'clamp(58px, 6vw, 92px)', textAlign: 'left' }}>
                {home ? (
                  <span style={{ ...display, fontSize: 'clamp(22px, 2.6vw, 34px)', fontWeight: 700, color: C.gold, whiteSpace: 'nowrap' }}>
                    {place === 0 ? <>1st <Spark size={16} /></> : place === 1 ? '2nd' : place === 2 ? '3rd' : `${place + 1}th`}
                  </span>
                ) : (
                  <span aria-hidden="true" style={{ color: C.panelEdge, lineHeight: 0, display: 'inline-block' }}>
                    <Icon name="pennant" size={30} />
                  </span>
                )}
              </span>
            </div>
          )
        })}
      </div>

      {board.ended && board.finished[0] && (
        <p className="text-center mt-7" style={{ ...display, fontSize: 'clamp(30px, 4vw, 54px)', fontWeight: 700, color: C.sea }}>
          {shownAs(board.finished[0])} takes the crown
        </p>
      )}
    </div>
  )
}
