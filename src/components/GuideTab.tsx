// The Guide — rules at your thumb. Search across everything; "your turn"
// always one tap away; conditions and the glossary; the pocket-guide
// candles. Nothing here needs the network.

import { useMemo, useState } from 'react'
import { GUIDE } from '../data/guide'
import { CONDITIONS } from '../data/rules'
import { ACTIONS, GLOSSARY, type RefEntry } from '../data/rulesRef'
import { C, Eyebrow, H, display, eyebrow, onState, panelSurface, wellSurface } from './ui'
import { Icon, type IconName } from './icons'

type Tab = 'turn' | 'rules' | 'guide'

/** Cost pills, in tokens: action = gold, bonus = the Sea, reaction = copper, movement = brass, free = faint. */
const COST_COLOR: Record<string, string> = {
  action: C.gold,
  'bonus action': C.sea,
  reaction: C.copper,
  movement: C.brassDim,
  free: C.faint,
}

const clean = (t: string) => t.replace(/\s*\/\/ VERIFY.*$/, '')

export function GuideTab() {
  const [tab, setTab] = useState<Tab>('turn')
  const [q, setQ] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const query = q.trim().toLowerCase()
  const conditions: RefEntry[] = useMemo(() => Object.entries(CONDITIONS).map(([name, text]) => ({ name, text, keys: 'condition' })), [])
  const guideEntries: RefEntry[] = useMemo(() => GUIDE.map((g) => ({ name: g.t, text: g.b })), [])

  const match = (e: RefEntry) => !query || `${e.name} ${e.text} ${e.keys ?? ''}`.toLowerCase().includes(query)

  const results = query
    ? [
        ...ACTIONS.filter(match).map((e) => ({ ...e, group: 'your turn' })),
        ...conditions.filter(match).map((e) => ({ ...e, group: 'condition' })),
        ...GLOSSARY.filter(match).map((e) => ({ ...e, group: 'rule' })),
        ...guideEntries.filter(match).map((e) => ({ ...e, group: 'guide' })),
      ]
    : null

  const card = (e: RefEntry & { group?: string }, key: string) => {
    const isOpen = open === key
    return (
      <div key={key} className="rounded-lg mb-2 overflow-hidden" style={{ ...panelSurface, ...(isOpen ? { borderColor: C.gold } : {}) }}>
        <button
          type="button"
          onClick={() => setOpen(isOpen ? null : key)}
          className="w-full text-left px-4 py-3 flex justify-between items-center gap-2"
          style={{ background: 'none', border: 'none', color: C.parchment, minHeight: 44, cursor: 'pointer' }}
          aria-expanded={isOpen}
        >
          <span style={{ ...display, fontSize: 17, fontWeight: 600 }}>
            {e.name}
            {e.cost && (
              <span className="text-xs ml-2 rounded-full px-2 align-middle" style={{ ...eyebrow, fontSize: 11, letterSpacing: '0.12em', color: COST_COLOR[e.cost], background: `linear-gradient(${COST_COLOR[e.cost]}1F, ${COST_COLOR[e.cost]}1F), ${C.nightDeep}`, border: `1px solid ${COST_COLOR[e.cost]}66`, padding: '1px 8px' }}>
                {e.cost}
              </span>
            )}
            {e.group && !e.cost && (
              <span className="text-xs ml-2" style={{ color: C.faint, fontWeight: 400 }}>
                {e.group}
              </span>
            )}
          </span>
          <span aria-hidden="true" style={{ color: C.brassDim, fontSize: 18, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
        </button>
        {isOpen && (
          <p className="px-4 pb-4 text-sm leading-relaxed" style={{ color: C.parchment, opacity: 0.92 }}>
            {clean(e.text)}
          </p>
        )}
      </div>
    )
  }

  // segmented tabs: the active one is lit (ember), the rest sit on the panel
  const tabBtn = (id: Tab, icon: IconName, label: string) => (
    <button
      type="button"
      role="tab"
      aria-selected={tab === id}
      onClick={() => {
        setTab(id)
        setOpen(null)
      }}
      className="flex-1 rounded-md py-2 text-sm inline-flex items-center justify-center gap-1.5"
      style={{
        ...(tab === id ? onState : { ...panelSurface, color: C.faint }),
        fontWeight: 600,
        minHeight: 44,
        cursor: 'pointer',
      }}
    >
      <Icon name={icon} size={16} />
      {label}
    </button>
  )

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>The guide</Eyebrow>
      <H>Rules at your thumb</H>

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value)
          setOpen(null)
        }}
        placeholder="Search anything — grapple, prone, concentration, cover…"
        aria-label="Search the rules"
        className="w-full rounded-lg px-3 py-2 mt-3 text-base"
        style={{ ...wellSurface, color: C.parchment, minHeight: 44 }}
      />

      {results ? (
        <div className="mt-3">
          {results.length === 0 && (
            <p className="text-sm" style={{ color: C.faint }}>
              Nothing by that name. Ask your DM — that’s always allowed.
            </p>
          )}
          {results.map((e, i) => card(e, `r-${i}-${e.name}`))}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mt-3" role="tablist">
            {tabBtn('turn', 'play', 'Your turn')}
            {tabBtn('rules', 'story', 'Rules')}
            {tabBtn('guide', 'clues', 'Guide')}
          </div>

          {tab === 'turn' && (
            <div className="mt-3">
              <p className="text-sm mb-2" style={{ color: C.faint }}>
                Every turn you get: <strong style={{ color: C.parchment }}>move</strong> (up to your speed) + <strong style={{ color: C.parchment }}>one action</strong> + maybe{' '}
                <strong style={{ color: C.parchment }}>one bonus action</strong> + <strong style={{ color: C.parchment }}>one reaction</strong> per round. Pick from these.
              </p>
              {ACTIONS.map((e) => card(e, `a-${e.name}`))}
            </div>
          )}

          {tab === 'rules' && (
            <div className="mt-3">
              <p className="mb-1" style={{ ...eyebrow, color: C.sea }}>
                conditions
              </p>
              {conditions.map((e) => card(e, `c-${e.name}`))}
              <p className="mb-1 mt-4" style={{ ...eyebrow, color: C.sea }}>
                the words that come up
              </p>
              {GLOSSARY.map((e) => card(e, `g-${e.name}`))}
            </div>
          )}

          {tab === 'guide' && (
            <div className="mt-3">
              <p className="text-sm mb-2" style={{ color: C.faint }}>
                How to play, in small candles. Read the first ten before your first night; the rest, as they come up.
              </p>
              {guideEntries.map((e, i) => card(e, `p-${i}`))}
              <p className="text-sm mt-4" style={{ color: C.faint }}>
                Everything else, your Dungeon Master will teach you at the table. That’s the fun part.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
