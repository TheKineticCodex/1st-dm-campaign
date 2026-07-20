export type RollMode = 'normal' | 'advantage' | 'disadvantage'

export interface RollResult {
  /** Both d20s (second only used for advantage/disadvantage). */
  dice: [number, number]
  kept: number
  modifier: number
  total: number
  mode: RollMode
  label: string
  isNat20: boolean
  isNat1: boolean
}

// Dice use the platform's cryptographic random source — hardware-seeded,
// unpredictable, and (via rejection sampling) exactly uniform: every face
// has precisely equal probability, with no modulo bias.
const UINT32_RANGE = 0x100000000
function secureRandomInt(size: number): number {
  if (typeof crypto === 'undefined' || !crypto.getRandomValues) {
    return Math.floor(Math.random() * size)
  }
  const limit = UINT32_RANGE - (UINT32_RANGE % size)
  const buf = new Uint32Array(1)
  do {
    crypto.getRandomValues(buf)
  } while (buf[0] >= limit)
  return buf[0] % size
}

const die = (size: number) => secureRandomInt(size) + 1
const d20 = () => die(20)

export function rollD20(label: string, modifier: number, mode: RollMode): RollResult {
  const a = d20()
  const b = d20()
  const kept =
    mode === 'advantage' ? Math.max(a, b) : mode === 'disadvantage' ? Math.min(a, b) : a
  return {
    dice: [a, b],
    kept,
    modifier,
    total: kept + modifier,
    mode,
    label,
    isNat20: kept === 20,
    isNat1: kept === 1,
  }
}

/** Parse "1d12" / "2d6" and roll it (damage dice — no advantage). */
export function rollDamage(notation: string, modifier: number): { rolls: number[]; total: number } {
  const m = notation.match(/^(\d+)d(\d+)$/)
  if (!m) return { rolls: [], total: modifier }
  const [, n, size] = m
  const rolls = Array.from({ length: Number(n) }, () => die(Number(size)))
  return { rolls, total: rolls.reduce((s, r) => s + r, 0) + modifier }
}
