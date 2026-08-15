// ✦ Levels 3–5 — D&D 2024 (revised 5e), for the classes at THIS table:
// Druid, Wizard, Fighter (Peaches & Freya Moon · Billy · Philip & Freya Sun).
//
// Depth for our five, not breadth for all twelve. Other classes keep their
// level 1–2 data in rules.ts and stay playable; these three get everything
// through level 5, all four 2024 subclasses each, the level-4 choice (ASI
// or a feat), and species traits that wake at 3 and 5.
//
// Sources: the SRD 5.2 (CC-BY-4.0) where it covers a thing (Circle of the
// Land, Champion, Evoker, the general feats, spell-slot table); everything
// else is described in the app's own words from the 2024 rules — mechanics
// only, never copied text — and carries // VERIFY for the Lantern-Keeper.

import type { AbilityKey } from './rules'

/** A feature with a name, plain-language text, and (optionally) uses that trackers can count. */
export interface Feature {
  name: string
  text: string
  /** How many times between rests. `n` may depend on level or proficiency; keep it simple here. */
  uses?: { n: number; per: 'short' | 'long' }
  /** What it costs on your turn, for the actions list. */
  action?: 'action' | 'bonus' | 'reaction' | 'free' | 'passive'
}

/** Split "Name: text" strings (rules.ts style) into a Feature. */
export function toFeature(f: string | Feature): Feature {
  if (typeof f !== 'string') return f
  const i = f.indexOf(':')
  if (i === -1) return { name: f, text: '' }
  return { name: f.slice(0, i).trim(), text: f.slice(i + 1).trim() }
}

// ------------------------------------------------------------ spell slots

/**
 * Full-caster spell slots by character level, indexed by spell level 1..
 * SRD 5.2 table. // VERIFY (standard: L1 [2] · L2 [3] · L3 [4,2] · L4 [4,3] · L5 [4,3,2])
 */
export const FULL_CASTER_SLOTS: Record<number, number[]> = {
  1: [2],
  2: [3],
  3: [4, 2],
  4: [4, 3],
  5: [4, 3, 2],
  6: [4, 3, 3],
  7: [4, 3, 3, 1],
  8: [4, 3, 3, 2],
}

/** Highest spell level a full caster can cast at a character level. */
export const maxSpellLevel = (level: number): number => FULL_CASTER_SLOTS[level]?.length ?? 0

// ------------------------------------------------------ core class levels

/**
 * Levels 3–5 for our three classes. Level 3 = subclass (see SUBCLASSES);
 * level 4 = Ability Score Improvement or a feat (see FEATS); level 5 = the
 * big one. Level 1–2 live in rules.ts.
 */
export const CLASS_LEVELS: Record<string, Record<number, Feature[]>> = {
  Druid: {
    3: [
      { name: 'Druid Circle', text: 'Choose your Circle — Land, Moon, Sea, or Stars. It shapes how your magic grows from here.', action: 'passive' },
      { name: '2nd-level spells', text: 'Your slots deepen: you can now prepare and cast 2nd-level spells (Moonbeam, Pass without Trace, Hold Person…).', action: 'passive' },
    ],
    4: [
      { name: 'Ability Score Improvement', text: 'Raise one ability by 2, or two abilities by 1 each (max 20) — or take a feat instead. Choose below.', action: 'passive' },
    ],
    5: [
      { name: 'Wild Resurgence', text: 'Once per turn, if you have no Wild Shape uses left, spend a spell slot to regain one. And once per long rest, spend a Wild Shape use to regain a 1st-level spell slot. // VERIFY', action: 'free' },
      { name: '3rd-level spells', text: 'Call Lightning, Conjure Animals, Plant Growth, Dispel Magic — the weather starts listening to you.', action: 'passive' },
    ],
  },
  Wizard: {
    3: [
      { name: 'Arcane Tradition', text: 'Choose your school — Abjurer, Diviner, Evoker, or Illusionist. It shapes what your study becomes.', action: 'passive' },
      { name: '2nd-level spells', text: 'Your slots deepen: two new spells for the book at 2nd level (Misty Step, Mirror Image, Scorching Ray, Invisibility…).', action: 'passive' },
    ],
    4: [
      { name: 'Ability Score Improvement', text: 'Raise one ability by 2, or two abilities by 1 each (max 20) — or take a feat instead. Choose below.', action: 'passive' },
    ],
    5: [
      { name: 'Memorize Spell', text: 'After a short rest, swap one prepared wizard spell for another from your book. // VERIFY', action: 'passive' },
      { name: '3rd-level spells', text: 'Fireball, Counterspell, Fly, Haste — the book gets dangerous.', action: 'passive' },
    ],
  },
  Fighter: {
    3: [
      { name: 'Fighter Subclass', text: 'Choose your path — Battle Master, Champion, Eldritch Knight, or Psi Warrior. It decides what kind of dangerous you are.', action: 'passive' },
    ],
    4: [
      { name: 'Ability Score Improvement', text: 'Raise one ability by 2, or two abilities by 1 each (max 20) — or take a feat instead. Choose below.', action: 'passive' },
    ],
    5: [
      { name: 'Extra Attack', text: 'When you take the Attack action, you attack TWICE. Two swings, one action, every turn.', action: 'passive' },
      { name: 'Tactical Shift', text: 'When you use Second Wind, you can also move up to half your speed without provoking opportunity attacks. // VERIFY', action: 'free' },
    ],
  },
}

