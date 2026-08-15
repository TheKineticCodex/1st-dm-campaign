// The spells a character carries, on the sheet: cantrips, prepared spells
// by level, tap for the card, CAST spends a slot (and lights concentration
// when it should). "Change spells" edits what's known and prepared, with the
// class's real counts. Wizards keep a book (known) and prepare from it;
// druids prepare from the whole list.
//
// Falls back to the class starter lists (rules.ts) when the character has
// never chosen — so every existing sheet keeps working unchanged.

import { useState } from 'react'
import { buzz } from '../lib/phoneSound'
import { fmt } from '../data/rules'
import { SPELL_NOTES } from '../data/spells'
import {
  CLASS_LETTER,
  PREPARED_COUNT,
  cantripsKnown,
  spellByName,
  spellsFor,
  wizardBookSize,
  type Spell,
} from '../data/spellbook'
import { SUBCLASSES, maxSpellLevel } from '../data/levels'
import type { ComputedSheet } from '../lib/compute'
import type { CharacterBuild, CharacterState } from '../types'
import { C, Eyebrow, Section, display } from './ui'

interface SpellsSectionProps {
  build: CharacterBuild
  state: CharacterState
  sheet: ComputedSheet
  usedSlots: (lvl: number) => number
  /** Spend a slot (or null for cantrips/rituals) and light concentration if the spell needs it — one atomic update. */
  castSpell: (slotLvl: number | null, concentration: boolean) => void
  updateBuild: (patch: Partial<CharacterBuild>) => void
  onRollSpellAttack: () => void
}

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

