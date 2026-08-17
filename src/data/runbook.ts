// 🧭 The Runbook — how to walk five players through the whole campaign.
//
// One page of "how to run" you can read in five minutes, then every scene
// in order: what it is for, the beats to hit, what the players might do
// and how you answer, who they might fight (with the numbers you need),
// which fights are the big ones, and what carries forward. Scene keys are
// the story-timeline titles, so the Book can mark "you are here."
//
// Voice: plain, short, yours. Canon: campaign/the-story.md. Monster
// numbers are SRD 5.2 from memory — glance at the block once before the
// night; a point of AC either way never ruined a game.

export interface Foe {
  name: string
  /** What it looks like at THIS table (reskin of the SRD block in `block`). */
  look: string
  block: string
  ac: number
  hp: number
  speed: string
  /** The attack line you'll actually roll. */
  attack: string
  special?: string
  tactics: string
}

export interface Battle {
  code: string
  name: string
  major?: boolean
  when: string
  force: string
  arena: string
  tricks: string[]
  goal: string
  retreat: string
  win: string
  loss: string
  draw?: string
  foes: Foe[]
}

export interface RunScene {
  /** Exact story-timeline title (marks "you are here"). */
  key: string
  act: number
  played?: boolean
  where: string
  goal: string
  oneBreath: string
  beats: string[]
  theyMight: { if: string; then: string }[]
  players: { who: string; note: string }[]
  battles: Battle[]
  exit: string
  timing?: string
}

// ------------------------------------------------------------ the primer

export const RUN_PRIMER: { title: string; lines: string[] }[] = [
  {
    title: 'Your whole job, in three moves',
    lines: [
      'Read the gold words. Ask "What do you do?" Answer honestly. That is the loop; everything else is garnish.',
      'When they try something: "Yes — give me a roll." Easy 10 · Medium 15 · Hard 20. Their phone adds the numbers.',
      'When you feel lost: "Hold that thought — everyone else, what are you doing?" Buys a minute, every time.',
    ],
  },
  {
    title: 'The three rules of the bargain (say them when asked)',
    lines: [
      '1 · They never take. They get you to say yes.',
      '2 · You can only give away what is yours. Give away something others hold pieces of too, and the promise has a crack in it — the day the real owners stand together and ask, it comes home.',
      '3 · Sing the pieces together and the song comes home.',
      'If a player says "wait — I thought they can\'t take things", they have understood the campaign. Smile, then say the true half: PEACHES — they did not take it; somebody said yes for her long before she was born, because the Sea promised away pieces that were not only its to promise. That is the crack, and it is the whole reason you can win. BILLY — he said yes; he was young, it seemed clever, and he does not remember doing it, which is what saying yes to them looks like afterwards, every time.',
    ],
  },
  {
    title: 'The five doors (every scene has them)',
    lines: [
      'Fight · Talk · Sneak · Bargain · Go sideways. Each scene below lists what happens behind each door.',
      'You do not need to prepare their choice. You need to know what is behind the five doors. It is always there.',
    ],
  },
  {
    title: 'How fights work here',
    lines: [
      'The Ones Below cannot be fought — killing a keeper sends what she kept Below forever. Foes take, delay, repossess; they never murder.',
      'Every battle has a RETREAT line. It is your throttle. Pull it early; never apologise.',
      'A PC at 0 HP is offered a bargain by the nearest foe. Pookie warns one round early and drags one drowning friend clear, once per fight.',
      'Big fights ("major") get the iPad map, a light, and a clock. Minor ones are seasoning — one round of drama, then move on.',
    ],
  },
  {
    title: 'Levels & pace',
    lines: [
      'Level 2 at the Three Gates (end of the carnival night). Level 3 the first time the party costs the Ones Below something real (each road has a ✦ LEVEL 3 scene). Level 4–5 across the other roads.',
      'Table → ✦ Level up the party sends the ceremony to every phone.',
      'One road ≈ 2–3 sessions. All three roads, then the Moon-Night. About ten to twelve nights in all.',
    ],
  },
  {
    title: 'Every session opens with the Moon',
    lines: [
      'S3 · "A fingernail-paring of moon over the sand. Thin. Nothing yet."',
      'S5 · "The moon is a hand\'s-breadth wider than it should be. The gulls won\'t look at it."',
      'S7 · "The moon is wrong. Everyone in Saltmere has stopped saying so."',
      'S9 · "The dry harbor floods for one minute at midnight, then drains. The chapel bell rang once, alone."',
      'Finale · "The moon fills the sky. The Sea is standing up on its hind legs to reach her."',
    ],
  },
  {
    title: 'Tells you can lean on',
    lines: [
      'Pookie runs away when worried — use it before anything bad.',
      'Billy checks the chain on his book when frightened. Never explain it. On the Mirror road, it is gone.',
      'Never explain a song. Show two pieces pull, once, and stop.',
      'Freya Moon\'s pendant stirs near anything taken. Give her one thing growing where it shouldn\'t, every session.',
    ],
  },
  {
    title: 'Two lines to have in your pocket',
    lines: [
      'The Twins\' slate: ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE.',
      'The Buyer, mid-roads, over tea: "The Sea wasn\'t robbed. It asked us. It wanted to forget her. Who are you to give it back its grief?"',
    ],
  },
]

// ------------------------------------------------------------ the cast, in one line each

export const RUN_CAST: { who: string; line: string; where: string }[] = [
  { who: 'Brother Hush & Sister Hum — the Twins of the Toll', line: 'Hush writes 3–5 words on slate; Hum half-sings. Polite. Never lie. The gate — and the last scene.', where: 'Gate · Three Gates · Moon-Night' },
  { who: 'Grandmother Grey-Gill', line: 'Old gills under a shawl. Sold her own NAME for her tent — bubbles when she tries to say who has it. Reads confessions back as prophecy.', where: 'Her tent' },
  { who: 'The carousel operator', line: 'Hums the Sea\'s song with a hole in it, weeps, notices neither. The organ IS the taken song.', where: 'The Missing Note' },
  { who: 'The Appraiser', line: 'Absent — a coat on a hook. "He\'s out. Appraising." Priced things ashore.', where: 'A closed tent' },
  { who: 'The jar-woman', line: 'Keeper of the Bog. Voices in green jars. Behind on her rent to the Buyer — will deal. All three keepers say his name out loud; whichever road they walk first is where the players learn it.', where: 'Bog road' },
  { who: 'The mirror-man', line: 'Keeper of the Hall. Everyone\'s best moment on loop. Believes keeping is love: "In here, nothing is ever lost."', where: 'Mirror road' },
  { who: 'The market-mother', line: 'Keeper of the drowned market. Sells "one scale, for sentiment," smiling. Must be beaten by the rules — never killed.', where: 'Under-Sea road' },
  { who: 'The Buyer', line: 'The one face. Courteous, punctual, unseen until the roads. Never lies. Glimpsed at each road\'s climax; speaks once, over tea.', where: 'Every climax · the tea' },
  { who: 'Old Griff · Maddy Brine · Tarn · Pip', line: 'Saltmere. Griff saw the lights forty years ago and tore the page from his tide log; will say so if asked directly.', where: 'Home' },
]

// ------------------------------------------------------------ foes (shared blocks)

