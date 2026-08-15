// ✦ The spellbook — every Druid and Wizard spell, levels 0–3, as a card the
// phone can show mid-scene. D&D 2024 lists; SRD 5.2 (CC-BY-4.0) names and
// figures where it covers a spell, own words everywhere. Short enough to
// read at the table, with the numbers that matter. // VERIFY on anything
// from the 2024 books that the SRD doesn't carry.
//
// classes: D Druid · W Wizard · B Bard · C Cleric · S Sorcerer · K Warlock ·
// P Paladin · R Ranger. (Only D and W are complete here.)
// tags: C = concentration · R = ritual.

export interface Spell {
  name: string
  level: number
  school: string
  classes: string
  time: string
  range: string
  duration: string
  /** 'C' concentration, 'R' ritual, 'CR' both. */
  tags?: string
  text: string
  upcast?: string
}

const S = (
  name: string,
  level: number,
  school: string,
  classes: string,
  time: string,
  range: string,
  duration: string,
  text: string,
  tags?: string,
  upcast?: string,
): Spell => ({ name, level, school, classes, time, range, duration, text, tags, upcast })

export const SPELLBOOK: Spell[] = [
  // ============================================================ CANTRIPS
  S('Acid Splash', 0, 'Evocation', 'WS', 'Action', '60 ft', 'Instant', 'A bubble of acid bursts in a 5-ft sphere: DEX save or 1d6 acid. Grows at levels 5/11/17. // VERIFY'),
  S('Blade Ward', 0, 'Abjuration', 'WBS', 'Action', 'Self', 'Concentration, 1 min', 'A whirling ward: attack rolls against you have disadvantage. // VERIFY 2024', 'C'),
  S('Chill Touch', 0, 'Necromancy', 'WSK', 'Action', 'Touch', 'Instant', 'A ghostly grasp: melee spell attack, 1d10 necrotic, and the target can’t regain HP until your next turn. // VERIFY 2024', undefined),
  S('Dancing Lights', 0, 'Illusion', 'WBS', 'Action', '120 ft', 'Concentration, 1 min', 'Up to four floating torch-lights you can drift where you like within range.', 'C'),
  S('Druidcraft', 0, 'Transmutation', 'D', 'Action', '30 ft', 'Instant', 'Whisper to nature: predict tomorrow’s weather, bloom a flower, light or snuff a candle, make a harmless sensory wonder.'),
  S('Elementalism', 0, 'Transmutation', 'DWS', 'Action', '30 ft', 'Instant', 'Tiny elemental theatre: a burst of wind, a spark that ignites a candle, a puff of dust, water that briefly hangs in the air. Flavour and cleverness, no damage. // VERIFY 2024'),
  S('Fire Bolt', 0, 'Evocation', 'WS', 'Action', '120 ft', 'Instant', 'A streak of fire: ranged spell attack, 1d10 fire damage. Ignites things that like burning. Grows at 5/11/17.'),
  S('Friends', 0, 'Enchantment', 'WBS', 'Action', '10 ft', 'Concentration, 1 min', 'One humanoid: WIS save or Charmed by you for the duration — and it knows, afterward, and won’t love you for it. // VERIFY 2024', 'C'),
  S('Guidance', 0, 'Divination', 'DC', 'Reaction', 'Touch', 'Instant', 'When a friend within reach fails an ability check, they add 1d4 — maybe turning it. // VERIFY 2024 (reaction)'),
  S('Light', 0, 'Evocation', 'WBCS', 'Action', 'Touch', '1 hour', 'Touch an object: it shines like a torch (bright 20 ft, dim 20 more). Great on a thrown pebble.'),
  S('Mage Hand', 0, 'Conjuration', 'WBSK', 'Action', '30 ft', '1 min', 'A spectral floating hand: open doors, fetch objects, carry up to 10 lb, reach 30 ft.'),
  S('Mending', 0, 'Transmutation', 'DWBCS', '1 min', 'Touch', 'Instant', 'Repair a single break or tear no bigger than a foot — a cracked bowl, a torn cloak, a broken chain link.'),
  S('Message', 0, 'Transmutation', 'DWBS', 'Action', '120 ft', '1 round', 'Whisper to one creature you point at; only it hears, and it can whisper back. Through walls if you know where they are.'),
  S('Mind Sliver', 0, 'Enchantment', 'WSK', 'Action', '60 ft', '1 round', 'A splinter of psychic pain: INT save or 1d6 psychic and −1d4 on its next saving throw before your next turn. // VERIFY 2024'),
  S('Minor Illusion', 0, 'Illusion', 'WBSK', 'Action', '30 ft', '1 min', 'A sound OR a small image (5-ft cube) for a minute. Investigation vs your spell DC sees through it.'),
  S('Poison Spray', 0, 'Necromancy', 'DWSK', 'Action', '30 ft', 'Instant', 'A puff of noxious gas: ranged spell attack, 1d12 poison. // VERIFY 2024 (attack, 30 ft)'),
  S('Prestidigitation', 0, 'Transmutation', 'WBS', 'Action', '10 ft', 'Up to 1 hour', 'Small magics: clean or soil, chill or warm, flavour food, snuff or light candles, tiny sensory effects. The showman’s toolkit.'),
  S('Produce Flame', 0, 'Conjuration', 'D', 'Bonus action', 'Self', '10 min', 'A friendly flame in your palm — torchlight until you need it, or hurl it (action): ranged spell attack, 1d8 fire. // VERIFY 2024 (bonus action)'),
  S('Ray of Frost', 0, 'Evocation', 'WS', 'Action', '60 ft', 'Instant', 'A beam of blue-white cold: ranged spell attack, 1d8 cold, and the target’s speed drops 10 ft until your next turn.'),
  S('Resistance', 0, 'Abjuration', 'DC', 'Reaction', 'Touch', 'Instant', 'When a friend within reach fails a saving throw, they add 1d4. // VERIFY 2024 (reaction)'),
  S('Shillelagh', 0, 'Transmutation', 'D', 'Bonus action', 'Self', '1 min', 'Your club or staff becomes a fine weapon: attack with WIS instead of STR, damage 1d8 (grows with level), counts as magical. // VERIFY 2024'),
  S('Shocking Grasp', 0, 'Evocation', 'WS', 'Action', 'Touch', 'Instant', 'Lightning in your palm: melee spell attack, 1d8 lightning, and the target can’t take reactions until its next turn. // VERIFY 2024'),
  S('Spare the Dying', 0, 'Necromancy', 'DC', 'Action', '15 ft', 'Instant', 'A dying creature you can see stabilizes — no more death saves. // VERIFY 2024 (range)'),
  S('Starry Wisp', 0, 'Evocation', 'DB', 'Action', '60 ft', 'Instant', 'A mote of starlight: ranged spell attack, 1d8 radiant, and the target sheds dim light and can’t be invisible until your next turn. // VERIFY 2024'),
  S('Thorn Whip', 0, 'Transmutation', 'D', 'Action', '30 ft', 'Instant', 'A vine lashes out: melee spell attack (30-ft reach), 1d6 piercing, and you pull a Large-or-smaller target 10 ft toward you.'),
  S('Thunderclap', 0, 'Evocation', 'DWBS', 'Action', 'Self (5-ft)', 'Instant', 'A crack of thunder around you: every other creature within 5 ft makes a CON save or takes 1d6 thunder. Audible 100 ft away.'),
  S('Toll the Dead', 0, 'Necromancy', 'WCK', 'Action', '60 ft', 'Instant', 'A dolorous bell only the target hears: WIS save or 1d8 necrotic — 1d12 if it’s already hurt.'),
  S('True Strike', 0, 'Divination', 'WBSK', 'Action', 'Self', 'Instant', 'Guided by insight, make one weapon attack using your spellcasting ability instead; the hit deals radiant damage if you like. // VERIFY 2024'),

  // ============================================================ LEVEL 1
  S('Alarm', 1, 'Abjuration', 'WR', '1 min', '30 ft', '8 hours', 'Ward a door, window, or 20-ft cube: when a Tiny-or-larger creature enters, a mental ping wakes you — or an audible bell rings. Ritual.', 'R'),
  S('Animal Friendship', 1, 'Enchantment', 'DBR', 'Action', '30 ft', '24 hours', 'A beast makes a WIS save or is Charmed by you for a day: it won’t attack you and can be led. // VERIFY 2024', undefined, 'One more beast per slot level.'),
  S('Burning Hands', 1, 'Evocation', 'WS', 'Action', 'Self (15-ft cone)', 'Instant', 'Fire fans from your fingertips: creatures in a 15-ft cone make a DEX save, 3d6 fire (half on a save). Sets things alight.', undefined, '+1d6 per slot level.'),
  S('Charm Person', 1, 'Enchantment', 'DWBSK', 'Action', '30 ft', '1 hour', 'A humanoid makes a WIS save or regards you as a friendly acquaintance for an hour. It KNOWS afterward. Choose targets wisely.', undefined, 'One more target per slot level.'),
  S('Chromatic Orb', 1, 'Evocation', 'WS', 'Action', '90 ft', 'Instant', 'Hurl a 4-inch sphere of acid, cold, fire, lightning, poison, or thunder: ranged spell attack, 3d8 damage of that type. Roll doubles and it leaps to a second target. // VERIFY 2024', undefined, '+1d8 per slot level.'),
  S('Color Spray', 1, 'Illusion', 'WS', 'Action', 'Self (15-ft cone)', 'Instant', 'A dazzling burst of colour: creatures in a 15-ft cone make a CON save or are Blinded until the end of your next turn. // VERIFY 2024'),
  S('Comprehend Languages', 1, 'Divination', 'WBSK', 'Action', 'Self', '1 hour', 'Understand any spoken language you hear, and read any written one you touch. Ritual.', 'R'),
  S('Create or Destroy Water', 1, 'Transmutation', 'DC', 'Action', '30 ft', 'Instant', 'Conjure up to 10 gallons of clean water (or a rain that fills a 30-ft cube), or destroy that much — fog and all.', undefined, '+10 gallons per slot level.'),
  S('Cure Wounds', 1, 'Abjuration', 'DBCPR', 'Action', 'Touch', 'Instant', 'Touch a creature: it regains 2d8 + your spellcasting modifier hit points. // VERIFY 2024', undefined, '+2d8 per slot level.'),
  S('Detect Magic', 1, 'Divination', 'DWBCPRSK', 'Action', 'Self (30-ft)', 'Concentration, 10 min', 'Sense magic within 30 ft; study a thing to learn its school. Ritual (no slot, +10 minutes).', 'CR'),
  S('Detect Poison and Disease', 1, 'Divination', 'DCPR', 'Action', 'Self (30-ft)', 'Concentration, 10 min', 'Sense poisons, poisonous creatures, and diseases within 30 ft, and what kind they are. Ritual.', 'CR'),
  S('Disguise Self', 1, 'Illusion', 'WBS', 'Action', 'Self', '1 hour', 'Look like someone else — a foot taller or shorter, different face, clothes, gear. Touch gives it away; Investigation vs your DC sees through it.'),
  S('Entangle', 1, 'Conjuration', 'D', 'Action', '90 ft', 'Concentration, 1 min', 'Grasping weeds erupt over a 20-ft square: STR save or Restrained (stuck; attacks against them have advantage). The ground is difficult terrain.', 'C'),
  S('Expeditious Retreat', 1, 'Transmutation', 'WSK', 'Bonus action', 'Self', 'Concentration, 10 min', 'You can Dash as a bonus action, now and every turn while it lasts.', 'C'),
  S('Faerie Fire', 1, 'Evocation', 'DB', 'Action', '60 ft', 'Concentration, 1 min', 'Everything in a 20-ft cube is outlined in glowing light: DEX save or attacks against them have ADVANTAGE and they cannot hide.', 'C'),
  S('False Life', 1, 'Necromancy', 'WS', 'Action', 'Self', 'Instant', 'Borrowed vitality: you gain 2d4 + 4 temporary hit points. // VERIFY 2024', undefined, '+5 temp HP per slot level.'),
  S('Feather Fall', 1, 'Transmutation', 'WBS', 'Reaction (when falling)', '60 ft', '1 min', 'Up to five falling creatures drift down like feathers — 60 ft per round, landing unhurt.'),
  S('Find Familiar', 1, 'Conjuration', 'W', '1 hour', '10 ft', 'Instant', 'A spirit takes the shape of a small animal — cat, owl, raven, frog… — that obeys you, shares your senses when you close your eyes, and can deliver touch spells. Ritual.', 'R'),
  S('Fog Cloud', 1, 'Conjuration', 'DWSR', 'Action', '120 ft', 'Concentration, 1 hour', 'A 20-ft-radius sphere of thick fog: heavily obscured. Wind disperses it.', 'C', '+20 ft radius per slot level.'),
  S('Goodberry', 1, 'Conjuration', 'DR', 'Action', 'Self', '24 hours', 'Ten berries appear in your hand. Eating one restores 1 HP and feeds you for a day. Wake the fallen with fruit.'),
  S('Grease', 1, 'Conjuration', 'WS', 'Action', '60 ft', '1 min', 'A 10-ft square becomes slick: difficult terrain, and creatures in it or entering it make a DEX save or fall Prone.'),
  S('Guiding Bolt', 1, 'Evocation', 'C', 'Action', '120 ft', '1 round', 'A bolt of light: ranged spell attack, 4d6 radiant, and the NEXT attack against that target before your next turn has advantage.', undefined, '+1d6 per slot level.'),
  S('Healing Word', 1, 'Abjuration', 'DBC', 'Bonus action', '60 ft', 'Instant', 'A word of mending from across the room: 2d4 + your modifier hit points. Great for waking the fallen. // VERIFY 2024', undefined, '+2d4 per slot level.'),
  S('Ice Knife', 1, 'Conjuration', 'DWS', 'Action', '60 ft', 'Instant', 'A shard of ice: ranged spell attack, 1d10 piercing — then it explodes: creatures within 5 ft of the target make a DEX save or take 2d6 cold.', undefined, '+1d6 cold per slot level.'),
  S('Identify', 1, 'Divination', 'WB', '1 min', 'Touch', 'Instant', 'Learn what a magic item does and how to use it, whether it needs attunement, and if it’s under a spell. Ritual.', 'R'),
  S('Illusory Script', 1, 'Illusion', 'WBK', '1 min', 'Touch', '10 days', 'Write a message only chosen readers can read; everyone else sees something else you decide. Ritual.', 'R'),
  S('Jump', 1, 'Transmutation', 'DWSR', 'Bonus action', 'Touch', '1 min', 'The target’s jump distance is tripled. // VERIFY 2024 (bonus action)'),
  S('Longstrider', 1, 'Transmutation', 'DWBR', 'Action', 'Touch', '1 hour', 'One creature’s speed rises by 10 ft for an hour.', undefined, 'One more creature per slot level.'),
  S('Mage Armor', 1, 'Abjuration', 'WS', 'Action', 'Touch', '8 hours', 'A willing, unarmored creature is sheathed in force: AC becomes 13 + DEX mod for eight hours. The wizard’s morning ritual.'),
  S('Magic Missile', 1, 'Evocation', 'WS', 'Action', '120 ft', 'Instant', 'Three darts of force that NEVER miss: 1d4 + 1 each, split among targets however you like.', undefined, '+1 dart per slot level.'),
  S('Protection from Evil and Good', 1, 'Abjuration', 'DWCPK', 'Action', 'Touch', 'Concentration, 10 min', 'A willing creature is warded against aberrations, celestials, elementals, fey, fiends, and undead: they have disadvantage attacking it, and can’t charm, frighten, or possess it.', 'C'),
  S('Purify Food and Drink', 1, 'Transmutation', 'DCP', 'Action', '10 ft', 'Instant', 'All food and drink in a 5-ft sphere is cleansed of poison and disease. Ritual.', 'R'),
  S('Ray of Sickness', 1, 'Necromancy', 'WS', 'Action', '60 ft', 'Instant', 'A sickly green ray: ranged spell attack, 2d8 poison, and the target has the Poisoned condition until your next turn. // VERIFY 2024', undefined, '+1d8 per slot level.'),
  S('Shield', 1, 'Abjuration', 'WS', 'Reaction (when hit)', 'Self', '1 round', 'Cast the instant you are hit: +5 AC until your next turn — often turning that hit into a miss — and Magic Missiles bounce off entirely.'),
  S('Silent Image', 1, 'Illusion', 'WBS', 'Action', '60 ft', 'Concentration, 10 min', 'An image of an object, creature, or thing up to a 15-ft cube — no sound, smell, or touch. You can move it. Investigation vs your DC sees through it.', 'C'),
  S('Sleep', 1, 'Enchantment', 'WBS', 'Action', '60 ft', 'Concentration, 1 min', 'Creatures in a 5-ft sphere make a WIS save or are Incapacitated, then Unconscious at the end of their next turn if still failing. Shaking them takes an action. // VERIFY 2024', 'C'),
  S('Speak with Animals', 1, 'Divination', 'DBR', 'Action', 'Self', '10 min', 'You can talk with beasts. They tell you what they’ve seen, in their way — the seal-pup, the gulls, one alligator who says nothing. Ritual.', 'R'),
  S('Hideous Laughter', 1, 'Enchantment', 'WB', 'Action', '30 ft', 'Concentration, 1 min', 'A creature makes a WIS save or falls Prone laughing, Incapacitated. It repeats the save when hurt. (Tasha’s, in the old books.) // VERIFY 2024', 'C', 'One more target per slot level.'),
  S('Floating Disk', 1, 'Conjuration', 'W', 'Action', '30 ft', '1 hour', 'A 3-ft disk of force hovers at your side and carries up to 500 lb, following you around. (Tenser’s.) Ritual.', 'R'),
  S('Thunderwave', 1, 'Evocation', 'DWBS', 'Action', 'Self (15-ft cube)', 'Instant', 'A boom of thunder from your body: creatures in a 15-ft cube make a CON save, 2d8 thunder and pushed 10 ft — half damage on a save. Loud. VERY loud.', undefined, '+1d8 per slot level.'),
  S('Unseen Servant', 1, 'Conjuration', 'WBK', 'Action', '60 ft', '1 hour', 'An invisible, mindless helper (STR 2, AC 10, 1 HP) that fetches, cleans, opens, and carries up to 20 lb at your command. Ritual.', 'R'),
  S('Witch Bolt', 1, 'Evocation', 'WSK', 'Action', '60 ft', 'Concentration, 1 min', 'A crackling arc: ranged spell attack, 2d12 lightning — then each turn, as a bonus action, 1d12 more while it lasts. // VERIFY 2024', 'C', '+1d12 per slot level.'),

  // ============================================================ LEVEL 2
  S('Aid', 2, 'Abjuration', 'DBCPR', 'Action', '30 ft', '8 hours', 'Up to three creatures gain +5 to their maximum AND current hit points for eight hours.', undefined, '+5 HP per slot level.'),
  S('Alter Self', 2, 'Transmutation', 'WS', 'Action', 'Self', 'Concentration, 1 hour', 'Reshape yourself: breathe water and swim, change your appearance entirely, or grow natural weapons (1d6, magical). Switch modes as an action.', 'C'),
  S('Animal Messenger', 2, 'Enchantment', 'DBR', 'Action', '30 ft', '24 hours', 'A Tiny beast carries a 25-word message to a place you name and a person you describe. Ritual.', 'R'),
  S('Arcane Lock', 2, 'Abjuration', 'W', 'Action', 'Touch', 'Until dispelled', 'A door, chest, or gate is magically locked. You (and creatures you name) pass freely; everyone else needs Knock or a much harder break.'),
  S('Arcane Vigor', 2, 'Abjuration', 'WS', 'Bonus action', 'Self', 'Instant', 'Spend one or two of your Hit Dice to heal yourself, adding your spellcasting modifier to each. // VERIFY 2024', undefined, 'One more Hit Die per slot level.'),
  S('Augury', 2, 'Divination', 'DWCB', '1 min', 'Self', 'Instant', 'Cast bones, cards, or shells and ask about a course of action within 30 minutes: Weal, Woe, both, or nothing. Ritual.', 'R'),
  S('Barkskin', 2, 'Transmutation', 'DR', 'Bonus action', 'Touch', '1 hour', 'A creature’s skin toughens like bark: its AC can’t be lower than 17. // VERIFY 2024 (bonus action, no concentration)'),
  S('Beast Sense', 2, 'Divination', 'DR', 'Action', 'Touch', 'Concentration, 1 hour', 'See and hear through a willing beast’s senses until you end it. Ritual.', 'CR'),
  S('Blindness/Deafness', 2, 'Transmutation', 'WBCS', 'Action', '120 ft', '1 min', 'One creature makes a CON save or is Blinded or Deafened (your choice) for a minute, saving again each turn.', undefined, 'One more target per slot level.'),
  S('Blur', 2, 'Illusion', 'WS', 'Action', 'Self', 'Concentration, 1 min', 'Your outline wavers: attacks against you have disadvantage (unless the attacker sees through illusions or doesn’t use sight).', 'C'),
  S('Cloud of Daggers', 2, 'Conjuration', 'WBSK', 'Action', '60 ft', 'Concentration, 1 min', 'A 5-ft cube fills with spinning blades: 4d4 slashing to anything that enters or starts its turn there. // VERIFY 2024', 'C', '+2d4 per slot level.'),
  S('Continual Flame', 2, 'Evocation', 'DWC', 'Action', 'Touch', 'Until dispelled', 'A torch-bright flame that never burns, never eats fuel, and never goes out — on an object you touch. Costs 50 gp of ruby dust.'),
  S('Crown of Madness', 2, 'Enchantment', 'WBSK', 'Action', '120 ft', 'Concentration, 1 min', 'A humanoid makes a WIS save or is Charmed and must attack a creature you choose before moving. Costs your action each turn to keep. // VERIFY', 'C'),
  S('Darkness', 2, 'Evocation', 'WSK', 'Action', '60 ft', 'Concentration, 10 min', 'A 15-ft sphere of magical darkness even darkvision can’t pierce. Cast on an object and it moves with it.', 'C'),
  S('Darkvision', 2, 'Transmutation', 'DWSR', 'Action', 'Touch', '8 hours', 'A willing creature sees in the dark (60 ft) as if it were dim light, for eight hours.'),
  S('Detect Thoughts', 2, 'Divination', 'WBS', 'Action', 'Self', 'Concentration, 1 min', 'Read the surface thoughts of a creature within 30 ft; probe deeper (WIS save) for what it’s hiding. It knows you’re in there if it saves.', 'C'),
  S('Dragon’s Breath', 2, 'Transmutation', 'WS', 'Bonus action', 'Touch', 'Concentration, 1 min', 'A willing creature can exhale a 15-ft cone of acid, cold, fire, lightning, or poison as an action: DEX save, 3d6 damage. // VERIFY', 'C', '+1d6 per slot level.'),
  S('Enhance Ability', 2, 'Transmutation', 'DWBCS', 'Action', 'Touch', 'Concentration, 1 hour', 'One creature gains advantage on checks with an ability you choose (STR also carries more; CON gives 2d6 temp HP). // VERIFY 2024', 'C', 'One more creature per slot level.'),
  S('Enlarge/Reduce', 2, 'Transmutation', 'DWS', 'Action', '30 ft', 'Concentration, 1 min', 'A creature or object doubles in size (advantage on STR checks and saves, +1d4 weapon damage) or halves (disadvantage, −1d4). Unwilling targets get a CON save.', 'C'),
  S('Find Traps', 2, 'Divination', 'DCR', 'Action', '120 ft', 'Instant', 'You sense whether a trap is present within line of sight — and the general nature of the danger — but not exactly where.'),
  S('Flame Blade', 2, 'Evocation', 'D', 'Bonus action', 'Self', 'Concentration, 10 min', 'A scimitar of fire in your hand: melee spell attack, 3d6 fire; sheds light. // VERIFY 2024', 'C', '+1d6 per two slot levels.'),
  S('Flaming Sphere', 2, 'Evocation', 'DWS', 'Action', '60 ft', 'Concentration, 1 min', 'A 5-ft ball of fire you roll 30 ft as a bonus action: creatures it ends next to make a DEX save, 2d6 fire (half on a save). Ignites things.', 'C', '+1d6 per slot level.'),
  S('Gentle Repose', 2, 'Necromancy', 'WCP', 'Action', 'Touch', '10 days', 'A corpse is protected from decay and from rising as undead, and its time limit for being raised is paused. Ritual.', 'R'),
  S('Gust of Wind', 2, 'Evocation', 'DWS', 'Action', 'Self (60-ft line)', 'Concentration, 1 min', 'A strong wind blows in a 60-ft line: creatures make a STR save or are pushed 15 ft; movement against it costs double; it snuffs flames and clears fog.', 'C'),
  S('Heat Metal', 2, 'Transmutation', 'DB', 'Action', '60 ft', 'Concentration, 1 min', 'A metal object glows red-hot: whoever touches it takes 2d8 fire, and drops it (or has disadvantage) unless they pass a CON save. Repeat as a bonus action each turn.', 'C', '+1d8 per slot level.'),
  S('Hold Person', 2, 'Enchantment', 'DWBCSK', 'Action', '60 ft', 'Concentration, 1 min', 'A humanoid makes a WIS save or is Paralyzed — melee hits are automatic critical hits. It saves again at the end of each of its turns.', 'C', 'One more target per slot level.'),
  S('Invisibility', 2, 'Illusion', 'WBSK', 'Action', 'Touch', 'Concentration, 1 hour', 'A creature you touch vanishes, along with what it wears and carries — until it attacks or casts a spell.', 'C', 'One more creature per slot level.'),
  S('Knock', 2, 'Transmutation', 'WBS', 'Action', '60 ft', 'Instant', 'One lock, bar, or arcane lock on a door, chest, or shackle springs open — with a loud KNOCK heard 300 ft away.'),
  S('Lesser Restoration', 2, 'Abjuration', 'DBCPR', 'Bonus action', 'Touch', 'Instant', 'End one condition on a creature: Blinded, Deafened, Paralyzed, or Poisoned. // VERIFY 2024 (bonus action)'),
  S('Levitate', 2, 'Transmutation', 'WS', 'Action', '60 ft', 'Concentration, 10 min', 'A creature or object (up to 500 lb) floats up to 20 ft into the air and hangs there; you move it 20 ft a turn. Unwilling targets get a CON save.', 'C'),
  S('Locate Animals or Plants', 2, 'Divination', 'DBR', 'Action', 'Self', 'Instant', 'Name a kind of beast or plant: you sense the nearest one within 5 miles, and which way. Ritual.', 'R'),
  S('Locate Object', 2, 'Divination', 'DWBCPR', 'Action', 'Self', 'Concentration, 10 min', 'Picture or name an object: sense the direction to it if it’s within 1,000 ft. Lead blocks it.', 'C'),
  S('Magic Mouth', 2, 'Illusion', 'WB', '1 min', '30 ft', 'Until dispelled', 'An object grows a mouth that speaks a 25-word message when a trigger you set occurs. Ritual.', 'R'),
  S('Magic Weapon', 2, 'Transmutation', 'WPR', 'Bonus action', 'Touch', '1 hour', 'A nonmagical weapon becomes +1 to attack and damage. // VERIFY 2024 (bonus action, no concentration)', undefined, '+2 at 3rd–5th slot, +3 at 6th+.'),
  S('Acid Arrow', 2, 'Evocation', 'W', 'Action', '90 ft', 'Instant', 'A shimmering green arrow: ranged spell attack, 4d4 acid now and 2d4 more at the end of the target’s next turn (half now, none later, on a miss). (Melf’s.)', undefined, '+1d4 to each per slot level.'),
  S('Mind Spike', 2, 'Divination', 'WSK', 'Action', '60 ft', 'Concentration, 1 hour', 'A spike of psychic pain: WIS save, 3d8 psychic (half on a save) — and you always know where the target is while it lasts.', 'C', '+1d8 per slot level.'),
  S('Mirror Image', 2, 'Illusion', 'WSK', 'Action', 'Self', '1 min', 'Three illusory duplicates of you flicker around you; attacks that would hit you may hit a copy instead (roll to see). Each copy pops when struck.'),
  S('Moonbeam', 2, 'Evocation', 'D', 'Action', '120 ft', 'Concentration, 1 min', 'A 5-ft-radius shaft of pale light falls from above: creatures that enter it or start their turn in it make a CON save, 2d10 radiant (half on a save); shapechangers who fail revert. Move it 60 ft as a bonus action. // VERIFY 2024', 'C', '+1d10 per slot level.'),
  S('Misty Step', 2, 'Conjuration', 'WSK', 'Bonus action', 'Self', 'Instant', 'Silver mist — and you’re 30 ft away, anywhere you can see. Bonus action. The escape hatch.'),
  S('Arcanist’s Magic Aura', 2, 'Illusion', 'W', 'Action', 'Touch', '24 hours', 'Disguise a creature or object’s magical nature: change what Detect Magic sees, or how a creature reads to spells that sense type. (Nystul’s.)'),
  S('Pass without Trace', 2, 'Abjuration', 'DR', 'Action', 'Self (30-ft)', 'Concentration, 1 hour', 'You and everyone within 30 ft gain +10 to Stealth checks and leave no tracks. The whole party, a shadow.', 'C'),
  S('Phantasmal Force', 2, 'Illusion', 'WBS', 'Action', '60 ft', 'Concentration, 1 min', 'Plant a 10-ft-cube illusion in one creature’s mind: INT save or it believes it utterly, and takes 2d6 psychic a turn if the illusion “hurts” it.', 'C'),
  S('Protection from Poison', 2, 'Abjuration', 'DCPR', 'Action', 'Touch', '1 hour', 'Neutralize one poison in the target; for an hour it has advantage on saves against poison and resistance to poison damage.'),
  S('Ray of Enfeeblement', 2, 'Necromancy', 'WSK', 'Action', '60 ft', 'Concentration, 1 min', 'A black beam of weakness: CON save or the target’s STR-based attacks deal half damage. // VERIFY 2024', 'C'),
  S('Rope Trick', 2, 'Transmutation', 'W', 'Action', 'Touch', '1 hour', 'A rope rises into the air and an invisible extradimensional room opens at its top — eight creatures can hide inside for an hour.'),
  S('Scorching Ray', 2, 'Evocation', 'WS', 'Action', '120 ft', 'Instant', 'Three rays of fire, aimed however you like: each is a ranged spell attack for 2d6 fire.', undefined, '+1 ray per slot level.'),
  S('See Invisibility', 2, 'Divination', 'WBS', 'Action', 'Self', '1 hour', 'You see invisible creatures and objects, and into the Ethereal Plane, for an hour.'),
  S('Shatter', 2, 'Evocation', 'WBSK', 'Action', '60 ft', 'Instant', 'A painful ringing burst in a 10-ft sphere: CON save, 3d8 thunder (half on a save). Nonmagical objects take it too — and creatures of stone or metal have disadvantage.', undefined, '+1d8 per slot level.'),
  S('Spider Climb', 2, 'Transmutation', 'WSK', 'Action', 'Touch', 'Concentration, 1 hour', 'A willing creature walks up walls and across ceilings, hands free, at its normal speed.', 'C'),
  S('Spike Growth', 2, 'Transmutation', 'DR', 'Action', '150 ft', 'Concentration, 10 min', 'A 20-ft-radius patch of ground sprouts hidden thorns: difficult terrain, and 2d4 piercing per 5 ft moved through it. Hard to spot (Perception vs your DC).', 'C'),
  S('Suggestion', 2, 'Enchantment', 'WBSK', 'Action', '30 ft', 'Concentration, 8 hours', 'Suggest a reasonable-sounding course of action (a sentence or two): WIS save or the creature does it. Obvious harm to itself breaks it.', 'C'),
  S('Summon Beast', 2, 'Conjuration', 'DR', 'Action', '90 ft', 'Concentration, 1 hour', 'Call a bestial spirit — air, land, or water — that fights beside you on your turn. Its stats scale with the slot. // VERIFY 2024', 'C', 'Stronger per slot level.'),
  S('Web', 2, 'Conjuration', 'WS', 'Action', '60 ft', 'Concentration, 1 hour', 'A 20-ft cube of sticky webbing: difficult terrain, and creatures make a DEX save or are Restrained. Fire burns it away.', 'C'),

  // ============================================================ LEVEL 3
  S('Animate Dead', 3, 'Necromancy', 'WC', '1 min', '10 ft', 'Instant', 'Raise a corpse or bones as a skeleton or zombie that obeys you for 24 hours (recast to keep control). Not a spell for the gentle. // VERIFY', undefined, '+2 undead per slot level.'),
  S('Aura of Vitality', 3, 'Abjuration', 'DCP', 'Action', 'Self (30-ft)', 'Concentration, 1 min', 'A healing aura: each turn, as a bonus action, one creature in it regains 2d6 HP. // VERIFY 2024', 'C'),
  S('Bestow Curse', 3, 'Necromancy', 'WBC', 'Action', 'Touch', 'Concentration, 1 min', 'Touch a creature: WIS save or cursed — disadvantage with one ability, or on attacks against you, or it wastes turns, or takes 1d8 necrotic when you hurt it.', 'C', 'Longer at higher slots; 5th+ needs no concentration.'),
  S('Blink', 3, 'Transmutation', 'WS', 'Action', 'Self', '1 min', 'Roll at the end of each turn: on 11+, you vanish to the Ethereal Plane until your next turn — untouchable — and reappear where you like within 10 ft.'),
  S('Call Lightning', 3, 'Conjuration', 'D', 'Action', '120 ft', 'Concentration, 10 min', 'A storm cloud gathers overhead; each turn (action) call a bolt down on a point: creatures within 5 ft make a DEX save, 3d10 lightning (half on a save). Outdoors in a real storm: 4d10.', 'C', '+1d10 per slot level.'),
  S('Clairvoyance', 3, 'Divination', 'WBCS', '10 min', '1 mile', 'Concentration, 10 min', 'An invisible sensor appears somewhere familiar or described within a mile; you see OR hear through it.', 'C'),
  S('Conjure Animals', 3, 'Conjuration', 'DR', 'Action', '60 ft', 'Concentration, 10 min', 'A pack of spectral animals races around you: creatures you choose within 10 ft of you at the end of your turn (or that you move next to) make a DEX save, 3d10 slashing. // VERIFY 2024 rework', 'C', '+1d10 per slot level.'),
  S('Counterspell', 3, 'Abjuration', 'WSK', 'Reaction (when a creature casts)', '60 ft', 'Instant', 'Interrupt a spell as it’s cast: the caster makes a CON save or the spell fails and the slot is wasted. // VERIFY 2024'),
  S('Daylight', 3, 'Evocation', 'DCPRS', 'Action', '60 ft', '1 hour', 'A 60-ft-radius sphere of sunlight-bright light (dim for 60 more). Dispels magical darkness of lower level.'),
  S('Dispel Magic', 3, 'Abjuration', 'DWBCPSK', 'Action', '120 ft', 'Instant', 'End spells on a creature, object, or area: automatic for 3rd level and below; higher needs a check (your modifier vs 10 + spell level).', undefined, 'Automatically ends spells up to the slot level.'),
  S('Elemental Weapon', 3, 'Transmutation', 'DPR', 'Action', 'Touch', 'Concentration, 1 hour', 'A weapon becomes +1 and deals +1d4 acid, cold, fire, lightning, or thunder.', 'C', '+2/+2d4 at 5th slot; +3/+3d4 at 7th.'),
  S('Fear', 3, 'Illusion', 'WBSK', 'Action', 'Self (30-ft cone)', 'Concentration, 1 min', 'A phantasm of each creature’s worst fear: creatures in a 30-ft cone make a WIS save or drop what they hold and are Frightened, fleeing you.', 'C'),
  S('Feign Death', 3, 'Necromancy', 'DWBC', 'Action', 'Touch', '1 hour', 'A willing creature appears dead to all inspection: blind, incapacitated, speed 0, resistant to all damage but psychic. Ritual.', 'R'),
  S('Fireball', 3, 'Evocation', 'WS', 'Action', '150 ft', 'Instant', 'A bead of fire streaks out and blooms into a 20-ft-radius explosion: DEX save, 8d6 fire (half on a save). Ignites everything flammable. Mind your friends.', undefined, '+1d6 per slot level.'),
  S('Fly', 3, 'Transmutation', 'WSK', 'Action', 'Touch', 'Concentration, 10 min', 'A willing creature gains a flying speed of 60 ft.', 'C', 'One more creature per slot level.'),
  S('Gaseous Form', 3, 'Transmutation', 'WSK', 'Action', 'Touch', 'Concentration, 1 hour', 'A willing creature becomes a misty cloud: fly 10 ft, slip through cracks, resist nonmagical damage, can’t attack or cast. // VERIFY', 'C'),
  S('Glyph of Warding', 3, 'Abjuration', 'WBC', '1 hour', 'Touch', 'Until dispelled or triggered', 'Inscribe a hidden glyph on a surface or object; when triggered it explodes (5d8 of a damage type in a 20-ft sphere) or casts a stored spell. Costs 200 gp of diamond dust.', undefined, '+1d8 explosion / higher stored spell per slot level.'),
  S('Haste', 3, 'Transmutation', 'WS', 'Action', '30 ft', 'Concentration, 1 min', 'A willing creature moves double speed, gains +2 AC, advantage on DEX saves, and one extra (limited) action each turn. When it ends, they lose a turn.', 'C'),
  S('Hypnotic Pattern', 3, 'Illusion', 'WBSK', 'Action', '120 ft', 'Concentration, 1 min', 'A twisting pattern of colour in a 30-ft cube: creatures make a WIS save or are Charmed, Incapacitated, speed 0 — until hurt or shaken.', 'C'),
  S('Tiny Hut', 3, 'Evocation', 'WB', '1 min', 'Self (10-ft)', '8 hours', 'A 10-ft dome of force rises around you and up to nine others: safe from weather and outside creatures for eight hours. (Leomund’s.) Ritual.', 'R'),
  S('Lightning Bolt', 3, 'Evocation', 'WS', 'Action', 'Self (100-ft line)', 'Instant', 'A stroke of lightning in a 100-ft line: DEX save, 8d6 lightning (half on a save). Ignites flammable objects.', undefined, '+1d6 per slot level.'),
  S('Magic Circle', 3, 'Abjuration', 'WCPK', '1 min', '10 ft', '1 hour', 'A 10-ft cylinder that celestials, elementals, fey, fiends, or undead (your pick) can’t willingly cross or affect through, and have disadvantage attacking through. Costs 100 gp of holy water/powdered silver.'),
  S('Major Image', 3, 'Illusion', 'WBSK', 'Action', '120 ft', 'Concentration, 10 min', 'An illusion up to a 20-ft cube with sight, sound, smell, and temperature — moving as you direct. Investigation vs your DC sees through it.', 'C', 'At 6th slot: lasts until dispelled, no concentration.'),
  S('Meld into Stone', 3, 'Transmutation', 'DC', 'Action', 'Touch', '8 hours', 'Step into a stone surface and hide inside it, hearing faintly what happens outside. Ritual.', 'R'),
  S('Nondetection', 3, 'Abjuration', 'WBR', 'Action', 'Touch', '8 hours', 'A creature or object is hidden from divination magic and scrying sensors for eight hours. Costs 25 gp of diamond dust.'),
  S('Phantom Steed', 3, 'Illusion', 'W', '1 min', '30 ft', '1 hour', 'A quasi-real horse (speed 100 ft) that carries a rider you choose. Ritual.', 'R'),
  S('Plant Growth', 3, 'Transmutation', 'DBR', 'Action or 8 hours', '150 ft', 'Instant', 'Action: plants in a 100-ft radius become thick overgrowth (movement costs ×4). 8 hours: enrich the land — a half-mile radius yields double harvest for a year.'),
  S('Protection from Energy', 3, 'Abjuration', 'DWCRS', 'Action', 'Touch', 'Concentration, 1 hour', 'A willing creature gains resistance to one damage type: acid, cold, fire, lightning, or thunder.', 'C'),
  S('Remove Curse', 3, 'Abjuration', 'WCPK', 'Action', 'Touch', 'Instant', 'All curses on a creature or object end. A cursed magic item stays cursed but releases its owner.'),
  S('Revivify', 3, 'Necromancy', 'DCPR', 'Action', 'Touch', 'Instant', 'A creature dead less than a minute returns to life with 1 HP. Costs 300 gp of diamonds — the diamond is consumed. Keep one in the pouch.'),
  S('Sending', 3, 'Evocation', 'WBC', 'Action', 'Unlimited', '1 round', 'Send a 25-word message to a creature you know, anywhere on the same plane; it can reply in 25 words.'),
  S('Sleet Storm', 3, 'Conjuration', 'DWS', 'Action', '150 ft', 'Concentration, 1 min', 'Freezing rain and sleet in a 40-ft-radius, 20-ft-tall cylinder: heavily obscured, difficult terrain, creatures fall Prone (DEX save), and concentration is hard to hold in it.', 'C'),
  S('Slow', 3, 'Transmutation', 'WS', 'Action', '120 ft', 'Concentration, 1 min', 'Up to six creatures in a 40-ft cube make a WIS save or are Slowed: half speed, −2 AC and DEX saves, no reactions, one action OR bonus action a turn.', 'C'),
  S('Speak with Dead', 3, 'Necromancy', 'WBC', 'Action', '10 ft', '10 min', 'A corpse with a mouth answers up to five questions — briefly, cryptically, and only what it knew in life. // VERIFY'),
  S('Speak with Plants', 3, 'Transmutation', 'DBR', 'Action', 'Self (30-ft)', '10 min', 'Plants within 30 ft can talk to you and answer questions; you can command them to part, tangle, or release.'),
  S('Stinking Cloud', 3, 'Conjuration', 'WBS', 'Action', '90 ft', 'Concentration, 1 min', 'A 20-ft sphere of nauseating yellow gas: creatures in it make a CON save at the start of their turn or spend it retching (Poisoned, no action). // VERIFY 2024', 'C'),
  S('Summon Fey', 3, 'Conjuration', 'DWRK', 'Action', '90 ft', 'Concentration, 1 hour', 'Call a fey spirit — fuming, mirthful, or tricksy — that fights beside you and can teleport. Its stats scale with the slot. // VERIFY 2024', 'C', 'Stronger per slot level.'),
  S('Summon Undead', 3, 'Necromancy', 'WK', 'Action', '90 ft', 'Concentration, 1 hour', 'Call an undead spirit — ghostly, putrid, or skeletal — that fights beside you. // VERIFY 2024', 'C', 'Stronger per slot level.'),
  S('Tongues', 3, 'Divination', 'WBCSK', 'Action', 'Touch', '1 hour', 'The target understands any spoken language, and is understood by any creature that knows a language.'),
  S('Vampiric Touch', 3, 'Necromancy', 'WSK', 'Action', 'Self', 'Concentration, 1 min', 'Your touch drains life: melee spell attack, 3d6 necrotic, and you heal half. Repeat as an action each turn while it lasts. // VERIFY', 'C', '+1d6 per slot level.'),
  S('Water Breathing', 3, 'Transmutation', 'DWSR', 'Action', '30 ft', '24 hours', 'Up to ten willing creatures can breathe underwater for a day. (The stairs Below don’t need it. The market might.) Ritual.', 'R'),
  S('Water Walk', 3, 'Transmutation', 'DCSR', 'Action', '30 ft', '1 hour', 'Up to ten willing creatures walk on water, acid, mud, snow, or lava as if solid ground. Ritual.', 'R'),
  S('Wind Wall', 3, 'Evocation', 'DR', 'Action', '120 ft', 'Concentration, 1 min', 'A wall of roaring wind up to 50 ft long, 15 high: 4d8 bludgeoning (STR save, half) to anything in it as it rises; arrows and small flyers can’t cross it.', 'C'),
]

