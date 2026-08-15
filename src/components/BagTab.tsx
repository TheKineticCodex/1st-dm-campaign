// 🎒 The Bag — its own tab. What you carry, what's in hand, what's in the
// purse. Weapons equip and unequip; everything else rides along, waiting for
// the story to want it. The Fair pays in strange coin — keep it here.

import { computeSheet } from '../lib/compute'
import { seedBag } from '../lib/bag'
import type { SavedCharacter } from '../types'
import { BagSection, PurseSection } from './SheetTab'
import { C, Eyebrow, H } from './ui'

export function BagTab({ character, onUpdate }: { character: SavedCharacter | null; onUpdate: (c: SavedCharacter) => void }) {
  if (!character) return null
  const sheet = computeSheet(character.build)
  if (!sheet) return null
  const { state } = character
  const updateState = (patch: Partial<SavedCharacter['state']>) =>
    onUpdate({ ...character, state: { ...state, ...patch }, updatedAt: new Date().toISOString() })

  const bag = state.bag ?? seedBag(sheet.K.weapon.name, sheet.ac.note ?? '')
  const inHand = bag.filter((i) => i.kind === 'weapon' && i.equipped).map((i) => i.name)

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>🎒 what you carry</Eyebrow>
      <H>The bag</H>
      <p className="text-sm mt-1" style={{ color: C.faint }}>
        In hand: {inHand.length ? inHand.join(', ') : 'nothing — fists, furniture, and wit'} · AC {sheet.ac.val} ({sheet.ac.note})
      </p>
      <BagSection bag={bag} onChange={(next) => updateState({ bag: next })} />
      <PurseSection coins={state.coins ?? { gp: 10, sp: 0, cp: 0 }} onChange={(next) => updateState({ coins: next })} />
      <p className="text-xs mt-3" style={{ color: C.faint }}>
        Prizes from the Midway, a page in a hand you know, one scale bought back for sentiment — keep them here. The Bag remembers.
      </p>
    </div>
  )
}