const F = {
  flyingSword: (look: string): Foe => ({ name: 'Flying Sword', look, block: 'Flying Sword (SRD, CR ¼)', ac: 17, hp: 17, speed: 'fly 50', attack: '+3, 1d8+1 slashing', special: 'Immune to poison/psychic; blindsight 60; falls if it can\'t fly.', tactics: 'Harries whoever holds stall property. Drop the loot and it loses interest at once.' }),
  animatedArmor: (look: string): Foe => ({ name: 'Animated Armor', look, block: 'Animated Armor (SRD, CR 1)', ac: 18, hp: 33, speed: '25', attack: 'two slams, +4, 1d6+2 each', special: 'Immune poison/psychic; blindsight 60.', tactics: 'Folds flat and slides under stalls; goes for crates, not people.' }),
  tree: (look: string): Foe => ({ name: 'Awakened Tree', look, block: 'Awakened Tree (SRD, CR 2)', ac: 13, hp: 59, speed: '20', attack: 'slam +6, 3d6+4 bludgeoning', special: 'Vulnerable to fire. Looks like an ordinary tree until it moves.', tactics: 'Grapples the LOUDEST player first (that is its toll). Fire terrifies it into parley. Singing calms it — it is starving for music.' }),
  shrub: (look: string): Foe => ({ name: 'Awakened Shrub', look, block: 'Awakened Shrub (SRD, CR 0)', ac: 9, hp: 10, speed: '20', attack: 'rake +1, 1d4−1', special: 'Vulnerable to fire.', tactics: 'Cowards. Rustle menacingly, flee at the first flame.' }),
  weird: (look: string): Foe => ({ name: 'Water Weird', look, block: 'Water Weird (SRD, CR 3)', ac: 13, hp: 58, speed: 'swim 60', attack: 'constrict +5, 3d6+3; grappled + restrained (escape DC 13), pulled 5 ft', special: 'Invisible in water. Bound to a place — cannot leave the barge\'s shadow / the window\'s glass.', tactics: 'One warning lash first, always. Then it holds one person and pulls. Break its anchor (the light, the bell) and it flails.' }),
  zombie: (look: string): Foe => ({ name: 'Zombie', look, block: 'Zombie (SRD, CR ¼)', ac: 8, hp: 22, speed: '20', attack: 'slam +3, 1d6+1', special: 'Undead Fortitude: drops to 1 HP instead of 0 on a CON save DC 5+damage (not radiant/crit).', tactics: 'Slow, tragic. They remember being people — a freed voice from a broken crate makes them stop and listen for a round.' }),
  specter: (look: string): Foe => ({ name: 'Specter', look, block: 'Specter (SRD, CR 1)', ac: 12, hp: 22, speed: 'fly 50 (hover)', attack: 'life drain +4, 3d6 necrotic; CON save DC 10 or max HP reduced by the damage until a long rest', special: 'Incorporeal; resists most damage; sunlight-sensitive.', tactics: 'Mimics Billy\'s real spells from tonight (read your dice feed aloud). One genuinely honest sentence from Billy staggers it — the table decides what counts.' }),
  greenHag: (look: string): Foe => ({ name: 'Green Hag', look, block: 'Green Hag (SRD, CR 3)', ac: 17, hp: 82, speed: '30', attack: 'claws +6, 2d8+4', special: 'Mimicry (any voice, Insight DC 14 to tell); Invisible Passage (turns invisible until it attacks); at-will minor illusion & dancing lights.', tactics: 'Narrates the fight as a review, aloud. Slips between mirrors. Parleys the instant his catalog is threatened with ink.' }),
  shadow: (look: string): Foe => ({ name: 'Shadow', look, block: 'Shadow (SRD, CR ½)', ac: 12, hp: 16, speed: '40', attack: 'strength drain +4, 2d6+2 necrotic; STR score −1d4 (0 = dies); returns after rest', special: 'Amorphous; hides in dim light; sunlight-weak.', tactics: 'Only touches anyone holding kept things. Put the thing down and they let go.' }),
  seaHag: (look: string): Foe => ({ name: 'Sea Hag', look, block: 'Sea Hag (SRD, CR 2)', ac: 14, hp: 52, speed: '30, swim 40', attack: 'claws +5, 2d6+3', special: 'Horrific Appearance: WIS save DC 11 or frightened (once per creature per day). Death Glare: a frightened creature makes WIS DC 11 or drops to 0 HP.', tactics: 'Her opening bid is her face. KILLING HER BREAKS THE SALE — the tail defaults to the Buyer. Beat her by the rules: the gavel, the crack in the promise, or out-bid.' }),
  merfolk: (look: string): Foe => ({ name: 'Merfolk', look, block: 'Merfolk (SRD, CR ⅛)', ac: 11, hp: 11, speed: '10, swim 40', attack: 'spear +2, 1d6 (1d8 two-handed)', special: 'Amphibious.', tactics: 'Grapple, escort, apologise. They never aim to kill; whistle recall the moment anyone is dying.' }),
  reefShark: (look: string): Foe => ({ name: 'Reef Shark', look, block: 'Reef Shark (SRD, CR ½)', ac: 12, hp: 22, speed: 'swim 40', attack: 'bite +4, 1d8+2', special: 'Pack tactics.', tactics: 'On a leash. Menaces; bites only what bleeds.' }),
  quippers: (look: string): Foe => ({ name: 'Swarm of Quippers', look, block: 'Swarm of Quippers (SRD, CR 1)', ac: 13, hp: 28, speed: 'swim 40', attack: 'bites +5, 4d4 (2d4 when bloodied)', special: 'Blood frenzy; swarm (resists most damage).', tactics: 'The back-current. Loud, brief, survivable.' }),
  ravens: (): Foe => ({ name: 'Swarm of Ravens', look: 'the ravens that stole Billy\'s page', block: 'Swarm of Ravens (SRD, CR ¼)', ac: 12, hp: 24, speed: 'fly 50', attack: 'beaks +5, 2d6 (1d6 bloodied)', tactics: 'Scatter when the page is dropped back. Their nest is full of stolen receipts.' }),
  frog: (): Foe => ({ name: 'Giant Frog', look: 'the frog-pond game, left open', block: 'Giant Frog (SRD, CR ¼)', ac: 11, hp: 18, speed: '30, swim 30', attack: 'bite +3, 1d6+1, grappled', special: 'Swallow a Small grappled target.', tactics: 'Comic. The barker pays hush-money in scrip afterwards.' }),
  wolf: (): Foe => ({ name: 'Wolf', look: 'bog-matted lantern poachers, apologetic', block: 'Wolf (SRD, CR ¼)', ac: 13, hp: 11, speed: '40', attack: 'bite +4, 2d4+2; STR save DC 11 or prone', special: 'Pack tactics.', tactics: 'Cutting the causeway lights. Flee at a raised voice. Drop a map marking the barge dock.' }),
  crocodile: (): Foe => ({ name: 'Crocodile', look: 'what lives off the causeway', block: 'Crocodile (SRD, CR ½)', ac: 12, hp: 19, speed: '20, swim 30', attack: 'bite +4, 1d10+2, grappled', tactics: 'Only if they wade off the planks. A dropped green jar is in its gullet — a free voice, very slimy.' }),
  wisp: (): Foe => ({ name: 'Will-o\'-Wisp', look: 'the pretty lights off the road', block: 'Will-o\'-Wisp (SRD, CR 2)', ac: 19, hp: 22, speed: 'fly 50', attack: 'shock +4, 2d8 lightning', special: 'Invisible at will; consumes life.', tactics: 'AVOIDABLE. Flees bright light. This is the bog\'s one lethal mistake and it announces itself. Following the lights is the choice.' }),
  armorFrame: (): Foe => ({ name: 'Animated Armor', look: 'a frame-warden — a mirror\'s gilt frame walking', block: 'Animated Armor (SRD, CR 1)', ac: 18, hp: 33, speed: '25', attack: 'two slams +4, 1d6+2', tactics: 'One per uninvited broken mirror. The freed moment owes them a favour afterwards.' }),
  rug: (): Foe => ({ name: 'Rug of Smothering', look: 'the red carpet — telegraph it: the carpet breathes', block: 'Rug of Smothering (SRD, CR 2)', ac: 12, hp: 33, speed: '10', attack: 'smother +5, 2d6+3; grappled, restrained, blinded, can\'t breathe', special: 'Damage to it while smothering also hits the victim.', tactics: 'Beneath it: the floor plan of the Hall.' }),
  mimic: (): Foe => ({ name: 'Mimic', look: 'the vanity table with the perfect mirror', block: 'Mimic (SRD, CR 2)', ac: 12, hp: 58, speed: '15', attack: 'pseudopod +5, 1d8+3 (adhesive); bite +5, 1d8+3 +1d8 acid', special: 'Adhesive; false appearance.', tactics: 'It has been eating acquisitions. Coughs up a velvet pouch: three teeth, a wedding ring that hums, a ticket stub for a show that hasn\'t happened yet.' }),
  crab: (look: string): Foe => ({ name: 'Giant Crab', look, block: 'Giant Crab (SRD, CR ⅛)', ac: 15, hp: 13, speed: '30, swim 30', attack: 'claw +3, 1d6+1, grappled (escape DC 11)', tactics: 'Herd or fight. Two claws, one target each.' }),
}

