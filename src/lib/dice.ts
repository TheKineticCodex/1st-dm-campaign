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

const d20 = () => Math.floor(Math.random() * 20) + 1

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
  const rolls = Array.from({ length: Number(n) }, () => Math.floor(Math.random() * Number(size)) + 1)
  return { rolls, total: rolls.reduce((s, r) => s + r, 0) + modifier }
}
