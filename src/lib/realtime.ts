// Phase 3 realtime layer. Thin wrapper over Supabase channels that
// degrades to a complete no-op in offline mode (spec: realtime features
// degrade gracefully or hide when Supabase is absent).

import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { BargainEvent, ConditionEvent, Encounter, Handout, RaceEvent, RollEvent } from '../types'

export interface TableEvents {
  encounter: (e: Encounter) => void
  handout: (h: Handout) => void
  roll: (r: RollEvent) => void
  condition: (c: ConditionEvent) => void
  race: (r: RaceEvent) => void
  bargain: (b: BargainEvent) => void
}

export interface TableChannel {
  sendEncounter(e: Encounter): void
  sendHandout(h: Handout): void
  sendRoll(r: RollEvent): void
  sendCondition(c: ConditionEvent): void
  sendRace(r: RaceEvent): void
  sendBargain(b: BargainEvent): void
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
    return {
      sendEncounter: () => {},
      sendHandout: () => {},
      sendRoll: () => {},
      sendCondition: () => {},
      sendRace: () => {},
      sendBargain: () => {},
      close: () => {},
    }
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
  if (on.roll) {
    channel.on('broadcast', { event: 'roll' }, (msg) => on.roll!(msg.payload as RollEvent))
  }
  if (on.condition) {
    channel.on('broadcast', { event: 'condition' }, (msg) => on.condition!(msg.payload as ConditionEvent))
  }
  if (on.race) {
    channel.on('broadcast', { event: 'race' }, (msg) => on.race!(msg.payload as RaceEvent))
  }
  if (on.bargain) {
    channel.on('broadcast', { event: 'bargain' }, (msg) => on.bargain!(msg.payload as BargainEvent))
  }
  channel.subscribe()

  const send = (event: string, payload: unknown) =>
    void channel.send({ type: 'broadcast', event, payload })

  return {
    sendEncounter: (e) => send('encounter', e),
    sendHandout: (h) => send('handout', h),
    sendRoll: (r) => send('roll', r),
    sendCondition: (c) => send('condition', c),
    sendRace: (r) => send('race', r),
    sendBargain: (b) => send('bargain', b),
    close() {
      void supabase!.removeChannel(channel)
    },
  }
}
