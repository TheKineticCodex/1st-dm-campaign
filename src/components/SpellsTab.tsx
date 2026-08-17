// ✦ Spells — the caster's own tab. The same casting surface as the sheet
// (so a druid can cast from here too), plus room to browse the whole list
// their class can learn, with every card. Fairies see their innate magic.

import { useState } from 'react'
import { fmt } from '../data/rules'
import { CLASS_LETTER, spellsFor, type Spell } from '../data/spellbook'
import { maxSpellLevel } from '../data/levels'
import { computeSheet } from '../lib/compute'
import type { SavedCharacter } from '../types'
import { SpellChips, SpellsSection } from './SpellsSection'
import { C, Eyebrow, H, Section, display, onState, panelSurface, wellSurface } from './ui'
import { Icon } from './icons'

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

export function SpellsTab({ character, onUpdate }: { character: SavedCharacter | null; onUpdate: (c: SavedCharacter) => void }) {
  const [q, setQ] = useState('')
  const [lvl, setLvl] = useState<number>(-1)
  const [open, setOpen] = useState<string | null>(null)

  if (!character) return null
  const sheet = computeSheet(character.build)
  if (!sheet) return null
  const { build, state } = character
  const update = (patch: Partial<SavedCharacter>) => onUpdate({ ...character, ...patch, updatedAt: new Date().toISOString() })
  const updateState = (patch: Partial<SavedCharacter['state']>) => update({ state: { ...state, ...patch } })

  const usedSlots = (l: number): number => (l === 1 ? state.slotsUsed : (state.slotsByLevel?.[l] ?? 0))
  const castSpell = (slotLvl: number | null, concentration: boolean) => {
    const patch: Partial<SavedCharacter['state']> = {}
    if (slotLvl) {
      const next = usedSlots(slotLvl) + 1
      patch.slotsByLevel = { ...(state.slotsByLevel ?? {}), [slotLvl]: next }
      if (slotLvl === 1) patch.slotsUsed = next
    }
    if (concentration) patch.concentrating = true
    updateState(patch)
  }

  const letter = build.klass ? CLASS_LETTER[build.klass] : undefined
  const maxLvl = maxSpellLevel(sheet.level)
  const pool: Spell[] = letter
    ? spellsFor(letter, Math.max(maxLvl, 1)).filter((s) => (lvl < 0 || s.level === lvl) && (!q || `${s.name} ${s.school} ${s.text}`.toLowerCase().includes(q.toLowerCase())))
    : []

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>✦ your magic</Eyebrow>
      <H>{build.name || 'Your'} spells</H>

      {build.species === 'Fairy ✦' && (
        <Section>
          <Eyebrow>fairy magic — born in you, no slots needed</Eyebrow>
          <SpellChips label="Always yours" names={sheet.level >= 5 ? ['Druidcraft', 'Faerie Fire', 'Enlarge/Reduce'] : sheet.level >= 3 ? ['Druidcraft', 'Faerie Fire'] : ['Druidcraft']} />
        </Section>
      )}

      {sheet.K.spells && (
        <SpellsSection
          build={build}
          state={state}
          sheet={sheet}
          usedSlots={usedSlots}
          castSpell={castSpell}
          updateBuild={(patch) => update({ build: { ...build, ...patch } })}
          onRollSpellAttack={() => {}}
        />
      )}

      {letter && sheet.K.spells && (
        <Section>
          <Eyebrow>the whole {build.klass?.toLowerCase()} list — everything you could learn</Eyebrow>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, school, or what it does…"
            className="w-full rounded-md px-3 py-2 text-sm mt-1"
            style={{ ...wellSurface, color: C.parchment, minHeight: 44 }}
          />
          <div className="flex gap-1 mt-2 flex-wrap">
            {[-1, 0, 1, 2, 3].map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLvl(l)}
                className="rounded-md px-2 py-1 text-xs"
                aria-pressed={lvl === l}
                style={{ ...(lvl === l ? onState : { ...wellSurface, boxShadow: 'none', color: C.parchment }), minHeight: 36, cursor: 'pointer', opacity: l > maxLvl && l > 0 ? 0.5 : 1 }}
              >
                {l < 0 ? 'all' : l === 0 ? 'cantrips' : ordinal(l)}
              </button>
            ))}
          </div>
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            {pool.length} spells · you can cast up to {ordinal(Math.max(maxLvl, 1))} level · Spell attack {fmt(sheet.spellAttack ?? 0)} · DC {sheet.spellDc}
          </p>
          <div className="mt-2">
            {pool.map((s) => {
              const isOpen = open === s.name
              return (
                <div key={s.name} className="rounded-lg mb-1.5 overflow-hidden" style={{ ...panelSurface, ...(isOpen ? { borderColor: C.gold } : {}) }}>
                  <button
                    type="button"
                    onClick={() => setOpen(isOpen ? null : s.name)}
                    className="w-full text-left px-3 py-2 flex justify-between items-center gap-2"
                    style={{ background: 'none', border: 'none', color: C.parchment, minHeight: 44, cursor: 'pointer' }}
                  >
                    <span>
                      <strong style={{ ...display, fontSize: 16 }}>{s.name}</strong>
                      <span className="text-xs ml-2" style={{ color: C.faint }}>
                        {s.level === 0 ? 'cantrip' : ordinal(s.level)} · {s.school}
                        {s.tags?.includes('C') ? <> · <Icon name="half" size={12} style={{ verticalAlign: '-0.1em' }} /></> : ''}
                        {s.tags?.includes('R') ? ' · ritual' : ''}
                      </span>
                    </span>
                    <span aria-hidden="true" style={{ color: C.brassDim, fontSize: 18, lineHeight: 1 }}>{isOpen ? '−' : '+'}</span>
                  </button>
                  {isOpen && (
                    <div className="px-3 pb-3">
                      <p className="text-xs" style={{ color: C.sea }}>
                        {s.time} · {s.range} · {s.duration}
                      </p>
                      <p className="text-sm mt-1 leading-relaxed">{s.text.replace(/\s*\/\/ VERIFY.*$/, '')}</p>
                      {s.upcast && (
                        <p className="text-xs mt-1 italic" style={{ color: C.faint }}>
                          Higher slot: {s.upcast}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Section>
      )}
    </div>
  )
}
