// The Character Forge — ported from the prototype's builder.
// New vs. prototype: species detail view (all traits), a locked subclass
// stub ("unlocks at level 3"), and stricter validation so impossible
// states are unreachable.

import { useState } from 'react'
import {
  ABILITIES,
  ARRAY_VALS,
  BACKGROUNDS,
  CLASSES,
  SKILL_ABILITY,
  SPECIES,
} from '../data/rules'
import type { CharacterBuild } from '../types'
import { CharacterCard } from './CharacterCard'
import { AURAS, CLASS_SIGILS, DEFAULT_AURA, SPECIES_GLYPHS } from './glyphs'
import { Btn, C, Eyebrow, H, Pick, Section, TextInput, display } from './ui'

const STEPS = ['Name', 'Species', 'Class', 'Background', 'Scores', 'Skills', 'Done']

interface BuildTabProps {
  build: CharacterBuild
  onChange: (b: CharacterBuild) => void
  onForged: () => void
}

export function BuildTab({ build: ch, onChange, onForged }: BuildTabProps) {
  const [step, setStep] = useState(0)
  const [speciesDetail, setSpeciesDetail] = useState<string | null>(null)

  const setCh = onChange

  const assignedVals = Object.values(ch.assign).filter((v): v is number => v !== null)
  const remaining = ARRAY_VALS.filter((v) => {
    const total = ARRAY_VALS.filter((x) => x === v).length
    const used = assignedVals.filter((x) => x === v).length
    return used < total
  })
  const allAssigned = assignedVals.length === 6
  const kl = ch.klass ? CLASSES[ch.klass] : null
  const bgd = ch.bg ? BACKGROUNDS[ch.bg] : null

  // Validation: every skill must be legal for the current class and within
  // count; bumps must be legal for the background and distinct.
  const skillsValid = kl ? ch.skills.length === kl.skills.n && ch.skills.every((s) => kl.skills.from.includes(s)) : false
  const bumpsValid =
    !!bgd && !!ch.bump2 && !!ch.bump1 && ch.bump2 !== ch.bump1 &&
    bgd.abis.includes(ch.bump2) && bgd.abis.includes(ch.bump1)

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>
        Character forge · step {step + 1} of {STEPS.length}
      </Eyebrow>

      {step > 0 && step < 6 && (
        <div
          className="rounded-xl px-4 py-3 mb-4"
          style={{ background: `${C.panel}CC`, border: `1px solid ${C.panelEdge}` }}
        >
          <CharacterCard build={ch} size="compact" />
        </div>
      )}

      {step === 0 && (
        <div>
          <H>Who are you?</H>
          <div className="mt-4">
            <TextInput value={ch.name} onChange={(v) => setCh({ ...ch, name: v })} placeholder="Character name" />
          </div>
          <p className="text-sm mt-2" style={{ color: C.faint }}>
            Stuck? Fey names love nature and mischief: Bramble, Marisol, Wick, Thistledown…
          </p>
          <Btn onClick={() => setStep(1)} disabled={!ch.name.trim()}>
            Next: species
          </Btn>
        </div>
      )}

      {step === 1 && (
        <div>
          <H>What did the Feywild find, when it found you?</H>
          <p className="text-sm mb-3" style={{ color: C.faint }}>
            ✦ marks Witchlight-book options — very welcome here. Tap a sigil to choose it.
          </p>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(SPECIES).map(([n, s]) => {
              const selected = ch.species === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => {
                    setCh({ ...ch, species: n })
                    setSpeciesDetail(n)
                  }}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: selected ? `linear-gradient(180deg, #2B1E55, ${C.panel})` : C.panel,
                    border: `1px solid ${selected ? C.gold : C.panelEdge}`,
                    boxShadow: selected ? `0 0 16px ${C.gold}44` : 'none',
                    color: C.parchment,
                    cursor: 'pointer',
                    minHeight: 44,
                    transition: 'box-shadow .2s ease, border-color .2s ease',
                  }}
                >
                  <span
                    className="block mx-auto mb-1"
                    style={{ width: 52, height: 52, color: selected ? C.gold : C.sea }}
                    aria-hidden="true"
                  >
                    {SPECIES_GLYPHS[n]}
                  </span>
                  <span style={{ ...display, fontSize: 18, fontWeight: 600 }}>{n}</span>
                  <span className="block text-xs mt-1" style={{ color: C.faint }}>
                    {s.traits[0].split(':')[0]}
                  </span>
                </button>
              )
            })}
          </div>
          {ch.species && speciesDetail === ch.species && (
            <Section style={{ marginTop: 12, border: `1px solid ${C.gold}55` }}>
              <Eyebrow>The {ch.species}'s gifts</Eyebrow>
              {SPECIES[ch.species].traits.map((t) => (
                <p key={t} className="text-sm mb-1">
                  ✦ {t}
                </p>
              ))}
              <p className="text-sm" style={{ color: C.faint }}>
                Speed: {SPECIES[ch.species].speed} ft
              </p>
            </Section>
          )}
          <Btn onClick={() => setStep(2)} disabled={!ch.species}>
            Next: class
          </Btn>
        </div>
      )}

      {step === 2 && (
        <div>
          <H>And what will you become?</H>
          <div className="grid grid-cols-2 gap-2 mt-3">
            {Object.entries(CLASSES).map(([n, k]) => {
              const selected = ch.klass === n
              return (
                <button
                  key={n}
                  type="button"
                  onClick={() => setCh({ ...ch, klass: n, skills: ch.klass === n ? ch.skills : [] })}
                  className="rounded-xl p-3 text-center"
                  style={{
                    background: selected ? `linear-gradient(180deg, #2B1E55, ${C.panel})` : C.panel,
                    border: `1px solid ${selected ? C.gold : C.panelEdge}`,
                    boxShadow: selected ? `0 0 16px ${C.gold}44` : 'none',
                    color: C.parchment,
                    cursor: 'pointer',
                    minHeight: 44,
                    transition: 'box-shadow .2s ease, border-color .2s ease',
                  }}
                >
                  <span
                    className="block mx-auto mb-1"
                    style={{ width: 52, height: 52, color: selected ? C.gold : C.sea }}
                    aria-hidden="true"
                  >
                    {CLASS_SIGILS[n]}
                  </span>
                  <span style={{ ...display, fontSize: 18, fontWeight: 600 }}>{n}</span>
                  <span className="block text-xs" style={{ color: C.gold }}>
                    {k.complexity}
                  </span>
                  <span className="block text-xs mt-1" style={{ color: C.faint }}>
                    {k.blurb}
                  </span>
                </button>
              )
            })}
          </div>
          {kl && (
            <Section style={{ marginTop: 12 }}>
              <p className="text-sm" style={{ color: C.faint }}>
                <span style={{ color: C.gold }}>Subclass — unlocks at level {kl.subclassAt} 🔒</span>
                <span className="block mt-1">
                  Every {ch.klass} chooses a path at level {kl.subclassAt}. The Feywild will offer
                  yours when the time comes.
                </span>
              </p>
            </Section>
          )}
          <Btn onClick={() => setStep(3)} disabled={!ch.klass}>
            Next: background
          </Btn>
        </div>
      )}

      {step === 3 && (
        <div>
          <H>Choose your background</H>
          <p className="text-sm mb-3" style={{ color: C.faint }}>
            Your life before the carnival. Grants two skills and a gift.
          </p>
          <div className="flex flex-col gap-2">
            {Object.entries(BACKGROUNDS).map(([n, b]) => (
              <Pick
                key={n}
                selected={ch.bg === n}
                onClick={() => setCh({ ...ch, bg: n, bump2: null, bump1: null })}
              >
                <strong>{n}</strong>
                <span className="block text-sm" style={{ color: C.faint }}>
                  {b.skills.join(', ')} · {b.feat}
                </span>
              </Pick>
            ))}
          </div>
          {bgd && (
            <div className="mt-4">
              <p className="text-sm mb-2" style={{ color: C.sea }}>
                Your background raises two abilities: pick +2, then +1{' '}
                {bgd.abis.length < 6 ? `(from ${bgd.abis.join(', ')})` : ''}
              </p>
              <div className="flex flex-wrap gap-2">
                {bgd.abis.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      if (ch.bump2 === a) setCh({ ...ch, bump2: null })
                      else if (!ch.bump2) setCh({ ...ch, bump2: a, bump1: ch.bump1 === a ? null : ch.bump1 })
                      else setCh({ ...ch, bump1: ch.bump1 === a ? null : a })
                    }}
                    className="px-3 py-2 rounded-md text-sm"
                    style={{
                      background: ch.bump2 === a ? C.gold : ch.bump1 === a ? C.sea : C.panel,
                      color: ch.bump2 === a || ch.bump1 === a ? C.ink : C.parchment,
                      border: `1px solid ${C.panelEdge}`,
                      minHeight: 44,
                      cursor: 'pointer',
                    }}
                  >
                    {a}
                    {ch.bump2 === a ? ' +2' : ch.bump1 === a ? ' +1' : ''}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Btn onClick={() => setStep(4)} disabled={!bumpsValid}>
            Next: ability scores
          </Btn>
        </div>
      )}

      {step === 4 && (
        <div>
          <H>Assign your abilities</H>
          <p className="text-sm mb-1" style={{ color: C.faint }}>
            Place 15, 14, 13, 12, 10, 8 — one per ability.
          </p>
          {kl && (
            <p className="text-sm mb-3" style={{ color: C.sea }}>
              A {ch.klass} wants the 15 in <strong>{kl.prime}</strong>. CON is everyone's second-best
              friend.
            </p>
          )}
          <div className="flex flex-col gap-2">
            {ABILITIES.map((a) => (
              <div
                key={a}
                className="flex items-center justify-between rounded-lg px-4 py-2"
                style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}
              >
                <span style={{ ...display, fontSize: 20, fontWeight: 600 }}>
                  {a}
                  {kl?.prime === a ? ' ★' : ''}
                </span>
                <select
                  aria-label={`Score for ${a}`}
                  value={ch.assign[a] ?? ''}
                  onChange={(e) =>
                    setCh({
                      ...ch,
                      assign: { ...ch.assign, [a]: e.target.value ? Number(e.target.value) : null },
                    })
                  }
                  className="rounded-md px-3 py-2"
                  style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
                >
                  <option value="">—</option>
                  {[...(ch.assign[a] !== null ? [ch.assign[a]!] : []), ...remaining]
                    .sort((x, y) => y - x)
                    .filter((v, i, arr) => arr.indexOf(v) === i)
                    .map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                </select>
              </div>
            ))}
          </div>
          <Btn onClick={() => setStep(5)} disabled={!allAssigned}>
            Next: skills
          </Btn>
        </div>
      )}

      {step === 5 && kl && (
        <div>
          <H>Pick your skills</H>
          <p className="text-sm mb-3" style={{ color: C.faint }}>
            Choose {kl.skills.n}. Your background already grants {bgd?.skills.join(' & ')}.
          </p>
          <div className="flex flex-col gap-2">
            {kl.skills.from.map((s) => {
              const on = ch.skills.includes(s)
              const dupe = bgd?.skills.includes(s)
              return (
                <Pick
                  key={s}
                  selected={on}
                  onClick={() => {
                    if (on) setCh({ ...ch, skills: ch.skills.filter((x) => x !== s) })
                    else if (ch.skills.length < kl.skills.n) setCh({ ...ch, skills: [...ch.skills, s] })
                  }}
                >
                  {s}{' '}
                  <span className="text-xs" style={{ color: C.faint }}>
                    ({SKILL_ABILITY[s]}){dupe ? ' · already from background' : ''}
                  </span>
                </Pick>
              )
            })}
          </div>
          <Btn onClick={() => setStep(6)} disabled={!skillsValid}>
            Next: review
          </Btn>
        </div>
      )}

      {step === 6 && kl && (
        <div>
          <H>The lanterns must know your light</H>
          <div className="my-5">
            <CharacterCard build={ch} size="full" />
          </div>
          <p className="text-sm text-center mb-2" style={{ color: C.faint }}>
            Choose the color of your aura — the light the carnival will see you by.
          </p>
          <div className="flex justify-center gap-4 mb-2">
            {Object.entries(AURAS).map(([key, a]) => {
              const selected = (ch.aura ?? DEFAULT_AURA) === key
              return (
                <button
                  key={key}
                  type="button"
                  aria-label={`Aura: ${a.name}`}
                  aria-pressed={selected}
                  onClick={() => setCh({ ...ch, aura: key })}
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    border: `2px solid ${selected ? C.parchment : 'transparent'}`,
                    background: `radial-gradient(circle at 40% 35%, ${a.color}, ${a.color}66)`,
                    boxShadow: selected ? `0 0 18px ${a.color}` : `0 0 8px ${a.color}55`,
                    cursor: 'pointer',
                    transition: 'box-shadow .2s ease',
                  }}
                />
              )
            })}
          </div>
          <p className="text-xs text-center mb-3 italic" style={{ color: AURAS[ch.aura ?? DEFAULT_AURA].color }}>
            {AURAS[ch.aura ?? DEFAULT_AURA].name} — {AURAS[ch.aura ?? DEFAULT_AURA].word}
          </p>
          <Section>
            <p className="text-sm" style={{ color: C.faint }}>
              Everything else — HP, AC, attacks, spells — is calculated on your sheet the moment
              the forge seals.
            </p>
          </Section>
          <Btn onClick={onForged}>Forge my character sheet ✦</Btn>
          <Btn secondary onClick={() => setStep(0)}>
            Start over
          </Btn>
        </div>
      )}

      {step > 0 && step < 6 && (
        <Btn secondary onClick={() => setStep(step - 1)}>
          ← Back a step
        </Btn>
      )}
    </div>
  )
}
