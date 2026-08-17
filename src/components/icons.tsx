// The fairground glyph set — one stroke family drawn on a 24-grid, currentColor
// throughout, so the gold active state colours them the same on iPhone Safari
// and Android Chrome (no platform emoji in the chrome). Also home of the
// Lantern emblem (Gate, Book header, Stage), the Spark mark and the SparkRule.
//
//   <Icon name="bag" size={20} />        any glyph by name
//   <Icon name={EMOJI_TO_ICON['🎒']} />   every emoji the app has used as UI
//   <Spark size={12} />                  the ✦ drawn (fold-title fallback)
//   <Lantern size={80} waves />          the emblem: lantern over the Sea
//   <SparkRule />                        brass rule broken by a fixed 12px ✦
//
// Strokes: 1.7px at ≥18px, 1.9px below (small glyphs need weight in a dim room).

import { useId } from 'react'
import type { CSSProperties, ReactNode } from 'react'

const BASE = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** stroke width rule: thicker under 18px so small glyphs keep their weight */
export function strokeFor(size: number): number {
  return size < 18 ? 1.9 : 1.7
}

function I({ children, size = 22, style, className }: { children: ReactNode; size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
      className={className}
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...style }}
    >
      {children}
    </svg>
  )
}

export type IconName =
  | 'spark' | 'sparkOutline' | 'sheet' | 'spells' | 'bag' | 'story' | 'guide' | 'fortune' | 'build'
  | 'book' | 'tonight' | 'run' | 'cheat' | 'roster' | 'vault' | 'lost' | 'notes' | 'npcs' | 'clues' | 'table'
  | 'stage' | 'die' | 'shield' | 'heart' | 'heartBroken' | 'lantern' | 'purse' | 'coin'
  | 'envelope' | 'tent' | 'note' | 'snail' | 'map' | 'scales' | 'moon' | 'moonFull' | 'moonNew' | 'moonClock'
  | 'serpent' | 'calendar' | 'target' | 'hush' | 'half' | 'fist' | 'flame' | 'eye' | 'mirror'
  | 'cross' | 'arrow' | 'play' | 'sun' | 'dusk' | 'storm' | 'wave' | 'anchor' | 'bell' | 'quill' | 'candle' | 'mask' | 'swords' | 'key' | 'compass' | 'scroll' | 'wheel' | 'pennant'

/** The four-point spark — the identity mark, drawn once. Concave sides (d2). */
export const SPARK_PATH = 'M12 1.5 C12.6 7.4 14.6 10.6 22.5 12 C14.6 13.4 12.6 16.6 12 22.5 C11.4 16.6 9.4 13.4 1.5 12 C9.4 10.6 11.4 7.4 12 1.5 Z'

/** ✦ — the spark drawn (so it renders the same on every phone). Fallback glyph. */
export function Spark({ size = 16, style, className }: { size?: number; style?: CSSProperties; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} aria-hidden="true" focusable="false" className={className} style={{ display: 'inline-block', verticalAlign: '-0.12em', flexShrink: 0, ...style }}>
      <path d={SPARK_PATH} fill="currentColor" />
    </svg>
  )
}

