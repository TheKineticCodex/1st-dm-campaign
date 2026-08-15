// ✦ Rules at your thumb — the actions you can take on a turn, and a plain-
// language glossary. D&D 2024, in the app's voice (mechanics paraphrased,
// SRD 5.2 where it applies). // VERIFY on any figure that matters.

export interface RefEntry {
  name: string
  /** One-line rule, readable mid-scene. */
  text: string
  /** Optional: what it costs on your turn. */
  cost?: 'action' | 'bonus action' | 'reaction' | 'movement' | 'free'
  /** Search keywords beyond the name. */
  keys?: string
}

/** What you can do on your turn. Every one of these is legal, every turn, for everyone. */
export const ACTIONS: RefEntry[] = [
  { name: 'Attack', cost: 'action', text: 'Make one attack (two, from Fighter 5) with a weapon or your fists: d20 + your attack bonus vs their AC. Hit? Roll damage. Then describe it.', keys: 'hit weapon strike fists unarmed' },
  { name: 'Cast a Spell', cost: 'action', text: 'Cast a spell with a casting time of one action. Some spells are a bonus action or a reaction — the card says. One leveled spell per turn if you also cast a bonus-action spell. // VERIFY', keys: 'magic slot cantrip' },
  { name: 'Dash', cost: 'action', text: 'Move again — gain extra movement equal to your speed. Run.', keys: 'run move sprint' },
  { name: 'Disengage', cost: 'action', text: 'Your movement doesn’t provoke opportunity attacks this turn. Slip away clean.', keys: 'retreat escape opportunity' },
  { name: 'Dodge', cost: 'action', text: 'Until your next turn, attacks against you have disadvantage and you have advantage on DEX saves — as long as you can see and aren’t incapacitated.', keys: 'defend evade' },
  { name: 'Help', cost: 'action', text: 'Give a friend advantage on their next ability check (for a task you could help with), or on their next attack against a creature within 5 ft of you.', keys: 'assist aid ally advantage' },
  { name: 'Hide', cost: 'action', text: 'Make a DEX (Stealth) check vs DC 15 while out of sight — succeed and you’re hidden: unseen, and attacks against you have disadvantage. // VERIFY 2024', keys: 'stealth sneak invisible' },
  { name: 'Ready', cost: 'action', text: 'Set a trigger and a response ("when it comes through the door, I swing"). When the trigger happens, you act as a reaction. Readied spells cost concentration.', keys: 'prepare wait trigger reaction' },
  { name: 'Search', cost: 'action', text: 'Make a WIS (Perception / Insight / Medicine / Survival) check to find something — a hidden creature, a lie, a wound, a trail. // VERIFY 2024', keys: 'look find perceive investigate' },
  { name: 'Utilize', cost: 'action', text: 'Use an object: pull a lever, drink a potion, throw a bottle. (Interacting with ONE thing per turn — drawing a sword, opening a door — is free.) // VERIFY 2024', keys: 'use object interact potion' },
  { name: 'Influence', cost: 'action', text: 'Try to change a creature’s mind: CHA (Persuasion / Deception / Intimidation) or WIS (Animal Handling). Roleplay it; the DM sets the DC. // VERIFY 2024', keys: 'persuade convince talk deceive intimidate' },
  { name: 'Study', cost: 'action', text: 'Make an INT check (Arcana / History / Investigation / Nature / Religion) to recall or work something out. // VERIFY 2024', keys: 'recall know think investigate' },
  { name: 'Magic (Feature)', cost: 'action', text: 'Use a magical feature that says it takes an action — Wild Shape, Channel-style abilities, some species traits.', keys: 'feature ability' },
  { name: 'Grapple', cost: 'action', text: 'Instead of a normal attack, grab: your STR (Athletics) vs their STR (Athletics) or DEX (Acrobatics). Win and their speed is 0 while you hold on. // VERIFY 2024 (unarmed-strike option)', keys: 'grab hold wrestle' },
  { name: 'Shove', cost: 'action', text: 'Instead of a normal attack, push: same contest as a grapple. Win and they’re pushed 5 ft or knocked Prone — your choice. // VERIFY 2024', keys: 'push knock prone' },
  { name: 'Opportunity Attack', cost: 'reaction', text: 'When a creature you can see moves out of your reach, you can make one melee attack against it. Once per round (it’s your reaction).', keys: 'reaction leave reach' },
  { name: 'Move', cost: 'movement', text: 'Up to your speed, split around your action however you like. Standing up from Prone costs half your speed. Difficult terrain costs double.', keys: 'speed walk climb swim' },
  { name: 'Bonus Action', cost: 'bonus action', text: 'Only if something gives you one — a spell (Healing Word, Misty Step), a feature (Second Wind, Cunning Action), an off-hand attack. One per turn.', keys: 'extra quick' },
  { name: 'Reaction', cost: 'reaction', text: 'One per round, on anyone’s turn, when a trigger fires: an opportunity attack, Shield, Counterspell, a readied action, Parry.', keys: 'trigger interrupt' },
]

