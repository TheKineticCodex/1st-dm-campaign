// ✦ Divination quiz — ported verbatim from the verified prototype.

export interface QuizOption {
  label: string
  pts: Record<string, number>
  /** Species affinity points — the mirror questions read your reflection. */
  speciesPts?: Record<string, number>
}

export interface QuizQuestion {
  id: string
  prompt: string
  type: 'choice' | 'text'
  options?: QuizOption[]
  placeholder?: string
  /** Answer is recorded but never scores points (flavor capture). */
  captureOnly?: boolean
}

export const QUIZ: QuizQuestion[] = [
  {
    id: 'moment',
    prompt: 'Picture your finest moment at the table. What are you doing?',
    type: 'choice',
    options: [
      { label: 'Winning a glorious fight', pts: { Fighter: 2, Barbarian: 2, Paladin: 1, Monk: 1 } },
      { label: 'Talking my way out of anything', pts: { Bard: 3, Rogue: 1, Warlock: 1 } },
      { label: 'Casting something spectacular', pts: { Wizard: 2, Sorcerer: 2, Warlock: 1, Druid: 1 } },
      { label: 'Outsmarting everyone in the room', pts: { Rogue: 3, Wizard: 1, Bard: 1 } },
      { label: 'Protecting someone who needed me', pts: { Paladin: 2, Cleric: 2, Fighter: 1 } },
      { label: 'Making the whole table laugh', pts: { Bard: 2, Rogue: 1, Sorcerer: 1 } },
    ],
  },
  {
    id: 'solve',
    prompt: 'Trouble finds you at the carnival. How do you answer it?',
    type: 'choice',
    options: [
      { label: 'Steel and strength', pts: { Fighter: 2, Barbarian: 2, Paladin: 1 } },
      { label: 'Magic, obviously', pts: { Wizard: 2, Sorcerer: 2, Warlock: 2, Druid: 1 } },
      { label: 'Words — honeyed or sharp', pts: { Bard: 3, Warlock: 1 } },
      { label: 'You never saw me', pts: { Rogue: 3, Monk: 1, Ranger: 1 } },
      { label: 'Beasts and green growing things', pts: { Druid: 3, Ranger: 2 } },
      { label: 'A little of everything', pts: { Bard: 1, Paladin: 1, Ranger: 1 } },
    ],
  },
  {
    id: 'complexity',
    prompt: 'How much do you want to keep track of?',
    type: 'choice',
    options: [
      { label: 'Give me 2–3 clear things I can do', pts: { Fighter: 3, Barbarian: 3, Rogue: 2 } },
      { label: 'Some choices — but not homework', pts: { Paladin: 2, Warlock: 2, Monk: 2, Bard: 2, Ranger: 1 } },
      { label: 'Hand me the whole toolbox', pts: { Wizard: 3, Cleric: 2, Druid: 2, Sorcerer: 2 } },
    ],
  },
  {
    id: 'vibe',
    prompt: 'What feeling should follow your character into the room?',
    type: 'choice',
    options: [
      { label: 'Heroic', pts: { Paladin: 2, Fighter: 1, Cleric: 1 } },
      { label: 'Strange', pts: { Warlock: 2, Druid: 1, Sorcerer: 1 } },
      { label: 'Funny', pts: { Bard: 2, Rogue: 1, Sorcerer: 1 } },
      { label: 'Mysterious', pts: { Rogue: 2, Warlock: 2, Wizard: 1 } },
      { label: 'A little frightening', pts: { Warlock: 2, Barbarian: 1, Paladin: 1 } },
      { label: 'Utterly charming', pts: { Bard: 3, Warlock: 1 } },
    ],
  },
  {
    id: 'fight',
    prompt: "And when a fight can't be avoided?",
    type: 'choice',
    options: [
      { label: 'Nose to nose, blade to blade', pts: { Fighter: 2, Barbarian: 2, Paladin: 2, Monk: 1 } },
      { label: 'From a safe, clever distance', pts: { Ranger: 2, Rogue: 1, Wizard: 1, Sorcerer: 1, Warlock: 1 } },
      { label: 'Helping, healing, tipping the scales', pts: { Cleric: 3, Bard: 2, Druid: 1 } },
      { label: 'Everywhere at once', pts: { Monk: 3, Rogue: 1 } },
      { label: "I'd rather there be no fight at all", pts: { Bard: 2, Rogue: 1, Druid: 1 } },
    ],
  },
  {
    id: 'mirror',
    prompt: 'The mirror-maze shows you truer than any glass. What looks back?',
    type: 'choice',
    options: [
      { label: 'Something small, quick, and impossible to catch', pts: {}, speciesPts: { Halfling: 2, Gnome: 2, 'Fairy ✦': 1 } },
      { label: 'Something with wings — or the ache where wings should be', pts: {}, speciesPts: { 'Fairy ✦': 3, Aasimar: 2 } },
      { label: 'Long ears, listening to everything at once', pts: {}, speciesPts: { 'Harengon ✦': 3, Elf: 1 } },
      { label: 'Something carved from stone and patience', pts: {}, speciesPts: { Dwarf: 2, Goliath: 2, Orc: 1 } },
      { label: 'Old fire, banked but never out', pts: {}, speciesPts: { Tiefling: 2, Dragonborn: 2, Orc: 1 } },
      { label: 'Just me — but braver, and glowing a little', pts: {}, speciesPts: { Human: 3, Aasimar: 1 } },
    ],
  },
  {
    id: 'home',
    prompt: 'Where does your heart keep its home?',
    type: 'choice',
    options: [
      { label: 'A snug den with a round door and good bread', pts: {}, speciesPts: { Halfling: 3, Gnome: 1, Dwarf: 1 } },
      { label: 'The deep woods, where the old songs live', pts: {}, speciesPts: { Elf: 3, 'Fairy ✦': 1 } },
      { label: 'Mountain halls, forge-light, the long memory', pts: {}, speciesPts: { Dwarf: 3, Goliath: 1 } },
      { label: 'Wherever the road bends next', pts: {}, speciesPts: { Human: 2, 'Harengon ✦': 2 } },
      { label: 'Somewhere I lost — and mean to find again', pts: {}, speciesPts: { Tiefling: 1, Aasimar: 1, Dragonborn: 1 } },
      { label: 'The carnival. Obviously.', pts: {}, speciesPts: { 'Fairy ✦': 1, Gnome: 1, 'Harengon ✦': 1 } },
    ],
  },
  {
    id: 'heroes',
    prompt: 'Name two or three fictional characters you love. Any book, film, show, or game.',
    type: 'text',
    placeholder: 'e.g. Howl, Puss in Boots, Geralt…',
  },
  {
    id: 'look',
    prompt: "Close your eyes. What does your character look like? 'A rabbit in a waistcoat' is a legal answer here.",
    type: 'text',
    placeholder: 'Describe the picture in your head…',
  },
  {
    id: 'recover',
    prompt: 'What would your character risk everything to get back?',
    type: 'text',
    placeholder: 'A person, a memory, a name, a promise…',
  },
  {
    id: 'fear',
    prompt: 'And what are they most afraid of losing?',
    type: 'text',
    placeholder: 'Be honest. The Feywild will know anyway.',
  },
  {
    id: 'why',
    prompt: 'The Witchlight Carnival comes but once every eight years. Why does your character walk through its gates?',
    type: 'choice',
    captureOnly: true,
    options: [
      { label: 'Chasing something', pts: {} },
      { label: 'Running from something', pts: {} },
      { label: 'Pure curiosity', pts: {} },
      { label: 'Following someone', pts: {} },
      { label: 'They work there', pts: {} },
    ],
  },
]
