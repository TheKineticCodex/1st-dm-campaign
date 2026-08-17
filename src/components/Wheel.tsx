// 🎡 The Fortune Wheel — the drawing. One SVG wheel, N wedges, a pointer at
// the top; give it a target wedge and a duration and it spins to land there,
// the same on every screen (phones, the DM's Book) because everyone gets the
// same numbers. Pure presentation — no network in here.

import { useEffect, useState } from 'react'
import { C } from './ui'
import { SPARK_PATH } from './icons'

interface WheelProps {
  wedges: string[]
  /** Index the wheel lands on. null = idle. */
  target: number | null
  /** Full turns before landing, and how long the spin takes (s). */
  turns?: number
  duration?: number
  /** Which spin this is — a change re-triggers the animation. */
  spinKey?: string
  size?: number
}

// the Fair's own paint: gold, panel-edge, the Sea, panel, copper, night, wax, panel-lift
const PALETTE = [C.gold, C.panelEdge, C.sea, C.panel, C.copper, C.night, C.wax, C.panelLift]

export function Wheel({ wedges, target, turns = 5, duration = 5.5, spinKey = '', size = 300 }: WheelProps) {
  const n = Math.max(1, wedges.length)
  const step = 360 / n
  const [angle, setAngle] = useState(0)
  const [animating, setAnimating] = useState(false)

  useEffect(() => {
    if (target === null) return
    // Land wedge `target` under the pointer at 12 o'clock. Wedge i spans
    // [i*step, (i+1)*step] measured clockwise from 12; we rotate the wheel
    // so the centre of wedge `target` ends at the top: -(target+0.5)*step.
    const jitter = (step * 0.7) * (Math.random() - 0.5) // land somewhere inside the wedge, not always dead centre
    const final = 360 * turns - (target + 0.5) * step + jitter
    setAnimating(true)
    // Start from wherever we are, but always spin forward at least `turns`.
    setAngle((a) => Math.floor(a / 360) * 360 + final + 360)
    const t = setTimeout(() => setAnimating(false), duration * 1000)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spinKey, target])

  const r = size / 2
  const cx = r
  const cy = r
  const arc = (i: number) => {
    const a0 = ((i * step - 90) * Math.PI) / 180
    const a1 = (((i + 1) * step - 90) * Math.PI) / 180
    const x0 = cx + r * Math.cos(a0)
    const y0 = cy + r * Math.sin(a0)
    const x1 = cx + r * Math.cos(a1)
    const y1 = cy + r * Math.sin(a1)
    const large = step > 180 ? 1 : 0
    return `M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`
  }
  const labelPos = (i: number) => {
    const a = (((i + 0.5) * step - 90) * Math.PI) / 180
    const rr = r * 0.62
    return { x: cx + rr * Math.cos(a), y: cy + rr * Math.sin(a), rot: (i + 0.5) * step }
  }

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }} aria-label="The Fortune Wheel" role="img">
      {/* pointer */}
      <div style={{ position: 'absolute', top: -6, left: '50%', transform: 'translateX(-50%)', zIndex: 2, width: 0, height: 0, borderLeft: '12px solid transparent', borderRight: '12px solid transparent', borderTop: `22px solid ${C.parchment}`, filter: 'drop-shadow(0 2px 4px #0008)' }} />
      <svg
        viewBox={`0 0 ${size} ${size}`}
        width={size}
        height={size}
        style={{
          transform: `rotate(${angle}deg)`,
          transition: animating ? `transform ${duration}s cubic-bezier(0.12, 0.7, 0.1, 1)` : 'none',
          borderRadius: '50%',
          boxShadow: `0 0 0 6px ${C.gold}, 0 0 40px ${C.gold}55`,
        }}
      >
        {wedges.map((_, i) => (
          <g key={i}>
            <path d={arc(i)} fill={PALETTE[i % PALETTE.length]} stroke={C.night} strokeWidth={2} />
            {(() => {
              const p = labelPos(i)
              const dark = [C.gold, C.sea].includes(PALETTE[i % PALETTE.length])
              return (
                <text
                  x={p.x}
                  y={p.y}
                  fill={dark ? C.ink : C.parchment}
                  fontSize={Math.max(10, size / 24)}
                  fontFamily="'Fraunces', Georgia, serif"
                  fontWeight={700}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${p.rot} ${p.x} ${p.y})`}
                >
                  {i + 1}
                </text>
              )
            })()}
          </g>
        ))}
        <circle cx={cx} cy={cy} r={size * 0.08} fill={C.night} stroke={C.gold} strokeWidth={3} />
        {/* the hub: the ✦ drawn (SPARK_PATH is on a 24-grid) */}
        <path d={SPARK_PATH} fill={C.gold} transform={`translate(${cx - size * 0.05} ${cy - size * 0.05}) scale(${(size * 0.1) / 24})`} />
      </svg>
    </div>
  )
}

/** The eight fortunes the Fair offers by default. The DM edits before arming. */
export const DEFAULT_WEDGES = [
  'A lantern that never goes out — until you tell a lie.',
  'One true answer from any stall-keeper. They will not enjoy it.',
  'Bottled applause: uncork it for Heroic Inspiration.',
  'A free ride on the carousel. The organ knows your name now.',
  'The house keeps this one. Try again.',
  'A page that washed up. Whose hand is that?',
  'Advantage on your next roll — the Fair insists.',
  'A small debt to the Fair, to be named later.',
]
