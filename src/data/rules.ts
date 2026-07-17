// ✦ Rules data — D&D 2024 (revised 5e).
// Level 1 data is ported VERBATIM from the verified prototype
// (handoff/prototypes/players-companion.jsx) — treat as source of truth,
// do not restructure. Level 2 entries were added during the port and are
// marked // VERIFY until the owner checks them against the 2024 PHB.

export type AbilityKey = 'STR' | 'DEX' | 'CON' | 'INT' | 'WIS' | 'CHA'

export const ABILITIES: AbilityKey[] = ['STR', 'DEX', 'CON', 'INT', 'WIS', 'CHA']
export const ARRAY_VALS = [15, 14, 13, 12, 10, 8]

export const mod = (s: number): number => Math.floor((s - 10) / 2)
export const fmt = (n: number): string => (n >= 0 ? `+${n}` : `${n}`)

export type AbilityScores = Record<AbilityKey, number>

export const SKILL_ABILITY: Record<string, AbilityKey> = {
  Acrobatics: 'DEX',
  'Animal Handling': 'WIS',
  Arcana: 'INT',
  Athletics: 'STR',
  Deception: 'CHA',
  History: 'INT',
  Insight: 'WIS',
  Intimidation: 'CHA',
  Investigation: 'INT',
  Medicine: 'WIS',
  Nature: 'INT',
  Perception: 'WIS',
  Performance: 'CHA',
  Persuasion: 'CHA',
  Religion: 'INT',
  'Sleight of Hand': 'DEX',
  Stealth: 'DEX',
  Survival: 'WIS',
}

export type CasterKind = 'full' | 'half' | 'pact'

export interface ClassLevelData {
  /** New features gained at this character level. */
  features: string[]
  /** First-level spell slots available at this character level (casters). */
  slots?: number
}

export interface ClassData {
  die: number
  prime: AbilityKey
  saves: AbilityKey[]
  skills: { n: number; from: string[] }
  blurb: string
  complexity: 'Simple' | 'Medium' | 'Involved'
  weapon: { name: string; die: string; ab: AbilityKey }
  kit: string
  spells?: { cantrips: string[]; leveled: string[] }
  caster?: CasterKind
  ac: (a: AbilityScores) => { val: number; note: string }
  /** Data-driven levels: 1 and 2 populated; 3-8 empty until needed. */
  levels: Record<number, ClassLevelData>
  /** Subclass unlocks at this level (2024: level 3 for every class). */
  subclassAt: number
}

const EMPTY_HIGHER_LEVELS: Record<number, ClassLevelData> = {
  3: { features: [] },
  4: { features: [] },
  5: { features: [] },
  6: { features: [] },
  7: { features: [] },
  8: { features: [] },
}

