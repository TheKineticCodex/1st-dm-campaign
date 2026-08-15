// Small sounds and a buzz for the phone. Progressive enhancement, never
// required: iOS blocks audio until the page has been tapped once (we unlock
// on the first gesture and stay quiet until then), iOS Safari has no
// Vibration API (Android does). Everything here degrades to nothing.

let AC: AudioContext | null = null
let unlocked = false

function ctx(): AudioContext | null {
  if (!unlocked) return null
  if (!AC) {
    try {
      AC = new AudioContext()
    } catch {
      return null
    }
  }
  return AC
}

/** Call once at app start: the first tap anywhere unlocks audio for later. */
export function armPhoneSound(): void {
  if (typeof window === 'undefined') return
  const unlock = () => {
    unlocked = true
    const a = ctx()
    if (a && a.state === 'suspended') void a.resume()
    window.removeEventListener('pointerdown', unlock)
    window.removeEventListener('keydown', unlock)
  }
  window.addEventListener('pointerdown', unlock, { passive: true })
  window.addEventListener('keydown', unlock)
}

function tone(a: AudioContext, freq: number, t: number, dur: number, gain: number, type: OscillatorType = 'sine') {
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(gain, t + 0.01)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.05)
}

/** The tap on the shoulder: two bright bell notes. */
export function chimeYourTurn(): void {
  const a = ctx()
  if (!a) return
  const t = a.currentTime + 0.02
  tone(a, 784, t, 0.5, 0.18)
  tone(a, 1568, t, 0.35, 0.05)
  tone(a, 1175, t + 0.18, 0.7, 0.16)
  tone(a, 2350, t + 0.18, 0.4, 0.04)
}

/** A gentle single note: you're up next. */
export function chimeUpNext(): void {
  const a = ctx()
  if (!a) return
  tone(a, 659, a.currentTime + 0.02, 0.45, 0.1)
}

/** One low heartbeat pair, for the dying. */
export function heartbeat(): void {
  const a = ctx()
  if (!a) return
  const t = a.currentTime + 0.02
  for (const w of [0, 0.32]) {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = 'sine'
    o.frequency.setValueAtTime(58, t + w)
    o.frequency.exponentialRampToValueAtTime(40, t + w + 0.15)
    g.gain.setValueAtTime(0.0001, t + w)
    g.gain.exponentialRampToValueAtTime(0.35, t + w + 0.01)
    g.gain.exponentialRampToValueAtTime(0.0001, t + w + 0.28)
    o.connect(g).connect(a.destination)
    o.start(t + w)
    o.stop(t + w + 0.35)
  }
}

/** Buzz where the platform allows (Android Chrome). Silent no-op elsewhere. */
export function buzz(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern)
  } catch {
    /* no haptics here */
  }
}
