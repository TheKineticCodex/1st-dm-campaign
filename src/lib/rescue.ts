/**
 * Carrying a character home.
 *
 * The app's database was replaced on 15 August 2026 and the old one deleted,
 * so five characters forged before that day exist in exactly one place each:
 * the browser they were made in. Nobody noticed, because reads fall back to
 * the phone's own copy when the server has nothing — so the sheets looked
 * perfectly normal all evening while the Book's roster showed five blanks.
 *
 * Reads fall back. Writes never caught up. This is the catching up.
 *
 * The rule is deliberately one-way and one-time: if the server has nothing
 * and the phone has something real, the phone's copy goes up. Never the
 * reverse, never over the top of a character the server already holds, and
 * never a half-finished forge. A phone that has been wiped must not be able
 * to erase the seat it signs into.
 */

import type { CharacterBuild, QuizResult, SavedCharacter } from '../types'

/**
 * Is this local copy worth carrying up?
 *
 * The forge writes as it goes, so a phone can hold a build that is three
 * questions old. Uploading one of those over an empty seat is harmless today
 * and confusing forever, so the bar is: it has to be somebody. A name, and a
 * species or a class — the two things you cannot have chosen by accident.
 */
export function isWorthKeeping(c: SavedCharacter | null | undefined): c is SavedCharacter {
  const b: CharacterBuild | undefined = c?.build
  if (!b) return false
  if (!b.name?.trim()) return false
  return !!(b.species || b.klass)
}

/** The same question for the divination — their own words, which Act 3 reads back. */
export function quizWorthKeeping(q: QuizResult | null | undefined): q is QuizResult {
  if (!q) return false
  return Object.values(q.answers ?? {}).some((a) => !!a?.trim())
}

/** What happened, in words the Book can show and a test can assert on. */
export type RescueOutcome =
  | { kind: 'server-already-has-it' }
  | { kind: 'nothing-to-carry' }
  | { kind: 'carried' }
  | { kind: 'could-not-carry' }

/**
 * The whole decision, with no store and no network in it, so the thing that
 * actually failed on 17 August can be tested without a browser.
 *
 * `remote` is what the server returned; `local` is what this browser holds.
 * `push` is only ever called when the server has nothing and the phone has
 * somebody — that is the entire safety property.
 */
export async function carryHome<T>(
  remote: T | null,
  local: T | null,
  worthKeeping: (v: T | null) => v is T,
  push: (v: T) => Promise<boolean>,
): Promise<RescueOutcome> {
  if (remote) return { kind: 'server-already-has-it' }
  if (!worthKeeping(local)) return { kind: 'nothing-to-carry' }
  // A push that throws must never take the sheet down with it: the player is
  // sitting at a table and their character is the one thing that must render.
  const ok = await push(local).catch(() => false)
  return ok ? { kind: 'carried' } : { kind: 'could-not-carry' }
}
