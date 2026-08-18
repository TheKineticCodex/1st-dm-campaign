/**
 * Telling the stage where the night is — from somewhere that always exists.
 *
 * Session 3 ran with a dark iPad. The stage's only writer was StageControls,
 * which lives inside a Fold on the Table tab, and a Fold unmounts its
 * children — so for a whole evening spent on Tonight, nothing was mounted to
 * push anything, and the table's screen never left the title card. The single
 * stage write of the night landed at 02:29, the moment that panel was finally
 * opened.
 *
 * So the automatic half of the stage lives here and is driven by the shell,
 * which is mounted from sign-in to sign-out. StageControls still owns the
 * deliberate half — maps, tokens, light, fog, the cards he holds up.
 */

import type { StageState } from '../types'
import type { Store } from './store'
import type { TableChannel } from './realtime'
import { readNightProgress } from './night'

/** Where the night is, re-read from the cache that NightPath writes. */
export function checkpointNow(): string | null {
  return readNightProgress().at ?? null
}

/**
 * Push the checkpoint the party is standing on, and only when it changes.
 * Reads the stage first so it cannot flatten a map the DM has already set.
 */
export async function tellStageWhereWeAre(
  store: Store,
  channel: TableChannel | null,
  at: string,
): Promise<void> {
  const current = (await store.getStage().catch(() => null)) ?? null
  const base: StageState = current && current.mode
    ? current
    : { mode: 'ambient', mapUrl: null, tokens: [] }
  // A new room wipes whatever was held up for the last one.
  const next: StageState = { ...base, at, card: null }
  channel?.sendStage(next)
  await store.saveStage(next).catch(() => {})
}
