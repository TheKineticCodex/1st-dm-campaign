// Ambient mode — the iPad stops being a dashboard and becomes the table's
// centerpiece: the campaign title breathing under drifting lanterns, the
// party's portraits floating like paintings in a haunted gallery.
// Tap anywhere to return to the Book.

import type { RosterEntry } from '../lib/store'
import { AURAS, DEFAULT_AURA } from './glyphs'
import { C, Lanterns, body, display } from './ui'
import { Lantern, SparkRule } from './icons'

interface AmbientModeProps {
  roster: RosterEntry[]
  /** Absent on the stage device: a stray elbow must not take the screen down. */
  onClose?: () => void
  /** The room they are standing in. Resolved from an id by the stage. */
  place?: string | null
}

const DRIFT_SPOTS = [
  { left: '12%', top: '18%', dur: 26, delay: 0 },
  { left: '78%', top: '22%', dur: 31, delay: 4 },
  { left: '18%', top: '68%', dur: 29, delay: 8 },
  { left: '74%', top: '66%', dur: 24, delay: 2 },
  { left: '46%', top: '80%', dur: 33, delay: 6 },
]

export function AmbientMode({ roster, onClose, place }: AmbientModeProps) {
  // Everyone with a character, not only everyone with a picture — a party of
  // five with two portraits used to show two faces and look broken.
  const portraits = roster.filter((r) => r.character)

  // On the DM's own screen the whole thing is a way back to the Book. On the
  // stage device there is no way back, so it is not a button at all — an
  // elbow on the iPad must not take the table's screen down mid-scene.
  const Tag = (onClose ? 'button' : 'div') as 'button' | 'div'

  return (
    <Tag
      {...(onClose ? { type: 'button' as const, onClick: onClose, 'aria-label': 'Ambient mode — tap to return to the Book' } : {})}
      className="fixed inset-0 overflow-hidden text-center"
      style={{
        zIndex: 90,
        border: 'none',
        cursor: onClose ? 'pointer' : 'default',
        background: `radial-gradient(1200px 700px at 50% -18%, rgba(240,181,79,0.22) 0%, rgba(240,181,79,0.06) 40%, transparent 68%), radial-gradient(1600px 1000px at 50% 115%, ${C.nightDeep} 0%, transparent 60%), ${C.night}`,
        color: C.parchment,
      }}
    >
      {/* the fair's string of bulbs — the top edge only */}
      <span
        aria-hidden="true"
        className="bulb-row"
        style={{ position: 'absolute', top: 'calc(14px + env(safe-area-inset-top))', left: 0, right: 0, display: 'block' }}
      />
      <Lanterns />

      {/* the party drifts like gallery paintings */}
      {portraits.map((r, i) => {
        const spot = DRIFT_SPOTS[i % DRIFT_SPOTS.length]
        const aura = AURAS[r.character!.build.aura ?? DEFAULT_AURA] ?? AURAS[DEFAULT_AURA]
        return (
          <span
            key={r.playerId}
            aria-hidden="true"
            className="ambient-drift"
            style={{
              position: 'absolute',
              left: spot.left,
              top: spot.top,
              animationDuration: `${spot.dur}s`,
              animationDelay: `${spot.delay}s`,
            }}
          >
            {r.character!.build.portraitUrl && (
              <img
                src={r.character!.build.portraitUrl}
                alt=""
                style={{
                  width: 110,
                  height: 110,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: `2px solid ${aura.color}`,
                  boxShadow: `0 0 34px ${aura.color}66`,
                  opacity: 0.85,
                }}
              />
            )}
            <span
              className="block text-center"
              style={{
                ...display,
                fontSize: 30,
                fontWeight: 600,
                color: aura.color,
                marginTop: r.character!.build.portraitUrl ? 10 : 0,
                textShadow: '0 2px 12px rgba(6,12,14,0.9)',
                whiteSpace: 'nowrap',
              }}
            >
              {r.character!.build.name || r.playerName}
            </span>
          </span>
        )
      })}

      <span
        className="absolute left-0 right-0"
        style={{ top: '38%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        {/* the emblem: the lantern hanging over the Sea, breathing */}
        <span className="spark inline-flex justify-center w-full" aria-hidden="true">
          <Lantern size={96} waves />
        </span>
        {/* the place-line — the Fair, and where it has docked */}
        {place ? (
          <span
            className="block mt-4 mx-auto"
            style={{ ...body, fontSize: 'clamp(20px, 2.4vw, 28px)', letterSpacing: '0.14em', color: C.parchmentDeep, fontWeight: 600, maxWidth: '88%' }}
          >
            {place}
          </span>
        ) : (
          <span className="block uppercase mt-4" style={{ ...body, fontSize: 'clamp(12px, 1.2vw, 15px)', letterSpacing: '0.4em', color: C.brassDim, fontWeight: 600 }}>
            The Getting Fair · Saltmere
          </span>
        )}
        <span
          className="title-glow block mt-1"
          style={{ ...display, fontVariationSettings: "'opsz' 144", fontSize: 'clamp(40px, 7.5vw, 84px)', fontWeight: 700, color: C.gold, lineHeight: 1.05, letterSpacing: '-0.01em' }}
        >
          The Song
          <br />
          the Sea Forgot
        </span>
        <SparkRule style={{ maxWidth: 320, margin: '20px auto 0' }} />
        <span className="block mt-4 italic" style={{ ...display, fontWeight: 600, color: C.parchment, fontSize: 'clamp(18px, 1.6vw, 22px)' }}>
          The carnival never charges coin. What it does charge is another matter.
        </span>
      </span>

      <span
        className="absolute left-0 right-0 text-xs"
        style={{ ...body, bottom: 'calc(18px + env(safe-area-inset-bottom))', color: C.faint, pointerEvents: 'none' }}
      >
        {onClose ? 'tap anywhere to open the Book' : 'the stage'}
      </span>
    </Tag>
  )
}
