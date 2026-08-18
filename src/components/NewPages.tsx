/// <reference types="vite-plugin-pwa/react" />
// "The Book has new pages" — noticing a newer build, and actually taking it.
//
// THE OLD VERSION NEVER FIRED. It compared the loaded bundle against a
// `fetch('/index.html', { cache: 'no-store' })` — but index.html is precached
// by the service worker, and no-store bypasses the HTTP cache, not the worker.
// The worker answered with its own stale copy, so the check compared the old
// build against itself forever. And `location.reload()` re-served the same
// cached shell, which is why refreshing by hand did nothing either.
//
// This uses the worker's own lifecycle instead: when a new one is waiting,
// updateServiceWorker(true) skips the wait, claims the page, and reloads onto
// the new build. It also listens for the Lantern-Keeper's "turn the page",
// so five phones can be brought forward without asking five people to do
// anything.

import { useEffect, useRef, useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'
import { getDeviceSession } from '../lib/storage'
import { joinTableChannelLazy, type TableChannel } from '../lib/realtime'
import { getStore } from '../lib/store'
import { C, display, goldAction } from './ui'
import { Spark } from './icons'

/** Ask the worker whether anything newer has landed. */
const CHECK_MS = 60_000

export function NewPages() {
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, r) {
      if (!r) return
      const look = () => void r.update().catch(() => {})
      const onVisible = () => {
        if (document.visibilityState === 'visible') look()
      }
      setInterval(look, CHECK_MS)
      document.addEventListener('visibilitychange', onVisible)
    },
  })

  // The Book can turn everybody's page at once. A device with nothing new
  // waiting simply reloads, which is harmless and still shakes off a stale
  // shell; a device with an update waiting takes it.
  const [told, setTold] = useState(false)
  const channel = useRef<TableChannel | null>(null)
  useEffect(() => {
    const session = getDeviceSession()
    if (!session) return
    let cancelled = false
    ;(async () => {
      const id = await getStore(session).getChannelId()
      if (cancelled || !id) return
      channel.current = joinTableChannelLazy(Promise.resolve(id), {
        reload: () => setTold(true),
      })
    })()
    return () => {
      cancelled = true
      channel.current?.close()
    }
  }, [])

  useEffect(() => {
    if (!told) return
    // If a new worker is waiting this reloads onto it. If there is nothing new
    // on this device, updateServiceWorker resolves without doing anything —
    // so reload anyway a moment later, which still shakes off a stale shell.
    void updateServiceWorker(true).catch(() => {})
    const t = setTimeout(() => location.reload(), 1500)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [told])

  if (!needRefresh) return null
  return (
    <button
      type="button"
      onClick={() => void updateServiceWorker(true)}
      className="fixed left-1/2 rounded-full px-5 py-2.5 inline-flex items-center gap-2"
      style={{
        ...display,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 84px)',
        transform: 'translateX(-50%)',
        zIndex: 90,
        ...goldAction,
        // the type gate: Fraunces never below 18px
        fontSize: 18,
        fontWeight: 700,
        boxShadow: `inset 0 1px 0 rgba(255,245,215,0.7), inset 0 -2px 0 rgba(90,55,10,0.25), 0 6px 26px rgba(240,181,79,0.35)`,
        maxWidth: 'calc(100vw - 32px)',
        minHeight: 44,
        cursor: 'pointer',
        color: C.ink,
      }}
    >
      <Spark size={15} style={{ flexShrink: 0 }} />
      <span>The Book has new pages — tap to turn them</span>
    </button>
  )
}
