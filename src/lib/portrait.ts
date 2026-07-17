// The Mirror — portrait generation from the character's choices.
// Uses pollinations.ai: free, keyless, no account (owner-approved AI
// exception to spec §9; swappable by changing this one file). The seed is
// baked into the stored URL, so a portrait, once seen, never changes.

import { AURAS, DEFAULT_AURA } from '../components/glyphs'
import type { CharacterBuild } from '../types'

export function portraitPrompt(build: CharacterBuild, appearance: string): string {
  const aura = AURAS[build.aura ?? DEFAULT_AURA] ?? AURAS[DEFAULT_AURA]
  const species = (build.species ?? 'mysterious traveler').replace(' ✦', '')
  const pieces = [
    `Storybook fantasy portrait of a ${species} ${build.klass ?? 'adventurer'}`,
    appearance.trim() ? appearance.trim() : null,
    build.bg ? `background as a ${build.bg.replace(' ✦', '')}` : null,
    `bathed in a ${aura.name.toLowerCase()} glow`,
    'Feywild twilight carnival, floating paper lanterns, fireflies',
    'deep indigo night, gold and seafoam accents, painterly fairy-tale illustration',
    'head and shoulders, warm light on the face, gentle and slightly mysterious',
  ]
  return pieces.filter(Boolean).join(', ')
}

export function mintPortraitUrl(prompt: string): string {
  const seed = Math.floor(Math.random() * 1_000_000)
  const encoded = encodeURIComponent(prompt)
  return `https://image.pollinations.ai/prompt/${encoded}?width=640&height=640&seed=${seed}&nologo=true&model=flux`
}