export function SpellsSection({ build, sheet, usedSlots, castSpell, updateBuild, onRollSpellAttack }: SpellsSectionProps) {
  const [open, setOpen] = useState<string | null>(null)
  const [editing, setEditing] = useState(false)
  const [filter, setFilter] = useState('')
  const [editLevel, setEditLevel] = useState<number>(0)

  const klass = build.klass!
  const letter = CLASS_LETTER[klass] ?? ''
  const starter = sheet.K.spells ?? { cantrips: [], leveled: [] }
  const cantrips = build.cantrips ?? starter.cantrips
  const prepared = build.prepared ?? starter.leveled
  const book = build.spellbook ?? starter.leveled // wizards only
  const isWizard = klass === 'Wizard'
  const maxLvl = maxSpellLevel(sheet.level)
  const preparedMax = PREPARED_COUNT[klass]?.[sheet.level] ?? prepared.length
  const cantripMax = cantripsKnown(klass, sheet.level) || cantrips.length
  const bookMax = wizardBookSize(sheet.level)
  const canEdit = !!PREPARED_COUNT[klass]

  // Subclass-granted spells: always prepared, never counted.
  const granted: string[] = []
  const grants = build.subclass ? SUBCLASSES[klass]?.[build.subclass]?.grants : undefined
  if (grants) for (const [l, names] of Object.entries(grants)) if (Number(l) <= sheet.level) granted.push(...names)
  const grantedCantrips = granted.filter((n) => (spellByName(n)?.level ?? 1) === 0)
  const grantedLeveled = granted.filter((n) => (spellByName(n)?.level ?? 1) > 0)

  const byLevel = new Map<number, string[]>()
  for (const n of [...grantedLeveled, ...prepared.filter((x) => !granted.includes(x))]) {
    const lvl = spellByName(n)?.level ?? 1
    byLevel.set(lvl, [...(byLevel.get(lvl) ?? []), n])
  }
  const levels = [...byLevel.keys()].sort()

  const chip = (selected: boolean, disabled = false) => ({
    background: selected ? `${C.gold}22` : C.night,
    border: `1px solid ${selected ? C.gold : C.panelEdge}`,
    color: disabled ? C.faint : selected ? C.gold : C.parchment,
    minHeight: 36,
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
  })

  const [casting, setCasting] = useState<{ name: string; lvl: number | null; key: number } | null>(null)
  const cast = (sp: Spell | undefined, name: string, slotLvl: number | null) => {
    castSpell(slotLvl, !!sp?.tags?.includes('C'))
    setOpen(null)
    setCasting({ name, lvl: slotLvl, key: Date.now() })
    buzz([20, 30, 60])
    setTimeout(() => setCasting((c) => (c && Date.now() - c.key > 1500 ? null : c)), 1700)
  }

  const card = (name: string) => {
    const sp = spellByName(name)
    const fallback = (SPELL_NOTES[name] ?? 'Ask the Lantern-Keeper — this one isn’t in the pocket-book yet.').replace(/\s*\/\/ VERIFY.*$/, '')
    const text = (sp?.text ?? fallback).replace(/\s*\/\/ VERIFY.*$/, '')
    const isCantrip = (sp?.level ?? (starter.cantrips.includes(name) ? 0 : 1)) === 0
    const castable = !isCantrip && sp ? sheet.slotsByLevel.map((n, i) => ({ lvl: i + 1, free: n - usedSlots(i + 1) })).filter((s) => s.lvl >= sp.level && s.free > 0) : []
    return (
      <div className="mt-2 rounded-lg px-3 py-3" style={{ background: C.night, border: `1px solid ${C.gold}44` }}>
        <div className="flex items-baseline justify-between">
          <strong style={{ ...display, fontSize: 18, color: C.gold }}>{name}</strong>
          {sp && (
            <span className="text-xs" style={{ color: C.faint }}>
              {sp.level === 0 ? 'cantrip' : `${ordinal(sp.level)} level`} · {sp.school}
            </span>
          )}
        </div>
        {sp && (
          <p className="text-xs mt-1" style={{ color: C.sea }}>
            {sp.time} · {sp.range} · {sp.duration}
            {sp.tags?.includes('C') ? ' · ◐ concentration' : ''}
            {sp.tags?.includes('R') ? ' · ritual' : ''}
          </p>
        )}
        <p className="text-sm mt-2 leading-relaxed" style={{ color: C.parchment }}>
          {text}
        </p>
        {sp?.upcast && (
          <p className="text-xs mt-1 italic" style={{ color: C.faint }}>
            Higher slot: {sp.upcast}
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {isCantrip ? (
            <button type="button" onClick={() => cast(sp, name, null)} className="rounded-md px-3 py-2 text-sm" style={{ ...chip(true), minHeight: 44 }}>
              ✦ Cast (free)
            </button>
          ) : castable.length ? (
            castable.map((s) => (
              <button key={s.lvl} type="button" onClick={() => cast(sp, name, s.lvl)} className="rounded-md px-3 py-2 text-sm" style={{ ...chip(true), minHeight: 44 }}>
                ✦ Cast with a {ordinal(s.lvl)} slot ({s.free} left)
              </button>
            ))
          ) : (
            <span className="text-xs" style={{ color: C.faint }}>
              No slot left for this — rest, or find another way.
            </span>
          )}
          {sp?.tags?.includes('R') && (
            <button type="button" onClick={() => cast(sp, name, null)} className="rounded-md px-3 py-2 text-sm" style={{ ...chip(false), minHeight: 44 }}>
              Cast as a ritual (+10 min, no slot)
            </button>
          )}
        </div>
      </div>
    )
  }

  const chips = (names: string[]) => (
    <div className="flex flex-wrap gap-1.5 mt-1">
      {names.map((n) => {
        const sp = spellByName(n)
        return (
          <button key={n} type="button" aria-expanded={open === n} onClick={() => setOpen(open === n ? null : n)} className="rounded-md px-2.5 py-1.5 text-sm" style={chip(open === n)}>
            {n}
            {sp?.tags?.includes('C') ? <span style={{ color: C.faint }}> ◐</span> : null}
          </button>
        )
      })}
    </div>
  )

  // ------------------------------------------------------------ editing
  const toggleIn = (list: string[], name: string, max: number): string[] | null => {
    if (list.includes(name)) return list.filter((x) => x !== name)
    if (list.length >= max) return null
    return [...list, name]
  }
  const pool = spellsFor(letter, maxLvl).filter((s) => !filter || s.name.toLowerCase().includes(filter.toLowerCase()))
  const poolCantrips = pool.filter((s) => s.level === 0)
  const poolLeveled = pool.filter((s) => s.level > 0 && (editLevel === 0 || s.level === editLevel))
  const preparePool = isWizard ? poolLeveled.filter((s) => book.includes(s.name)) : poolLeveled

  return (
    <Section>
      {casting && (
        <div
          key={casting.key}
          role="status"
          className="fixed rounded-2xl px-6 py-4 text-center"
          style={{
            left: '50%',
            bottom: 'calc(96px + env(safe-area-inset-bottom))',
            transform: 'translateX(-50%)',
            minWidth: 240,
            maxWidth: 'calc(100vw - 32px)',
            background: `${C.night}F2`,
            border: `1px solid ${C.gold}`,
            color: C.parchment,
            zIndex: 47,
            pointerEvents: 'none',
            animation: 'castRise 1.7s cubic-bezier(.2,.8,.2,1) both, emberEdge 1.7s ease-out both',
          }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
            {casting.lvl ? `${ordinal(casting.lvl)}-level slot spent` : 'cantrip'}
          </p>
          <p style={{ ...display, fontSize: 26, fontWeight: 700, color: C.gold }}>
            ✦ {casting.name}
          </p>
        </div>
      )}
      <div className="flex items-center justify-between">
        <Eyebrow>Spellcasting</Eyebrow>
        {canEdit && (
          <button
            type="button"
            onClick={() => {
              setEditing(!editing)
              setOpen(null)
            }}
            className="text-xs underline"
            style={{ color: C.sea, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            {editing ? 'done ✓' : '✎ change spells'}
          </button>
        )}
      </div>
      <p className="text-xs" style={{ color: C.faint }}>
        <button type="button" onClick={onRollSpellAttack} style={{ color: C.sea, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}>
          Spell attack {fmt(sheet.spellAttack ?? 0)}
        </button>{' '}
        · Save DC {sheet.spellDc}
        {sheet.slotsByLevel.length > 0 && ` · casts up to ${ordinal(maxLvl)}-level spells`}
      </p>

      {!editing && (
        <>
          <p className="text-sm mt-2">
            <strong>Cantrips</strong> <span className="text-xs" style={{ color: C.faint }}>always free</span>
          </p>
          {chips([...grantedCantrips, ...cantrips.filter((c) => !granted.includes(c))])}
          {granted.length > 0 && (
            <p className="text-xs mt-1" style={{ color: C.faint }}>
              {build.subclass} keeps {granted.join(', ')} always ready — they don’t count against your prepared spells.
            </p>
          )}
          {levels.map((lvl) => (
            <div key={lvl} className="mt-2">
              <p className="text-sm">
                <strong>{ordinal(lvl)}-level</strong>{' '}
                <span className="text-xs" style={{ color: C.faint }}>
                  {sheet.slotsByLevel[lvl - 1] !== undefined ? `${sheet.slotsByLevel[lvl - 1] - usedSlots(lvl)} of ${sheet.slotsByLevel[lvl - 1]} slots left` : ''}
                </span>
              </p>
              {chips(byLevel.get(lvl) ?? [])}
            </div>
          ))}
          {open && card(open)}
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            Tap a spell to read it and cast it. ◐ marks concentration.
          </p>
        </>
      )}

      {editing && (
        <div className="mt-2">
          <p className="text-xs mb-2" style={{ color: C.faint }}>
            {isWizard
              ? `Your book holds ${book.length}/${bookMax} spells. Prepare ${prepared.length}/${preparedMax} of them each morning. Cantrips ${cantrips.length}/${cantripMax}.`
              : `Prepare ${prepared.length}/${preparedMax} spells from the whole ${klass.toLowerCase()} list each morning. Cantrips ${cantrips.length}/${cantripMax}.`}
          </p>
          <input
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            placeholder="Search spells…"
            className="w-full rounded-md px-3 py-2 text-sm mb-2"
            style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
          />
          <div className="flex gap-1 mb-2">
            {[0, ...Array.from({ length: maxLvl }, (_, i) => i + 1)].map((l) => (
              <button key={l} type="button" onClick={() => setEditLevel(l)} className="rounded-md px-2 py-1 text-xs" style={chip(editLevel === l)}>
                {l === 0 ? 'all' : ordinal(l)}
              </button>
            ))}
          </div>

          <p className="text-sm mt-1">
            <strong>Cantrips</strong> <span className="text-xs" style={{ color: C.faint }}>{cantrips.length}/{cantripMax}</span>
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {poolCantrips.map((s) => {
              const on = cantrips.includes(s.name)
              const full = !on && cantrips.length >= cantripMax
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    const next = toggleIn(cantrips, s.name, cantripMax)
                    if (next) updateBuild({ cantrips: next })
                  }}
                  className="rounded-md px-2.5 py-1.5 text-sm"
                  style={chip(on, full)}
                >
                  {on ? '✦ ' : ''}
                  {s.name}
                </button>
              )
            })}
          </div>

          {isWizard && (
            <>
              <p className="text-sm mt-3">
                <strong>Your spellbook</strong> <span className="text-xs" style={{ color: C.faint }}>{book.length}/{bookMax} known</span>
              </p>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {poolLeveled.map((s) => {
                  const on = book.includes(s.name)
                  const full = !on && book.length >= bookMax
                  return (
                    <button
                      key={s.name}
                      type="button"
                      onClick={() => {
                        const next = toggleIn(book, s.name, bookMax)
                        if (!next) return
                        const patch: Partial<CharacterBuild> = { spellbook: next }
                        if (!next.includes(s.name)) patch.prepared = prepared.filter((x) => x !== s.name)
                        updateBuild(patch)
                      }}
                      className="rounded-md px-2.5 py-1.5 text-sm"
                      style={chip(on, full)}
                    >
                      {on ? '📖 ' : ''}
                      {s.name} <span style={{ color: C.faint }}>{ordinal(s.level)}</span>
                    </button>
                  )
                })}
              </div>
            </>
          )}

          <p className="text-sm mt-3">
            <strong>Prepared</strong> <span className="text-xs" style={{ color: C.faint }}>{prepared.length}/{preparedMax}</span>
          </p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {preparePool.map((s) => {
              const on = prepared.includes(s.name)
              const full = !on && prepared.length >= preparedMax
              return (
                <button
                  key={s.name}
                  type="button"
                  onClick={() => {
                    const next = toggleIn(prepared, s.name, preparedMax)
                    if (next) updateBuild({ prepared: next })
                  }}
                  className="rounded-md px-2.5 py-1.5 text-sm"
                  style={chip(on, full)}
                >
                  {on ? '✦ ' : ''}
                  {s.name} <span style={{ color: C.faint }}>{ordinal(s.level)}</span>
                  {s.tags?.includes('C') ? <span style={{ color: C.faint }}> ◐</span> : null}
                </button>
              )
            })}
            {preparePool.length === 0 && (
              <p className="text-xs" style={{ color: C.faint }}>
                {isWizard ? 'Add spells to your book first.' : 'Nothing matches.'}
              </p>
            )}
          </div>
          {open && card(open)}
        </div>
      )}
    </Section>
  )
}

/** A small read-only chip list with the same cards — for innate spells (Fairy Magic, feats). */
export function SpellChips({ label, names }: { label: string; names: string[] }) {
  const [open, setOpen] = useState<string | null>(null)
  if (names.length === 0) return null
  return (
    <div className="mt-1">
      <p className="text-sm">
        <strong>{label}:</strong>
      </p>
      <div className="flex flex-wrap gap-1.5 mt-1">
        {names.map((n) => (
          <button
            key={n}
            type="button"
            aria-expanded={open === n}
            onClick={() => setOpen(open === n ? null : n)}
            className="rounded-md px-2.5 py-1.5 text-sm"
            style={{
              background: open === n ? `${C.gold}22` : C.night,
              border: `1px solid ${open === n ? C.gold : C.panelEdge}`,
              color: open === n ? C.gold : C.parchment,
              minHeight: 36,
              cursor: 'pointer',
            }}
          >
            {n}
          </button>
        ))}
      </div>
      {open && (
        <p className="text-sm mt-2 rounded-lg px-3 py-2 leading-relaxed" style={{ background: C.night, border: `1px solid ${C.gold}44`, color: C.parchment }}>
          <span style={{ color: C.gold, fontStyle: 'italic' }}>{open} · </span>
          {(spellByName(open)?.text ?? SPELL_NOTES[open] ?? 'Ask the Lantern-Keeper — this one isn’t in the pocket-book yet.').replace(/\s*\/\/ VERIFY.*$/, '')}
        </p>
      )}
    </div>
  )
}
