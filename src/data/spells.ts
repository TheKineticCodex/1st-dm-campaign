// Plain-language pocket descriptions for every starter spell in rules.ts,
// plus the Fairy Magic pair. Shown on the phone when a spell name is
// tapped. Summaries paraphrase SRD 5.2 (CC-BY-4.0) in the app's voice —
// short enough to read mid-scene, with the numbers that matter.
// Rules figures carry // VERIFY like everything else from the 2024 books.

export const SPELL_NOTES: Record<string, string> = {
  // ---- cantrips (always free, never spend a slot) ----
  'Vicious Mockery':
    'Insult someone so magically cutting it stings: they make a Wisdom save or take 1d6 psychic damage and have disadvantage on their next attack roll. // VERIFY',
  'Dancing Lights':
    'Up to four floating torch-lights you can drift wherever you like within range. Lasts while you concentrate (up to 1 minute).',
  'Sacred Flame':
    'Radiant fire descends on a target you can see: Dexterity save or 1d8 radiant damage — and hiding behind cover does not help. // VERIFY',
  Guidance:
    'Touch a willing friend: they add 1d4 to an ability check they make before the spell ends. Concentration, up to 1 minute. // VERIFY',
  Thaumaturgy:
    'Minor wonders: your voice booms, flames flicker, the ground trembles gently, doors fly open. Pure drama, no damage.',
  'Produce Flame':
    'A friendly flame in your palm — torchlight until you need it, or hurl it: ranged spell attack, 1d8 fire damage. // VERIFY',
  'Fire Bolt':
    'A streak of fire: ranged spell attack for 1d10 fire damage. Ignites things that like burning. // VERIFY',
  'Mage Hand':
    'A spectral floating hand: open doors, fetch objects, carry up to 10 pounds, reach 30 feet. Lasts a minute.',
  Light:
    'Touch an object: it shines like a torch (bright 20 ft) for an hour. Great on a thrown pebble.',
  'Minor Illusion':
    'Create a sound OR a small image (fits in a 5-ft cube) for a minute. An Investigation check against your spell DC sees through it.',
  Prestidigitation:
    'Small magics: clean or soil, chill or warm, flavor food, snuff or light candles, tiny sensory effects. The showman’s toolkit.',
  'Eldritch Blast':
    'A crackling beam of force: ranged spell attack, 1d10 force damage. The warlock classic. // VERIFY',
  Druidcraft:
    'Whisper to nature: predict tomorrow’s weather, bloom a flower, light or snuff a candle, make a harmless sensory wonder.',

  // ---- level 1 (each cast spends one spell slot) ----
  'Cure Wounds':
    'Touch a creature: it regains 2d8 + your spellcasting modifier hit points. // VERIFY 2024 value',
  'Healing Word':
    'A word of mending from across the room (bonus action, 60 ft): 2d4 + your modifier hit points. Great for waking the fallen. // VERIFY 2024 value',
  Entangle:
    'Grasping weeds erupt over a 20-ft square: Strength save or Restrained (stuck; attacks against them have advantage). Concentration. // VERIFY',
  'Faerie Fire':
    'Everything in a 20-ft cube is outlined in glowing light: Dexterity save or attacks against them have ADVANTAGE and they cannot hide. Concentration. // VERIFY',
  Thunderwave:
    'A boom of thunder from your body (15-ft cube): Constitution save, 2d8 thunder damage and pushed 10 feet away — half damage on a save. Loud. VERY loud. // VERIFY',
  'Magic Missile':
    'Three darts of force that NEVER miss: 1d4+1 damage each, split among targets however you like. // VERIFY',
  Shield:
    'A reaction, cast the instant you are hit: +5 AC until your next turn — often turning that hit into a miss — and Magic Missiles bounce off entirely. // VERIFY',
  Sleep:
    'Send creatures near a point drifting toward sleep: Wisdom save or Incapacitated, then Unconscious. Shaking them awake takes an action. // VERIFY 2024 rework',
  'Detect Magic':
    'Sense magic within 30 feet and learn its school with study. Concentration, up to 10 minutes. Can be cast as a ritual (no slot, +10 minutes).',
  'Dissonant Whispers':
    'A discordant melody only your target hears: Wisdom save or 3d6 psychic damage and it must immediately flee from you. // VERIFY',
  'Charm Person':
    'A humanoid makes a Wisdom save or regards you as a friendly acquaintance for an hour. It KNOWS afterward. Choose targets wisely. // VERIFY',
  Bless:
    'Up to three creatures add 1d4 to every attack roll and saving throw. Concentration — and quietly one of the strongest level-1 spells in the game. // VERIFY',
  'Guiding Bolt':
    'A bolt of light: ranged spell attack, 4d6 radiant damage, and the NEXT attack against that target has advantage. // VERIFY',
  'Shield of Faith':
    'A shimmering field around one creature: +2 AC. Concentration, up to 10 minutes. // VERIFY',
  Hex:
    'Curse a target (bonus action): your attacks against it deal +1d6 necrotic each, and it has disadvantage on checks with one ability you choose. Concentration. // VERIFY',
  'Chromatic Orb':
    'Hurl a 4-inch sphere of whatever element you fancy — acid, cold, fire, lightning, poison, or thunder: ranged spell attack, 3d8 damage of that type. // VERIFY',
  "Hunter's Mark":
    'Mark your quarry (bonus action): your weapon attacks against it deal +1d6 extra, and you track it like a bloodhound. Concentration. // VERIFY',
  'Divine Smite':
    'After you HIT with a melee weapon (bonus action, spends a slot): +2d8 radiant damage — +1d8 more against undead or fiends. Declared after the hit lands. // VERIFY 2024',
}
