/**
 * 🐌 The Great Snail Derby, as everybody watching it sees it.
 *
 * The phones send taps; the Book and the stage each rebuild the lanes from
 * the same broadcast. Both sides reduce with THIS function so they cannot
 * disagree about where a snail is or when one crossed — a snail finishing on
 * the laptop and not on the table's screen is the kind of thing five people
 * notice immediately.
 */

import type { RaceEvent } from '../types'

/** How far a snail has to go. */
export const RACE_GOAL = 40

export interface RaceBoard {
  raceId: string
  /** player name → how far along, 0..RACE_GOAL */
  lanes: Record<string, number>
  /** in the order they crossed */
  finished: string[]
  ended: boolean
}

export function startBoard(raceId: string, names: string[]): RaceBoard {
  const lanes: Record<string, number> = {}
  for (const n of names) lanes[n] = 0
  return { raceId, lanes, finished: [], ended: false }
}

/**
 * Fold one broadcast into the board. Returns the same object when nothing
 * changed, so React can skip the render.
 */
export function reduceRace(cur: RaceBoard | null, r: RaceEvent, names: string[]): RaceBoard | null {
  if (r.phase === 'start') return startBoard(r.raceId, names)
  if (!cur || r.raceId !== cur.raceId || cur.ended) return cur
  if (r.phase === 'progress' && r.playerName) {
    return { ...cur, lanes: { ...cur.lanes, [r.playerName]: r.progress ?? 0 } }
  }
  if (r.phase === 'finish' && r.playerName && !cur.finished.includes(r.playerName)) {
    return {
      ...cur,
      lanes: { ...cur.lanes, [r.playerName]: RACE_GOAL },
      finished: [...cur.finished, r.playerName],
    }
  }
  if (r.phase === 'end') {
    return { ...cur, ended: true, finished: r.results ?? cur.finished }
  }
  return cur
}
