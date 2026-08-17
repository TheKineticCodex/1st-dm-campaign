// Shared primitives, ported from the prototype. All components live at
// module level — NEVER define components inside components (an earlier
// prototype version did, and every keystroke remounted the tree and killed
// input focus on mobile).
//
// ─────────────────────────────────────────────────────────────────────────────
// THE LIVERY — "Lantern-light at the Fair" (tokens mirror :root in theme.css)
//
// TYPE GATE (the discipline behind the two families):
//   DISPLAY = Fraunces (`display`), NEVER below 18px, and at 18px ONLY for
//     buttons and fold titles. Roles: Gate title 42/700 · Stage title
//     clamp(40px,7.5vw,84px) · "Your turn" 40–44 · Book/contract/envelope
//     titles 28 · Section H 26 · fold titles & buttons 18–19/600. Italic
//     Fraunces 600 for the canon lines on the Gate/Stage only.
//   BODY = Vollkorn (`body`): everything players read at 17px/1.55; 15
//     secondary; 13–14 meta; 12 eyebrows in 600 uppercase tracked .18–.22em;
//     11 only for the legal line (full --faint, never dimmed). Vollkorn italic
//     is the lanterns' voice (whispers, asides, hints); Vollkorn 600 for every
//     small label and the top-bar controls so labels have stroke weight in a
//     dim room. Never set Fraunces at 15–17px — its hairlines vanish on OLED.
//   NUMERALS = `numerals` (lining + tabular): HP/AC/Speed tiles Vollkorn 600
//     28px, vitals pill 15px, save mods and coins 24/28. `.num` /
//     `.rolling-number` carry the same in CSS. No old-style figures anywhere.
//   SCALE (six sizes replace ~25 inline sizes): 12 · 13 · 15 · 17 · 21 · 26 · 28 · 40+
//
// GOLD ONCE: one brass-filled action per screen (`goldAction` / .btn-gold).
// Selected / on states are LIT, never filled: `onState` (ember), `seaLit`,
// `bloodLit` — a wash grounded on night-deep, a hairline, gold-hi/sea/blood text.
// PAPER = artifacts only (contract, envelope, HP/AC/Speed cards): theme.css
// `.paper` (+ `.sea-paper-ruled`), ink text, brass-ink labels, Btn tone="paper".
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import type { CSSProperties, ReactNode } from 'react'
import { applyCalm, isCalm, readCache, writeCache } from '../lib/storage'
import { EMOJI_TO_ICON, Icon, type IconName } from './icons'

// Leading icon token: an emoji (with optional VS16) or one of our dingbats, then optional space.
const LEAD = /^(\p{Extended_Pictographic}️?|[✦✧❖☾⚔⚑✎✒✉⚖◐♥▶➤✕★♪♫→]️?)\s*/u

/**
 * Split a title like "🎒 the bag" into its glyph and its words. If the title
 * starts with an icon we know, the glyph replaces it; unknown emoji fall back
 * to the Spark. Never lets a colour emoji through as UI.
 */
export function splitLeadGlyph(title: string): [IconName | null, string] {
  const m = title.match(LEAD)
  if (!m) return [null, title]
  const key = m[1].replace(/️$/, '')
  return [EMOJI_TO_ICON[key] ?? EMOJI_TO_ICON[m[1]] ?? 'spark', title.slice(m[0].length)]
}

// The night is ink-black-green, the accent is lantern amber; brass and copper
// for the fittings; aged paper for anything you could hold in your hand.
export const C = {
  night: '#0B1416',
  nightDeep: '#060C0E',
  panel: '#142022',
  panelLift: '#1A2A2C',
  panelEdge: '#2A3A3A',
  hairline: 'rgba(255,214,150,0.09)',
  gold: '#F0B54F',
  goldHi: '#FFD98A',
  brassDim: '#B7873A',
  goldDim: '#B7873A', // alias of brassDim (older screens)
  copper: '#C97C4A',
  sea: '#8BD3BC',
  parchment: '#F1E6CF',
  parchmentDeep: '#E6D7B8',
  ink: '#2A1C11',
  brassInk: '#6E4A1B',
  wax: '#8E2F3C',
  faint: '#B3AA97',
  blood: '#D88078',
}

