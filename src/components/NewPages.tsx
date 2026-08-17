// "The Book has new pages" — detects a newer deployed build and offers a
// one-tap refresh. Kills the stale-cache class of bug (blank Run the
// Night, missing spellbook) that bit us on Night One.
//
// Mechanism: the built index.html references a content-hashed JS bundle.
// We refetch index.html (cache-bypassed) and compare its bundle hash to
// the one this page actually loaded. Checks run every few minutes and
// whenever the app returns to the foreground (the moment staleness bites).

import { useEffect, useState } from 'react'
import { C, display, goldAction } from './ui'
import { Spark } from './icons'

const CHECK_MS = 4 * 60_000

function loadedBundle(): string | null {
  const script = document.querySelector<HTMLScriptElement>('script[src*="/assets/index-"]')
  return script ? new URL(script.src, location.href).pathname : null
}

async function deployedBundle(): Promise<string | null> {
  try {
    const res = await fetch('/index.html', { cache: 'no-store' })
    if (!res.ok) return null
    const html = await res.text()
    const m = html.match(/src="(\/assets\/index-[^"]+\.js)"/)
    return m ? m[1] : null
  } catch {
    return null
  }
}

export function NewPages() {
  const [fresh, setFresh] = useState(false)

  useEffect(() => {
    const current = loadedBundle()
    if (!current) return
    let cancelled = false

    const check = async () => {
      const latest = await deployedBundle()
      if (!cancelled && latest && latest !== current) setFresh(true)
    }

    const onVisible = () => {
      if (document.visibilityState === 'visible') void check()
    }

    const timer = setInterval(check, CHECK_MS)
    document.addEventListener('visibilitychange', onVisible)
    void check()
    return () => {
      cancelled = true
      clearInterval(timer)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  if (!fresh) return null
  return (
    <button
      type="button"
      onClick={() => location.reload()}
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
