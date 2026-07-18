// Ambient mode — the iPad stops being a dashboard and becomes the table's
// centerpiece: the campaign title breathing under drifting lanterns, the
// party's portraits floating like paintings in a haunted gallery.
// Tap anywhere to return to the Book.

import type { RosterEntry } from '../lib/store'
import { AURAS, DEFAULT_AURA } from './glyphs'
import { C, Lanterns, display } from './ui'

interface AmbientModeProps {
  roster: RosterEntry[]
  onClose: () => void
}

const DRIFT_SPOTS = [
  { left: '12%', top: '18%', dur: 26, delay: 0 },
  { left: '78%', top: '22%', dur: 31, delay: 4 },
  { left: '18%', top: '68%', dur: 29, delay: 8 },
  { left: '74%', top: '66%', dur: 24, delay: 2 },
  { left: '46%', top: '80%', dur: 33, delay: 6 },
]

export function AmbientMode({ roster, onClose }: AmbientModeProps) {
  const portraits = roster.filter((r) => r.character?.build.portraitUrl)

  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Ambient mode — tap to return to the Book"
      className="fixed inset-0 overflow-hidden text-center"
      style={{
        zIndex: 90,
        border: 'none',
        cursor: 'pointer',
        background: `radial-gradient(1400px 800px at 50% -20%, #2B1E55 0%, ${C.night} 60%, #0D0820 100%)`,
        color: C.parchment,
      }}
    >
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
          </span>
        )
      })}

      <span
        className="absolute left-0 right-0"
        style={{ top: '38%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
      >
        <span className="spark block" style={{ fontSize: 30 }} aria-hidden="true">
          ✦
        </span>
        <span
          className="title-glow block mt-3"
          style={{ ...display, fontSize: 'clamp(38px, 7vw, 72px)', fontWeight: 700, color: C.gold, lineHeight: 1.1 }}
        >
          The Song
          <br />
          the Sea Forgot
        </span>
        <span className="block mt-4 italic" style={{ color: C.faint, fontSize: 18 }}>
          The carnival never charges coin. What it does charge is another matter.
        </span>
      </span>

      <span
        className="absolute left-0 right-0 text-xs"
        style={{ bottom: 'calc(18px + env(safe-area-inset-bottom))', color: `${C.faint}88`, pointerEvents: 'none' }}
      >
        tap anywhere to open the Book
      </span>
    </button>
  )
}
