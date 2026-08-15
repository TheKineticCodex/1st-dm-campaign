// The tap on the shoulder. When it becomes your turn, the phone takes over
// for a moment: YOUR TURN, then what you can do RIGHT NOW — no hunting.
// One tap drops you onto the sheet to do it. (Battle mode, phase 1.)

import { useEffect } from 'react'
import { fmt, mod } from '../data/rules'
import { spellByName } from '../data/spellbook'
import { SUBCLASSES } from '../data/levels'
import type { ComputedSheet } from '../lib/compute'
import { buzz, chimeYourTurn } from '../lib/phoneSound'
import type { SavedCharacter } from '../types'
import { C, display } from './ui'

const QUICK_ACTIONS: [string, string][] = [
  ['Dash', 'move again'],
  ['Disengage', 'leave without a free hit'],
  ['Dodge', 'attacks on you at disadvantage'],
  ['Help', 'give a friend advantage'],
  ['Hide', 'Stealth vs 15'],
  ['Grapple / Shove', 'instead of a hit'],
]

interface YourTurnProps {
  character: SavedCharacter
  sheet: ComputedSheet
  onGo: () => void
}

export function YourTurn({ character, sheet, onGo }: YourTurnProps) {
  const { build, state } = character
  const hp = Math.max(0, sheet.hpMax - state.damage)
  const dying = hp === 0

  useEffect(() => {
    chimeYourTurn()
    buzz([60, 40, 120])
  }, [])

  const usedSlots = (lvl: number) => (lvl === 1 ? state.slotsUsed : (state.slotsByLevel?.[lvl] ?? 0))
  const starter = sheet.K.spells ?? { cantrips: [], leveled: [] }
  const grants: string[] = []
  const g = build.subclass ? SUBCLASSES[build.klass!]?.[build.subclass]?.grants : undefined
  if (g) for (const [l, names] of Object.entries(g)) if (Number(l) <= sheet.level) grants.push(...names)
  const prepared = [...new Set([...grants, ...(build.prepared ?? starter.leveled)])]
  const cantrips = build.cantrips ?? starter.cantrips
  const castable = prepared
    .map((n) => spellByName(n))
    .filter((s): s is NonNullable<typeof s> => !!s && s.level > 0)
    .filter((s) => sheet.slotsByLevel.some((count, i) => i + 1 >= s.level && count - usedSlots(i + 1) > 0))
    .slice(0, 6)
  const abilities = sheet.featureList.filter((f) => f.uses && f.uses.n > 0).map((f) => ({ name: f.name, left: f.uses!.n - Math.min(f.uses!.n, state.uses?.[f.name] ?? 0), action: f.action }))

  return (
    <div
      role="dialog"
      aria-label="Your turn"
      className="fixed inset-0 flex flex-col"
      style={{ background: `${C.night}FA`, zIndex: 80, animation: 'cardRise .3s ease-out', overflowY: 'auto' }}
    >
      <div className="text-center px-5 pt-10 pb-4" style={{ background: dying ? '#3d2030' : C.gold, color: dying ? '#E0928F' : C.ink }}>
        <p className="text-xs uppercase tracking-widest" style={{ letterSpacing: '0.3em', opacity: 0.8 }}>
          ⚔ the table is watching
        </p>
        <p style={{ ...display, fontSize: 40, fontWeight: 700, lineHeight: 1.05 }}>{dying ? 'Hold on.' : 'Your turn'}</p>
        <p className="text-sm mt-1" style={{ opacity: 0.85 }}>
          {build.name || 'You'} · ♥ {hp}/{sheet.hpMax} · 🛡 {sheet.ac.val}
          {state.conditions.length ? ` · ${state.conditions.join(', ')}` : ''}
          {state.concentrating ? ' · ◐ concentrating' : ''}
        </p>
      </div>

      <div className="px-5 py-4 flex-1" style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
        {dying ? (
          <p className="text-sm" style={{ color: C.parchment }}>
            You are at 0. Your turn is a death save — roll it on your sheet. Or someone reaches you first.
          </p>
        ) : (
          <>
            <p className="text-xs uppercase tracking-widest mb-1" style={{ color: C.sea, letterSpacing: '0.25em' }}>
              right now you can
            </p>
            <div className="rounded-lg px-3 py-2 mb-2" style={{ background: C.panel, border: `1px solid ${C.gold}55` }}>
              <strong style={{ ...display, fontSize: 18, color: C.gold }}>
                Attack{sheet.attacks > 1 ? ` ×${sheet.attacks}` : ''}
              </strong>
              <span className="text-sm" style={{ color: C.parchment }}>
                {' '}
                — {sheet.K.weapon.name}, d20 {fmt(sheet.atkMod)} to hit · {sheet.K.weapon.die} {fmt(mod(sheet.A[sheet.K.weapon.ab]))}
              </span>
            </div>

            {(castable.length > 0 || cantrips.length > 0) && (
              <div className="rounded-lg px-3 py-2 mb-2" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
                <strong style={{ ...display, fontSize: 18, color: C.gold }}>Cast</strong>
                <p className="text-sm" style={{ color: C.parchment }}>
                  {castable.map((s) => `${s.name}${s.tags?.includes('C') ? ' ◐' : ''}`).join(' · ')}
                  {castable.length && cantrips.length ? ' · ' : ''}
                  {cantrips.length ? <span style={{ color: C.faint }}>{cantrips.join(' · ')} (free)</span> : null}
                </p>
                <p className="text-xs mt-1" style={{ color: C.faint }}>
                  slots left:{' '}
                  {sheet.slotsByLevel.map((n, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} ${n - usedSlots(i + 1)}/${n}`).join(' · ') || 'none'}
                </p>
              </div>
            )}

            {abilities.length > 0 && (
              <div className="rounded-lg px-3 py-2 mb-2" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
                <strong style={{ ...display, fontSize: 18, color: C.gold }}>Abilities</strong>
                <p className="text-sm" style={{ color: C.parchment }}>
                  {abilities.map((a) => (
                    <span key={a.name} style={{ opacity: a.left ? 1 : 0.5 }}>
                      {a.name} <span style={{ color: a.left ? C.sea : C.faint }}>{a.left ? `×${a.left}` : 'spent'}</span>
                      {a.action && a.action !== 'passive' ? <span style={{ color: C.faint }}> ({a.action})</span> : null}
                      {' · '}
                    </span>
                  ))}
                </p>
              </div>
            )}

            <div className="rounded-lg px-3 py-2 mb-2" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
              <strong style={{ ...display, fontSize: 18, color: C.gold }}>Or</strong>
              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                {QUICK_ACTIONS.map(([n, t]) => (
                  <span key={n} className="text-sm" style={{ color: C.parchment }}>
                    <strong>{n}</strong> <span style={{ color: C.faint }}>{t}</span>
                  </span>
                ))}
              </div>
            </div>
            <p className="text-xs" style={{ color: C.faint }}>
              Move up to {sheet.S.speed} ft, one action, maybe a bonus action. Say what you TRY; the dice finish the sentence.
            </p>
          </>
        )}
      </div>

      <div className="px-5 pb-8" style={{ maxWidth: 560, width: '100%', margin: '0 auto' }}>
        <button
          type="button"
          onClick={onGo}
          className="w-full rounded-lg py-3 text-lg"
          style={{ ...display, fontWeight: 700, background: C.gold, color: C.ink, border: 'none', minHeight: 52, cursor: 'pointer' }}
        >
          Let’s go ✦
        </button>
      </div>
    </div>
  )
}
