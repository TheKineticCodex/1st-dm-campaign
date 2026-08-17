// 🪧 What can be held up to the table.
//
// Hush is mute and speaks by writing on a slate. There is a screen on a stand
// facing the players. This is that slate.
//
// EVERY LINE HERE IS VETTED AND TYPED BY HAND. Nothing is assembled from
// campaign prose at runtime, and nothing crosses the wire but an id — so a
// DM-only sentence cannot reach the glass by accident, ever.
//
// `at` scopes a card to the checkpoints it belongs under, so the Lantern-Keeper
// only ever sees the four or five chips for the room he is standing in. That
// scoping is the safety control: it is what stops ONE OPENS TONIGHT being one
// mistap away at the Gate. 'fight' means "whenever an encounter is running".

import type { StageCard } from '../types'

export interface StageCardDeck {
  card: StageCard
  /** His label, lowercase, in his own voice. */
  chip: string
  /** Checkpoint ids this belongs under, or 'fight'. */
  at: string[]
}

export const STAGE_CARDS: StageCardDeck[] = [
  // ---- the Gate --------------------------------------------------------
  { at: ['gate'], chip: 'slate: welcome', card: { id: 'slate-welcome', kind: 'slate', lines: ['WELCOME'] } },
  {
    at: ['gate'],
    chip: 'slate: sold in sets',
    card: { id: 'slate-sets', kind: 'slate', lines: ['ADMISSION IS SOLD IN SETS.', 'YOU FIVE ARRIVED ON ONE TIDE.'] },
  },
  {
    at: ['gate'],
    chip: 'slate: what brought you here?',
    card: { id: 'slate-brought', kind: 'slate', lines: ['WHAT BROUGHT YOU HERE?'] },
  },
  {
    at: ['gate'],
    chip: 'slate: that was not an answer',
    card: { id: 'slate-noanswer', kind: 'slate', lines: ['THAT WAS NOT AN ANSWER.'] },
  },
  { at: ['gate'], chip: 'slate: five, that is the set', card: { id: 'slate-five', kind: 'slate', lines: ['FIVE.', 'THAT IS THE SET.'] } },

  // ---- the Midway ------------------------------------------------------
  {
    at: ['midway'],
    chip: 'the sign: we never charge coin',
    card: { id: 'sign-coin', kind: 'slate', lines: ['WE NEVER CHARGE COIN.'] },
  },

  // ---- the back fence --------------------------------------------------
  {
    at: ['gates'],
    chip: 'slate: one opens tonight',
    card: { id: 'slate-oneopens', kind: 'slate', lines: ['ONE OPENS TONIGHT.', 'THE OTHERS REMEMBER BEING CHOSEN LAST.'] },
  },
  {
    at: ['gates'],
    chip: 'slate: we do not advise',
    card: { id: 'slate-advise', kind: 'slate', lines: ['WE DO NOT ADVISE.', 'THAT IS A DIFFERENT COUNTER.'] },
  },
  { at: ['gates'], chip: 'slate: sets', card: { id: 'slate-setsonly', kind: 'slate', lines: ['SETS.'] } },
  {
    at: ['gates'],
    chip: 'the three lanterns',
    card: { id: 'gates-lanterns', kind: 'gates', lines: [] },
  },

  // ---- any fight -------------------------------------------------------
  // The rule the table forgets by round three. Every phone is showing YourTurn
  // during a fight, so the shared screen is the only surface that can hold a
  // rule up for as long as the thing it governs lasts.
  {
    at: ['fight'],
    chip: 'the way out: drop what you took',
    card: { id: 'note-drop', kind: 'note', lines: ['Drop what you took and it stops.', 'Any time — even mid-swing.'] },
  },
  {
    at: ['fight'],
    chip: 'the way out: past the fence',
    card: { id: 'note-fence', kind: 'note', lines: ['Get it past the fence and they stop.', 'They cannot follow over the line.'] },
  },
]

/** The chips for where he is standing, plus the fight ones while one is running. */
export function cardsFor(at: string | null | undefined, fighting: boolean): StageCardDeck[] {
  return STAGE_CARDS.filter((c) => (at && c.at.includes(at)) || (fighting && c.at.includes('fight')))
}
