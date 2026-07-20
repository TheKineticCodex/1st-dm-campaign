// The Bag: video-game inventory seeded once per character from their class.
// Weapons equip/unequip (Maddy WILL take them); everything else rides along.

import type { BagItem } from '../types'

const WEAPON_ICONS: Record<string, string> = {
  Greataxe: '🪓',
  Rapier: '🗡',
  Mace: '🔨',
  Quarterstaff: '🪄',
  Longsword: '⚔',
  Shortsword: '🗡',
  Dagger: '🔪',
  Longbow: '🏹',
  Shortbow: '🏹',
  Handaxe: '🪓',
  Warhammer: '🔨',
  Scimitar: '🗡',
  Spear: '🔱',
}

export function seedBag(weaponName: string, armorNote: string): BagItem[] {
  const items: BagItem[] = [
    {
      id: 'class-weapon',
      name: weaponName,
      icon: WEAPON_ICONS[weaponName] ?? '⚔',
      kind: 'weapon',
      equipped: true,
    },
  ]
  if (armorNote && !/unarmored/i.test(armorNote)) {
    items.push({ id: 'class-armor', name: armorNote.replace(/ & /g, ' + '), icon: '🛡', kind: 'armor', equipped: true })
  }
  items.push(
    { id: 'torch', name: 'Torch', icon: '🕯', kind: 'trinket', equipped: false },
    { id: 'rope', name: 'Rope, 50 ft', icon: '🪢', kind: 'trinket', equipped: false },
    { id: 'rations', name: 'Rations', icon: '🍞', kind: 'trinket', equipped: false },
    { id: 'waterskin', name: 'Waterskin', icon: '🍶', kind: 'trinket', equipped: false },
  )
  return items
}
