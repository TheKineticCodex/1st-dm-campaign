// Shared primitives, ported from the prototype. All components live at
// module level — NEVER define components inside components (an earlier
// prototype version did, and every keystroke remounted the tree and killed
// input focus on mobile).

import type { CSSProperties, ReactNode } from 'react'

export const C = {
  night: '#181030',
  panel: '#251A48',
  panelEdge: '#3A2C66',
  gold: '#E8B84B',
  goldDim: '#B58A2E',
  sea: '#7FD4C1',
  parchment: '#F2E9D8',
  ink: '#241A42',
  faint: '#9C8FC4',
}

export const display: CSSProperties = { fontFamily: "'Cormorant Garamond', Georgia, serif" }
export const body: CSSProperties = { fontFamily: "'Sorts Mill Goudy', Georgia, serif" }

export function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, ...style }}>
      {children}
    </div>
  )
}

export function H({ children }: { children: ReactNode }) {
  return <h2 style={{ ...display, fontSize: 26, fontWeight: 700, color: C.parchment }}>{children}</h2>
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="uppercase text-xs tracking-widest mb-1" style={{ color: C.sea, letterSpacing: '0.25em' }}>
      {children}
    </p>
  )
}

export function Btn({
  onClick,
  disabled,
  children,
  secondary,
  shimmer,
}: {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  secondary?: boolean
  shimmer?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg py-3 text-base font-semibold mt-3${shimmer && !disabled && !secondary ? ' btn-shimmer' : ''}`}
      style={{
        ...display,
        fontSize: 18,
        minHeight: 44,
        background: disabled ? C.panelEdge : secondary ? 'transparent' : C.gold,
        color: disabled ? C.faint : secondary ? C.faint : C.ink,
        border: secondary ? `1px solid ${C.panelEdge}` : 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export function Pick({
  selected,
  onClick,
  children,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left rounded-lg px-4 py-3 text-base w-full"
      style={{
        background: C.panel,
        border: `1px solid ${selected ? C.gold : C.panelEdge}`,
        color: C.parchment,
        minHeight: 44,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

export function TextInput(props: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      id={props.id}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      placeholder={props.placeholder}
      className="w-full rounded-lg px-4 py-3 outline-none"
      style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.parchment, minHeight: 44 }}
    />
  )
}

/** Drifting carnival lanterns for entry screens. Hidden under reduced motion. */
export function Lanterns() {
  const specks: { left: string; size: number; duration: number; delay: number; drift: number; max: number }[] = [
    { left: '8%', size: 14, duration: 16, delay: 0, drift: 22, max: 0.55 },
    { left: '22%', size: 9, duration: 21, delay: 5, drift: -16, max: 0.4 },
    { left: '43%', size: 12, duration: 18, delay: 9, drift: 12, max: 0.5 },
    { left: '61%', size: 8, duration: 23, delay: 3, drift: -20, max: 0.35 },
    { left: '78%', size: 15, duration: 15, delay: 7, drift: 18, max: 0.6 },
    { left: '90%', size: 10, duration: 20, delay: 12, drift: -12, max: 0.45 },
  ]
  return (
    <div aria-hidden="true" style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
      {specks.map((s, i) => (
        <span
          key={i}
          className="lantern"
          style={{
            left: s.left,
            fontSize: s.size,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            ['--drift-x' as string]: `${s.drift}px`,
            ['--lantern-max' as string]: s.max,
          }}
        >
          ✦
        </span>
      ))}
    </div>
  )
}

export function TextArea(props: {
  value: string
  onChange: (v: string) => void
  onBlur?: () => void
  placeholder?: string
  rows?: number
}) {
  return (
    <textarea
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      onBlur={props.onBlur}
      placeholder={props.placeholder}
      rows={props.rows ?? 4}
      className="w-full rounded-lg px-4 py-3 outline-none text-sm"
      style={{ background: C.night, border: `1px solid ${C.panelEdge}`, color: C.parchment, resize: 'vertical' }}
    />
  )
}
