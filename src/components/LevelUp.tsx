// The level-up ceremony. Shown at the top of the sheet when the Lantern-
// Keeper has announced a higher level than the character holds, or when a
// choice is still owed (subclass at 3, ASI-or-feat at 4). It walks the
// player through what's new and the choices, then seals the new level.
//
// The player's device is the authority on its own character (DECISIONS 17):
// the DM announces; the phone rises.

import { useState } from 'react'
import { ABILITIES, CLASSES, type AbilityKey } from '../data/rules'
import { CLASS_LEVELS, FEATS, SPECIES_BY_LEVEL, SUBCLASSES, toFeature, type Feature } from '../data/levels'
import { asiLevels, computeSheet } from '../lib/compute'
import type { CharacterBuild } from '../types'
import { Btn, C, Eyebrow, Section, display, eyebrow, onState, wellSurface } from './ui'
import { Spark } from './icons'

interface LevelUpProps {
  build: CharacterBuild
  /** The level the DM has announced (may equal build.level if only a choice is owed). */
  targetLevel: number
  onSeal: (next: CharacterBuild) => void
}

export function LevelUp({ build, targetLevel, onSeal }: LevelUpProps) {
  const klass = build.klass!
  const K = CLASSES[klass]
  const from = build.level
  const to = Math.max(targetLevel, from)

  // What's new between from+1 .. to
  const gained: { level: number; features: Feature[]; species: string[] }[] = []
  for (let l = from + 1; l <= to; l++) {
    const feats: Feature[] = [
      ...(K.levels[l]?.features ?? []).map(toFeature),
      ...(CLASS_LEVELS[klass]?.[l] ?? []),
    ]
    gained.push({ level: l, features: feats, species: SPECIES_BY_LEVEL[build.species ?? '']?.[l] ?? [] })
  }

  // Choices owed at the target level
  const subclassOptions = SUBCLASSES[klass]
  const needsSubclass = to >= K.subclassAt && !build.subclass && !!subclassOptions
  const featsOwed = asiLevels(klass).filter((l) => l <= to).length - (build.feats ?? []).length
  const needsFeat = featsOwed > 0

  const [subclass, setSubclass] = useState<string | null>(null)
  const [featName, setFeatName] = useState<string | null>(null)
  const [asiA, setAsiA] = useState<AbilityKey | null>(null)
  const [asiB, setAsiB] = useState<AbilityKey | null>(null) // null = +2 to asiA
  const [featBump, setFeatBump] = useState<AbilityKey | null>(null)

  const feat = FEATS.find((f) => f.name === featName) ?? null
  const isAsi = featName === 'Ability Score Improvement'
  const abilities = computeSheet(build)?.A

  const featReady =
    !needsFeat ||
    (isAsi && asiA !== null) ||
    (!!feat && !isAsi && (feat.bump === 'any' ? featBump !== null : feat.bump.length === 1 || featBump !== null))
  const ready = (!needsSubclass || subclass !== null) && featReady

  const seal = () => {
    const next: CharacterBuild = { ...build, level: to }
    if (needsSubclass && subclass) next.subclass = subclass
    if (needsFeat && featName) {
      next.feats = [...(build.feats ?? []), featName]
      const asi: Partial<Record<AbilityKey, number>> = { ...(build.asi ?? {}) }
      const add = (a: AbilityKey, n: number) => (asi[a] = (asi[a] ?? 0) + n)
      if (isAsi && asiA) {
        if (asiB && asiB !== asiA) {
          add(asiA, 1)
          add(asiB, 1)
        } else add(asiA, 2)
      } else if (feat && !isAsi) {
        const b = feat.bump === 'any' ? featBump : feat.bump.length === 1 ? feat.bump[0] : featBump
        if (b) add(b, 1)
      }
      next.asi = asi
    }
    onSeal(next)
  }

  // picks are LIT (ember), never filled; at rest they sit in a small well
  const chip = (selected: boolean) => ({
    ...(selected ? onState : { ...wellSurface, boxShadow: 'none', color: C.parchment }),
    minHeight: 44,
    cursor: 'pointer',
  })

  return (
    <Section style={{ borderColor: C.gold, boxShadow: `inset 0 1px 0 ${C.hairline}, 0 0 24px ${C.gold}22`, animation: 'cardRise .5s ease-out' }}>
      <Eyebrow>✦ the Feywild notices you</Eyebrow>
      <h2 style={{ ...display, fontSize: 26, fontWeight: 700, color: C.gold }}>
        {to > from ? `Level ${to}` : `A choice awaits`}
      </h2>
      {to > from && (
        <p className="text-sm mt-1" style={{ color: C.faint }}>
          You feel it in your hands before you understand it. Here is what wakes.
        </p>
      )}

      {gained.map((g) => (
        <div key={g.level} className="mt-3">
          {gained.length > 1 && (
            <p style={{ ...eyebrow, color: C.sea }}>
              level {g.level}
            </p>
          )}
          {g.features.map((f) => (
            <p key={f.name} className="text-sm mb-1">
              <strong style={{ color: C.parchment }}>{f.name}</strong>
              {f.text && <span style={{ color: C.parchment, opacity: 0.85 }}> — {f.text}</span>}
            </p>
          ))}
          {g.species.map((t) => (
            <p key={t} className="text-sm mb-1">
              <strong style={{ color: C.parchment }}>Your blood remembers</strong>
              <span style={{ color: C.parchment, opacity: 0.85 }}> — {t}</span>
            </p>
          ))}
        </div>
      ))}

      {/* ---- Subclass ---- */}
      {needsSubclass && subclassOptions && (
        <div className="mt-4">
          <Eyebrow>choose your path</Eyebrow>
          <p className="text-xs mb-2" style={{ color: C.faint }}>
            This is yours to choose, and it stays. Read all four. Take your time — the lanterns can wait.
          </p>
          <div className="grid gap-2">
            {Object.entries(subclassOptions).map(([name, sc]) => {
              const selected = subclass === name
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => setSubclass(selected ? null : name)}
                  aria-pressed={selected}
                  className="text-left rounded-lg p-3"
                  style={{
                    ...(selected ? onState : { ...wellSurface, boxShadow: 'none' }),
                    color: C.parchment,
                    minHeight: 44,
                    cursor: 'pointer',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <strong style={{ ...display, fontSize: 18, color: selected ? C.goldHi : C.parchment }}>{name}</strong>
                    {selected && <Spark size={14} style={{ color: C.gold }} />}
                  </div>
                  <p className="text-sm mt-1" style={{ opacity: 0.9 }}>
                    {sc.blurb}
                  </p>
                  <p className="text-xs mt-1 italic" style={{ color: C.sea }}>
                    {sc.fits}
                  </p>
                  {selected && (
                    <div className="mt-2">
                      {(sc.features[3] ?? []).map((f) => (
                        <p key={f.name} className="text-xs mb-1" style={{ opacity: 0.9 }}>
                          <strong>{f.name}</strong> — {f.text}
                        </p>
                      ))}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* ---- ASI or feat ---- */}
      {needsFeat && (
        <div className="mt-4">
          <Eyebrow>grow stronger — one way or another</Eyebrow>
          <p className="text-xs mb-2" style={{ color: C.faint }}>
            Raise your abilities, or take a feat — a new trick that changes how you play. Tap one to read it.
          </p>
          <div className="flex flex-wrap gap-2">
            {FEATS.map((f) => (
              <button
                key={f.name}
                type="button"
                onClick={() => {
                  setFeatName(featName === f.name ? null : f.name)
                  setFeatBump(null)
                  setAsiA(null)
                  setAsiB(null)
                }}
                aria-pressed={featName === f.name}
                className="rounded-md px-3 py-2 text-sm"
                style={chip(featName === f.name)}
              >
                {f.name}
              </button>
            ))}
          </div>
          {feat && (
            <div className="mt-3 rounded-lg p-3" style={{ background: C.nightDeep, border: `1px solid ${C.gold}44` }}>
              <strong style={{ ...display, fontSize: 18, color: C.gold }}>{feat.name}</strong>
              <p className="text-sm mt-1">{feat.text}</p>
              <p className="text-xs mt-1 italic" style={{ color: C.sea }}>
                {feat.fits}
              </p>

              {isAsi ? (
                <div className="mt-3">
                  <p className="text-xs mb-1" style={{ color: C.faint }}>
                    +2 to one ability — or tap a second for +1 and +1.
                  </p>
                  <div className="grid grid-cols-6 gap-1">
                    {ABILITIES.map((a) => {
                      const sel = asiA === a || asiB === a
                      return (
                        <button
                          key={a}
                          type="button"
                          onClick={() => {
                            if (asiA === a) {
                              setAsiA(asiB)
                              setAsiB(null)
                            } else if (asiB === a) setAsiB(null)
                            else if (asiA === null) setAsiA(a)
                            else if (asiB === null) setAsiB(a)
                            else setAsiA(a)
                          }}
                          aria-pressed={sel}
                          className="rounded-md py-2 text-xs num"
                          style={chip(sel)}
                        >
                          {a}
                          <span className="block" style={{ opacity: 0.8 }}>
                            {abilities?.[a]}
                            {sel ? (asiB ? ' +1' : ' +2') : ''}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ) : (
                (feat.bump === 'any' || feat.bump.length > 1) && (
                  <div className="mt-3">
                    <p className="text-xs mb-1" style={{ color: C.faint }}>
                      This feat also raises one ability by 1. Which?
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {(feat.bump === 'any' ? ABILITIES : feat.bump).map((a) => (
                        <button key={a} type="button" aria-pressed={featBump === a} onClick={() => setFeatBump(a)} className="rounded-md px-3 py-2 text-xs num" style={chip(featBump === a)}>
                          {a} {abilities?.[a]}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      <Btn onClick={seal} disabled={!ready} shimmer>
        {to > from ? `Rise to level ${to} ✦` : 'Seal the choice ✦'}
      </Btn>
      {!ready && (
        <p className="text-xs text-center mt-2" style={{ color: C.faint }}>
          {needsSubclass && !subclass ? 'Choose your path first.' : 'Choose how you grow first.'}
        </p>
      )}
    </Section>
  )
}
