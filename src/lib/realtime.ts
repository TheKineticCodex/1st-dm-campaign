// Phase 3 realtime layer. Thin wrapper over Supabase channels that
// degrades to a complete no-op in offline mode (spec: realtime features
// degrade gracefully or hide when Supabase is absent).

import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { BargainEvent, ConditionEvent, Encounter, FinaleEvent, Handout, RaceEvent, RollEvent, StageState, VitalsEvent, WheelEvent } from '../types'
import type { GameEvent } from './games'

export interface TableEvents {
  encounter: (e: Encounter) => void
  handout: (h: Handout) => void
  roll: (r: RollEvent) => void
  condition: (c: ConditionEvent) => void
  race: (r: RaceEvent) => void
  bargain: (b: BargainEvent) => void
  stage: (s: StageState) => void
  vitals: (v: VitalsEvent) => void
  wheel: (w: WheelEvent) => void
  game: (g: GameEvent) => void
  finale: (f: FinaleEvent) => void
  /** "Turn the page" — the Book telling every device to take the new build. */
  reload: (r: { at: string }) => void
}

export interface TableChannel {
  sendEncounter(e: Encounter): void
  sendHandout(h: Handout): void
  sendRoll(r: RollEvent): void
  sendCondition(c: ConditionEvent): void
  sendRace(r: RaceEvent): void
  sendBargain(b: BargainEvent): void
  sendStage(s: StageState): void
  sendVitals(v: VitalsEvent): void
  sendWheel(w: WheelEvent): void
  sendGame(g: GameEvent): void
  sendFinale(f: FinaleEvent): void
  sendReload(): void
  close(): void
}

const EVENTS = ['encounter', 'handout', 'roll', 'condition', 'race', 'bargain', 'stage', 'vitals', 'wheel', 'game', 'finale', 'reload'] as const
type EventName = (typeof EVENTS)[number]

/**
 * One live channel per campaign, shared by every component on this device.
 *
 * supabase-js hands back the SAME RealtimeChannel for the same topic — so
 * when the sheet, the live layer and the Table each "joined" and one of them
 * unmounted and closed, it tore the subscription out from under the others
 * (a phone stopped hearing the DM the moment it visited Spells). Now the
 * channel is ref-counted: joins add their handlers to a set, close removes
 * them, and the socket only leaves when the last join is gone.
 */
interface Shared {
  channel: RealtimeChannel
  joins: Set<Partial<TableEvents>>
  ready: Promise<void>
}
const shared = new Map<string, Shared>()

function acquire(campaignId: string): Shared {
  const have = shared.get(campaignId)
  if (have) return have
  const channel: RealtimeChannel = supabase!.channel(`table:${campaignId}`, {
    config: { broadcast: { self: true } },
  })
  const joins = new Set<Partial<TableEvents>>()
  for (const ev of EVENTS) {
    channel.on('broadcast', { event: ev }, (msg) => {
      for (const j of joins) {
        const fn = j[ev] as ((p: unknown) => void) | undefined
        if (fn) fn(msg.payload)
      }
    })
  }
  // Sends wait for SUBSCRIBED (before it, supabase-js falls back to an HTTP
  // broadcast our phones never saw) — or 6 s, then go anyway.
  let joined: () => void = () => {}
  const ready = Promise.race([
    new Promise<void>((resolve) => {
      joined = resolve
    }),
    new Promise<void>((resolve) => setTimeout(resolve, 6000)),
  ])
  channel.subscribe((status) => {
    if (status === 'SUBSCRIBED') joined()
  })
  const s: Shared = { channel, joins, ready }
  shared.set(campaignId, s)
  return s
}

const INERT: TableChannel = {
  sendEncounter: () => {},
  sendHandout: () => {},
  sendRoll: () => {},
  sendCondition: () => {},
  sendRace: () => {},
  sendBargain: () => {},
  sendStage: () => {},
  sendVitals: () => {},
  sendWheel: () => {},
  sendGame: () => {},
  sendFinale: () => {},
  sendReload: () => {},
  close: () => {},
}

/**
 * Join the campaign's table channel. `campaignId` comes from the
 * get_channel RPC; pass null (offline mode) and you get an inert channel.
 */
export function joinTableChannel(campaignId: string | null, on: Partial<TableEvents>): TableChannel {
  if (!supabase || !campaignId) return INERT
  const s = acquire(campaignId)
  s.joins.add(on)
  let open = true
  const send = (event: EventName, payload: unknown) => {
    if (!open) return
    void s.ready.then(() => {
      if (open) void s.channel.send({ type: 'broadcast', event, payload })
    })
  }
  return {
    sendEncounter: (e) => send('encounter', e),
    sendHandout: (h) => send('handout', h),
    sendRoll: (r) => send('roll', r),
    sendCondition: (c) => send('condition', c),
    sendRace: (r) => send('race', r),
    sendBargain: (b) => send('bargain', b),
    sendStage: (st) => send('stage', st),
    sendVitals: (v) => send('vitals', v),
    sendWheel: (w) => send('wheel', w),
    sendGame: (g) => send('game', g),
    sendFinale: (f) => send('finale', f),
    sendReload: () => send('reload', { at: new Date().toISOString() }),
    close() {
      if (!open) return
      open = false
      s.joins.delete(on)
      if (s.joins.size === 0 && shared.get(campaignId) === s) {
        shared.delete(campaignId)
        void supabase!.removeChannel(s.channel)
      }
    },
  }
}

/**
 * Join the table channel as soon as a component mounts, before the campaign
 * id has come back from the RPC. Every send is queued until the real channel
 * exists (and has subscribed), so a DM who opens the Table and taps "Begin"
 * in the same breath never sends into the void. Close is safe at any time.
 */
export function joinTableChannelLazy(campaignId: Promise<string | null>, on: Partial<TableEvents>): TableChannel {
  let real: TableChannel | null = null
  let closed = false
  const queue: ((c: TableChannel) => void)[] = []
  void campaignId.then((id) => {
    if (closed) return
    real = joinTableChannel(id, on)
    for (const q of queue) q(real)
    queue.length = 0
  })
  const via = (fn: (c: TableChannel) => void) => {
    if (real) fn(real)
    else if (!closed) queue.push(fn)
  }
  return {
    sendEncounter: (e) => via((c) => c.sendEncounter(e)),
    sendHandout: (h) => via((c) => c.sendHandout(h)),
    sendRoll: (r) => via((c) => c.sendRoll(r)),
    sendCondition: (x) => via((c) => c.sendCondition(x)),
    sendRace: (r) => via((c) => c.sendRace(r)),
    sendBargain: (b) => via((c) => c.sendBargain(b)),
    sendStage: (s) => via((c) => c.sendStage(s)),
    sendVitals: (v) => via((c) => c.sendVitals(v)),
    sendWheel: (w) => via((c) => c.sendWheel(w)),
    sendGame: (g) => via((c) => c.sendGame(g)),
    sendFinale: (f) => via((c) => c.sendFinale(f)),
    sendReload: () => via((c) => c.sendReload()),
    close() {
      closed = true
      queue.length = 0
      real?.close()
    },
  }
}
