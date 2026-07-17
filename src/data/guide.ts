// ✦ Beginner rules guide — ported verbatim from the verified prototype.

export interface GuideEntry {
  t: string
  b: string
}

export const GUIDE: GuideEntry[] = [
  { t: 'What is D&D, in one breath?', b: 'A group story. The Dungeon Master describes the world; you say what your character does; dice decide the uncertain parts. There is no winning or losing — only what happens next.' },
  { t: 'The one rule that runs everything', b: "When the outcome is uncertain, roll a 20-sided die (the d20), add your bonus, and try to meet a target number the DM sets. Higher is better. That's an ability check, an attack roll, and a saving throw — same idea, three uses." },
  { t: 'Advantage & disadvantage', b: "Circumstances favor you? Roll two d20s, keep the higher (advantage). Circumstances hurt you? Keep the lower (disadvantage). That's the whole rule." },
  { t: 'Your key numbers', b: 'Armor Class (AC): how hard you are to hit — enemies must roll your AC or higher. Hit Points (HP): your fight left in you; at 0 you fall unconscious. Initiative: a DEX roll at the start of combat that sets the turn order.' },
  { t: 'Your turn in combat', b: 'You get: Movement (up to your speed), one Action (attack, cast, dash, hide, help…), maybe one Bonus Action (if something grants it), and one Reaction per round (used on other people\'s turns, like an opportunity attack). You can split movement around your action.' },
  { t: 'Spellcasting basics', b: "Cantrips are free — cast them all day. Leveled spells burn spell slots, which come back when you rest. If a spell says 'Concentration,' you can only hold one such spell at a time, and taking damage may break it." },
  { t: 'Resting', b: 'Short Rest (1 hour): spend Hit Dice to heal; some abilities recharge. Long Rest (8 hours): back to full HP and all spell slots. You get one long rest per day.' },
  { t: 'Dropping to 0 HP', b: 'You fall unconscious and make death saving throws: d20, no bonus. 10+ is a success, 9 or less a failure. Three successes: you stabilize. Three failures: you die. Any healing wakes you instantly — even 1 HP.' },
  { t: 'Heroic Inspiration', b: 'A reward for great roleplay or luck of the species (humans get it every morning). Spend it to reroll any die. You can only bank one at a time — use it!' },
  { t: 'The only real etiquette', b: "Say what you TRY, not what happens. Let the dice and the DM finish the sentence. And when in doubt: 'Can I try to…?' is always a legal move." },
]
