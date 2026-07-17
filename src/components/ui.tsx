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
}: {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  secondary?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="w-full rounded-lg py-3 text-base font-semibold mt-3"
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
