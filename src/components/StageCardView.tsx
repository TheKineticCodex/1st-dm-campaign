// 🪧 The three shapes a held-up card can take on the stage.
//
// Read from across a table, in a dim room, by five people at once. Signage,
// not a document: very few words, very large, and nothing else on the glass.

import type { StageCard } from '../types'
import { C, body, display } from './ui'
import { Lantern } from './icons'

/** Hush's slate. Chalk caps on near-black, and nothing else at all. */
function Slate({ lines }: { lines: string[] }) {
  const longest = Math.max(...lines.map((l) => l.length), 0)
  // Two buckets, no measuring: short lines fill the screen, long ones step down.
  const size = longest <= 24 ? 'clamp(56px, 9vw, 104px)' : 'clamp(44px, 6.4vw, 80px)'
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#0A1012', zIndex: 92, padding: '4vw' }}>
      <p
        className="text-center"
        style={{
          ...display,
          fontSize: size,
          fontWeight: 700,
          color: C.parchment,
          letterSpacing: '0.06em',
          lineHeight: 1.15,
          maxWidth: '92%',
          textShadow: '0 2px 30px rgba(0,0,0,0.8)',
        }}
      >
        {lines.map((l, i) => (
          <span key={i} className="block">
            {l}
          </span>
        ))}
      </p>
    </div>
  )
}

/**
 * A rule for a fight, pinned low-left so it clears the initiative rail. Sits
 * over whatever else is on the glass rather than replacing it — the map is
 * still the thing they are looking at.
 */
function Note({ lines }: { lines: string[] }) {
  return (
    <div
      className="fixed"
      style={{
        left: 'calc(28px + env(safe-area-inset-left))',
        bottom: 'calc(28px + env(safe-area-inset-bottom))',
        maxWidth: 'min(62vw, 760px)',
        zIndex: 92,
        background: 'rgba(6,12,14,0.82)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${C.panelEdge}`,
        borderRadius: 14,
        padding: '18px 26px',
      }}
    >
      <p style={{ ...display, fontSize: 'clamp(44px, 6vw, 76px)', fontWeight: 700, color: C.sea, lineHeight: 1.1 }}>
        {lines[0]}
      </p>
      {lines[1] && (
        <p style={{ ...body, fontSize: 'clamp(20px, 2.4vw, 32px)', color: C.faint, marginTop: 6 }}>{lines[1]}</p>
      )}
    </div>
  )
}

/**
 * Three lanterns and no words. It holds the night's biggest choice in the
 * middle of the table and adds exactly no information, which is what stops it
 * deflating the argument. The Lantern's brass is hardcoded gold, so the colour
 * comes from a filter — and the brightness terms matter: at low saturation on
 * near-black, three hues collapse into three greys off-axis.
 */
const LANTERN_LIGHT = [
  { key: 'green', filter: 'hue-rotate(82deg) saturate(1.15)' },
  { key: 'silver', filter: 'saturate(0) brightness(1.35)' },
  { key: 'blue', filter: 'hue-rotate(178deg) saturate(1.25) brightness(0.95)' },
]

function Gates() {
  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ background: '#05090A', zIndex: 92 }}>
      <div className="flex items-center justify-center" style={{ gap: 'clamp(40px, 8vw, 120px)' }}>
        {LANTERN_LIGHT.map((l, i) => (
          <span
            key={l.key}
            className="spark"
            style={{ filter: l.filter, animationDelay: `${i * 0.9}s`, animationDuration: `${4 + i * 0.7}s` }}
          >
            <Lantern size={200} />
          </span>
        ))}
      </div>
    </div>
  )
}

export function StageCardView({ card }: { card: StageCard }) {
  if (card.kind === 'gates') return <Gates />
  if (card.kind === 'note') return <Note lines={card.lines} />
  return <Slate lines={card.lines} />
}

/** A note rides over the scene; a slate or the gates replaces it. */
export function cardCoversTheScreen(card: StageCard | null | undefined): boolean {
  return !!card && card.kind !== 'note'
}
