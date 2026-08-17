// The Lantern-Keeper's Cheat Sheet — one glanceable screen for the table.
// Story in a breath, the three rules, the five, who's who, tonight's beats,
// panic lines. Data lives in src/data/cheatSheet.ts; this file only lays
// it out. All components at module scope (see ui.tsx header).

import {
  MOON_CLOCK,
  PANIC_LINES,
  STORY_IN_A_BREATH,
  THE_FIVE,
  THREE_RULES,
  TONIGHT_BEATS,
  WHO_IS_WHO,
  type CheatCard,
} from '../data/cheatSheet'
import { C, Eyebrow, Fold, H, Section, display } from './ui'
import { Icon, Spark } from './icons'

export function CheatSheet() {
  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <H>The Cheat Sheet</H>
      <p className="text-sm mb-4" style={{ color: C.faint }}>
        Everything you need to remember, in plain words. Glance, don't read.
      </p>

      <Section style={{ borderColor: C.gold }}>
        <Eyebrow>The story, in one breath</Eyebrow>
        <ol className="mt-2 space-y-2" style={{ paddingLeft: '1.25rem' }}>
          {STORY_IN_A_BREATH.map((line, i) => (
            <li key={i} style={{ ...display, fontSize: 19, lineHeight: 1.35, color: C.parchment }}>
              {line}
            </li>
          ))}
        </ol>
      </Section>

      <Section>
        <Eyebrow>The only three rules players ever need</Eyebrow>
        <div className="mt-2 space-y-2">
          {THREE_RULES.map((rule, i) => (
            <p key={i} style={{ ...display, fontSize: 20, fontWeight: 600, color: C.gold, lineHeight: 1.3 }}>
              {i + 1}. {rule}
            </p>
          ))}
        </div>
      </Section>

      <Fold id="cheat:moon" title="🌙 The Moon clock — read one line at every session's open">
        <ul className="space-y-2">
          {MOON_CLOCK.map((line, i) => (
            <li key={i} className="text-base" style={{ color: C.parchment, lineHeight: 1.45 }}>
              <span style={{ color: C.gold }}>·</span> {line}
            </li>
          ))}
        </ul>
        <p className="text-xs mt-3" style={{ color: C.faint }}>
          No rules. Bigger and wronger every time. They'll feel the clock without you counting.
        </p>
      </Fold>

      <Eyebrow>Tonight — the carnival</Eyebrow>
      <CardList prefix="beat" cards={TONIGHT_BEATS} defaultOpen />

      <Eyebrow>Your five</Eyebrow>
      <CardList prefix="five" cards={THE_FIVE} />

      <Eyebrow>Who's who</Eyebrow>
      <CardList prefix="who" cards={WHO_IS_WHO} />

      <Section>
        <Eyebrow>When you freeze</Eyebrow>
        <ul className="mt-2 space-y-1">
          {PANIC_LINES.map((line, i) => (
            <li key={i} className="text-base flex items-start gap-2" style={{ color: C.parchment }}>
              <Spark size={12} style={{ color: C.sea, marginTop: 7, flexShrink: 0 }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs mt-3 inline-flex items-center gap-1.5" style={{ color: C.faint }}>
          The Book has you. <Icon name="lantern" size={14} style={{ color: C.brassDim }} />
        </p>
      </Section>
    </div>
  )
}

function CardList({ prefix, cards, defaultOpen = false }: { prefix: string; cards: CheatCard[]; defaultOpen?: boolean }) {
  return (
    <div className="mb-4">
      {cards.map((card, i) => (
        <Fold key={card.title} id={`cheat:${prefix}:${i}`} title={card.title} defaultOpen={defaultOpen}>
          <ul className="space-y-2">
            {card.lines.map((line, j) => (
              <li key={j} className="text-base" style={{ color: C.parchment, lineHeight: 1.45 }}>
                <span style={{ color: C.gold }}>·</span> {line}
              </li>
            ))}
          </ul>
        </Fold>
      ))}
    </div>
  )
}