export function Icon({ name, size = 22, style, className }: { name: IconName; size?: number; style?: CSSProperties; className?: string }) {
  const S = { ...BASE, strokeWidth: strokeFor(size) }
  const thin = { ...BASE, strokeWidth: strokeFor(size) - 0.4 }
  const p = { size, style, className }
  switch (name) {
    case 'spark':
    case 'spells':
      return <I {...p}><path d={SPARK_PATH} fill="currentColor" stroke="none" /></I>
    case 'sparkOutline':
      return <I {...p}><path d={SPARK_PATH} {...thin} /></I>
    case 'sheet': // the character card: a card with the ✦ sigil
      return <I {...p}><rect x="4.5" y="3" width="15" height="18" rx="2" {...S} /><path d="M12 8.2 c.3 2.2 1.1 3.1 3.6 3.8 c-2.5 .7 -3.3 1.6 -3.6 3.8 c-.3 -2.2 -1.1 -3.1 -3.6 -3.8 c2.5 -.7 3.3 -1.6 3.6 -3.8z" fill="currentColor" stroke="none" /><path d="M8 18.5h8" {...thin} /></I>
    case 'bag': // a satchel
      return <I {...p}><path d="M4.5 9.5h15l-1 10.5h-13z" {...S} /><path d="M8.5 9.5V7a3.5 3.5 0 0 1 7 0v2.5" {...S} /><path d="M4.5 13.5h15" {...thin} /><circle cx="12" cy="15.8" r="1.1" fill="currentColor" stroke="none" /></I>
    case 'story': // an open book
    case 'book':
      return <I {...p}><path d="M12 6.5c-1.6-1.4-4-2-8-2v14c4 0 6.4.6 8 2 1.6-1.4 4-2 8-2v-14c-4 0-6.4.6-8 2z" {...S} /><path d="M12 6.5v14" {...thin} /></I>
    case 'guide': // a lantern
    case 'lantern':
      return <I {...p}><path d="M9 4.5h6M12 2.5v2M8.5 7.5h7l1 2h-9z" {...S} /><path d="M8 9.5v8.5h8V9.5" {...S} /><path d="M7 18h10l-.8 2.5H7.8z" {...S} /><path d="M12 12c.9 1 1.5 1.9 1.5 2.9a1.5 1.5 0 0 1-3 0c0-1 .6-1.9 1.5-2.9z" fill="currentColor" stroke="none" /></I>
    case 'fortune': // the fortune wheel
    case 'wheel':
      return <I {...p}><circle cx="12" cy="12" r="8.5" {...S} /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><path d="M12 3.5v17M3.5 12h17M6 6l12 12M18 6L6 18" {...thin} strokeWidth={1.2} /><path d="M12 1.2l1.4 2.4h-2.8z" fill="currentColor" stroke="none" /></I>
    case 'build': // hammer on anvil
      return <I {...p}><path d="M4 16h11l-1 4H7z" {...S} /><path d="M4 16c-1.6-1.4-1.2-3.5 1-4h9v4" {...S} /><path d="M13.5 5.5l3-3 4 4-3 3z" {...S} /><path d="M15 7l-5.5 5.5" {...S} /></I>
    case 'tonight': // a pennant
    case 'pennant':
      return <I {...p}><path d="M6 21V3" {...S} /><path d="M6 4h12l-3 4 3 4H6" {...S} /></I>
    case 'run': // a compass rose
    case 'compass':
      return <I {...p}><circle cx="12" cy="12" r="9" {...S} /><path d="M15.5 8.5l-2 5.5-5.5 2 2-5.5z" fill="currentColor" stroke="none" opacity=".9" /><path d="M12 3v2M12 19v2M3 12h2M19 12h2" {...thin} /></I>
    case 'cheat': // a scroll
    case 'scroll':
      return <I {...p}><path d="M7 4h11a2 2 0 0 1 2 2v1H9" {...S} /><path d="M7 4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9" {...S} /><path d="M9 11h7M9 14.5h7" {...thin} /></I>
    case 'roster': // four sparks — the chairs
      return <I {...p}><path d="M12 3c.3 1.8 1 2.6 3 3-2 .4-2.7 1.2-3 3-.3-1.8-1-2.6-3-3 2-.4 2.7-1.2 3-3zM5 10.5c.3 1.6.9 2.3 2.6 2.6-1.7.3-2.3 1-2.6 2.6-.3-1.6-.9-2.3-2.6-2.6 1.7-.3 2.3-1 2.6-2.6zM19 10.5c.3 1.6.9 2.3 2.6 2.6-1.7.3-2.3 1-2.6 2.6-.3-1.6-.9-2.3-2.6-2.6 1.7-.3 2.3-1 2.6-2.6zM12 15c.3 1.8 1 2.6 3 3-2 .4-2.7 1.2-3 3-.3-1.8-1-2.6-3-3 2-.4 2.7-1.2 3-3z" fill="currentColor" stroke="none" /></I>
    case 'vault': // the crescent moon
    case 'moon':
      return <I {...p}><path d="M14.5 3.5a8.5 8.5 0 1 0 6 14.5A9 9 0 0 1 14.5 3.5z" {...S} /></I>
    case 'moonFull':
      return <I {...p}><circle cx="12" cy="12" r="8.5" {...S} /><path d="M8 9.5q2-1.5 4 0M14 14q1.5-1 3 0" {...thin} /></I>
    case 'moonNew': // the dark of the moon
      return <I {...p}><circle cx="12" cy="12" r="8.5" {...S} /><circle cx="12" cy="12" r="5.5" fill="currentColor" stroke="none" opacity=".35" /></I>
    case 'moonClock': // a moon in a ring
      return <I {...p}><circle cx="12" cy="12" r="9" {...S} /><path d="M13.5 6.5a5.5 5.5 0 1 0 3.5 7.5 4.5 4.5 0 0 1-3.5-7.5z" {...thin} /></I>
    case 'lost': // a key
    case 'key':
      return <I {...p}><circle cx="8" cy="9" r="4.5" {...S} /><path d="M11.5 12l8 8M16.5 17l2-2M14 14.5l2-2" {...S} /></I>
    case 'notes': // a quill
    case 'quill':
      return <I {...p}><path d="M20 4c-6 0-11 4-13 11l-3 5 5-3c7-2 11-7 11-13z" {...S} /><path d="M6 18l6-6" {...thin} /></I>
    case 'npcs': // a carnival mask
    case 'mask':
      return <I {...p}><path d="M4 7c2.5-1.5 5-2 8-2s5.5.5 8 2v5c0 4-3.5 8-8 8s-8-4-8-8z" {...S} /><path d="M7.5 10.5c1-1 2.5-1 3.5 0M13 10.5c1-1 2.5-1 3.5 0" {...thin} /><path d="M9 15c1.5 1.5 4.5 1.5 6 0" {...thin} /></I>
    case 'clues': // a candle
    case 'candle':
      return <I {...p}><path d="M9 10h6v10H9z" {...S} /><path d="M7 20h10" {...S} /><path d="M12 3c1.2 1.4 2 2.6 2 3.9a2 2 0 0 1-4 0C10 5.6 10.8 4.4 12 3z" fill="currentColor" stroke="none" /><path d="M12 7v3" {...thin} /></I>
    case 'table': // crossed swords
    case 'swords':
      return <I {...p}><path d="M4 4l11 11M20 4L9 15M4 20l4-4M20 20l-4-4M13.5 15.5l1.5 1.5M10.5 15.5L9 17" {...S} /></I>
    case 'stage': // footlights: a small arc of bulbs
      return <I {...p}><path d="M3 15a9 9 0 0 1 18 0" {...S} /><circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" /><circle cx="12" cy="8" r="1.2" fill="currentColor" stroke="none" /><circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" /><path d="M4 19h16" {...S} /></I>
    case 'die': // a d20 face
      return <I {...p}><path d="M12 2.5l8.5 5v9l-8.5 5-8.5-5v-9z" {...S} /><path d="M12 2.5v6l8.5-1M12 8.5L3.5 7.5M12 8.5l-5.5 8h11z" {...thin} strokeWidth={1.2} /><path d="M6.5 16.5L3.5 16.5M17.5 16.5h3M12 21.5v-5" {...thin} strokeWidth={1.2} /></I>
    case 'shield':
      return <I {...p}><path d="M12 3l7 2.5v5.5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V5.5z" {...S} /></I>
    case 'heart':
      return <I {...p}><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" fill="currentColor" stroke="none" /></I>
    case 'heartBroken':
      return <I {...p}><path d="M12 20s-7-4.6-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.4-7 10-7 10z" {...S} /><path d="M12 7.4l-1.5 4 3 2.5L12 20" {...thin} /></I>
    case 'envelope':
      return <I {...p}><rect x="3" y="5.5" width="18" height="13" rx="1.5" {...S} /><path d="M3.5 6.5l8.5 7 8.5-7" {...S} /><circle cx="12" cy="13.5" r="1.6" fill="currentColor" stroke="none" /></I>
    case 'tent':
      return <I {...p}><path d="M12 3.5l9 16H3z" {...S} /><path d="M12 3.5v16M12 19.5l-3-6M12 19.5l3-6" {...thin} /><path d="M12 3.5l2-1.5" {...thin} /></I>
    case 'note':
      return <I {...p}><path d="M9.5 18.5V5l10-2v13.5" {...S} /><circle cx="6.5" cy="18.5" r="3" {...S} /><circle cx="16.5" cy="16.5" r="3" {...S} /></I>
    case 'snail':
      return <I {...p}><path d="M4 18.5h14" {...S} /><path d="M6 18.5c-1.5-4 1-9.5 6-9.5s7 4 7 6.5c0 2-1.5 3-3.5 3" {...S} /><path d="M12 12.5a3 3 0 1 1 3.5 3" {...thin} /><path d="M6 12.5c-1.5-2-3-4-3-6.5M6.5 11c-.5-2 .5-4 1.5-5.5" {...thin} /></I>
    case 'serpent':
      return <I {...p}><path d="M4.5 16c1.5-4 4.5-4 6-1.5s4.5 2.5 6-1c1-2.5 3.5-3 4-5.5" {...S} /><path d="M4.5 16c-.5 2.5 1.5 3.5 3 2" {...S} /><circle cx="19.5" cy="7.5" r="1" fill="currentColor" stroke="none" /></I>
    case 'map':
      return <I {...p}><path d="M3 6l6-2 6 2 6-2v14l-6 2-6-2-6 2z" {...S} /><path d="M9 4v14M15 6v14" {...thin} /></I>
    case 'scales':
      return <I {...p}><path d="M12 3v17M7 20h10M5 7h14" {...S} /><path d="M2.5 13l3.5-6 3.5 6a3.5 3.5 0 0 1-7 0zM14.5 13l3.5-6 3.5 6a3.5 3.5 0 0 1-7 0z" {...thin} /></I>
    case 'purse':
      return <I {...p}><path d="M7 9c-2 2.5-3 5-3 7.5 0 2 1.5 3.5 4 3.5h8c2.5 0 4-1.5 4-3.5C20 14 19 11.5 17 9z" {...S} /><path d="M7 9l1.5-4h7L17 9" {...S} /><path d="M9.5 9h5" {...thin} /></I>
    case 'coin':
      return <I {...p}><circle cx="12" cy="12" r="8" {...S} /><circle cx="12" cy="12" r="4.5" {...thin} /><path d="M12 9.5v5" {...thin} /></I>
    case 'calendar':
      return <I {...p}><rect x="4" y="5.5" width="16" height="15" rx="2" {...S} /><path d="M4 10h16M8 3.5V7M16 3.5V7" {...S} /><path d="M8 14h2M14 14h2M8 17.5h2" {...thin} /></I>
    case 'target':
      return <I {...p}><circle cx="12" cy="12" r="8.5" {...S} /><circle cx="12" cy="12" r="4.5" {...thin} /><circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" /></I>
    case 'hush': // for your eyes only
      return <I {...p}><path d="M4 12c3-5 13-5 16 0-3 5-13 5-16 0z" {...S} /><path d="M4 12c3 2.5 13 2.5 16 0" {...thin} /></I>
    case 'half': // concentration
      return <I {...p}><circle cx="12" cy="12" r="8" {...S} /><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor" stroke="none" /></I>
    case 'fist':
      return <I {...p}><path d="M6 12V9a1.5 1.5 0 0 1 3 0V8a1.5 1.5 0 0 1 3 0v.5a1.5 1.5 0 0 1 3 0V10a1.5 1.5 0 0 1 3 0v5a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5z" {...S} /><path d="M9 12V9M12 12V8M15 12V8.5" {...thin} /></I>
    case 'flame':
      return <I {...p}><path d="M12 3.5c2.5 3.5 5.5 6 5.5 10a5.5 5.5 0 0 1-11 0c0-2.5 1.5-4 2.5-5.5 0 2 1 3 2 3 0-2.5 0-5 1-7.5z" {...S} /></I>
    case 'eye':
      return <I {...p}><path d="M3 12c3-5.5 15-5.5 18 0-3 5.5-15 5.5-18 0z" {...S} /><circle cx="12" cy="12" r="3" {...S} /></I>
    case 'mirror':
      return <I {...p}><ellipse cx="12" cy="10.5" rx="6.5" ry="7.5" {...S} /><path d="M12 18v2.5M8.5 20.5h7" {...S} /><path d="M9.5 8q1-2 3-2.5" {...thin} /></I>
    case 'cross':
      return <I {...p}><path d="M6 6l12 12M18 6L6 18" {...S} /></I>
    case 'arrow':
      return <I {...p}><path d="M4 12h16M14 6l6 6-6 6" {...S} /></I>
    case 'play':
      return <I {...p}><path d="M7 4.5v15l12-7.5z" {...S} /></I>
    case 'sun':
      return <I {...p}><circle cx="12" cy="12" r="4" {...S} /><path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1" {...thin} /></I>
    case 'dusk': // the sun on the horizon
      return <I {...p}><path d="M5 15a7 7 0 0 1 14 0" {...S} /><path d="M3 15h18M6 19h12" {...S} /><path d="M12 4v2.5M4.5 8.5l1.8 1.8M19.5 8.5l-1.8 1.8" {...thin} /></I>
    case 'storm':
      return <I {...p}><path d="M7 15.5a4 4 0 0 1-.5-8 5.5 5.5 0 0 1 10.6 1.5A3.3 3.3 0 0 1 17 15.5" {...S} /><path d="M12.5 12l-2.5 4.5h4L11.5 21" {...S} /></I>
    case 'wave':
      return <I {...p}><path d="M3 9.5c2-2 4-2 6 0s4 2 6 0 4-2 6 0" {...S} /><path d="M3 15c2-2 4-2 6 0s4 2 6 0 4-2 6 0" {...S} /></I>
    case 'anchor':
      return <I {...p}><circle cx="12" cy="5" r="2.2" {...S} /><path d="M12 7.2V21M8 11h8" {...S} /><path d="M4.5 14a7.5 7.5 0 0 0 15 0" {...S} /><path d="M4.5 14l-2 1.5M19.5 14l2 1.5" {...thin} /></I>
    case 'bell':
      return <I {...p}><path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2h-15z" {...S} /><path d="M10 21a2 2 0 0 0 4 0M12 3v2" {...S} /></I>
  }
}

