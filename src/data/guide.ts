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

  // ---- more candles, lit as the party needed them ----
  { t: 'The three rules of the Fair', b: 'Everything the ones Below do runs on three lines. They never take — they get you to say yes. You can only give away what is yours; give away something other people are holding pieces of, and the promise has a crack in it — and the day the real owners stand together and ask, it comes home. And a song can be sung back together, if the pieces are gathered in one place. That is the whole campaign, and now you know it.' },
  { t: 'What is a song?', b: 'The bit of you that other people are keeping safe. It lives in everyone who loves the thing — which is why it can never simply be taken. If someone asks you for a piece of yours: it is yours to give, and yours to refuse. Think before you say yes.' },
  { t: 'Bargains & the Ledger', b: 'When something offers you a deal, it arrives on your phone as a contract. Read every line — especially the price. Sign with your finger and it is sealed; the Ledger keeps every deal you have ever made and what you still owe. Nothing signed is ever secret from the one who holds it.' },
  { t: 'Concentration, in one breath', b: 'Some spells (marked ◐) need holding. One at a time. Take damage and your sheet asks for a CON save — DC 10 or half the damage, whichever is higher. Fail and the spell ends. Casting another concentration spell ends the first.' },
  { t: 'Spell slots, plainly', b: 'Cantrips are free forever. Leveled spells burn a slot of that level or higher; a higher slot often makes the spell bigger (the card says how). Slots come back after a long rest. Your sheet spends them for you when you tap Cast.' },
  { t: 'Prepared spells (druids & wizards)', b: 'Each morning you choose which spells you can cast that day. Druids pick from the whole list; wizards pick from their book. Tap ✎ change spells on your sheet after a long rest. Circle spells and school spells are always ready and never count.' },
  { t: 'Wild Shape, plainly', b: 'Druids from level 2 can become a beast (bonus action, 2 uses per long rest). You keep your mind, your allies, and your alignment; you take on the beast’s body and HP. Drop to 0 as a beast and you snap back to yourself. Ask your DM for the beast’s stats.' },
  { t: 'Two weapons', b: 'With a light weapon in each hand, when you attack with one you can attack once with the other as a bonus action — no ability modifier on that damage unless a feature says so. // VERIFY 2024' },
  { t: 'Grappling & shoving', b: 'Instead of a normal hit, grab or push: your Athletics against their Athletics or Acrobatics. A grappled creature can’t move; a shoved one goes 5 ft back or Prone. Halflings and fairies: yes, you can. Size matters — one size larger at most.' },
  { t: 'Cover', b: 'A low wall or a friend gives half cover (+2 AC and DEX saves). A pillar or a doorframe, three-quarters (+5). Fully behind something: can’t be targeted at all. The Midway is full of things to duck behind.' },
  { t: 'Hiding', b: 'Get out of sight, then Hide (an action, Stealth vs DC 15). While hidden, attacks against you have disadvantage and yours have advantage — until you attack, cast with a voice, or step into the open.' },
  { t: 'Falling & jumping', b: 'Falls hurt: 1d6 per 10 ft, and you land Prone. Long jump: your Strength score in feet with a run-up. High jump: 3 + STR mod. Fairies fly, which settles most of it.' },
  { t: 'Light and dark', b: 'Bright light is normal. Dim light: seeing things is harder (disadvantage on Perception). Darkness: you are effectively blind unless you have darkvision. Lanterns and Light cantrips are not decoration.' },
  { t: 'Temporary hit points', b: 'A shield of extra HP that soaks damage first. They don’t add — you keep the higher — and they vanish at a long rest.' },
  { t: 'Exhaustion', b: 'A creeping tiredness in levels: each level is −2 on every d20 roll and −5 ft speed. A long rest removes one level. Don’t drink the bog water. // VERIFY 2024' },
  { t: 'Rituals', b: 'A spell marked ritual can be cast without spending a slot if you take 10 extra minutes. Detect Magic, Speak with Animals, Find Familiar — free, if you have the time.' },
  { t: 'Being knocked out — our table’s rule', b: 'In the Dry Anchor brawl every hit was a knockout hit: 0 HP means out cold, not dying. Out on the roads it’s real again — but remember, at this table foes take, delay, and repossess. They rarely kill. And death is a negotiation.' },
  { t: 'Leveling up', b: 'Your DM announces it and an envelope arrives. Open your sheet: it shows what wakes at the new level. At level 3 you choose your path — read all four. At level 4, grow: raise abilities or take a feat. Tap Rise, and your sheet is new.' },
  { t: 'Rolling with the sheet', b: 'Tap any ability for a save, any skill for a check, the attack to swing, a spell to cast. Set advantage or disadvantage first — the toggle above the attack. 🎲 in the top bar rolls anything else: any die, any number, any modifier.' },
  { t: 'Talking to your DM', b: '"Can I try to…?" is always legal. "What do I know about…?" is always legal. "What does it look like?" is always legal. Your DM wants to say yes and roll for it.' },
  { t: 'Sealed whispers', b: 'Sometimes only YOUR phone buzzes: a whisper the others don’t get. Break the seal, read it — some fade after a minute — and decide for yourself what to share. Secrets are allowed. So is telling.' },
]
