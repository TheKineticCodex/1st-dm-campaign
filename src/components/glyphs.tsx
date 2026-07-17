// Original sigil art for the forge — every species and class gets a mark.
// All in-palette stroke SVGs drawn for this campaign (licensing guardrail:
// no book art ships with the app). Rendered with currentColor so the
// character's chosen aura tints them.

import type { ReactNode } from 'react'

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2.4,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

function Glyph({ children, label }: { children: ReactNode; label: string }) {
  return (
    <svg viewBox="0 0 48 48" role="img" aria-label={label} style={{ width: '100%', height: '100%' }}>
      {children}
    </svg>
  )
}

export const SPECIES_GLYPHS: Record<string, ReactNode> = {
  Human: (
    <Glyph label="Human sigil">
      <circle cx="24" cy="16" r="7" {...S} />
      <path d="M10 40 Q24 26 38 40" {...S} />
      <path d="M24 4 l1.5 3 3 .5 -2.2 2.2 .5 3 -2.8 -1.5 -2.8 1.5 .5 -3 -2.2 -2.2 3 -.5 z" fill="currentColor" stroke="none" opacity=".9" />
    </Glyph>
  ),
  Elf: (
    <Glyph label="Elf sigil">
      <path d="M24 42 C10 30 12 12 24 6 C36 12 38 30 24 42 Z" {...S} />
      <path d="M24 40 V12" {...S} />
      <path d="M24 22 C19 20 16 16 16 12 M24 30 C29 28 32 24 32 20" {...S} />
    </Glyph>
  ),
  Dwarf: (
    <Glyph label="Dwarf sigil">
      <path d="M6 40 L18 16 L24 26 L30 12 L42 40 Z" {...S} />
      <path d="M20 40 L24 33 L28 40" {...S} />
      <circle cx="30" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </Glyph>
  ),
  Halfling: (
    <Glyph label="Halfling sigil">
      <circle cx="24" cy="26" r="15" {...S} />
      <circle cx="24" cy="26" r="9.5" {...S} strokeWidth={1.4} />
      <circle cx="29" cy="26" r="1.8" fill="currentColor" stroke="none" />
      <path d="M24 6 Q26 9 24 11 Q22 9 24 6" {...S} strokeWidth={1.6} />
    </Glyph>
  ),
  Gnome: (
    <Glyph label="Gnome sigil">
      <path d="M14 30 L24 6 L34 30 Z" {...S} />
      <path d="M10 36 Q24 30 38 36" {...S} />
      <circle cx="24" cy="6" r="1.8" fill="currentColor" stroke="none" />
      <path d="M20 22 h8" {...S} strokeWidth={1.4} />
    </Glyph>
  ),
  Orc: (
    <Glyph label="Orc sigil">
      <path d="M12 14 Q10 30 18 40 M36 14 Q38 30 30 40" {...S} />
      <path d="M14 34 Q12 26 15 20 M34 34 Q36 26 33 20" {...S} strokeWidth={1.4} />
      <path d="M18 40 Q24 44 30 40" {...S} />
      <path d="M20 24 l2 4 M28 24 l-2 4" {...S} />
    </Glyph>
  ),
  Tiefling: (
    <Glyph label="Tiefling sigil">
      <path d="M14 42 C6 30 8 14 16 8 C14 18 16 26 20 30" {...S} />
      <path d="M34 42 C42 30 40 14 32 8 C34 18 32 26 28 30" {...S} />
      <path d="M20 38 Q24 42 28 38" {...S} />
      <circle cx="24" cy="34" r="1.6" fill="currentColor" stroke="none" />
    </Glyph>
  ),
  Dragonborn: (
    <Glyph label="Dragonborn sigil">
      <path d="M8 28 Q16 8 40 10 Q34 16 30 16 Q36 22 32 30 Q26 26 22 28 Q24 36 18 40 Q16 32 8 28 Z" {...S} />
      <circle cx="30" cy="13.5" r="1.6" fill="currentColor" stroke="none" />
    </Glyph>
  ),
  Goliath: (
    <Glyph label="Goliath sigil">
      <path d="M12 42 L12 18 L24 6 L36 18 L36 42" {...S} />
      <path d="M18 42 V26 L24 20 L30 26 V42" {...S} strokeWidth={1.6} />
      <path d="M24 6 V2" {...S} />
    </Glyph>
  ),
  Aasimar: (
    <Glyph label="Aasimar sigil">
      <circle cx="24" cy="24" r="9" {...S} />
      <path d="M24 4 V10 M24 38 V44 M4 24 H10 M38 24 H44 M10 10 L14 14 M38 10 L34 14 M10 38 L14 34 M38 38 L34 34" {...S} />
    </Glyph>
  ),
  'Fairy ✦': (
    <Glyph label="Fairy sigil">
      <path d="M24 24 C14 8 4 12 8 22 C10 28 18 28 24 24 Z" {...S} />
      <path d="M24 24 C34 8 44 12 40 22 C38 28 30 28 24 24 Z" {...S} />
      <path d="M24 24 C16 34 10 34 12 40 M24 24 C32 34 38 34 36 40" {...S} strokeWidth={1.6} />
      <path d="M24 20 V34" {...S} />
    </Glyph>
  ),
  'Harengon ✦': (
    <Glyph label="Harengon sigil">
      <path d="M17 26 C12 18 12 8 17 5 C21 8 21 18 19 26" {...S} />
      <path d="M31 26 C36 18 36 8 31 5 C27 8 27 18 29 26" {...S} />
      <circle cx="24" cy="33" r="9" {...S} />
      <circle cx="21" cy="31" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="27" cy="31" r="1.3" fill="currentColor" stroke="none" />
      <path d="M24 35 v2 M22 39 q2 1.5 4 0" {...S} strokeWidth={1.4} />
    </Glyph>
  ),
}