/**
 * Every emoji / dingbat the app has used as UI (tab bars, DM nav, fold and
 * eyebrow titles, inline chrome) → the glyph that replaces it. Fold/Eyebrow
 * strip a leading token through this map (ui.tsx splitLeadGlyph); anything
 * unmapped falls back to the Spark.
 */
export const EMOJI_TO_ICON: Record<string, IconName> = {
  '✦': 'spark', '✧': 'sparkOutline', '✨': 'spark', '⭐': 'spark', '★': 'spark',
  '❖': 'roster', '🎒': 'bag', '📖': 'story', '🧭': 'run', '⚒': 'build', '🔨': 'build',
  '☾': 'vault', '🌙': 'vault', '🌕': 'moonFull', '🌑': 'moonNew', '🕰': 'moonClock',
  '🔒': 'lost', '🗝': 'lost', '🔑': 'lost', '✎': 'notes', '✒': 'notes', '🖋': 'notes',
  '🎭': 'npcs', '🕯': 'clues', '🏮': 'lantern', '⚔': 'table', '🗡': 'table', '⚑': 'tonight', '🚩': 'tonight',
  '📜': 'cheat', '🎲': 'die', '✉': 'envelope', '💌': 'envelope', '⚖': 'scales', '🎵': 'note', '🎶': 'note', '♪': 'note', '♫': 'note',
  '🎡': 'fortune', '🎠': 'fortune', '🎪': 'tent', '🗺': 'map', '🐌': 'snail', '🐍': 'serpent', '🗓': 'calendar', '📅': 'calendar',
  '🎯': 'target', '🤫': 'hush', '👁': 'eye', '🪞': 'mirror', '🪙': 'purse', '💰': 'purse', '⚪': 'coin', '🟤': 'coin', '🟡': 'coin',
  '♥': 'heart', '❤': 'heart', '💓': 'heart', '💔': 'heartBroken', '🛡': 'shield', '◐': 'half', '👊': 'fist', '💪': 'fist', '🔥': 'flame',
  '✕': 'cross', '✖': 'cross', '❌': 'cross', '➤': 'arrow', '→': 'arrow', '▶': 'play', '⏵': 'play',
  '☀': 'sun', '🌇': 'dusk', '🌅': 'dusk', '⛈': 'storm', '🌩': 'storm', '⚡': 'storm', '🌊': 'wave', '💧': 'wave', '⚓': 'anchor', '🔔': 'bell',
}

