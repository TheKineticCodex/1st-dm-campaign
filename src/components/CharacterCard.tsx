// The living character medallion — assembles piece by piece as choices are
// made in the forge, and crowns the finished sheet. Species mark in the
// center, class sigil in the badge, wrapped in the chosen aura.

import { AURAS, CLASS_SIGILS, DEFAULT_AURA, SPECIES_GLYPHS } from './glyphs'
import type { CharacterBuild } from '../types'
import { C, display } from './ui'

interface CharacterCardProps {
  build: CharacterBuild
  size?: 'compact' | 'full'
}

export function CharacterCard({ build, size = 'full' }: CharacterCardProps) {
  const aura = AURAS[build.aura ?? DEFAULT_AURA] ?? AURAS[DEFAULT_AURA]
  const speciesGlyph = build.species ? SPECIES_GLYPHS[build.species] : null
  const classSigil = build.klass ? CLASS_SIGILS[build.klass] : null
  const compact = size === 'compact'
  const ring = compact ? 64 : 132
  const badge = compact ? 26 : 46

  return (
    <div
      className="flex items-center"
      style={{
        flexDirection: compact ? 'row' : 'column',
        gap: compact ? 12 : 8,
        justifyContent: compact ? 'flex-start' : 'center',
        textAlign: compact ? 'left' : 'center',
      }}
    >
      <div style={{ position: 'relative', width: ring, height: ring, flexShrink: 0 }}>
        {/* aura halo */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: compact ? -4 : -10,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${aura.color}55 0%, ${aura.color}18 55%, transparent 75%)`,
            animation: 'glow-pulse 3.2s ease-in-out infinite',
          }}
        />
        {/* medallion ring — the mirror's portrait once seen, sigil before */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            border: `2px solid ${aura.color}`,
            background: `radial-gradient(circle at 50% 35%, #2B1E55 0%, ${C.night} 80%)`,
            boxShadow: `0 0 ${compact ? 10 : 24}px ${aura.color}44, inset 0 0 ${compact ? 8 : 18}px ${aura.color}22`,
            display: 'grid',
            placeItems: 'center',
            padding: build.portraitUrl ? 0 : compact ? 12 : 26,
            color: aura.color,
            overflow: 'hidden',
          }}
        >
          {build.portraitUrl ? (
            <img
              src={build.portraitUrl}
              alt={`Portrait of ${build.name || 'the character'}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
            />
          ) : (
            speciesGlyph ?? (
              <span aria-hidden="true" style={{ fontSize: compact ? 18 : 36, opacity: 0.5 }}>
                ?
              </span>
            )
          )}
        </div>
        {/* class badge */}
        {classSigil && (
          <div
            style={{
              position: 'absolute',
              right: compact ? -4 : -2,
              bottom: compact ? -4 : -2,
              width: badge,
              height: badge,
              borderRadius: '50%',
              background: C.panel,
              border: `1.5px solid ${aura.color}`,
              boxShadow: `0 0 8px ${aura.color}55`,
              padding: compact ? 4 : 8,
              color: C.parchment,
            }}
          >
            {classSigil}
          </div>
        )}
      </div>

      <div style={{ minWidth: 0 }}>
        <p
          style={{
            ...display,
            fontSize: compact ? 18 : 30,
            fontWeight: 700,
            color: C.parchment,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {build.name || 'A stranger, so far'}
        </p>
        <p className="text-xs" style={{ color: C.faint }}>
          {[build.species, build.klass].filter(Boolean).join(' ') || 'the lanterns are still guessing'}
          {build.bg ? ` · ${build.bg}` : ''}
        </p>
        {!compact && (
          <p className="text-xs mt-1 italic" style={{ color: aura.color }}>
            {aura.name} — {aura.word}
          </p>
        )}
      </div>
    </div>
  )
}