export const CLASS_SIGILS: Record<string, ReactNode> = {
  Barbarian: (
    <Glyph label="Barbarian sigil">
      <path d="M24 44 V14" {...S} />
      <path d="M24 14 C14 14 10 8 12 4 C20 6 24 10 24 14 C24 10 28 6 36 4 C38 8 34 14 24 14 Z" {...S} />
    </Glyph>
  ),
  Bard: (
    <Glyph label="Bard sigil">
      <path d="M20 30 C12 30 10 40 18 42 C26 44 30 36 28 28 L24 12 C23 8 26 5 30 6" {...S} />
      <path d="M22 26 L34 10 M25 30 L37 14" {...S} strokeWidth={1.4} />
    </Glyph>
  ),
  Cleric: (
    <Glyph label="Cleric sigil">
      <circle cx="24" cy="24" r="7" {...S} />
      <path d="M24 6 V17 M24 31 V42 M6 24 H17 M31 24 H42" {...S} />
    </Glyph>
  ),
  Druid: (
    <Glyph label="Druid sigil">
      <path d="M36 8 C16 8 10 24 12 40 C14 26 20 18 32 14" {...S} />
      <path d="M36 8 C38 20 34 30 24 34" {...S} />
    </Glyph>
  ),
  Fighter: (
    <Glyph label="Fighter sigil">
      <path d="M10 10 L34 34 M38 38 L34 34 M28 40 L40 28" {...S} />
      <path d="M38 10 L14 34 M10 38 L14 34 M8 28 L20 40" {...S} />
    </Glyph>
  ),
  Monk: (
    <Glyph label="Monk sigil">
      <path d="M38 20 A15 15 0 1 0 40 30" {...S} />
      <circle cx="24" cy="24" r="3" fill="currentColor" stroke="none" />
    </Glyph>
  ),
  Paladin: (
    <Glyph label="Paladin sigil">
      <path d="M24 4 C30 8 36 9 40 9 C40 26 34 38 24 44 C14 38 8 26 8 9 C12 9 18 8 24 4 Z" {...S} />
      <path d="M24 14 V32 M16 22 H32" {...S} strokeWidth={1.8} />
    </Glyph>
  ),
  Ranger: (
    <Glyph label="Ranger sigil">
      <path d="M12 8 C28 12 34 28 36 42" {...S} />
      <path d="M12 8 C10 24 18 36 36 42" {...S} strokeWidth={1.6} />
      <path d="M40 8 L16 34 M16 34 l-1 7 M16 34 l7 -1" {...S} strokeWidth={1.8} />
    </Glyph>
  ),
  Rogue: (
    <Glyph label="Rogue sigil">
      <path d="M24 4 C28 14 28 26 24 34 C20 26 20 14 24 4 Z" {...S} />
      <path d="M16 34 H32 M24 34 V42 M20 42 h8" {...S} />
    </Glyph>
  ),
  Sorcerer: (
    <Glyph label="Sorcerer sigil">
      <path d="M24 44 C12 38 14 28 20 24 C16 18 20 8 28 4 C26 12 30 16 32 20 C38 26 34 40 24 44 Z" {...S} />
      <path d="M24 36 C20 32 22 28 25 26 C28 30 28 33 24 36 Z" {...S} strokeWidth={1.4} />
    </Glyph>
  ),
  Warlock: (
    <Glyph label="Warlock sigil">
      <path d="M6 24 C12 14 36 14 42 24 C36 34 12 34 6 24 Z" {...S} />
      <circle cx="24" cy="24" r="5" {...S} />
      <circle cx="24" cy="24" r="1.8" fill="currentColor" stroke="none" />
    </Glyph>
  ),
  Wizard: (
    <Glyph label="Wizard sigil">
      <path d="M30 6 A14 14 0 1 0 42 22 A11 11 0 0 1 30 6 Z" {...S} />
      <path d="M34 30 l1 2.5 2.5 1 -2.5 1 -1 2.5 -1 -2.5 -2.5 -1 2.5 -1 z" fill="currentColor" stroke="none" />
    </Glyph>
  ),
}

/** The light the lanterns see in you — aura choices for the medallion. */
export const AURAS: Record<string, { color: string; name: string; word: string }> = {
  lantern: { color: '#E8B84B', name: 'Lantern Gold', word: 'warmth that refuses to go out' },
  seafoam: { color: '#7FD4C1', name: 'Seafoam', word: 'something the tide once loved' },
  twilight: { color: '#C08BE0', name: 'Twilight Violet', word: 'a question the stars keep asking' },
  rose: { color: '#E08BA8', name: 'Briar Rose', word: 'sweetness with thorns in it' },
}

export const DEFAULT_AURA = 'lantern'