/** Uses-per-rest for level 1–2 features already listed in rules.ts, so trackers can count them. */
export const CORE_FEATURE_USES: Record<string, Record<string, { n: number | 'prof'; per: 'short' | 'long' }>> = {
  Fighter: {
    'Second Wind': { n: 2, per: 'long' }, // 3 uses at level 4, 4 at level 10 // VERIFY
    'Action Surge': { n: 1, per: 'short' },
  },
  Druid: {
    'Wild Shape': { n: 2, per: 'long' }, // 3 uses at level 6 // VERIFY
  },
  Wizard: {
    'Arcane Recovery': { n: 1, per: 'long' },
  },
}

// -------------------------------------------------------------- subclasses

export interface Subclass {
  blurb: string
  /** One line for the choosing screen: who picks this. */
  fits: string
  features: Record<number, Feature[]>
}

export const SUBCLASSES: Record<string, Record<string, Subclass>> = {
  Druid: {
    'Circle of the Land': {
      blurb: 'The old druids of hill and grove. Extra spells from the land you know, and the land pays you back.',
      fits: 'A caster who wants MORE spells and steadier magic. (SRD.)',
      features: {
        3: [
          { name: 'Circle Spells', text: 'Choose a land — Arid, Polar, Temperate, or Tropical. Its spells are always prepared for you (Temperate: Misty Step, Sleep at 3rd; Lightning Bolt, Plant Growth at 5th). // VERIFY', action: 'passive' },
          { name: "Land's Aid", text: 'Action: expend a Wild Shape use to make a 10-ft-radius circle within 60 ft. Creatures you choose inside make a CON save or take 2d6 necrotic; one creature you choose regains 2d6 HP. Scales as you level. // VERIFY', uses: { n: 1, per: 'short' }, action: 'action' },
        ],
      },
    },
    'Circle of the Moon': {
      blurb: 'The shapeshifters. Your beast forms are stronger, and you can heal yourself while wearing them.',
      fits: 'A druid who wants to FIGHT as an animal — bear, wolf, whatever the bog needs.',
      features: {
        3: [
          { name: 'Circle Forms', text: 'Your Wild Shape beasts are tougher: challenge rating up to a third of your level, an AC of 13 + WIS mod if better, and temporary HP equal to three times your druid level when you transform. // VERIFY', action: 'passive' },
          { name: 'Circle Spells', text: 'Cure Wounds, Moonbeam, and Starry Wisp are always prepared — and you can cast them while wild-shaped. // VERIFY', action: 'passive' },
        ],
      },
    },
    'Circle of the Sea': {
      blurb: 'Storm and tide. You carry the sea’s anger with you, and it lashes out around you.',
      fits: 'A druid who wants to stand in the middle of a fight and be the weather. (Peaches’s natural home.)',
      features: {
        3: [
          { name: 'Wrath of the Sea', text: 'Bonus action: expend a Wild Shape use to surround yourself with a 5-ft aura of spray for 10 minutes. At the end of each of your turns, one creature in the aura you choose makes a CON save or takes d6 cold damage (dice equal to your WIS mod) and is pushed 15 ft. // VERIFY', uses: { n: 1, per: 'short' }, action: 'bonus' },
          { name: 'Circle Spells', text: 'Fog Cloud, Gust of Wind, Ray of Frost, Shatter, and Thunderwave are always prepared. // VERIFY', action: 'passive' },
        ],
      },
    },
    'Circle of the Stars': {
      blurb: 'The sky-readers. A star map, an omen, and a form made of constellations.',
      fits: 'A druid who wants magic that looks like the night sky — and a little foresight.',
      features: {
        3: [
          { name: 'Star Map', text: 'You hold a star chart (your druidic focus). Guidance and Guiding Bolt are always prepared, and you can cast Guiding Bolt without a slot a number of times per long rest equal to your WIS mod. // VERIFY', uses: { n: 3, per: 'long' }, action: 'passive' },
          { name: 'Starry Form', text: 'Bonus action: expend a Wild Shape use to shine as a constellation for 10 minutes — Archer (bonus-action radiant bolt, 1d8 + WIS), Chalice (heal an ally when you cast a healing spell), or Dragon (treat 9 or lower as 10 on INT/WIS checks and CON saves for concentration). // VERIFY', uses: { n: 1, per: 'short' }, action: 'bonus' },
        ],
      },
    },
  },
  Wizard: {
    Abjurer: {
      blurb: 'The ward-maker. Protective magic that stores itself in a shield around you.',
      fits: 'A wizard who wants to be hard to hurt and to protect the others.',
      features: {
        3: [
          { name: 'Abjuration Savant', text: 'Add two Abjuration spells to your book free; whenever you gain a wizard level, one of your two new spells may be a free Abjuration spell. // VERIFY', action: 'passive' },
          { name: 'Arcane Ward', text: 'When you cast an Abjuration spell using a slot, a magical ward forms with HP equal to twice your wizard level + INT mod. Damage you take hits the ward first. Each Abjuration spell you cast recharges it. // VERIFY', action: 'passive' },
        ],
      },
    },
    Diviner: {
      blurb: 'The seer. You roll the future in advance and hand it out.',
      fits: 'A wizard who wants to bend luck — yours and everyone else’s.',
      features: {
        3: [
          { name: 'Divination Savant', text: 'Add two Divination spells to your book free; one of your two new spells each level may be a free Divination spell. // VERIFY', action: 'passive' },
          { name: 'Portent', text: 'After a long rest, roll two d20s and write them down. Any time you or a creature you can see makes a d20 test, you can replace the roll with one of yours — before the roll is made. Each die can be used once. // VERIFY', uses: { n: 2, per: 'long' }, action: 'free' },
        ],
      },
    },
    Evoker: {
      blurb: 'The blaster. Fire, lightning, force — and your friends never get caught in it.',
      fits: 'A wizard who wants big damage and clean lines. (SRD.)',
      features: {
        3: [
          { name: 'Evocation Savant', text: 'Add two Evocation spells to your book free; one of your two new spells each level may be a free Evocation spell. // VERIFY', action: 'passive' },
          { name: 'Potent Cantrip', text: 'Your damaging cantrips still deal half damage when the target saves or you miss. // VERIFY', action: 'passive' },
        ],
      },
    },
    Illusionist: {
      blurb: 'The trickster. Illusions with weight, sound, and staying power.',
      fits: 'A wizard who wants to lie beautifully — and make the lie hold. (Blue-Chew Billy, in his element.)',
      features: {
        3: [
          { name: 'Illusion Savant', text: 'Add two Illusion spells to your book free; one of your two new spells each level may be a free Illusion spell. // VERIFY', action: 'passive' },
          { name: 'Improved Illusions', text: 'You cast illusion spells without Verbal components (silently), your illusions reach 60 ft further, and Minor Illusion is yours free — creating both a sound AND an image at once. // VERIFY', action: 'passive' },
        ],
      },
    },
  },
  Fighter: {
    'Battle Master': {
      blurb: 'The tactician. Superiority Dice fuel maneuvers — trips, feints, parries, rallies.',
      fits: 'A fighter who wants CHOICES every turn, and to protect the people beside them.',
      features: {
        3: [
          { name: 'Combat Superiority', text: 'You have four d8 Superiority Dice (back on a short or long rest) and know three maneuvers — for example Trip Attack (add the die to damage; STR save or knocked prone), Parry (reaction: reduce damage to you by the die + DEX mod), Rally (bonus action: an ally gains temp HP = die + WIS mod), Disarming Attack, Precision Attack, Riposte. Maneuver save DC = 8 + prof + STR or DEX mod. // VERIFY', uses: { n: 4, per: 'short' }, action: 'free' },
          { name: 'Student of War', text: "Proficiency with one artisan's tool and one extra skill from the fighter list. // VERIFY", action: 'passive' },
        ],
      },
    },
    Champion: {
      blurb: 'The natural. Crits come easier and your body does the rest.',
      fits: 'A fighter who wants it SIMPLE and deadly. (SRD.)',
      features: {
        3: [
          { name: 'Improved Critical', text: 'Your weapon attacks score a critical hit on a roll of 19 or 20. // VERIFY', action: 'passive' },
          { name: 'Remarkable Athlete', text: 'Advantage on Initiative rolls and Athletics checks; when you score a critical hit, you can move up to half your speed without provoking opportunity attacks. // VERIFY', action: 'passive' },
        ],
      },
    },
    'Eldritch Knight': {
      blurb: 'Steel and spellwork. A fighter who learns a little wizardry and bonds with a blade.',
      fits: 'A fighter who wants a few spells (Shield! Magic Missile!) and a sword that always comes back.',
      features: {
        3: [
          { name: 'Spellcasting (INT)', text: 'You learn two wizard cantrips and three 1st-level wizard spells (two from Abjuration or Evocation), and have two 1st-level slots. Spell save DC 8 + prof + INT; spell attack prof + INT. // VERIFY', action: 'passive' },
          { name: 'War Bond', text: 'Ritual (1 hour): bond a weapon to yourself. You can’t be disarmed of it unless incapacitated, and if it’s on the same plane you can summon it to your hand as a bonus action. Up to two bonded weapons. // VERIFY', action: 'bonus' },
        ],
      },
    },
    'Psi Warrior': {
      blurb: 'Mind over muscle. Psionic Energy Dice shield allies, shove foes, and harden your strikes.',
      fits: 'A fighter who wants a quiet, uncanny edge — protecting people with will alone.',
      features: {
        3: [
          { name: 'Psionic Power', text: 'You have Psionic Energy Dice (d6s, twice your proficiency bonus of them; one returns on a short rest, all on a long rest). Protective Field (reaction: reduce damage to a creature within 30 ft by the die + INT mod) · Psionic Strike (once per turn, add the die of force damage to a hit within 30 ft) · Telekinetic Movement (action: move an object or willing creature 30 ft with your mind, once per short rest free). // VERIFY', uses: { n: 4, per: 'long' }, action: 'free' },
        ],
      },
    },
  },
}

