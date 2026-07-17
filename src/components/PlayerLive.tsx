// Phase 3 — Table Mode, player side: the initiative banner ("you're up")
// and incoming handouts (including the secret single-target channel).
// Renders nothing in offline mode.

import { useEffect, useRef, useState } from 'react'
import { joinTableChannel } from '../lib/realtime'
import { readCache, writeCache } from '../lib/storage'
import type { Store } from '../lib/store'
import type { Encounter, Handout } from '../types'
import { SealedEnvelope } from './SealedEnvelope'
import { C, display } from './ui'

interface PlayerLiveProps {
  store: Store
  playerName: string
}

export function PlayerLive({ store, playerName }: PlayerLiveProps) {
  const [encounter, setEncounter] = useState<Encounter | null>(null)
  const [handout, setHandout] = useState<Handout | null>(null)
  const queue = useRef<Handout[]>([])

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
        })
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
    </>
  )
}
