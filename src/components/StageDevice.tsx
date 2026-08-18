// 🎪 The stage device — the iPad on its stand, and nothing else.
//
// Signed in with the Lantern-Keeper's code plus -STAGE, this device gets one
// screen for the whole night. There is no Book behind it: the ✕ signs it out
// to the gate, so a player who picks it up mid-scene finds a ticket booth,
// not the cheat sheet. The MacBook drives everything it shows.
//
// It keeps the glass awake, because a stage that sleeps is a dark table.

import { useEffect, useState } from 'react'
import { atTheTable } from '../data/campaign'
import { getStore, type RosterEntry } from '../lib/store'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'
import { keepGlassLit } from '../lib/wakeLock'
import { StageScreen } from './StageScreen'
import { C, nightGround, body } from './ui'

export function StageDevice({ session, onLeave }: { session: DeviceSession; onLeave: () => void }) {
  const store = getStore(session)
  const [roster, setRoster] = useState<RosterEntry[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => keepGlassLit(), [])

  // The roster names the tokens and matches the vitals; it refreshes quietly
  // so a character forged after the stage was lit still shows up.
  useEffect(() => {
    let cancelled = false
    const load = async () => {
      const r = await store.listRoster().catch(() => [])
      if (cancelled) return
      // The table's own screen never shows a spare device — a test phone must
      // not become a sixth face in front of five players.
      setRoster(atTheTable(r))
      setReady(true)
    }
    void load()
    const t = setInterval(() => void load(), 30000)
    return () => {
      cancelled = true
      clearInterval(t)
    }
  }, [store])

  const leave = () => {
    if (!window.confirm('Take this screen off the stage? You will need the stage code to light it again.')) return
    clearDeviceSession()
    onLeave()
  }

  if (!ready) {
    return (
      <main
        style={{ minHeight: '100dvh', background: nightGround, ...body, color: C.faint }}
        className="flex items-center justify-center"
      >
        <p>The stage is being lit…</p>
      </main>
    )
  }

  return <StageScreen store={store} roster={roster} onClose={leave} locked />
}