export const CLASSES: Record<string, ClassData> = {
  Barbarian: {
    die: 12,
    prime: 'STR',
    saves: ['STR', 'CON'],
    skills: { n: 2, from: ['Animal Handling', 'Athletics', 'Intimidation', 'Nature', 'Perception', 'Survival'] },
    blurb: 'Unstoppable fury. Simple and mighty.',
    complexity: 'Simple',
    weapon: { name: 'Greataxe', die: '1d12', ab: 'STR' },
    kit: "Greataxe, 4 handaxes, explorer's pack",
    ac: (a) => ({ val: 10 + mod(a.DEX) + mod(a.CON), note: 'Unarmored Defense' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Rage (2/day): bonus action — advantage on STR checks, +2 melee damage, resist physical damage',
          'Unarmored Defense',
          'Weapon Mastery',
        ],
      },
      2: {
        // VERIFY: 2024 PHB Barbarian level 2
        features: [
          'Danger Sense: advantage on DEX saves against effects you can see',
          'Reckless Attack: advantage on STR melee attacks; attacks against you gain advantage until your next turn',
        ],
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Bard: {
    die: 8,
    prime: 'CHA',
    saves: ['DEX', 'CHA'],
    skills: { n: 3, from: Object.keys(SKILL_ABILITY) },
    blurb: "A performer whose art is magic. The carnival's darling.",
    complexity: 'Medium',
    weapon: { name: 'Rapier', die: '1d8', ab: 'DEX' },
    kit: "Rapier, leather armor, musical instrument, entertainer's pack",
    spells: {
      cantrips: ['Vicious Mockery', 'Dancing Lights'],
      leveled: ['Healing Word', 'Dissonant Whispers', 'Charm Person', 'Faerie Fire'],
    },
    caster: 'full',
    ac: (a) => ({ val: 11 + mod(a.DEX), note: 'Leather armor' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Bardic Inspiration (d6): bonus action — give an ally a die to add to a roll',
          'Spellcasting (CHA)',
        ],
        slots: 2, // VERIFY: full caster, two 1st-level slots at level 1
      },
      2: {
        // VERIFY: 2024 PHB Bard level 2
        features: [
          'Expertise: double proficiency in two of your skills',
          'Jack of All Trades: add half proficiency to ability checks that have none',
        ],
        slots: 3, // VERIFY: full caster, three 1st-level slots at level 2
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Cleric: {
    die: 8,
    prime: 'WIS',
    saves: ['WIS', 'CHA'],
    skills: { n: 2, from: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'] },
    blurb: 'Champion of a higher power. Mends wounds, turns fate.',
    complexity: 'Involved',
    weapon: { name: 'Mace', die: '1d6', ab: 'STR' },
    kit: "Mace, chain shirt, shield, holy symbol, priest's pack",
    spells: {
      cantrips: ['Sacred Flame', 'Guidance', 'Thaumaturgy'],
      leveled: ['Cure Wounds', 'Bless', 'Guiding Bolt', 'Shield of Faith'],
    },
    caster: 'full',
    ac: (a) => ({ val: 13 + Math.min(mod(a.DEX), 2) + 2, note: 'Chain shirt & shield' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Spellcasting (WIS) — prepared caster',
          'Divine Order: Protector (armor) or Thaumaturge (extra cantrip)',
        ],
        slots: 2, // VERIFY
      },
      2: {
        // VERIFY: 2024 PHB Cleric level 2
        features: ['Channel Divinity (2 uses): Divine Spark or Turn Undead'],
        slots: 3, // VERIFY
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Druid: {
    die: 8,
    prime: 'WIS',
    saves: ['INT', 'WIS'],
    skills: { n: 2, from: ['Arcana', 'Animal Handling', 'Insight', 'Medicine', 'Nature', 'Perception', 'Religion', 'Survival'] },
    blurb: "Speaker for wild places. Nature's voice.",
    complexity: 'Involved',
    weapon: { name: 'Quarterstaff', die: '1d6', ab: 'STR' },
    kit: "Quarterstaff, leather armor, shield, druidic focus, explorer's pack",
    spells: {
      cantrips: ['Produce Flame', 'Guidance'],
      leveled: ['Cure Wounds', 'Entangle', 'Faerie Fire', 'Thunderwave'],
    },
    caster: 'full',
    ac: (a) => ({ val: 11 + mod(a.DEX) + 2, note: 'Leather armor & shield' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Spellcasting (WIS) — prepared caster',
          'Druidic (secret language)',
          'Primal Order: Magician or Warden',
        ],
        slots: 2, // VERIFY
      },
      2: {
        // VERIFY: 2024 PHB Druid level 2
        features: [
          'Wild Shape (2 uses): transform into a beast form',
          'Wild Companion: summon a nature spirit familiar',
        ],
        slots: 3, // VERIFY
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Fighter: {
    die: 10,
    prime: 'STR',
    saves: ['STR', 'CON'],
    skills: { n: 2, from: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Persuasion', 'Survival'] },
    blurb: 'Master of arms. The easiest class to learn.',
    complexity: 'Simple',
    weapon: { name: 'Longsword', die: '1d8', ab: 'STR' },
    kit: "Longsword, chain mail, shield, dungeoneer's pack",
    ac: () => ({ val: 18, note: 'Chain mail & shield' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Second Wind: bonus action — heal 1d10+level (2 uses)',
          'Fighting Style',
          'Weapon Mastery',
        ],
      },
      2: {
        // VERIFY: 2024 PHB Fighter level 2
        features: [
          'Action Surge: take one additional action (1/short rest)',
          'Tactical Mind: spend a Second Wind use to add 1d10 to a failed ability check',
        ],
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Monk: {
    die: 8,
    prime: 'DEX',
    saves: ['STR', 'DEX'],
    skills: { n: 2, from: ['Acrobatics', 'Athletics', 'History', 'Insight', 'Religion', 'Stealth'] },
    blurb: 'Living weapon. Speed, discipline, flow.',
    complexity: 'Medium',
    weapon: { name: 'Unarmed Strike', die: '1d6', ab: 'DEX' },
    kit: "Spear, 5 daggers, explorer's pack",
    ac: (a) => ({ val: 10 + mod(a.DEX) + mod(a.WIS), note: 'Unarmored Defense' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Martial Arts (d6): unarmed strikes use DEX; bonus-action strike',
          'Unarmored Defense',
        ],
      },
      2: {
        // VERIFY: 2024 PHB Monk level 2
        features: [
          "Monk's Focus (2 points): Flurry of Blows, Patient Defense, Step of the Wind",
          'Unarmored Movement: +10 ft speed',
          'Uncanny Metabolism: regain Focus on initiative (1/long rest)',
        ],
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Paladin: {
    die: 10,
    prime: 'STR',
    saves: ['WIS', 'CHA'],
    skills: { n: 2, from: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'] },
    blurb: 'A knight bound by an oath — and in the Feywild, oaths have teeth.',
    complexity: 'Medium',
    weapon: { name: 'Longsword', die: '1d8', ab: 'STR' },
    kit: "Longsword, chain mail, shield, holy symbol, priest's pack",
    spells: { cantrips: [], leveled: ['Divine Smite', 'Cure Wounds'] },
    caster: 'half',
    ac: () => ({ val: 18, note: 'Chain mail & shield' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Lay On Hands: heal a pool of 5 × level HP',
          'Spellcasting (CHA)',
          'Weapon Mastery',
        ],
        slots: 2, // VERIFY: 2024 half caster, two 1st-level slots at level 1
      },
      2: {
        // VERIFY: 2024 PHB Paladin level 2
        features: [
          'Fighting Style',
          "Paladin's Smite: Divine Smite always prepared, castable once free per long rest",
        ],
        slots: 2, // VERIFY
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Ranger: {
    die: 10,
    prime: 'DEX',
    saves: ['STR', 'DEX'],
    skills: { n: 3, from: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'] },
    blurb: 'Hunter at the edge of the map.',
    complexity: 'Medium',
    weapon: { name: 'Longbow', die: '1d8', ab: 'DEX' },
    kit: "Longbow & 20 arrows, shortswords ×2, studded leather, explorer's pack",
    spells: { cantrips: [], leveled: ["Hunter's Mark", 'Cure Wounds'] },
    caster: 'half',
    ac: (a) => ({ val: 12 + mod(a.DEX), note: 'Studded leather' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Spellcasting (WIS)',
          "Favored Enemy: always-prepared Hunter's Mark",
          'Weapon Mastery',
        ],
        slots: 2, // VERIFY
      },
      2: {
        // VERIFY: 2024 PHB Ranger level 2
        features: ['Deft Explorer: Expertise in one skill; two extra languages', 'Fighting Style'],
        slots: 2, // VERIFY
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Rogue: {
    die: 8,
    prime: 'DEX',
    saves: ['DEX', 'INT'],
    skills: { n: 4, from: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Persuasion', 'Sleight of Hand', 'Stealth'] },
    blurb: 'The clever one. Locks, lies, one perfect blade.',
    complexity: 'Simple',
    weapon: { name: 'Rapier', die: '1d8', ab: 'DEX' },
    kit: "Rapier, shortbow, leather armor, thieves' tools, burglar's pack",
    ac: (a) => ({ val: 11 + mod(a.DEX), note: 'Leather armor' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Sneak Attack (+1d6 once/turn with advantage or a nearby ally)',
          'Expertise: double proficiency in 2 skills',
          "Thieves' Cant",
        ],
      },
      2: {
        // VERIFY: 2024 PHB Rogue level 2
        features: ['Cunning Action: Dash, Disengage, or Hide as a bonus action'],
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Sorcerer: {
    die: 6,
    prime: 'CHA',
    saves: ['CON', 'CHA'],
    skills: { n: 2, from: ['Arcana', 'Deception', 'Insight', 'Intimidation', 'Persuasion', 'Religion'] },
    blurb: 'Magic in your blood — wild and barely on a leash.',
    complexity: 'Involved',
    weapon: { name: 'Fire Bolt (cantrip)', die: '1d10', ab: 'CHA' },
    kit: "Daggers ×2, arcane focus, dungeoneer's pack",
    spells: {
      cantrips: ['Fire Bolt', 'Light', 'Minor Illusion', 'Prestidigitation'],
      leveled: ['Shield', 'Chromatic Orb'],
    },
    caster: 'full',
    ac: (a) => ({ val: 10 + mod(a.DEX), note: 'Unarmored' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Spellcasting (CHA)',
          'Innate Sorcery: bonus action — spell save DC +1, advantage on spell attacks',
        ],
        slots: 2, // VERIFY
      },
      2: {
        // VERIFY: 2024 PHB Sorcerer level 2
        features: [
          'Font of Magic: 2 Sorcery Points, convertible to/from spell slots',
          'Metamagic: choose 2 options to shape your spells',
        ],
        slots: 3, // VERIFY
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Warlock: {
    die: 8,
    prime: 'CHA',
    saves: ['WIS', 'CHA'],
    skills: { n: 2, from: ['Arcana', 'Deception', 'History', 'Intimidation', 'Investigation', 'Nature', 'Religion'] },
    blurb: 'You made a deal with something powerful. In this campaign, that matters.',
    complexity: 'Medium',
    weapon: { name: 'Eldritch Blast (cantrip)', die: '1d10', ab: 'CHA' },
    kit: "Daggers ×2, leather armor, arcane focus, scholar's pack",
    spells: { cantrips: ['Eldritch Blast', 'Minor Illusion'], leveled: ['Hex', 'Charm Person'] },
    caster: 'pact',
    ac: (a) => ({ val: 11 + mod(a.DEX), note: 'Leather armor' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Pact Magic: few slots, always cast at max, recharge on short rest',
          'Eldritch Invocations (recommend Agonizing Blast)',
        ],
        slots: 1, // VERIFY: pact magic, one slot at level 1
      },
      2: {
        // VERIFY: 2024 PHB Warlock level 2
        features: ['Magical Cunning: recover half your pact slots (1/long rest)'],
        slots: 2, // VERIFY: pact magic, two slots at level 2
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
  Wizard: {
    die: 6,
    prime: 'INT',
    saves: ['INT', 'WIS'],
    skills: { n: 2, from: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Nature', 'Religion'] },
    blurb: 'Magic as scholarship. The deepest toolbox.',
    complexity: 'Involved',
    weapon: { name: 'Fire Bolt (cantrip)', die: '1d10', ab: 'INT' },
    kit: "Quarterstaff, spellbook, arcane focus, scholar's pack",
    spells: {
      cantrips: ['Fire Bolt', 'Mage Hand', 'Light'],
      leveled: ['Magic Missile', 'Shield', 'Sleep', 'Detect Magic'],
    },
    caster: 'full',
    ac: (a) => ({ val: 10 + mod(a.DEX), note: 'Unarmored (ask about Mage Armor)' }),
    subclassAt: 3,
    levels: {
      1: {
        features: [
          'Spellcasting (INT) — spellbook',
          'Arcane Recovery: regain slots on a short rest',
          'Ritual Adept',
        ],
        slots: 2, // VERIFY
      },
      2: {
        // VERIFY: 2024 PHB Wizard level 2
        features: ['Scholar: Expertise in one INT skill you know'],
        slots: 3, // VERIFY
      },
      ...EMPTY_HIGHER_LEVELS,
    },
  },
}

export interface SpeciesData {
  speed: number
  traits: string[]
}

export const SPECIES: Record<string, SpeciesData> = {
  Human: { speed: 30, traits: ['Resourceful: Heroic Inspiration each long rest', 'Skillful: one extra skill', 'Versatile: bonus origin feat'] },
  Elf: { speed: 30, traits: ['Darkvision 60 ft', 'Fey Ancestry: advantage vs. charm', 'Trance: 4-hour rest', 'Lineage cantrip'] },
  Dwarf: { speed: 30, traits: ['Darkvision 120 ft', 'Dwarven Resilience: resist poison', 'Stonecunning'] },
  Halfling: { speed: 30, traits: ['Luck: reroll 1s on d20s', 'Brave: advantage vs. fear', "Nimble: move through bigger creatures' spaces"] },
  Gnome: { speed: 30, traits: ['Darkvision 60 ft', 'Gnomish Cunning: advantage on INT/WIS/CHA saves'] },
  Orc: { speed: 30, traits: ['Adrenaline Rush: bonus-action Dash + temp HP', 'Relentless Endurance: drop to 1 HP instead of 0 (1/day)', 'Darkvision 120 ft'] },
  Tiefling: { speed: 30, traits: ['Darkvision 60 ft', 'Fiendish Legacy: resistance + Thaumaturgy cantrip'] },
  Dragonborn: { speed: 30, traits: ['Breath Weapon (1d10 cone/line)', 'Damage resistance (chosen type)', 'Darkvision 60 ft'] },
  Goliath: { speed: 35, traits: ['Giant Ancestry boon', 'Powerful Build: carry big, shrug off grapples'] },
  Aasimar: { speed: 30, traits: ['Celestial Resistance: necrotic & radiant', 'Healing Hands (1/day)', 'Light Bearer cantrip'] },
  'Fairy ✦': { speed: 30, traits: ['Small size', 'Flight 30 ft (no heavy armor)', 'Fairy Magic: Druidcraft & Faerie Fire', 'From the Witchlight book'] },
  'Harengon ✦': { speed: 30, traits: ['Hare-Trigger: add proficiency to initiative', 'Lucky Footwork: reroll a failed DEX save', 'Rabbit Hop: bonus-action leap', 'From the Witchlight book'] },
}

export interface BackgroundData {
  skills: string[]
  feat: string
  abis: AbilityKey[] | readonly AbilityKey[]
}

export const BACKGROUNDS: Record<string, BackgroundData> = {
  Acolyte: { skills: ['Insight', 'Religion'], feat: 'Magic Initiate (Cleric)', abis: ['INT', 'WIS', 'CHA'] },
  Criminal: { skills: ['Sleight of Hand', 'Stealth'], feat: 'Alert', abis: ['DEX', 'CON', 'INT'] },
  Entertainer: { skills: ['Acrobatics', 'Performance'], feat: 'Musician', abis: ['STR', 'DEX', 'CHA'] },
  Sage: { skills: ['Arcana', 'History'], feat: 'Magic Initiate (Wizard)', abis: ['CON', 'INT', 'WIS'] },
  Sailor: { skills: ['Acrobatics', 'Perception'], feat: 'Tavern Brawler', abis: ['STR', 'DEX', 'WIS'] },
  Soldier: { skills: ['Athletics', 'Intimidation'], feat: 'Savage Attacker', abis: ['STR', 'DEX', 'CON'] },
  // Witchlight-book backgrounds, 2014-era adapted: +2/+1 to ANY abilities (house rule, DM-approved)
  'Feylost ✦': { skills: ['Deception', 'Survival'], feat: 'Feywild Whimsy (story gift — ask your DM)', abis: ABILITIES },
  'Witchlight Hand ✦': { skills: ['Performance', 'Sleight of Hand'], feat: 'Carnival Fixture (free admission forever)', abis: ABILITIES },
}

/** Proficiency bonus by character level (2024: +2 through level 4). */
export const profBonus = (level: number): number => 2 + Math.floor((level - 1) / 4)

/**
 * Max HP using fixed (average) rolls: level 1 = die max + CON mod;
 * each later level adds die/2+1 + CON mod. // VERIFY: standard fixed-HP rule
 */
export function maxHp(die: number, conMod: number, level: number): number {
  return die + conMod + (level - 1) * (die / 2 + 1 + conMod)
}

/**
 * Conditions, in plain language for the sheet display. Wording is a
 * beginner-friendly paraphrase of the 2024 rules glossary. // VERIFY
 */
export const CONDITIONS: Record<string, string> = {
  Blinded: "You can't see: you automatically fail sight checks, your attacks have disadvantage, and attacks against you have advantage.",
  Charmed: "You can't attack your charmer, and they have advantage on social checks against you.",
  Deafened: "You can't hear and automatically fail hearing checks.",
  Frightened: 'Roll with disadvantage while the source of your fear is in sight, and you cannot willingly move closer to it.',
  Grappled: 'Your speed is 0. Attacks against anyone except your grappler have disadvantage.',
  Incapacitated: "You can't take actions, bonus actions, or reactions; you lose concentration.",
  Invisible: 'Attacks against you have disadvantage; your attacks have advantage.',
  Paralyzed: "You can't move or act. Attacks against you have advantage, and melee hits are automatic criticals.",
  Poisoned: 'You roll attacks and ability checks with disadvantage.',
  Prone: 'Crawling only. Melee attacks against you have advantage; ranged attacks have disadvantage. Standing costs half your speed.',
  Restrained: 'Speed 0. Your attacks and DEX saves have disadvantage; attacks against you have advantage.',
  Stunned: "You can't move or act and can barely speak. Attacks against you have advantage; you fail STR and DEX saves.",
  Unconscious: "You're out: prone, unaware, attacks against you have advantage, melee hits are automatic criticals.",
}
