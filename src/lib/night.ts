/**
 * Where the Book is standing tonight.
 *
 * The night's progress used to be private to NightPath, which meant the Table
 * could not know which fight the party was walking into. It lives here now so
 * the checkpoint card and the fight card on the Table read one truth.
 */

import { NIGHT_PATH, type Checkpoint, type NightBattle } from '../data/nightPath'
import { readCache, writeCache } from './storage'
import type { RosterEntry } from './store'

export const NIGHT_KEY = `night:${NIGHT_PATH.session}`

export interface NightProgress {
  /** checkpoint id → the door they took */
  took: Record<string, string>
  /** the checkpoint the Book is sitting on */
  at: string
  /** true once the last gate is chosen */
  done?: boolean
}

export const EMPTY_NIGHT: NightProgress = { took: {}, at: NIGHT_PATH.checkpoints[0]!.id }

export function readNightProgress(): NightProgress {
  return readCache<NightProgress>(NIGHT_KEY) ?? EMPTY_NIGHT
}

export function writeNightProgress(p: NightProgress): void {
  writeCache(NIGHT_KEY, p)
}

/** The checkpoint he is standing on, or undefined once the night is done. */
export function currentCheckpoint(p: NightProgress): Checkpoint | undefined {
  if (p.done) return undefined
  const cps = NIGHT_PATH.checkpoints
  const i = cps.findIndex((c) => c.id === p.at)
  return cps[Math.max(0, i)]
}

/** The fights reachable from where he is standing. Usually none. */
export function battlesHere(p: NightProgress): NightBattle[] {
  const cp = currentCheckpoint(p)
  if (!cp) return []
  const ids = new Set(cp.doors.map((d) => d.battle).filter((x): x is string => !!x))
  return NIGHT_PATH.battles.filter((b) => ids.has(b.id))
}

/**
 * Their real level and headcount, straight off the roster — the lowest level
 * at the table, because the weakest chair is the one a fight has to survive.
 */
export function partyLevel(roster: RosterEntry[]): { level: number; heads: number } {
  const levels = roster.map((r) => r.character?.build.level ?? 0).filter((n) => n > 0)
  return {
    level: levels.length ? Math.min(...levels) : NIGHT_PATH.writtenFor,
    heads: Math.max(1, roster.length || 5),
  }
}
