// Small pieces of motion the whole player app shares.
//
//   <RollingNumber value={hp} />   digits that roll like an odometer when the
//                                  number changes (HP, slots, coins)
//   <LanternToggle />              ✧ the light that follows the hand — asks
//                                  iOS for the gyroscope inside the tap
//   goWithTransition(fn)           wraps a state change in a View Transition
//                                  when the browser has one (Safari 18+,
//                                  Chrome 111+); plain call otherwise

import { useState } from 'react'
import { flushSync } from 'react-dom'
import { isCalm } from '../lib/storage'
import { startTilt, stopTilt, tiltPermission, tiltPossible, tiltRunning } from '../lib/tilt'
import { C } from './ui'

// ------------------------------------------------------------ view transitions

type VTDocument = Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }

/** Blink only: WebKit's same-document transitions crashed under test (Aug 2026); iOS keeps the plain switch. */
const blink = typeof window !== 'undefined' && !!(window as unknown as { chrome?: unknown }).chrome

/** Change state under a page transition. Falls back to a plain call. */
export function goWithTransition(update: () => void): void {
  const doc = document as VTDocument
  if (!blink || isCalm() || typeof doc.startViewTransition !== 'function' || window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    update()
    return
  }
  try {
    doc.startViewTransition(() => flushSync(update))
  } catch {
    update()
  }
}

// ------------------------------------------------------------ rolling number

/**
 * A number whose digits roll to their new values. The real digits stay in
 * the DOM as (transparent) text — so screen readers, copy, and tests see
 * "31" — while a CSS column of 0–9 slides over each one.
 */
export function RollingNumber({ value, style }: { value: number; style?: React.CSSProperties }) {
  const v = Math.max(0, Math.round(value))
  const digits = String(v).split('').map(Number)
  if (isCalm()) return <span style={style}>{v}</span>
  return (
    <span className="rolling-number" style={style}>
      {digits.map((d, i) => (
        <span key={digits.length - i} className="rolling-digit">
          <span className="rolling-digit-col" aria-hidden="true" style={{ transform: `translateY(-${d * 10}%)`, transitionDelay: `${(digits.length - 1 - i) * 40}ms` }} />
          <span className="rolling-digit-text">{d}</span>
        </span>
      ))}
    </span>
  )
}

// ------------------------------------------------------------ the lantern

/** ✧ Let the light move with the phone. On iOS this asks once, inside the tap. */
export function LanternToggle() {
  const [on, setOn] = useState(tiltRunning())
  const [denied, setDenied] = useState(tiltPermission() === 'denied')
  if (!tiltPossible()) return null
  return (
    <button
      type="button"
      aria-pressed={on}
      title={denied ? 'Motion was declined for this site — allow it in Settings › Safari to let the light move' : on ? 'still the light' : 'let the light follow your hand'}
      onClick={async () => {
        if (on) {
          stopTilt()
          setOn(false)
          return
        }
        const ok = await startTilt()
        setOn(ok)
        setDenied(!ok)
      }}
      className="text-xs"
      style={{ color: on ? C.gold : C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer', whiteSpace: 'nowrap' }}
    >
      {on ? '✧ light on' : '✧ light'}
    </button>
  )
}
