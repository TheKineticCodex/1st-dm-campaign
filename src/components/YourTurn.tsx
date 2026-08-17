// The tap on the shoulder. When it becomes your turn, the phone takes over
// for a moment: YOUR TURN, then what you can do RIGHT NOW — no hunting.
// One tap drops you onto the sheet to do it. (Battle mode, phase 1.)
//
// The livery: a night-deep marquee banner lit from above with one bulb row,
// "Your turn" in Fraunces with a halo, a 2px brass rule under the banner, a
// one-shot brass wash on entry (fades over 1.2s; none under calm), the Attack
// row marked by a gold LEFT RULE, the overlay fully opaque, one brass action.

import { useEffect } from 'react'
import { fmt, mod } from '../data/rules'
import { spellByName } from '../data/spellbook'
import { SUBCLASSES } from '../data/levels'
import type { ComputedSheet } from '../lib/compute'
import { buzz, chimeYourTurn } from '../lib/phoneSound'
import { isCalm } from '../lib/storage'
import type { SavedCharacter } from '../types'
import { C, body, display, eyebrow, goldAction, leftRule, numerals, panelSurface } from './ui'
import { Icon, Spark } from './icons'

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
  const calm = isCalm() || (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches)

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

  const accent = dying ? C.blood : C.gold
  const accentHi = dying ? C.blood : C.goldHi

  return (
    <div
      role="dialog"
      aria-label="Your turn"
      className="fixed inset-0 flex flex-col"
      style={{ background: C.nightDeep, color: C.parchment, ...body, zIndex: 80, animation: calm ? 'none' : 'cardRise .3s var(--ease-lantern)', overflowY: 'auto' }}
    >
      {/* the one-shot brass wash: the whole phone catches the light, then it settles */}
      {!calm && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 1,
            background: dying
              ? `radial-gradient(120% 80% at 50% 0%, rgba(216,128,120,0.32) 0%, transparent 70%)`
              : `radial-gradient(120% 80% at 50% 0%, rgba(240,181,79,0.34) 0%, rgba(240,181,79,0.08) 45%, transparent 75%)`,
            animation: 'ceremony-fade 1.2s var(--ease-lantern) both',
          }}
        />
      )}

      {/* the marquee banner: night-deep, lit from above */}
      <div
        className="text-center px-5 pb-5"
        style={{
          paddingTop: 'calc(34px + env(safe-area-inset-top))',
          background: dying
            ? `radial-gradient(700px 300px at 50% -20%, rgba(216,128,120,0.28), transparent 70%), ${C.nightDeep}`
            : `radial-gradient(700px 320px at 50% -30%, rgba(240,181,79,0.36) 0%, rgba(240,181,79,0.10) 45%, transparent 75%), ${C.nightDeep}`,
          color: accentHi,
          // the 2px brass rule under the banner — load-bearing from across the table
          borderBottom: `2px solid ${dying ? C.blood : '#A8742A'}`,
          boxShadow: dying
            ? `0 2px 0 rgba(216,128,120,0.25), 0 12px 40px rgba(216,128,120,0.10)`
            : `0 2px 0 rgba(255,214,150,0.28), 0 12px 40px rgba(240,181,79,0.14)`,
          position: 'relative',
        }}
      >
        {/* marquee bulbs, one row */}
        <span
          aria-hidden="true"
          className="bulb-row"
          style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(8px + env(safe-area-inset-top))',
            opacity: 0.75,
            filter: dying ? 'hue-rotate(-30deg) saturate(0.7)' : 'none',
          }}
        />
        <p style={{ ...eyebrow, color: dying ? C.blood : C.brassDim, letterSpacing: '0.3em', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Icon name="stage" size={14} />the table is watching
        </p>
        <p
          className="title-glow"
          style={{ ...display, fontVariationSettings: "'opsz' 144", fontSize: 44, fontWeight: 700, lineHeight: 1.05, color: accent, marginTop: 2 }}
        >
          {dying ? 'Hold on.' : 'Your turn'}
        </p>
        <p className="text-sm mt-1 inline-flex items-center flex-wrap justify-center gap-x-1" style={{ ...numerals, color: C.parchment }}>
          <span>{build.name || 'You'} ·</span>
          <span className="inline-flex items-center gap-1"><Icon name="heart" size={12} style={{ color: dying ? C.blood : C.sea }} /> {hp}/{sheet.hpMax} ·</span>
          <span className="inline-flex items-center gap-1"><Icon name="shield" size={13} style={{ color: C.faint }} /> {sheet.ac.val}</span>
          {state.conditions.length ? <span>· {state.conditions.join(', ')}</span> : null}
          {state.concentrating ? <span className="inline-flex items-center gap-1">· <Icon name="half" size={12} style={{ color: C.sea }} /> concentrating</span> : null}
        </p>
      </div>

      <div className="px-5 py-4 flex-1" style={{ maxWidth: 560, width: '100%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        {dying ? (
          <p className="text-sm" style={{ color: C.parchment }}>
            You are at 0. Your turn is a death save — roll it on your sheet. Or someone reaches you first.
          </p>
        ) : (
          <>
            <p style={{ ...eyebrow, marginBottom: 6 }}>right now you can</p>
            {/* Attack: the one gold left rule — "this one", not a fill, not a rim */}
            <div
              className="rounded-lg py-2 mb-2"
              style={{ ...panelSurface, ...leftRule(C.gold), boxShadow: `inset 3px 0 0 ${C.gold}, inset 0 1px 0 ${C.hairline}, 0 0 18px rgba(240,181,79,0.08)`, paddingLeft: 15, paddingRight: 12 }}
            >
              <strong style={{ ...display, fontSize: 18, color: C.gold }}>
                Attack{sheet.attacks > 1 ? ` ×${sheet.attacks}` : ''}
              </strong>
              <span className="text-sm" style={{ color: C.parchment }}>
                {' '}
                — {sheet.K.weapon.name}, d20 {fmt(sheet.atkMod)} to hit · {sheet.K.weapon.die} {fmt(mod(sheet.A[sheet.K.weapon.ab]))}
              </span>
            </div>

            {(castable.length > 0 || cantrips.length > 0) && (
              <div className="rounded-lg px-3 py-2 mb-2" style={panelSurface}>
                <strong style={{ ...display, fontSize: 18, color: C.gold }}>Cast</strong>
                <p className="text-sm" style={{ color: C.parchment }}>
                  {castable.map((s, i) => (
                    <span key={s.name}>
                      {i > 0 ? ' · ' : ''}
                      {s.name}
                      {s.tags?.includes('C') ? <Icon name="half" size={11} style={{ marginLeft: 3, marginTop: -2, color: C.sea }} /> : null}
                    </span>
                  ))}
                  {castable.length && cantrips.length ? ' · ' : ''}
                  {cantrips.length ? <span style={{ color: C.faint }}>{cantrips.join(' · ')} (free)</span> : null}
                </p>
                <p className="text-xs mt-1" style={{ ...numerals, color: C.faint }}>
                  slots left:{' '}
                  {sheet.slotsByLevel.map((n, i) => `${i + 1}${i === 0 ? 'st' : i === 1 ? 'nd' : i === 2 ? 'rd' : 'th'} ${n - usedSlots(i + 1)}/${n}`).join(' · ') || 'none'}
                </p>
              </div>
            )}

            {abilities.length > 0 && (
              <div className="rounded-lg px-3 py-2 mb-2" style={panelSurface}>
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

            <div className="rounded-lg px-3 py-2 mb-2" style={panelSurface}>
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

      <div className="px-5 pb-8" style={{ maxWidth: 560, width: '100%', margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <button
          type="button"
          onClick={onGo}
          className="w-full rounded-lg py-3 text-lg"
          style={{ ...display, fontSize: 19, fontWeight: 700, ...goldAction, minHeight: 52, cursor: 'pointer' }}
        >
          Let’s go <Spark size={16} style={{ marginLeft: 6, marginTop: -3 }} />
        </button>
      </div>
    </div>
  )
}
