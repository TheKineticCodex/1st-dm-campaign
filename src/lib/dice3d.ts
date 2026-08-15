// 🎲 Real dice — physics dice tumble across the phone and land on the number
// the app already rolled. The result never comes from the physics: our
// secure random (lib/dice.ts) is the die; the 3D is theatre, forced to land
// on it (`1d20@17`). So the DM's feed, the card, and what the player sees
// always agree.
//
// Lazy: three.js + cannon-es load into their own chunk on the first roll,
// so a phone that never rolls (or can't do WebGL) never pays. Falls back to
// "no theatre" — the card just appears — when WebGL is missing, the user
// calmed the lanterns, or the OS asks for reduced motion.

import { isCalm, readCache } from './storage'

type Box = {
  initialize(): Promise<void>
  roll(notation: string): Promise<unknown>
  clearDice(): void
  updateConfig(c: Record<string, unknown>): Promise<void>
}

export interface DiceSpec {
  /** Sides: 4, 6, 8, 10, 12, 20, 100. */
  die: number
  /** The values each die must land on (already rolled). */
  values: number[]
}

const ID = 'sea-dice-3d'
let box: Box | null = null
let loading: Promise<Box | null> | null = null
let disabled = false
let cleanup: ReturnType<typeof setTimeout> | null = null

/** Loud, gold, marbled — the Fair's dice. Face numbers in ink. */
const COLORSET = {
  name: 'the-fair',
  foreground: '#241A42',
  background: ['#E8B84B', '#F2D27A', '#D9A83A'],
  outline: '#241A42',
  texture: 'marble',
  material: 'glass',
}

function webglOk(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    return false
  }
}

/** Can this phone do the theatre? Cheap, sync, safe to call often. */
export function dice3dAvailable(): boolean {
  if (disabled) return false
  if (typeof window === 'undefined') return false
  if (isCalm()) return false
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return false
  // Automated browsers skip the theatre unless a test asks for it (keeps the phone e2e deterministic).
  if (navigator.webdriver && readCache<boolean>('dice3d-force') !== true) return false
  return webglOk()
}

function container(): HTMLElement {
  let el = document.getElementById(ID)
  if (el) return el
  el = document.createElement('div')
  el.id = ID
  el.setAttribute('aria-hidden', 'true')
  Object.assign(el.style, {
    position: 'fixed',
    inset: '0',
    zIndex: '45',
    pointerEvents: 'none',
    opacity: '0',
    transition: 'opacity .25s ease',
  } as CSSStyleDeclaration)
  document.body.appendChild(el)
  return el
}

async function load(): Promise<Box | null> {
  if (box) return box
  if (loading) return loading
  loading = (async () => {
    try {
      const mod = await import('@3d-dice/dice-box-threejs')
      const DiceBox = (mod as { default: new (sel: string, cfg: Record<string, unknown>) => Box }).default
      container()
      const b = new DiceBox(`#${ID}`, {
        assetPath: '/dice/',
        theme_customColorset: COLORSET,
        theme_surface: 'default',
        theme_material: 'glass',
        light_intensity: 0.9,
        gravity_multiplier: 600,
        baseScale: 96,
        strength: 1.3,
        shadows: true,
        sounds: false,
      })
      await b.initialize()
      box = b
      return b
    } catch (e) {
      console.warn('[dice3d] unavailable', e)
      disabled = true
      return null
    }
  })()
  return loading
}

/** Warm the engine in the background (call after first paint, on a phone that has a sheet). */
export function warmDice3d(): void {
  if (!dice3dAvailable()) return
  const idle = (window as unknown as { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => void }).requestIdleCallback
  if (idle) idle(() => void load(), { timeout: 4000 })
  else setTimeout(() => void load(), 1500)
}

function notation(spec: DiceSpec[]): string {
  return spec
    .filter((s) => s.values.length > 0 && [4, 6, 8, 10, 12, 20, 100].includes(s.die))
    .map((s) => `${s.values.length}d${s.die}@${s.values.join(',')}`)
    .join('+')
}

/**
 * Throw the dice and resolve when they've landed. Resolves immediately (false)
 * when the theatre isn't available, so callers can show the card at once.
 * The dice stay on screen until `clearDice3d()` or ~5 s.
 */
export async function rollDice3d(spec: DiceSpec[]): Promise<boolean> {
  if (!dice3dAvailable()) return false
  const n = notation(spec)
  if (!n) return false
  const b = await load()
  if (!b) return false
  const el = container()
  if (cleanup) clearTimeout(cleanup)
  el.style.opacity = '1'
  try {
    // Physics with a hard ceiling — a hung simulation must never hold the card hostage.
    await Promise.race([b.roll(n), new Promise((r) => setTimeout(r, 4500))])
  } catch (e) {
    console.warn('[dice3d] roll failed', e)
    disabled = true
    el.style.opacity = '0'
    return false
  }
  cleanup = setTimeout(() => clearDice3d(), 5000)
  return true
}

/** Sweep the dice off the table. */
export function clearDice3d(): void {
  if (cleanup) clearTimeout(cleanup)
  cleanup = null
  const el = document.getElementById(ID)
  if (el) el.style.opacity = '0'
  setTimeout(() => {
    try {
      box?.clearDice()
    } catch {
      /* nothing to clear */
    }
  }, 260)
}
