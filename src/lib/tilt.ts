// ✧ The lantern light follows the hand. The phone's gyroscope drives two CSS
// variables on <html> — --tilt-x and --tilt-y, each −1..1, smoothed — and
// anything on the page can use them in pure CSS (a sheen that slides across
// the medallion, a halo that leans). No React re-renders; one rAF loop.
//
// iOS needs a tap-time permission (DeviceOrientationEvent.requestPermission);
// Android just streams. We never ask on page load — only inside a tap.

import { readCache, writeCache } from './storage'

type Perm = 'granted' | 'denied' | 'unknown'
let running = false
let target = { x: 0, y: 0 }
let current = { x: 0, y: 0 }
let raf = 0
let base: { beta: number; gamma: number } | null = null

const clamp = (v: number, m = 1) => Math.max(-m, Math.min(m, v))

function onOrient(e: DeviceOrientationEvent) {
  if (e.beta == null || e.gamma == null) return
  // Calibrate to how the phone is held on the first reading — "flat" is wherever you are.
  if (!base) base = { beta: e.beta, gamma: e.gamma }
  const dy = e.beta - base.beta // forward/back
  const dx = e.gamma - base.gamma // left/right
  target = { x: clamp(dx / 25), y: clamp(dy / 25) }
}

function loop() {
  current = { x: current.x + (target.x - current.x) * 0.08, y: current.y + (target.y - current.y) * 0.08 }
  const s = document.documentElement.style
  s.setProperty('--tilt-x', current.x.toFixed(3))
  s.setProperty('--tilt-y', current.y.toFixed(3))
  raf = requestAnimationFrame(loop)
}

export function tiltPermission(): Perm {
  return readCache<Perm>('tilt-permission') ?? 'unknown'
}
export function tiltRunning(): boolean {
  return running
}

/** Does this device even have the API? */
export function tiltPossible(): boolean {
  return typeof window !== 'undefined' && 'DeviceOrientationEvent' in window
}

/**
 * Start the light. Call from inside a tap on iOS (it may prompt). Resolves
 * true when orientation events are flowing (or at least allowed).
 */
export async function startTilt(): Promise<boolean> {
  if (running) return true
  if (!tiltPossible()) return false
  const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<'granted' | 'denied'> }
  try {
    if (typeof DOE.requestPermission === 'function') {
      const r = await DOE.requestPermission()
      writeCache('tilt-permission', r === 'granted' ? 'granted' : 'denied')
      if (r !== 'granted') return false
    } else {
      writeCache('tilt-permission', 'granted')
    }
  } catch {
    writeCache('tilt-permission', 'denied')
    return false
  }
  base = null
  window.addEventListener('deviceorientation', onOrient, { passive: true })
  running = true
  document.documentElement.classList.add('tilt')
  raf = requestAnimationFrame(loop)
  return true
}

export function stopTilt(): void {
  if (!running) return
  window.removeEventListener('deviceorientation', onOrient)
  cancelAnimationFrame(raf)
  running = false
  document.documentElement.classList.remove('tilt')
  const s = document.documentElement.style
  s.setProperty('--tilt-x', '0')
  s.setProperty('--tilt-y', '0')
}

/** Re-centre "flat" to however the phone is held right now. */
export function recentreTilt(): void {
  base = null
}
