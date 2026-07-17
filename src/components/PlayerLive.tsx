// Phase 3 — Table Mode, player side: the initiative banner ("you're up")
// and incoming handouts (including the secret single-target channel).
// Renders nothing in offline mode.

import { useEffect, useRef, useState } from 'react'
import { joinTableChannel, type TableChannel } from '../lib/realtime'
import { readCache, writeCache } from '../lib/storage'
import type { Store } from '../lib/store'
import type { Encounter, Handout, RaceEvent } from '../types'
import { SealedEnvelope } from './SealedEnvelope'
import { C, display } from './ui'

const RACE_GOAL = 40

interface PlayerLiveProps {
  store: Store
  playerName: string
  /** DM applied/cleared a condition on this player (co-pilot A4). */
  onCondition: (condition: string, active: boolean) => void
}

interface PlayerRace {
  raceId: string
  phase: 'racing' | 'done'
  myProgress: number
  place?: number
}

export function PlayerLive({ store, playerName, onCondition }: PlayerLiveProps) {
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [handout, setHandout] = useState<Handout | null>(null)
  const [race, setRace] = useState<PlayerRace | null>(null)
  const queue = useRef<Handout[]>([])
  const channelRef = useRef<TableChannel | null>(null)
  const progressRef = useRef(0)
  const lastSent = useRef(0)
  const finishedSent = useRef(false)
  const onConditionRef = useRef(onCondition)
  onConditionRef.current = onCondition

  useEffect(() => {
    let cancelled = false
    let close = () => {}

    const seen = () => new Set(readCache<string[]>('handouts-seen') ?? [])
    const markSeen = (id: string) => writeCache('handouts-seen', [...seen(), id])

    const enqueue = (h: Handout) => {
      if (h.target && h.target !== playerName) return
      if (seen().has(h.id)) return
      markSeen(h.id)
      queue.current.push(h)
      setHandout((cur) => cur ?? queue.current.shift() ?? null)
    }

    ;(async () => {
      const channelId = await store.getChannelId()
      if (cancelled) return

      // Offline mode: no channel, but the catch-up below still runs so the
      // owner can rehearse the whole flow on one device (DM sends, then
      // rejoins as a player and receives).
      if (channelId) {
        const channel = joinTableChannel(channelId, {
          encounter: (e) => setEncounter(e.active ? e : null),
          handout: enqueue,
          condition: (c) => {
            if (c.targetPlayer === playerName) onConditionRef.current(c.condition, c.active)
          },
          race: (r: RaceEvent) => {
            if (r.phase === 'start') {
              progressRef.current = 0
              finishedSent.current = false
              setRace({ raceId: r.raceId, phase: 'racing', myProgress: 0 })
            } else if (r.phase === 'end') {
              const place = r.results ? r.results.indexOf(playerName) + 1 : 0
              setRace((cur) =>
                cur && cur.raceId === r.raceId
                  ? { ...cur, phase: 'done', place: place > 0 ? place : undefined }
                  : cur,
              )
              setTimeout(() => setRace(null), 7000)
            }
          },
        })
        channelRef.current = channel
        close = channel.close
      }

      // Late joiners: catch up on state that predates the subscription.
      const [active, missed] = await Promise.all([store.getActiveEncounter(), store.listMyHandouts()])
      if (cancelled) return
      if (active) setEncounter(active)
      missed.forEach(enqueue)
    })()

    return () => {
      cancelled = true
      close()
    }
  }, [store, playerName])

  const dismissHandout = () => setHandout(queue.current.shift() ?? null)

  // Snail sprint: taps buffer locally; broadcasts throttled to 5Hz
  // (engineering law 8.3: ≤10Hz batched).
  const sprint = () => {
    if (!race || race.phase !== 'racing') return
    const next = Math.min(RACE_GOAL, progressRef.current + 1)
    progressRef.current = next
    setRace({ ...race, myProgress: next })
    const now = Date.now()
    if (next >= RACE_GOAL && !finishedSent.current) {
      finishedSent.current = true
      channelRef.current?.sendRace({ raceId: race.raceId, phase: 'finish', playerName, progress: next })
    } else if (now - lastSent.current > 200) {
      lastSent.current = now
      channelRef.current?.sendRace({ raceId: race.raceId, phase: 'progress', playerName, progress: next })
    }
  }

  const myTurn =
    encounter && encounter.order[encounter.activeIndex]?.playerName === playerName
  const nextIndex = encounter ? (encounter.activeIndex + 1) % encounter.order.length : 0
  const upNext = encounter && encounter.order[nextIndex]?.playerName === playerName

  return (
    <>
      {encounter && (
        <div
          role="status"
          className="fixed left-0 right-0 top-0 text-center py-2 px-4"
          style={{
            background: myTurn ? C.gold : `${C.night}F2`,
            color: myTurn ? C.ink : C.parchment,
            borderBottom: `1px solid ${myTurn ? C.gold : C.panelEdge}`,
            backdropFilter: 'blur(8px)',
            zIndex: 60,
            ...display,
            fontWeight: 600,
          }}
        >
          {myTurn
            ? '⚔ Your turn! The table is watching.'
            : upNext
              ? `✦ You're up next — ${encounter.order[encounter.activeIndex]?.name} is acting.`
              : `⚔ ${encounter.order[encounter.activeIndex]?.name}'s turn`}
        </div>
      )}

      {handout && <SealedEnvelope key={handout.id} handout={handout} onDismiss={dismissHandout} />}

      {race && (
        <div
          className="fixed inset-0 flex flex-col items-center justify-center p-6"
          style={{ background: `${C.night}FA`, zIndex: 75 }}
          role="dialog"
          aria-label="The Great Snail Derby"
        >
          {race.phase === 'racing' ? (
            <>
              <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
                The carnival presents
              </p>
              <h2 style={{ ...display, fontSize: 32, fontWeight: 700, color: C.gold }}>
                🐌 The Great Snail Derby!
              </h2>
              <div
                className="w-full rounded-full mt-6 mb-2"
                style={{ maxWidth: 420, height: 18, background: C.panel, border: `1px solid ${C.panelEdge}`, overflow: 'hidden' }}
                role="progressbar"
                aria-valuenow={race.myProgress}
                aria-valuemax={RACE_GOAL}
              >
                <div
                  style={{
                    width: `${(race.myProgress / RACE_GOAL) * 100}%`,
                    height: '100%',
                    background: `linear-gradient(90deg, ${C.sea}, ${C.gold})`,
                  }}
                />
              </div>
              <p className="text-xs mb-6" style={{ color: C.faint }}>
                {race.myProgress >= RACE_GOAL
                  ? 'Your snail slides across the line! The judges confer…'
                  : `${race.myProgress} / ${RACE_GOAL} — your snail believes in you`}
              </p>
              {race.myProgress < RACE_GOAL && (
                <button
                  type="button"
                  onClick={sprint}
                  className="rounded-full font-bold"
                  style={{
                    ...display,
                    width: 190,
                    height: 190,
                    fontSize: 26,
                    background: C.gold,
                    color: C.ink,
                    border: `4px solid ${C.parchment}`,
                    boxShadow: `0 0 34px ${C.gold}77`,
                    cursor: 'pointer',
                    touchAction: 'manipulation',
                    userSelect: 'none',
                  }}
                >
                  TAP!
                  <br />
                  TAP! TAP!
                </button>
              )}
            </>
          ) : (
            <div className="text-center" style={{ animation: 'cardRise .4s ease-out' }}>
              <p style={{ fontSize: 56 }} aria-hidden="true">
                {race.place === 1 ? '🥇' : race.place === 2 ? '🥈' : race.place === 3 ? '🥉' : '🐌'}
              </p>
              <h2 style={{ ...display, fontSize: 28, fontWeight: 700, color: C.gold }}>
                {race.place === 1
                  ? 'Your snail is a legend!'
                  : race.place
                    ? `${race.place === 2 ? 'Second' : race.place === 3 ? 'Third' : `${race.place}th`} across the line!`
                    : 'A noble effort, snail and rider both.'}
              </h2>
              <p className="text-sm mt-2" style={{ color: C.faint }}>
                The carnival remembers its champions.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  )
}