// -------------------------------------------------------------------- feats

export interface Feat {
  name: string
  text: string
  /** 2024 general feats also raise one ability by 1 (from a list, or any). */
  bump: AbilityKey[] | 'any'
  /** Who this is for, in one line — the choosing screen. */
  fits: string
}

/**
 * The level-4 choice: an Ability Score Improvement, or one of these. Curated
 * for our table (SRD 5.2 general feats, plain language). // VERIFY each.
 */
export const FEATS: Feat[] = [
  { name: 'Ability Score Improvement', text: 'Raise one ability by 2, or two abilities by 1 each. Simple, always good.', bump: 'any', fits: 'Anyone who wants to be better at what they already do.' },
  { name: 'Resilient', text: 'Choose an ability: +1 to it, and you gain proficiency in saving throws with it. (Wizards and druids: CON, to keep concentration.)', bump: 'any', fits: 'Casters who keep losing concentration; anyone with a weak save.' },
  { name: 'War Caster', text: 'Advantage on CON saves to keep concentration; you can cast a spell as an opportunity attack; you can perform somatic components with weapons or a shield in hand.', bump: ['INT', 'WIS', 'CHA'], fits: 'Casters who fight up close.' },
  { name: 'Fey-Touched', text: 'You learn Misty Step and one 1st-level Divination or Enchantment spell (e.g. Bless, Charm Person, Detect Magic, Hunter’s Mark). Cast each once per long rest without a slot, or with slots. // VERIFY', bump: ['INT', 'WIS', 'CHA'], fits: 'Anyone at THIS table — the Feywild is already in you.' },
  { name: 'Sentinel', text: 'When you hit with an opportunity attack, the target’s speed drops to 0. Creatures provoke you even when they Disengage. When a creature attacks someone other than you within 5 ft, you can attack it as a reaction.', bump: ['STR', 'DEX'], fits: 'The wall. Fighters who protect.' },
  { name: 'Great Weapon Master', text: 'When you hit with a heavy weapon, add your proficiency bonus to the damage once per turn. When you crit or drop a foe with a melee weapon, make one extra attack as a bonus action.', bump: ['STR'], fits: 'Big-weapon fighters.' },
  { name: 'Dual Wielder', text: 'You can two-weapon-fight with non-light weapons, and make one extra attack with the off-hand as a bonus action when you attack with a light weapon in your other hand.', bump: ['STR', 'DEX'], fits: 'Two swords. (Freya Sun.)' },
  { name: 'Defensive Duelist', text: 'Reaction, while wielding a finesse weapon: add your proficiency bonus to your AC against one melee attack that would hit you.', bump: ['DEX'], fits: 'Quick fighters who’d rather not be hit.' },
  { name: 'Shield Master', text: 'Once per turn, when you hit with a melee attack, use your shield to shove the target 5 ft or knock it prone (STR save). Add your shield’s AC bonus to DEX saves against effects that target only you; take no damage on a success. ', bump: ['STR'], fits: 'Sword-and-board fighters.' },
  { name: 'Skill Expert', text: '+1 to any ability, proficiency in one skill, and Expertise (double proficiency) in one skill you know.', bump: 'any', fits: 'Anyone who wants to be brilliant at one thing.' },
  { name: 'Observant', text: 'Proficiency (or Expertise) in Insight, Investigation, or Perception; you can’t be surprised while conscious; you can lip-read. // VERIFY', bump: ['INT', 'WIS'], fits: 'The one who notices.' },
  { name: 'Durable', text: 'Advantage on death saving throws; as a bonus action, spend a Hit Die to heal.', bump: ['CON'], fits: 'Anyone who keeps going down.' },
  { name: 'Speedy', text: '+10 ft speed; Dash costs no movement through difficult terrain; opportunity attacks against you have disadvantage.', bump: ['DEX', 'CON'], fits: 'Anyone who wants to be where the trouble is.' },
  { name: 'Elemental Adept', text: 'Choose a damage type (acid, cold, fire, lightning, thunder): your spells ignore resistance to it, and you treat 1s on damage dice as 2s.', bump: ['INT', 'WIS', 'CHA'], fits: 'Casters who blast.' },
  { name: 'Telepathic', text: 'Speak telepathically to any creature you can see within 60 ft; cast Detect Thoughts once per long rest without a slot.', bump: ['INT', 'WIS', 'CHA'], fits: 'Anyone who wants to whisper across the table without whispering.' },
  { name: 'Grappler', text: 'Advantage on attacks against creatures you’re grappling; when you hit with an unarmed strike you can grapple; move a grappled creature at full speed.', bump: ['STR', 'DEX'], fits: 'The one who won’t kill — but will hold you down. (Philip.)' },
]

// ------------------------------------------------------ species, by level

/** Species traits that wake at later levels. // VERIFY each */
export const SPECIES_BY_LEVEL: Record<string, Record<number, string[]>> = {
  Aasimar: {
    3: [
      'Celestial Revelation: bonus action, once per long rest, for 1 minute — choose Heavenly Wings (fly at your speed), Inner Radiance (shed light; each turn, creatures within 10 ft take radiant damage equal to your proficiency bonus), or Necrotic Shroud (creatures within 10 ft make a CHA save or are frightened until the end of your next turn). While it lasts, once per turn add your proficiency bonus as radiant or necrotic damage to one attack or spell. // VERIFY',
    ],
  },
  'Fairy ✦': {
    3: ['Fairy Magic: Faerie Fire — once per long rest without a slot (also with slots).'],
    5: ['Fairy Magic: Enlarge/Reduce — once per long rest without a slot (also with slots). // VERIFY'],
  },
}
