// Phase 3 realtime layer. Thin wrapper over Supabase channels that
// degrades to a complete no-op in offline mode (spec: realtime features
// degrade gracefully or hide when Supabase is absent).

import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Encounter, Handout } from '../types'

export interface TableEvents {
  encounter: (e: Encounter) => void
  handout: (h: Handout) => void
}

export interface TableChannel {
  sendEncounter(e: Encounter): void
  sendHandout(h: Handout): void
  close(): void
}

/**
 * Join the campaign's table channel. `campaignId` comes from the
 * get_channel RPC; pass null (offline mode) and you get an inert channel.
 */
export function joinTableChannel(
  campaignId: string | null,
  on: Partial<TableEvents>,
): TableChannel {
  if (!supabase || !campaignId) {
    return { sendEncounter: () => {}, sendHandout: () => {}, close: () => {} }
  }

  const channel: RealtimeChannel = supabase.channel(`table:${campaignId}`, {
    config: { broadcast: { self: true } },
  })

  if (on.encounter) {
    channel.on('broadcast', { event: 'encounter' }, (msg) => on.encounter!(msg.payload as Encounter))
  }
  if (on.handout) {
    channel.on('broadcast', { event: 'handout' }, (msg) => on.handout!(msg.payload as Handout))
  }
  channel.subscribe()

  return {
    sendEncounter(e) {
      void channel.send({ type: 'broadcast', event: 'encounter', payload: e })
    },
    sendHandout(h) {
      void channel.send({ type: 'broadcast', event: 'handout', payload: h })
    },
    close() {
      void supabase!.removeChannel(channel)
    },
  }
}