/** Look up one spell by name (exact). */
export const spellByName = (name: string): Spell | undefined => SPELLBOOK.find((s) => s.name === name)

/** All spells a class can learn, at or below a spell level. */
export function spellsFor(classLetter: string, maxLevel: number): Spell[] {
  return SPELLBOOK.filter((s) => s.classes.includes(classLetter) && s.level <= maxLevel)
}

/** Class name → letter used in `classes`. */
export const CLASS_LETTER: Record<string, string> = {
  Druid: 'D',
  Wizard: 'W',
  Bard: 'B',
  Cleric: 'C',
  Sorcerer: 'S',
  Warlock: 'K',
  Paladin: 'P',
  Ranger: 'R',
}

/**
 * How many spells a prepared caster keeps ready, by character level.
 * 2024 tables. // VERIFY (Druid & Wizard: 4·5·6·7·9 for levels 1–5;
 * cantrips: 2 (Druid) / 3 (Wizard) at level 1, +1 at level 4.)
 */
export const PREPARED_COUNT: Record<string, Record<number, number>> = {
  Druid: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 9, 6: 10, 7: 11, 8: 12 },
  Wizard: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 9, 6: 10, 7: 11, 8: 12 },
}
export const CANTRIP_COUNT: Record<string, Record<number, number>> = {
  Druid: { 1: 2, 4: 3, 10: 4 },
  Wizard: { 1: 3, 4: 4, 10: 5 },
}
export function cantripsKnown(klass: string, level: number): number {
  const table = CANTRIP_COUNT[klass]
  if (!table) return 0
  let n = 0
  for (const [l, c] of Object.entries(table)) if (Number(l) <= level) n = c
  return n
}
/** A wizard's spellbook holds 6 spells at level 1 and gains 2 per level. // VERIFY */
export const wizardBookSize = (level: number): number => 6 + 2 * (level - 1)
