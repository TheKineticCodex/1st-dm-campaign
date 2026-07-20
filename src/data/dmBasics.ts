// The nervous-DM safety net: the whole job on cards, rendered inside
// Run the Night so nothing lives only in a markdown file on game night.

export interface BasicsCard {
  title: string
  body: string
}

export const DM_BASICS: BasicsCard[] = [
  {
    title: '🎲 Calling for a roll',
    body: 'Only when the outcome is uncertain AND failure is interesting. Say: "Give me a [skill] check." Easy DC 10 · Medium DC 15 · Hard DC 20. Their sheet already adds the numbers — they just read the total.',
  },
  {
    title: '⚔ The combat loop',
    body: 'Initiative once (Table tab tracks it). On each turn: move + one action. Attack: they roll d20 + their bonus vs the target\'s AC — meet it or beat it, then roll damage. Then the BEST part: describe what it looked like.',
  },
  {
    title: '⚖ Advantage & disadvantage',
    body: 'Roll two d20s (their sheet has buttons). Circumstances helping? Advantage: keep the higher. Hindering? Disadvantage: keep the lower. Never stack more than one of each — they cancel out.',
  },
  {
    title: '😴 Tonight\'s knockout rule',
    body: 'Announce it proudly before the brawl: "Every hit tonight is a knockout hit. Zero hit points = out cold, no dying, wake at dawn with a headache and a story." Players CAN go down. That is fun, not failure — Maddy applies a cold ham.',
  },
  {
    title: '✅ Say yes, then roll',
    body: 'When someone tries something wild, the answer is "Absolutely — give me a roll." Pick the nearest check, DC 12 if unsure. A failed wild idea should be funnier than a safe success, never a punishment.',
  },
  {
    title: '🧭 When you feel lost',
    body: 'Read the gold words aloud. Press a button. Ask "What do you do?" If you need a beat: "Hold that thought — everyone, what are you doing while this happens?" (Buys you a full minute, every time.)',
  },
  {
    title: '⏸ Pacing valves',
    body: 'Running LONG: cut Intermission Games to two, compress the cellar to the wall-touch + whisper. Running SHORT: more games, more brawl wave, let the cellar breathe. The only fixed point: END ON THE LIGHTS.',
  },
  {
    title: '🗣 Voices are optional',
    body: 'You do not need accents. Maddy = hands on hips, calls everyone "love" or "trouble." Griff = slow, certain. The Appraiser = polite, zero warmth. Posture and pace ARE the voice.',
  },
]

export interface RunSheetRow {
  time: string
  beat: string
  what: string
}

export const SESSION1_RUN_SHEET: RunSheetRow[] = [
  { time: '0:00', beat: 'Arrivals', what: 'Maddy takes weapons BY NAME — that is the introductions. Get every phone at the table open to its sheet.' },
  { time: '0:20', beat: 'Talent Night', what: 'Every player performs: describe the act, one check of their choice DC 10. Fire Peaches\'s whisper after her act. The Appraiser writes.' },
  { time: '1:00', beat: 'The Intermission Games', what: 'Judges "deliberate." Run whichever games the table bites on — each one rehearses a mechanic the brawl needs.' },
  { time: '1:40', beat: 'The Brawl', what: 'The vote comes back wrong → riot. Knockout rule aloud, Moves menu open, waves of 4. Old Griff wades in last.' },
  { time: '2:20', beat: 'The Hum in the Cellar', what: 'The tone flip. Cold wall, inside barnacles, chalk carousel. Fire the Peaches and Freya Moon whispers at the wall-touch.' },
  { time: '2:50', beat: 'The Tide Goes Out', what: 'Up the stairs, out the door, no sea, distant lights. One minute of gasping. END. Snuff the lanterns.' },
]