// ------------------------------------------------------------ the scenes

export const RUN_SCENES: RunScene[] = [
  // ------------------------------------------------ Act 1 · Saltmere (played)
  {
    key: 'Talent Night at the Dry Anchor',
    act: 1,
    played: true,
    where: 'The Dry Anchor, Saltmere',
    goal: 'Introductions by weapon-name; every player performs; the Appraiser prices it all.',
    oneBreath: 'A tavern talent night that is secretly an inventory. Five songs walked in the same door; somebody wrote that down.',
    beats: ['Maddy takes weapons by name (that IS the introductions).', 'Each act: describe it, one check of choice DC 10 — success or glorious disaster, the room cheers either way.', 'The stranger in the corner never drinks, never claps, writes after each act.'],
    theyMight: [{ if: 'They pick a fight early', then: 'One warning from Old Griff. The real brawl waits.' }, { if: 'They read the stranger', then: 'Insight DC 13: his mug has NEVER emptied. First dread, earned.' }],
    players: [{ who: 'Everyone', note: 'The Appraiser writes after EVERY act — he is not here for one of them, he is here because all five are.' }],
    battles: [],
    exit: 'Judges "deliberate" → the Intermission Games.',
  },
  {
    key: 'The Intermission Games',
    act: 1,
    played: true,
    where: 'The Dry Anchor',
    goal: 'Rehearse every mechanic the brawl needs, as bar games.',
    oneBreath: 'Arm-wrestle Griff, darts at AC 10/13/15, Maddy\'s order, the tankard tower.',
    beats: ['Run whichever games the table bites on — two if long, four if short.'],
    theyMight: [{ if: 'They shove', then: 'One Griff-glare. Save it for the vote.' }],
    players: [],
    battles: [],
    exit: 'The vote comes back wrong → the brawl.',
  },
  {
    key: 'The Brawl at the Dry Anchor ✦ tutorial',
    act: 1,
    played: true,
    where: 'The Dry Anchor',
    goal: 'Teach the fight loop with a knockout rule and a moves menu.',
    oneBreath: 'Waves of four brawlers, then Griff as the "boss". Zero HP = out cold, no dying.',
    beats: ['Announce the knockout rule proudly.', 'R1 initiative + attacks · R2 shove/grapple/improvised · R3 advantage & Help · then Griff.'],
    theyMight: [{ if: 'They swing on the chandelier', then: 'DEX/STR DC 12 — nat 20 is the Perfect Swing; Maddy rings the bell.' }],
    players: [{ who: 'Billy', note: 'Blinded Tarn here (session 1). It matters later: the Appraiser will price Tarn\'s sight.' }],
    battles: [],
    exit: 'The Hum in the Cellar.',
  },
  {
    key: 'The Hum in the Cellar',
    act: 1,
    played: true,
    where: 'Under the Dry Anchor',
    goal: 'The tone flips. Cold wall, barnacles on the inside, a chalk carousel.',
    oneBreath: 'Nothing to fight. The wall does not care.',
    beats: ['Fire Peaches\'s and Freya Moon\'s whispers at the wall-touch.'],
    theyMight: [{ if: 'They break the wall', then: 'Salt water, a hum, and nothing behind it. It was never a door.' }],
    players: [],
    battles: [],
    exit: 'Up the stairs — the tide has gone out.',
  },
  {
    key: 'The Tide Goes Out (cliffhanger)',
    act: 1,
    played: true,
    where: 'The harbour, empty',
    goal: 'End session 1 on the gasp.',
    oneBreath: 'No sea. Distant lights on the sand. Snuff the lanterns.',
    beats: ['One minute of gasping. END.'],
    theyMight: [],
    players: [],
    battles: [],
    exit: 'The Morning After.',
  },
  {
    key: 'The Morning After',
    act: 1,
    played: true,
    where: 'Saltmere, dry',
    goal: 'The lantern box; each lantern visits its player; the pull toward the Fair.',
    oneBreath: 'Fish gasping in the shallows, wreckers on the boats, the lighthouse keeper swearing the horizon moved.',
    beats: ['Griff, if asked directly, tells the forty-years-ago story ONCE — save it if it doesn\'t come up; it can wait for a road.'],
    theyMight: [{ if: 'They go to the tide pools', then: 'Giant crabs — herd or fight.' }, { if: 'They stop the wreckers', then: 'Two wreckers strip boats; they fold if scared.' }],
    players: [{ who: 'Everyone', note: 'Each lantern visits its player, then all of them tug toward the sand.' }],
    battles: [
      {
        code: 'm0', name: 'Tide-pool crabs · wreckers', when: 'If they poke the shallows / the boats', force: '2 giant crabs · 2 wreckers (AC 12, HP 11, club +2 1d6)', arena: 'Rock pools and stranded hulls', tricks: ['Wreckers fold if frightened.'], goal: 'Colour, not danger.', retreat: 'Whenever it stops being fun.', win: 'A crab dinner and a wrecker\'s confession: "the lights on the sand had a fence."', loss: 'Nobody loses this.', foes: [F.crab('tide-pool crabs the size of dogs')],
      },
    ],
    exit: '→ THE GATE. Session 3 opens here.',
  },

  // ------------------------------------------------ Act 1 · the carnival night
  {
    key: 'The Gate of Paper Lanterns',
    act: 1,
    where: 'A mile out on the wet sand',
    goal: 'The toll: one honest answer each, aloud. WRITE THEM DOWN.',
    oneBreath: 'A fence of paper lanterns, a gate, two figures — Hush with the slate, Hum half-singing.',
    timing: 'Session 3 open · 20–30 min',
    beats: [
      'Read the Moon line for session 3 first.',
      'Read the gold words. Hush holds up the slate: WELCOME. Then: ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE.',
      'Ask each player, warmly, out loud, one honest answer. (Table → 🕯 The Toll can run this on the phones if the room is shy.) Write every answer in Notes — they come back at the very end in the players\' own words.',
      'The gate opens. Set the room to 🎪 The Getting Fair.',
    ],
    theyMight: [
      { if: 'They fight the Twins', then: 'The Twins don\'t resist; the lanterns dim around violence until it stops. Toll doubles.' },
      { if: 'They lie', then: 'Hum stops singing. Hush writes: THAT WAS NOT AN ANSWER. Ask again. No penalty but the silence.' },
      { if: 'They climb the fence', then: 'They arrive MARKED — every lantern watches them all night. Whispers land harder.' },
      { if: 'They bargain', then: 'Hush accepts a secret instead: "one secret, of Our choosing, later." Note who took it.' },
    ],
    players: [{ who: 'Everyone', note: 'Five honest answers on paper. This is the campaign\'s last scene, seeded.' }],
    battles: [],
    exit: '→ The Games of the Midway.',
  },
  {
    key: 'The Games of the Midway',
    act: 1,
    where: 'The Midway',
    goal: 'Play. Pay Billy in Wren\'s handwriting. Let them find the crates marked BELOW.',
    oneBreath: 'Stalls, the Snail Derby, prizes that are a little wrong.',
    timing: '40–60 min · use the game booth freely',
    beats: [
      'Run the Snail Derby (Table → 🐌). Prizes: a paper crown that never tears (advantage vs charm, 1/day), bottled applause (uncork: Heroic Inspiration).',
      'Draw the Missing Piece / the Fortune Wheel are perfect here — whisper the prizes.',
      'At a prize stall Billy is paid with a loose PAGE in Wren\'s handwriting. Stallkeep shrugs: "It washed up." Do not explain.',
      'If anyone snoops behind a stall: crates marked BELOW — the same glass as Tarn\'s bottle.',
    ],
    theyMight: [
      { if: 'They chase the raven that steals the page', then: 'm1 — Swarm of Ravens. Page back + a nest of stolen receipts.' },
      { if: 'They open the frog-pond tent', then: 'm2 — two giant frogs; the barker pays hush-money in scrip.' },
      { if: 'They interfere with the Empty Costumes / rob a stall', then: 'CARN-A. Costumes only want the stock; dropping it ends everything.' },
      { if: 'They gossip', then: '"The Toll-Twins never sleep." "Don\'t hum near the carousel." "Grey-Gill knows you before you sit."' },
    ],
    players: [{ who: 'Billy', note: 'The page. Proof someone knew him before. He checks the chain on his book.' }],
    battles: [
      {
        code: 'CARN-A', name: 'The Empty Costumes', when: 'They rob a stall or block the porters', force: '5 empty costumes (Flying Swords) — one each. 250 XP at level 1; see Tonight’s path', arena: 'The Midway map — prize shelves (climbable, collapsible), a ring-toss stall (nets), lantern strings (cut = 10-ft dark patches)',
        tricks: ['Costumes ignore anyone not holding stall property.', 'Dropping the loot ends their interest instantly — teach it: they only want what is "theirs".', 'The Armor folds flat and slides under stalls.'],
        goal: 'Carry the crates to the back fence.', retreat: 'Stock secured, or the Armor destroyed.',
        win: 'The stallkeep gifts Billy the page freely + a discount forever.', loss: 'The crates (and Billy\'s page) go BELOW — recoverable at the drowned market.', draw: 'Half the stock gone; the stallkeep whispers the word "tithe" for the first time.',
        foes: [F.flyingSword('a carnival costume\'s empty sleeve holding a prop rapier'), F.animatedArmor('a full costume with nobody inside — a porter')],
      },
      { code: 'm1', name: 'The ravens', when: 'They chase the page-thief', force: '1 swarm', arena: 'Rooftops of the stalls', tricks: ['Drop the page back on the ground and they scatter.'], goal: 'Keep the page.', retreat: 'When the page is dropped.', win: 'Page + the nest of receipts (a random clue).', loss: 'The page is at the stall tomorrow anyway.', foes: [F.ravens()] },
      { code: 'm2', name: 'The frog pond', when: 'The tent is open', force: '2 giant frogs', arena: 'A tent, a pond, a barker hiding', tricks: ['Comic. Small folk can be swallowed — Philip, mind.'], goal: 'Get out of the tent.', retreat: 'When the barker screams.', win: 'Hush-money in scrip.', loss: 'Wet.', foes: [F.frog()] },
    ],
    exit: '→ Grandmother Grey-Gill\'s tent.',
  },
  {
    key: "Grandmother Grey-Gill's Tent",
    act: 1,
    where: 'The heart of the Fair',
    goal: 'She reads them their own confessions as prophecy. Nobody says the name-wound aloud.',
    oneBreath: 'Old gills under a shawl. She takes Peaches\'s hand first: "You walked in on borrowed feet, child."',
    timing: '30–40 min · the night\'s heart',
    beats: [
      'Set the room to 🕯 Inside a tent. Slow down.',
      'Fire the ✉ readings one at a time (Run the night → cues). Let each land in silence.',
      'When asked who bought her name: only bubbles come. She and Billy share the wound. Don\'t say it.',
      'She gives one true thing about the road ahead if asked kindly: "Three gates. One opens tonight. The others remember."',
    ],
    theyMight: [
      { if: 'They fight her', then: 'She yields at once; the tent weeps salt water until they leave. One fortune lost forever.' },
      { if: 'They try to buy her name back', then: 'She laughs until she cries. "Child, you have nothing they want. Yet."' },
      { if: 'They sneak the back', then: 'A shelf: five small lanterns, unlit, one for each of them. Nothing else.' },
    ],
    players: [{ who: 'Peaches', note: 'First. Borrowed feet.' }, { who: 'Billy', note: 'The name-wound, unspoken.' }, { who: 'Everyone', note: 'Their confession, back at them.' }],
    battles: [],
    exit: '→ The Missing Note.',
  },
  {
    key: 'The Missing Note',
    act: 1,
    where: 'The carousel',
    goal: 'The song with the hole. If Peaches hums along, the hunt begins — because of a choice at your table.',
    oneBreath: 'The organ plays the Sea\'s song and skips one note, every time. The operator weeps and doesn\'t notice.',
    timing: '15–25 min',
    beats: [
      'Play 🎠 the carousel from the soundboard and let it loop under everything.',
      'Do NOT warn Peaches. If she hums the missing note: play ♪ the missing note alone — three seconds of true silence — then every lantern in the Fair turns to look. Say that. Move on.',
      'If anyone else hums it: the same silence, then the lanterns look at HER anyway.',
      'The operator, if asked: hums along, weeps, "Lovely tune, isn\'t it. Always has been."',
    ],
    theyMight: [
      { if: 'They steal the organ', then: 'CARN-A with double costumes. The organ WANTS to go — it slides toward Peaches. If they get it out, let them keep it: they now carry the Sea\'s taken song and every road gets shorter and stranger.' },
      { if: 'They open the organ', then: 'A brass cylinder etched with a name they cannot read — bubbles form on the metal.' },
      { if: 'They talk to the horses', then: 'One horse is a seal-pup, carved. It hums the first three notes (play 🐟 the seal-pup).' },
    ],
    players: [{ who: 'Peaches', note: 'Her choice. Whatever she does, the lanterns know now.' }, { who: 'Freya Moon', note: 'The pendant stirs for the first time. Say only that.' }],
    battles: [
      { code: 'CARN-A′', name: 'The Empty Costumes, doubled', when: 'They take the organ', force: 'The Porter (Animated Armor run at HP 45) + 4 empty costumes — 400 XP at level 1; see Tonight’s path', arena: 'The carousel platform, turning; horses as cover', tricks: ['The platform keeps turning — every round the exits move.', 'The organ slides toward Peaches on its own.'], goal: 'Repossess the organ.', retreat: 'If the organ crosses the Fair\'s fence line, every costume stops at the line. Run, do not win.', win: 'They keep the song. Everything downstream is stranger.', loss: 'The organ back on the carousel; one personal item each as "restocking fee" — recoverable at the market.', foes: [F.flyingSword('an empty sleeve, prop rapier'), F.animatedArmor('a porter with nobody inside')] },
    ],
    exit: '→ Whispers in the Dark.',
  },
  {
    key: 'Whispers in the Dark',
    act: 1,
    where: 'The Fair, lanterns dimmed for the midnight show',
    goal: 'Five visions, one each, all walking toward the back fence.',
    oneBreath: 'Deliver, then wait.',
    timing: '10–15 min',
    beats: ['Fire all five vision whispers (60-second ephemeral). Say nothing while they read.', 'Then: "What do you share?" Let the table decide. Every vision walks toward the back fence.'],
    theyMight: [{ if: 'They chase a vision', then: 'It is always just past the next lantern. Then the fence.' }],
    players: [{ who: 'Everyone', note: 'Their lost thing, glimpsed, moving away.' }],
    battles: [],
    exit: '→ The Three Gates.',
  },
  {
    key: 'The Three Gates',
    act: 1,
    where: 'The back fence',
    goal: 'The choice. Level 2 on the crossing. The music ends the session, not you.',
    oneBreath: 'Slate: ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST.',
    timing: '20 min · END of session 3',
    beats: [
      'Green lanterns (the Bog: Freya Sun + Philip) · silver (the Hall of Mirrors: Billy + Philip) · blue (the Under-Sea: Peaches + Freya Moon). Each gate pulls its two.',
      'Let them argue. Do not help. Someone hears, from the gate not chosen: "we\'ll come back for yours."',
      'When they step through: Table → ✦ Level up the party (2). Play 🎠 the carousel; it fades as they cross. End.',
    ],
    theyMight: [
      { if: 'They split up', then: 'The gates close on the last one through each. Say it once, plainly, before they do it. If they insist: two roads at once is a session each, alternating — hard but possible.' },
      { if: 'They refuse all three', then: 'The Fair waits. Nothing happens. The tide does not come back. Let the silence do it.' },
    ],
    players: [{ who: 'Everyone', note: 'Two names on every gate. Whoever\'s gate is not chosen carries that.' }],
    battles: [],
    exit: '→ the chosen road (Act 2). All three, in time.',
  },

  // ------------------------------------------------ Act 2 · the Bog
  {
    key: 'The Whispering Causeway (Bog road)',
    act: 2,
    where: 'A road of floating lanterns over black water',
    goal: 'Voices in the water. Freya Sun hears one she KNOWS. Philip hears the false teacher preaching from the reeds.',
    oneBreath: 'The jar-woman\'s leaking shelves. Polite voices. A hedge at the end that hushes.',
    timing: 'Road session 1 · 60–90 min',
    beats: [
      'Set the room to 🌫 The Whispering Causeway. Read the Moon line.',
      'The voices: one knows a story — "the sea gave its song away, but a mermaid was born holding a piece of it, after." Let it drift past.',
      'Freya Sun: a voice from her list, in a jar somewhere ahead. Philip: preaching from the reeds — the false teacher, hollow. Whisper each privately.',
      'The hedge at the end wants a toll: one voice, temporarily (BOG-A). Singing to it works.',
    ],
    theyMight: [
      { if: 'They wade off the planks', then: 'b-m2 — a crocodile; a dropped jar in its gullet.' },
      { if: 'They follow the pretty lights', then: 'b-m3 — will-o\'-wisps. Announce the danger. Let them choose.' },
      { if: 'They cut down lanterns / meet the poachers', then: 'b-m1 — two wolves, apologetic; a map to the barge dock.' },
      { if: 'They talk to the water', then: 'The voices are grateful to be asked anything. One remembers the jar-woman\'s rent is due "on the hour, the barge, always the barge."' },
    ],
    players: [{ who: 'Freya Sun', note: 'A voice she knows. Do not say whose until she says it.' }, { who: 'Philip', note: 'The teacher\'s cadence, exactly right, empty inside. His warning of his own future.' }],
    battles: [
      { code: 'BOG-A', name: 'The Hedge That Hushes', when: 'The causeway\'s end', force: '1 Awakened Tree + 4 Awakened Shrubs (~490 XP · L2)', arena: '5-ft planks, black water both sides, hanging jars (throwable — each freed voice SCREAMS: the Tree is deafened a round)', tricks: ['It hushes the loudest first — grapple priority = whoever talks most.', 'Fire terrifies it into parley.', 'Singing to it works: it is starving for music (Hold the Note fits here).'], goal: 'A toll, not lives.', retreat: 'Toll paid, or burned twice.', win: 'The door opens; the jar-woman respects force: "you\'ll do."', loss: 'It takes a PC\'s voice as toll — recoverable inside (jar #1 on the left; she\'ll trade it back cheap — she thinks the Hedge overcharges).', foes: [F.tree('a topiary doorman, leaves like pursed lips'), F.shrub('cowardly hedge-clippings')] },
      { code: 'b-m1', name: 'Lantern poachers', when: 'They investigate cut lights', force: '2 wolves', arena: 'The planks', tricks: ['Flee at a raised voice.'], goal: 'Steal light.', retreat: 'A shout.', win: 'A poacher\'s map marking the barge dock.', loss: 'Dark patches on the road.', foes: [F.wolf()] },
      { code: 'b-m2', name: 'Off the causeway', when: 'They wade', force: '1 crocodile', arena: 'Black water', tricks: ['Pookie warns first.'], goal: 'A meal.', retreat: 'It sinks when hurt.', win: 'A jar from its gullet — a free voice.', loss: 'Wet, bitten, wiser.', foes: [F.crocodile()] },
      { code: 'b-m3', name: 'The pretty lights', when: 'They leave the road for the lights', force: '2 will-o\'-wisps', arena: 'Open bog', tricks: ['They flee bright light. This one can kill — say so through the fiction (a skeleton holding a lantern, smiling).'], goal: 'A drowning.', retreat: 'Any bright light.', win: 'Survival and a lesson.', loss: 'Someone at 0 HP is offered a bargain by the light.', foes: [F.wisp()] },
    ],
    exit: '→ The Jar-House.',
  },
  {
    key: 'The Jar-House ✦ LEVEL 3',
    act: 2,
    where: 'A house on stilts, shelves of humming green jars',
    goal: 'The proof. Deal with the jar-woman. Free a voice → Level 3.',
    oneBreath: 'She is behind on her rent to the Buyer and will deal. A jar hums back at Peaches and unlatches on its own.',
    timing: 'Road session 1–2 · 60 min',
    beats: [
      'THE PROOF, if it hasn\'t happened: a jar hums back at Peaches; the pendant warms; something small unlatches. Show it once. Never explain.',
      'The jar-woman deals. What she wants: something that hums. What she offers: any one jar. Freya Sun\'s voice is on the third shelf; Philip\'s teacher\'s convictions are a jar the size of a fist, dull.',
      'The Bargain (Table → ⚖) fits her exactly — she takes ONE and keeps the rest.',
      'Freeing any voice = LEVEL 3: the bog goes silent for one full minute, then a thousand jars whisper thank you. Send the level-up.',
    ],
    theyMight: [
      { if: 'They break jars in anger', then: 'b-m4 — one Shadow per jar; grief with claws. She stops trading.' },
      { if: 'They steal', then: 'Every jar screams at once. The barge comes early. Skip to The Rent Comes Due, with no allies.' },
      { if: 'They pay her rent for her', then: 'She weeps, gives them the jar of the Sea\'s song for nothing, and tells them the barge\'s hour. Best door — reward it.' },
      { if: 'They ask about the Buyer', then: '"Polite. Punctual. Comes on the hour with tea. I have never once seen him lie." Bubbles.' },
    ],
    players: [{ who: 'Freya Sun', note: 'Her voice, in a jar. Getting it back costs her nothing — that is the point they come for later.' }, { who: 'Philip', note: 'The teacher can be freed HERE — pour the dull jar back into him at the reeds. Or refused. His call.' }, { who: 'Peaches', note: 'The jar that hums back. Her note, recognising itself.' }],
    battles: [
      { code: 'b-m4', name: 'Grief with claws', when: 'A jar broken in anger', force: '1 Shadow per broken jar', arena: 'The shelves', tricks: ['Only touches whoever holds kept things.'], goal: 'To be held.', retreat: 'When the jar\'s owner is named aloud.', win: 'The shadow thins to a sigh.', loss: 'STR drained; the jar-woman closes shop.', foes: [F.shadow('a voice with nothing to say it')] },
    ],
    exit: '→ The Rent Comes Due.',
  },
  {
    key: 'The Rent Comes Due (Bog climax)',
    act: 2,
    where: 'The dock and the barge',
    goal: 'MAJOR BATTLE. The barge leaves on the hour regardless. Win the jarred piece of the song. See the Buyer.',
    oneBreath: 'A grey barge without a wake, poled by a coat with no one in it. Something in the water is bound to it.',
    timing: 'Road session 2–3 · 60–75 min · put a clock on the iPad',
    beats: [
      'Map on the stage: dock + barge. Light: 🌫 or 🌑 night. Fog on if you like.',
      'The Ferryman (the coat) has no stats — attack it and it hands you a receipt for one dignity.',
      'The barge leaves at the top of the hour REGARDLESS. Say the time every round.',
      'At the end, whatever happened: the Buyer, on the deck, taking tea. He nods. He knows Peaches. He does not speak. Not yet.',
    ],
    theyMight: [
      { if: 'They ring the tithe bell early', then: 'The Weird is stunned a round.' },
      { if: 'They break crates', then: 'Freed voices; the zombies stop and listen for a round.' },
      { if: 'They read the manifest on the mast', then: 'Wax-laminated. Every jar\'s owner, in the players\' own words if any is theirs.' },
      { if: 'They talk to the Buyer', then: 'He listens politely. "Another time." The barge leaves.' },
    ],
    players: [{ who: 'Freya Sun', note: 'They come for her list, never for her — the barge tries to load Philip. Watch her offer herself. The party talks her out of the yes.' }, { who: 'Philip', note: 'The teacher: freed (he weeps, has nothing to say, and that is honest) or refused.' }],
    battles: [
      { code: 'BOG-B', name: 'The Tithe Barge', major: true, when: 'The climax', force: '1 Water Weird bound to the barge + 3 Zombies — drowned debtors (~850 XP · L3)', arena: 'Dock + barge: crate stacks (humming, topple-able), the tithe bell (ring early = Weird stunned a round), lantern-buoys (light anchors the Weird\'s reach), the manifest on the mast', tricks: ['The Weird cannot leave the barge\'s shadow.', 'Broken crates free voices that distract the zombies.', 'The clock is the boss. Say the minutes.'], goal: 'Load the jar-woman\'s tithe and leave on schedule.', retreat: 'ON SCHEDULE — the barge leaves at the top of the hour no matter what.', win: 'The jarred piece of the Sea\'s song · Freya Sun\'s voice · the teacher freed or refused. The Buyer glimpsed, tea in hand.', loss: 'The tithe leaves with something of theirs aboard (a jar with a name they know). Recoverable at the drowned market — a reason to take the blue road next.', draw: 'The barge leaves half-loaded; the jar-woman is "in arrears" and becomes an ally out of spite.', foes: [F.weird('the thing in the water bound to the barge'), F.zombie('drowned debtors, tragic and slow')] },
    ],
    exit: '→ back to the Fair, then the next gate. Or, if all three roads are walked: the Moon-Night.',
  },

  // ------------------------------------------------ Act 2 · the Mirrors
  {
    key: 'The Gallery of Best Faces (Mirror road)',
    act: 2,
    where: 'Standing mirrors with no walls',
    goal: 'Nobody sees themselves. Wren mid-laugh. Billy\'s covered mirror: PENDING. Philip\'s finest hour, already priced. The chain is EMPTY.',
    oneBreath: 'A performance with no performer — Billy\'s shape, gestures perfect, face absent.',
    timing: 'Road session 1 · 60–90 min',
    beats: [
      'Set the room 🕯 (close) — the Hall breathes. Read the Moon line.',
      'Let them walk. Every mirror is someone\'s finest hour on loop. Name three: a stranger\'s wedding, a child\'s first catch, Wren mid-laugh.',
      'One is covered. Billy, unsmiling, and a card: PENDING.',
      'One loops the day Philip chose not to kill — a price-card already on it.',
      'Billy reaches for the chain on his book here — and it is gone. Ask his player to notice it, not you.',
    ],
    theyMight: [
      { if: 'They break a mirror uninvited', then: 'm-m1 — a frame-warden; the freed moment owes them a favour.' },
      { if: 'They walk the red carpet', then: 'm-m2 — it breathes. Telegraph it. Beneath: the floor plan of the Hall.' },
      { if: 'They sit at the vanity', then: 'm-m3 — the mimic. It coughs up the pouch with the ticket for a show that hasn\'t happened yet.' },
      { if: 'They meet the Understudy', then: 'FAC-A. Applaud it and it bows, helpless.' },
    ],
    players: [{ who: 'Billy', note: 'The empty chain. His fear made visible: the person everyone loves isn\'t really him. Say nothing; let his player carry it.' }, { who: 'Philip', note: 'His finest hour, priced. Someone wants the day he chose mercy.' }],
    battles: [
      { code: 'FAC-A', name: 'The Understudy', when: 'It steps out of the covered mirror', force: '1 Specter (Billy\'s shape, no face) + 3 Flying Swords (dueling-prop rapiers) (~350 XP · L2)', arena: 'The gallery — every mirror shows the fight a beat EARLY (each observant player gains advantage once)', tricks: ['It mimics Billy\'s REAL spells from tonight — read your dice feed aloud.', 'It cannot mimic anything sincere: one honest sentence from Billy staggers it (once per honest thing; the table decides what is honest).', 'Applaud it and it bows, helpless, until dragged offstage.'], goal: 'Replace Billy for opening night.', retreat: 'If applauded.', win: 'Its script drops: stage directions for OPENING NIGHT — free intel on the climax.', loss: 'It walks out wearing Billy\'s role; NPCs mistake the double for him at the worst moments until the climax.', foes: [F.specter('Billy\'s shape, gestures perfect, face absent'), F.flyingSword('a prop rapier, dueling on its own')] },
      { code: 'm-m1', name: 'Frame-warden', when: 'A mirror broken uninvited', force: '1 Animated Armor', arena: 'Between mirrors', tricks: ['One per mirror.'], goal: 'Protect the collection.', retreat: 'When the shards are swept up.', win: 'The freed moment owes them a favour-memory.', loss: 'The shards re-form. Louder.', foes: [F.armorFrame()] },
      { code: 'm-m2', name: 'The red carpet', when: 'They walk it', force: '1 Rug of Smothering', arena: 'The aisle', tricks: ['Say the carpet breathes. Say it twice.'], goal: 'A hug.', retreat: 'Fire.', win: 'The floor plan of the Hall.', loss: 'Someone smothered a round; a lesson.', foes: [F.rug()] },
      { code: 'm-m3', name: 'The vanity', when: 'Someone sits', force: '1 Mimic', arena: 'A dressing corner', tricks: ['It has eaten acquisitions.'], goal: 'A meal.', retreat: 'When it coughs.', win: 'The velvet pouch — the ticket stub dated the finale.', loss: 'Stuck a while.', foes: [F.mimic()] },
    ],
    exit: '→ The Back Room.',
  },
  {
    key: 'The Back Room ✦ LEVEL 3',
    act: 2,
    where: 'The mirror-man\'s workshop',
    goal: 'Reassemble Wren\'s laugh (three skills, together). It flies home into Billy\'s book. Level 3.',
    oneBreath: 'Faces in clamps. A laugh disassembled on velvet. "In here, nothing is ever lost."',
    timing: 'Road session 2 · 45–60 min',
    beats: [
      'The mirror-man greets them like a curator. He believes keeping is love. Let him be right for a minute — it is more frightening.',
      'The laugh: three checks, three different players, three different skills (Insight to know its shape · Performance to give it breath · Sleight of Hand / Arcana to fit it). Draw the Missing Piece is a fine stand-in if you want the table to build it.',
      'It flies home into Billy\'s book. Level 3: every mirror in the Hall ripples like water. Send the level-up.',
      'He does not stop them. He makes a note. "Opening night, then."',
    ],
    theyMight: [
      { if: 'They attack him', then: 'He defends with the room — warn with the environment first: clamps close, mirrors tilt to show them from behind.' },
      { if: 'They bargain', then: 'He offers Billy\'s smile for Wren\'s laugh, generously. Note the offer; he repeats it mid-climax when Billy is lowest.' },
      { if: 'They free other faces', then: 'Each freed face costs a round and cheers them at the climax. Let them spend the time.' },
    ],
    players: [{ who: 'Billy', note: 'Wren\'s laugh, home. He does not have to say anything. Give him the silence.' }],
    battles: [],
    exit: '→ Opening Night.',
  },
  {
    key: 'Opening Night (Mirror climax)',
    act: 2,
    where: 'The gallery, now a theatre; the mirrors are the audience',
    goal: 'MAJOR BATTLE. Beat the mirror-man on his own stage. Win Wren\'s book and Philip\'s hour un-priced. The Buyer in the front row.',
    oneBreath: 'He narrates the fight as a review, aloud. Broken mirrors free moments that CHEER.',
    timing: 'Road session 2–3 · 60–75 min',
    beats: [
      'Map: the theatre of mirrors. Light: 🏮 lantern (each token carries a light). Do the review voice — dry, delighted.',
      'Each PC\'s FIRST mirror-break gives them Heroic Inspiration; every break removes one of his escape routes and frees a moment that audibly cheers.',
      'Mid-fight, when Billy is at his lowest, the mirror-man offers the bargain again, kindly. This is the real fight. The party answers, not you.',
      'The Buyer, front row centre, applauds exactly once at the end, whatever happens.',
    ],
    theyMight: [
      { if: 'They go for the props crate', then: 'Wren\'s book, mid-transit. Grabbing it is an action and his whole attention.' },
      { if: 'They threaten his catalog with ink', then: 'Unforgivable vandalism — he parleys instantly. Use it as the retreat.' },
      { if: 'They lower the chandelier of faces', then: 'A round of chaos; the Shadows scatter; he screams a review of it.' },
    ],
    players: [{ who: 'Billy', note: 'The bargain offered at his lowest. If he says yes, the party can still talk him back — rule 2: it comes home when the promise breaks.' }, { who: 'Philip', note: 'His finest hour un-priced when the price-card burns.' }],
    battles: [
      { code: 'FAC-B', name: 'Opening Night', major: true, when: 'The climax', force: 'The mirror-man (Green Hag) + 3 Shadows (stage-hands) (~1000 XP · L3)', arena: 'The theatre: audience-mirrors (breakable — escape routes + cheers + Inspiration on first break), the chandelier of faces (lowerable), the props crate (Wren\'s book)', tricks: ['He narrates the fight as a review, aloud.', 'Invisible Passage between mirrors.', 'The Shadows only touch anyone holding kept things.'], goal: 'Complete the acquisition — Billy\'s smile — with signed consent, offered mid-fight.', retreat: 'His catalog threatened with ink → instant parley.', win: 'Wren\'s book, mid-transit, and Philip\'s finest hour un-priced.', loss: 'The smile is sold; the party must break the promise later (Rule 2) — a Moon-Night beat.', draw: 'The book but not the hour, or the hour but not the book. He bows.', foes: [F.greenHag('the mirror-man — a curator\'s coat, a face you forget while looking at it'), F.shadow('a stage-hand in black')] },
    ],
    exit: '→ back to the Fair, then the next gate. Or, if all three roads are walked: the Moon-Night.',
  },

  // ------------------------------------------------ Act 2 · the Under-Sea
  {
    key: 'The Stairs Below (Under-Sea road)',
    act: 2,
    where: 'Stairs into water that lets you breathe if you were ever owed a life below',
    goal: 'Peaches breathes free. Everyone else speaks one small truth into the water. The pendant warms.',
    oneBreath: 'Drowned commuters gossip about "the tail lot" and do not look at Peaches.',
    timing: 'Road session 1 · 60–90 min',
    beats: [
      'Set the room 🌊 (use the ⚓ harbour bed; the stage light 🌊 under the sea). Read the Moon line.',
      'The stairs: each non-Peaches player says one small true thing to the water to breathe. Take them at the table, out loud, quick.',
      'The market thoroughfare. Security wants them escorted, not dead (MAR-A) — grapples over damage.',
      'The gossip: "the tail lot." Nobody looks at Peaches. Freya Moon\'s pendant warms the deeper they go.',
    ],
    theyMight: [
      { if: 'They pocket anything unpaid', then: 'u-m1 — two giant crabs ("stall clamps"); the item, plus a fine.' },
      { if: 'They swim the back-current', then: 'u-m2 — quippers; a shortcut that skips security entirely.' },
      { if: 'They cause a scene', then: 'Skip to the market-mother intervening — she finds them interesting, which is worse.' },
    ],
    players: [{ who: 'Peaches', note: 'Breathes without asking. Everyone notices. Nobody says it.' }, { who: 'Freya Moon', note: 'The pendant warms. Elowen is nearer than she has ever been.' }],
    battles: [
      { code: 'MAR-A', name: 'Market Security', when: 'They are noticed', force: '5 Merfolk + 1 Reef Shark on a leash — deliberately easy: an ESCORT (L2)', arena: 'The thoroughfare: kelp awnings (collapsible), the pressure-bubble lane (shove a foe in — pops them up a level), tutting drowned shoppers', tricks: ['They grapple; they do not aim to kill.', 'Whistle recall the moment anyone is dying.'], goal: 'Remove them.', retreat: 'Whistle recall.', win: 'Confiscated gear returned with a receipt and an apology.', loss: 'Escorted to the stairs; re-entry needs a disguise or the market-mother\'s invitation — more fun anyway.', foes: [F.merfolk('market security, polite spears'), F.reefShark('on a leash of pearls')] },
      { code: 'u-m1', name: 'Stall clamps', when: 'Pocketing', force: '2 giant crabs', arena: 'A stall', tricks: ['They hold, they do not hurt.'], goal: 'The item back.', retreat: 'When it is returned.', win: 'A fine, paid in scrip.', loss: 'The item, plus a fine.', foes: [F.crab('stall clamps — crabs the size of chairs')] },
      { code: 'u-m2', name: 'The back-current', when: 'They swim it', force: '1 swarm of quippers', arena: 'A tunnel of current', tricks: ['Loud, brief.'], goal: 'A meal.', retreat: 'It ends when the current does.', win: 'A shortcut past security.', loss: 'Bitten and out the other side anyway.', foes: [F.quippers('the back-current, teeth in it')] },
    ],
    exit: '→ The Market-Mother\'s Window.',
  },
  {
    key: "The Market-Mother's Window ✦ LEVEL 3",
    act: 2,
    where: 'A window the size of a cathedral door',
    goal: 'The tail on black velvet: ONE SONG, ALREADY PAID. Peaches never said yes — that is the crack. The sealed grove-lot; the pendant burns.',
    oneBreath: 'The market-mother sells "one scale, for sentiment," smiling. Level 3 when a price-card flickers.',
    timing: 'Road session 1–2 · 60 min',
    beats: [
      'The window. Read the card. Watch Peaches. Say nothing for a full breath.',
      'Beside it: a sealed lot — ONE SPRING, GROVE-CUT. The pendant burns. Elowen is close. (Decide now, or ask her player privately: taken, or chose.)',
      'The market-mother deals. She sells a scale, for sentiment. If anyone says the words "she never said yes" aloud, every price-card in the market flickers, uncertain. LEVEL 3. Send it.',
      'She names the sale: tomorrow, the amphitheatre. Everyone is invited.',
    ],
    theyMight: [
      { if: 'They touch the glass', then: 'u-m3 — something lives in the glass (a Water Weird). One warning lash, always. Distracting it is how the sneak door works.' },
      { if: 'They try to buy the tail', then: '"Already paid, dear. By the Sea itself." Bubbles. She is telling the truth.' },
      { if: 'They open the grove-lot', then: 'Not here — it is sealed until the sale. But the pendant and the lot pull toward each other. Show it. Once.' },
    ],
    players: [{ who: 'Peaches', note: 'Her tail, in a window. Give her the scene. Ask her what she does; do not narrate her.' }, { who: 'Freya Moon', note: 'The grove-lot. Elowen. The pendant burns hot enough to notice.' }],
    battles: [
      { code: 'u-m3', name: 'The thing in the glass', when: 'They touch the window', force: '1 Water Weird', arena: 'The window and the lane before it', tricks: ['One warning lash first, always.', 'It cannot leave the glass. Distract it and the back of the window is a door.'], goal: 'Guard the lot.', retreat: 'It cannot follow.', win: 'The way behind the window — a look at the tail\'s case up close: it answers only to a gavel.', loss: 'Held and dunked; security arrives politely.', foes: [F.weird('the thing that lives in the glass')] },
    ],
    exit: '→ The Sale of the Tail.',
  },
  {
    key: 'The Sale of the Tail (Under-Sea climax)',
    act: 2,
    where: 'An amphitheatre of shells',
    goal: 'MAJOR BATTLE. Beat the market-mother BY THE RULES — never kill her. Win the tail (wrapped, waiting for the song) and open the grove-lot. The Buyer raises a hand.',
    oneBreath: 'The audience breathes water and bids on the fight. The gavel is the real objective.',
    timing: 'Road session 2–3 · 60–75 min',
    beats: [
      'Map: the shell amphitheatre. Light: 🌊 under the sea. Put the tail\'s case at centre.',
      'The audience never fights; it BIDS on the combat — call bids aloud ("two hundred pearls on the little one with the book!"). The Bargain (Table → ⚖) can literally be the bidding.',
      'The gavel is an artifact of SOLD: whoever holds it can close or void one lot. Getting it is the fight.',
      'If Peaches sings her note: the tail glows in its case and the whole room forgets to breathe — one full round of stunned silence, once. Play ♪ the missing note.',
      'End: the Buyer, in the best seat, raises one hand. The room goes quiet for him. He nods to Peaches. Later — over tea, mid-roads — he speaks his honest sentence.',
    ],
    theyMight: [
      { if: 'They try to kill the market-mother', then: 'Say it plainly through the fiction first: the case answers to the gavel; if she dies the lot "defaults" — the tail goes to the Buyer. Worst outcome. Warn once.' },
      { if: 'They out-bid', then: 'Bids are promises, not coin. What would they give? Rule 2 hangs over every offer. Let them win with something they can afford to have come home.' },
      { if: 'They find the crack', then: '"She never said yes." Any legal challenge suspends everything: "the Below does not brawl over settled lots." The market-mother, furious and gleeful, becomes an unlikely ally.' },
    ],
    players: [{ who: 'Peaches', note: 'The tail is hers again — wrapped, waiting for the song to be whole. Decide with her what that means. Do not decide for her.' }, { who: 'Freya Moon', note: 'The grove-lot opens: the spring, and a scent of willow. Elowen is one door away. Whisper it.' }],
    battles: [
      { code: 'SEA-B', name: 'The Auction of the Tail', major: true, when: 'The climax', force: 'The market-mother (Sea Hag) + 3 Merfolk + 1 Swarm of Quippers (~900 XP · L3)', arena: 'The amphitheatre: the auction block (the case answers only to the gavel), the gavel, pressure bubbles (vertical movement), the bidding audience', tricks: ['Her Horrific Appearance is her opening bid.', 'Killing her BREAKS the sale — the tail defaults to the Buyer.', 'Peaches\'s note: one round of stunned silence, once.', 'The audience bids on the fight; you call the odds.'], goal: 'Complete the sale.', retreat: '"The Below does not brawl over settled lots" — any legal challenge (the crack) suspends everything.', win: 'The tail, wrapped, and the sealed grove-lot opened.', loss: 'The tail sells to the Buyer, glimpsed at last — the Moon-Night becomes the pursuit; it can still come home when the promise breaks.', draw: 'Sale suspended "pending provenance"; the market-mother allies out of spite.', foes: [F.seaHag('the market-mother — pearls that used to be wishes, a smile for sentiment'), F.merfolk('auction ushers'), F.quippers('the back-current, loosed')] },
    ],
    exit: '→ back to the Fair, then the next gate. Or, if all three roads are walked: the Moon-Night.',
  },

  // ------------------------------------------------ Act 3
  {
    key: 'The Moon-Night',
    act: 3,
    where: 'The Fair\'s largest stage, under the closest moon in a lifetime',
    goal: 'It FEELS like a battle. It is not one. All five sing. The Sea remembers. The tide comes home. Then five doors, and you ask.',
    oneBreath: 'The moon fills the sky; the Sea is standing up on its hind legs to reach her.',
    timing: 'Two sessions · the last one ends the campaign',
    beats: [
      'Read the finale Moon line. Set the room to 🌕 The Moon-Night. Stage: ambient, then the finale.',
      'Everyone the party freed is here — the seal-pup, the jarred voices, the mirror-moments, the organ turned, Pookie. Name each. Give each one line.',
      'The Ones Below make it FEEL like a battle: lanterns, porters, the Twins, the Buyer taking tea. Run one round of "combat" with the Table if the players want to swing — nothing here can be fought. Then the Twins hold up the slate: ADMISSION IS SOLD IN SETS.',
      'The Twins read the five Gate answers, in the players\' own words, once more. Read them slowly. This is why you wrote them down.',
      'All five sing — described in the fiction, not performed. Each their own song. Then: Table → 🌕 The finale: ready the phones, then Sing it. Every phone and your MacBook play the whole song together; the iPad\'s Moon rises.',
      'The Sea remembers her and chooses to keep the memory. The tide comes home up Saltmere harbour at dawn; the chapel bell rings alone; the horizon steps back eleven feet.',
      'The Buyer survives. He files the loss under "instructive" and leaves the one who out-sang him a card: "We will be watching your career with interest."',
      'Then five doors. Ask each player, in turn: "The tide is in. Where do you go?" Do not decide for them.',
    ],
    theyMight: [
      { if: 'They try to fight the Buyer', then: 'He hands the attacker a receipt for one dignity and pours the tea. Nothing here can be fought — say it once through the fiction.' },
      { if: 'Someone sides with the Sea', then: '"Who are you to give it back its grief?" Let the argument happen at the table. It is the night the campaign is about something. The Sea chooses, in the end, to keep her.' },
      { if: 'A promise was sold along the way (Billy\'s smile, a voice, a hand)', then: 'This is where it comes home: the promise breaks in the singing. Rule 2. Say it plainly.' },
    ],
    players: [
      { who: 'Peaches', note: 'Her tail; the coral house. Go home to the water, or stay on borrowed feet with the people who sang for her. If she goes: Pookie speaks, once — "She sang to me first."' },
      { who: 'Freya Moon', note: 'The Grove blooms; Elowen (taken, or chose — you decided on the blue road). Return, or keep walking with the party her hope belongs to.' },
      { who: 'Billy', note: 'His name comes home when his friends sing it. Wren\'s pages in his own hand, one new page addressed to Billy. Back to being William, or forward as whoever they sang him into.' },
      { who: 'Philip', note: 'His mother\'s tune, whole; her garden. Go home, or carry the tune on — the teacher\'s people still need someone who won\'t kill.' },
      { who: 'Freya Sun', note: 'Nothing was ever taken. She learns she can be protected. Stay with the two she protects, or go back to the rest of her list.' },
    ],
    battles: [],
    exit: 'The end. Some stay together. Some go. Both are winning — whoever leaves, leaves choosing to.',
  },
]