/** The words that come up. */
export const GLOSSARY: RefEntry[] = [
  { name: 'Advantage / Disadvantage', text: 'Roll two d20s: keep the higher (advantage) or the lower (disadvantage). They cancel one for one; you never roll more than two.', keys: 'adv dis' },
  { name: 'Armor Class (AC)', text: 'How hard you are to hit. An attack hits if the roll meets or beats your AC.', keys: 'ac defense' },
  { name: 'Hit Points (HP)', text: 'Your fight left in you. At 0 you fall unconscious and start making death saves. Healing from 0 wakes you.', keys: 'hp health' },
  { name: 'Temporary Hit Points', text: 'A buffer that absorbs damage first and doesn’t stack — take the higher. Gone at a long rest.', keys: 'temp thp' },
  { name: 'Difficulty Class (DC)', text: 'The number to beat on a check or save. Easy 10 · Medium 15 · Hard 20. Spell save DC = 8 + proficiency + your spellcasting modifier.', keys: 'dc target' },
  { name: 'Proficiency Bonus', text: 'Your training: +2 at levels 1–4, +3 at 5–8. Added to attacks with weapons you know, skills you know, saves you’re proficient in, and spell DCs.', keys: 'prof' },
  { name: 'Expertise', text: 'Double proficiency on a skill. Some classes and feats grant it.', keys: 'double' },
  { name: 'Saving Throw', text: 'A roll to resist something: d20 + ability modifier (+ proficiency if it’s one of your class’s saves) vs the DC.', keys: 'save resist' },
  { name: 'Ability Check', text: 'A roll to do something uncertain: d20 + ability modifier (+ proficiency if you have the skill) vs the DC.', keys: 'check skill' },
  { name: 'Initiative', text: 'A DEX check at the start of combat that sets the turn order, highest first.', keys: 'order combat start' },
  { name: 'Critical Hit', text: 'A natural 20 on an attack always hits and rolls double the damage dice. A natural 1 always misses.', keys: 'crit nat 20 natural' },
  { name: 'Concentration', text: 'Some spells need you to hold them. You can hold one at a time. When you take damage, make a CON save (DC 10 or half the damage, whichever is higher) or lose it. // VERIFY', keys: 'hold spell maintain' },
  { name: 'Spell Slots', text: 'Fuel for leveled spells. A spell uses a slot of its level or higher (higher often makes it stronger). Cantrips are free. Slots return on a long rest.', keys: 'slot cast' },
  { name: 'Ritual', text: 'A spell marked ritual can be cast without a slot if you take 10 extra minutes. Detect Magic over lunch, for free.', keys: 'free slow' },
  { name: 'Short Rest', text: 'One hour. Spend Hit Dice to heal (roll the die + CON mod each). Some abilities come back (Action Surge, Superiority Dice).', keys: 'rest hour hit dice' },
  { name: 'Long Rest', text: 'Eight hours. Full HP, all spell slots, all abilities, half your Hit Dice back. One per day.', keys: 'rest sleep night' },
  { name: 'Hit Dice', text: 'One per level (a d10 for fighters, d8 for druids, d6 for wizards). Spend them on a short rest to heal.', keys: 'hd heal rest' },
  { name: 'Death Saves', text: 'At 0 HP: roll a d20 each turn, no bonus. 10+ succeeds, 9− fails. Three successes: stable. Three failures: dead. A natural 20: you wake with 1 HP. Damage at 0 HP is a failure (two if it’s a crit).', keys: 'dying unconscious death' },
  { name: 'Heroic Inspiration', text: 'A reward for great play (humans get it every morning). Spend it to reroll any d20 you just rolled. You can only hold one.', keys: 'inspiration reroll' },
  { name: 'Cover', text: 'Half cover +2 AC and DEX saves · three-quarters cover +5 · full cover can’t be targeted. Stand behind things.', keys: 'hide behind wall' },
  { name: 'Difficult Terrain', text: 'Mud, rubble, undergrowth, a crowd: every foot costs two.', keys: 'slow terrain' },
  { name: 'Resistance / Vulnerability', text: 'Resistance halves damage of a type; vulnerability doubles it; immunity ignores it.', keys: 'half double damage type' },
  { name: 'Reach', text: 'Melee is 5 ft unless a weapon says otherwise (a whip or a polearm reaches 10).', keys: 'melee distance' },
  { name: 'Range', text: 'Ranged attacks have a normal range and a long range (disadvantage past the first). Shooting with an enemy adjacent: disadvantage.', keys: 'distance shoot' },
  { name: 'Unarmed Strike', text: 'Punch, kick, headbutt: d20 + STR + proficiency to hit; 1 + STR mod damage. Or grapple or shove instead. // VERIFY 2024', keys: 'punch fists' },
  { name: 'Improvised Weapon', text: 'A bottle, a chair, a lantern: d4 damage (bludgeoning, usually), thrown 20/60 ft. The Dry Anchor knows this one.', keys: 'bottle chair throw' },
  { name: 'Prone', text: 'On the ground. Melee attacks against you have advantage, ranged have disadvantage; you attack with disadvantage. Standing costs half your movement.', keys: 'down knocked stand' },
  { name: 'Hidden / Unseen', text: 'If a creature can’t see you, your attacks against it have advantage and its attacks against you have disadvantage. Attacking reveals you.', keys: 'stealth invisible' },
  { name: 'Light & Darkness', text: 'Bright light: normal. Dim light: disadvantage on Perception by sight. Darkness: effectively blinded (unless you have darkvision).', keys: 'dark dim see' },
  { name: 'Darkvision', text: 'See in darkness as if it were dim light out to the listed range — in grey.', keys: 'see dark' },
  { name: 'Falling', text: '1d6 bludgeoning per 10 ft, max 20d6, and you land Prone. Feather Fall exists for a reason.', keys: 'fall drop height' },
  { name: 'Jumping', text: 'Long jump: your STR score in feet with a run-up (half standing). High jump: 3 + STR mod. // VERIFY', keys: 'leap' },
  { name: 'Exhaustion', text: 'Levels 1–10; each level is −2 to every d20 roll and −5 ft speed. A long rest removes one. Level 10 is death. // VERIFY 2024', keys: 'tired fatigue' },
  { name: 'Surprise', text: 'If you didn’t notice the danger before initiative, you have disadvantage on your initiative roll. // VERIFY 2024', keys: 'ambush' },
  { name: 'Attunement', text: 'Some magic items need a short rest spent bonding with them before they work. You can attune to three at once.', keys: 'magic item' },
  { name: 'Weapon Mastery', text: 'Fighters (and some others) get a special property from certain weapons — Cleave, Push, Sap, Slow, Topple, Vex… Ask your DM which your weapon has. // VERIFY 2024', keys: 'mastery property' },
]