/**
 * The ground is painted ONCE by theme.css (body::before: amber lantern pool →
 * night-deep, with grain). Screens paint nothing behind themselves — keep this
 * transparent so the one fixed layer shows through. The Gate adds its extra
 * glow by setting `--gate-glow` on <html> (or `html.gate`), never a second
 * fixed div.
 */
export const nightGround = 'transparent'

/** A lifted panel: a breath lighter at the top, a warm hairline. */
export const panelSurface: CSSProperties = {
  background: `linear-gradient(180deg, ${C.panelLift} 0%, ${C.panel} 46%)`,
  border: `1px solid ${C.panelEdge}`,
  boxShadow: `inset 0 1px 0 ${C.hairline}`,
}

/** The one gold action per screen: brass under lantern light. */
export const goldAction: CSSProperties = {
  background: 'linear-gradient(180deg, #FFD88A 0%, #F0B54F 50%, #D59A3A 100%)',
  border: '1px solid #A8742A',
  color: C.ink,
  boxShadow: 'inset 0 1px 0 rgba(255,245,215,0.7), inset 0 -2px 0 rgba(90,55,10,0.25), 0 6px 22px rgba(240,181,79,0.22)',
  textShadow: '0 1px 0 rgba(255,240,200,0.45)',
}

/**
 * Selected / on-state — the ember: a 12% copper wash grounded on night-deep
 * (never on the panel gradient, which turned it olive), a gold hairline, an
 * inner ring, a top highlight, gold-hi text. Never solid gold.
 */
export const onState: CSSProperties = {
  background: `linear-gradient(rgba(201,124,74,0.12), rgba(201,124,74,0.12)), ${C.nightDeep}`,
  border: `1px solid ${C.gold}`,
  color: C.goldHi,
  boxShadow: 'inset 0 0 0 1px rgba(240,181,79,0.22), inset 0 1px 0 rgba(255,214,150,0.12)',
}
/** The Sea, lit: HP-healthy, advantage, links-as-chips, the active initiative glyph, Roll when open. */
export const seaLit: CSSProperties = {
  background: `linear-gradient(rgba(139,211,188,0.12), rgba(139,211,188,0.12)), ${C.nightDeep}`,
  border: `1px solid ${C.sea}`,
  color: C.sea,
  boxShadow: 'inset 0 0 0 1px rgba(139,211,188,0.2), inset 0 1px 0 rgba(255,214,150,0.12)',
}
/** Blood, lit: disadvantage, HP low, failures. */
export const bloodLit: CSSProperties = {
  background: `linear-gradient(rgba(216,128,120,0.12), rgba(216,128,120,0.12)), ${C.nightDeep}`,
  border: `1px solid ${C.blood}`,
  color: C.blood,
  boxShadow: 'inset 0 0 0 1px rgba(216,128,120,0.2), inset 0 1px 0 rgba(255,214,150,0.12)',
}
/** A recessed well the text sits into (inputs, chairs, code fields). */
export const wellSurface: CSSProperties = {
  background: C.nightDeep,
  border: `1px solid ${C.panelEdge}`,
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.5)',
}
/** A "current" row in a list: ember tint + a 3px left rule (Book initiative, Attack in Your-turn uses gold). */
export const leftRule = (color: string = C.gold): CSSProperties => ({
  boxShadow: `inset 3px 0 0 ${color}`,
})