/**
 * The Lantern — the emblem. A hanging carnival lantern with the ✦ spark as
 * its flame; with `waves` it hangs over two fading lines of the Sea (the
 * lockup for the Gate, the Stage and the PWA icon). `size` is the rendered
 * height of the lantern body; the flame flickers unless the lanterns are calmed.
 */
export function Lantern({ size = 56, style, flicker = true, waves = false }: { size?: number; style?: CSSProperties; flicker?: boolean; waves?: boolean }) {
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const glowId = `lg-${uid}`
  const brassId = `lb-${uid}`
  const vh = waves ? 78 : 64
  const w = (size * 40) / 64
  const h = (size * vh) / 64
  return (
    <svg viewBox={`0 0 40 ${vh}`} width={w} height={h} aria-hidden="true" focusable="false" style={{ display: 'block', overflow: 'visible', ...style }}>
      <defs>
        <radialGradient id={glowId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD98A" stopOpacity=".55" />
          <stop offset="60%" stopColor="#F0B54F" stopOpacity=".12" />
          <stop offset="100%" stopColor="#F0B54F" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={brassId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#8A6224" />
          <stop offset=".45" stopColor="#F0B54F" />
          <stop offset="1" stopColor="#9C6F2C" />
        </linearGradient>
      </defs>
      {/* the light it throws */}
      <circle cx="20" cy="36" r="19" fill={`url(#${glowId})`} />
      {/* ring and cap */}
      <circle cx="20" cy="5" r="3" fill="none" stroke={`url(#${brassId})`} strokeWidth="1.6" />
      <path d="M20 8v3" stroke={`url(#${brassId})`} strokeWidth="1.6" strokeLinecap="round" />
      <path d="M11 15 L14 11 H26 L29 15 Z" fill={`url(#${brassId})`} />
      {/* glass body */}
      <path d="M12 16 H28 L30 44 H10 Z" fill="rgba(240,181,79,0.10)" stroke={`url(#${brassId})`} strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 16 V44 M12.5 30 H27.5" stroke="#B7873A" strokeWidth=".9" opacity=".7" />
      {/* base */}
      <path d="M9 45 H31 L29 50 H11 Z" fill={`url(#${brassId})`} />
      <path d="M17 51 h6 v3 h-6 z" fill="#8A6224" />
      {/* the flame: the ✦ */}
      <g className={flicker ? 'flicker' : undefined} style={{ transformOrigin: '20px 34px' }}>
        <path d="M20 22 C20.4 27.5 21.8 30 26 31 C21.8 32 20.4 34.5 20 40 C19.6 34.5 18.2 32 14 31 C18.2 30 19.6 27.5 20 22 Z" fill="#FFD98A" />
        <path d="M20 26 C20.2 29 21 30.3 23.4 31 C21 31.7 20.2 33 20 36 C19.8 33 19 31.7 16.6 31 C19 30.3 19.8 29 20 26 Z" fill="#FFF4D6" />
      </g>
      {/* the Sea beneath: two fading lines */}
      {waves && (
        <g fill="none" stroke="var(--seafoam, #8BD3BC)" strokeLinecap="round">
          <path d="M0 63 Q5 59.5 10 63 T20 63 T30 63 T40 63" strokeWidth="1.5" opacity=".85" />
          <path d="M5 70 Q10 66.5 15 70 T25 70 T35 70" strokeWidth="1.3" opacity=".5" />
        </g>
      )}
    </svg>
  )
}

/** A brass rule with a spark at its heart — section dividers, ceremony lines. Flex row: the ✦ never stretches. */
export function SparkRule({ style, color = '#B7873A', sparkSize = 12 }: { style?: CSSProperties; color?: string; sparkSize?: number }) {
  return (
    <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', color, ...style }}>
      <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.6 }} />
      <Spark size={sparkSize} style={{ verticalAlign: 'middle' }} />
      <span style={{ flex: 1, height: 1, background: 'currentColor', opacity: 0.6 }} />
    </div>
  )
}