/** Fraunces — display only, ≥18px (see the type gate above). */
export const display: CSSProperties = {
  fontFamily: "'Fraunces', 'Iowan Old Style', Georgia, serif",
  fontVariationSettings: "'opsz' 72",
  fontVariantNumeric: 'lining-nums',
}
/** Vollkorn — everything players read. */
export const body: CSSProperties = { fontFamily: "'Vollkorn', 'Iowan Old Style', Georgia, serif" }
/** Numerals that must never clip: HP, AC, dice, coins. */
export const numerals: CSSProperties = { fontVariantNumeric: 'lining-nums tabular-nums', fontFeatureSettings: "'lnum' 1, 'tnum' 1" }
/** A 12px brass eyebrow (Vollkorn 600, tracked caps). Pass color for paper (C.brassInk). */
export const eyebrow: CSSProperties = { ...body, fontSize: 12, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', color: C.brassDim }

export function Section({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div className="rounded-xl p-5 mb-4" style={{ ...panelSurface, ...style }}>
      {children}
    </div>
  )
}

export function H({ children }: { children: ReactNode }) {
  return <h2 style={{ ...display, fontSize: 26, fontWeight: 600, color: C.parchment }}>{children}</h2>
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  const [glyph, label] = typeof children === 'string' ? splitLeadGlyph(children) : [null, children]
  return (
    <p className="mb-1 flex items-center gap-1.5" style={{ ...eyebrow, ...style }}>
      {glyph && <Icon name={glyph} size={14} style={{ flexShrink: 0 }} />}
      <span>{label}</span>
    </p>
  )
}

export type BtnTone = 'night' | 'paper'

/** Ink-on-cream button colours (mirrors the --btn-* vars theme.css sets under .paper). Disabled = slate ink ≥5:1 on cream. */
export const PAPER_BTN = { ink: C.ink, rim: C.brassInk, disabledInk: '#4A5A61', disabledBg: 'rgba(42,28,17,0.06)', disabledRim: 'rgba(110,74,27,0.35)' }

/**
 * The button. `tone="night"` (default) sits on the night: the ONE gold action
 * is brass, `secondary` is a lifted rim, `disabled` is a dim panel.
 * `tone="paper"` sits on an artifact: `secondary` is ink-on-cream with a
 * brass-ink rim, `disabled` stays legible (≥5:1 slate ink on cream) — never a
 * dark block on paper. Only ONE non-secondary Btn per screen.
 */
export function Btn({
  onClick,
  disabled,
  children,
  secondary,
  shimmer,
  tone = 'night',
  style,
}: {
  onClick?: () => void
  disabled?: boolean
  children: ReactNode
  secondary?: boolean
  shimmer?: boolean
  tone?: BtnTone
  style?: CSSProperties
}) {
  const onPaper = tone === 'paper'
  const gold = !disabled && !secondary
  // On the night the tokens fall back to their defaults; inside `.paper` /
  // `.on-paper` theme.css redefines the --btn-* vars, so a Btn on an artifact
  // takes ink even without tone="paper" (no !important, no cascade hack).
  const look: CSSProperties = disabled
    ? onPaper
      ? { background: PAPER_BTN.disabledBg, color: PAPER_BTN.disabledInk, border: `1px solid ${PAPER_BTN.disabledRim}`, textShadow: 'none' }
      : { background: `var(--btn-disabled-bg, ${C.panel})`, color: `var(--btn-disabled-ink, ${C.faint})`, border: `1px solid var(--btn-disabled-rim, ${C.panelEdge})`, opacity: 'var(--btn-disabled-opacity, 0.7)' }
    : secondary
      ? onPaper
        ? { background: 'transparent', color: C.ink, border: `1px solid ${C.brassInk}` }
        : { background: 'var(--btn-wash, transparent)', color: `var(--btn-ink, ${C.parchment})`, border: `1px solid var(--btn-rim, ${C.panelEdge})` }
      : goldAction
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-lg py-3 text-base font-semibold mt-3${shimmer && gold ? ' btn-shimmer' : ''}`}
      style={{
        ...display,
        fontSize: 18,
        minHeight: 44,
        ...look,
        cursor: disabled ? 'not-allowed' : 'pointer',
        ...style,
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
  style,
}: {
  selected?: boolean
  onClick?: () => void
  children: ReactNode
  style?: CSSProperties
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className="text-left rounded-lg px-4 py-3 text-base w-full"
      style={{
        ...(selected ? onState : { ...panelSurface, color: C.parchment }),
        minHeight: 44,
        cursor: 'pointer',
        ...style,
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
  onEnter?: () => void
  style?: CSSProperties
}) {
  return (
    <input
      id={props.id}
      value={props.value}
      onChange={(e) => props.onChange(e.target.value)}
      onKeyDown={(e) => e.key === 'Enter' && props.onEnter?.()}
      placeholder={props.placeholder}
      className="w-full rounded-lg px-4 py-3 outline-none"
      style={{ ...wellSurface, color: C.parchment, minHeight: 44, ...props.style }}
    />
  )
}

/**
 * Foldable panel (Quiet Interface law 5): dense surfaces open calm.
 * Open/closed state is remembered per device under the given id.
 */
export function Fold({
  id,
  title,
  defaultOpen = false,
  forceOpen = false,
  children,
}: {
  id: string
  title: string
  defaultOpen?: boolean
  forceOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(() => forceOpen || (readCache<boolean>(`fold:${id}`) ?? defaultOpen))
  const [glyph, label] = splitLeadGlyph(title)
  const toggle = () => {
    const next = !open
    setOpen(next)
    writeCache(`fold:${id}`, next)
  }
  return (
    <div className="rounded-xl mb-3 overflow-hidden" style={panelSurface}>
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        style={{ background: 'none', border: 'none', color: C.parchment, minHeight: 48, cursor: 'pointer' }}
      >
        <span className="flex items-center gap-2" style={{ ...display, fontSize: 18, fontWeight: 600, color: open ? C.gold : C.parchment }}>
          {glyph && <Icon name={glyph} size={18} style={{ color: open ? C.gold : C.brassDim, flexShrink: 0 }} />}
          {label}
        </span>
        <span aria-hidden="true" style={{ color: C.brassDim, fontSize: 18, lineHeight: 1 }}>
          {open ? '−' : '+'}
        </span>
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  )
}

/**
 * One-time hint (Quiet Interface law 3): a gentle line in the lanterns'
 * voice, shown until dismissed, then never again on this device.
 */
export function HintOnce({ id, children }: { id: string; children: ReactNode }) {
  const [dismissed, setDismissed] = useState(() => readCache<boolean>(`hint:${id}`) === true)
  if (dismissed) return null
  return (
    <div
      className="flex items-start justify-between gap-2 rounded-lg px-3 py-2 mb-3"
      style={{ background: `${C.sea}12`, border: `1px solid ${C.sea}44`, borderLeft: `3px solid ${C.sea}` }}
      role="note"
    >
      <p className="text-sm flex items-start gap-1.5" style={{ color: C.sea, fontStyle: 'italic' }}>
        <Icon name="spark" size={12} style={{ marginTop: 5, flexShrink: 0 }} />
        <span>{children}</span>
      </p>
      <button
        type="button"
        aria-label="Dismiss hint"
        onClick={() => {
          writeCache(`hint:${id}`, true)
          setDismissed(true)
        }}
        style={{ background: 'none', border: 'none', color: C.faint, minWidth: 40, minHeight: 40, cursor: 'pointer', flexShrink: 0 }}
      >
        <Icon name="cross" size={16} />
      </button>
    </div>
  )
}

/** In-app motion toggle — accessibility amendment 8.5. */
export function CalmToggle() {
  const [calm, setCalm] = useState(isCalm())
  return (
    <button
      type="button"
      aria-pressed={calm}
      onClick={() => {
        applyCalm(!calm)
        setCalm(!calm)
      }}
      className="text-xs"
      style={{ ...body, fontWeight: 600, color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer', whiteSpace: 'nowrap' }}
      title="Toggle animations"
    >
      {calm ? 'wake the lanterns' : 'calm the lanterns'}
    </button>
  )
}

/** Drifting ember motes for entry screens. Stilled (not removed) under calm / reduced motion. */
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
            lineHeight: 1,
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`,
            ['--drift-x' as string]: `${s.drift}px`,
            ['--lantern-max' as string]: s.max,
          }}
        >
          <Icon name="spark" size={s.size} />
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
      style={{ ...wellSurface, color: C.parchment, resize: 'vertical' }}
    />
  )
}
