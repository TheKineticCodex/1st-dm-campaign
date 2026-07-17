/**
 * Device identity + offline cache, backed by localStorage.
 *
 * No accounts: a player joins with the campaign code + a name, and we mint
 * a device token so their phone reconnects silently next visit. The same
 * storage doubles as the offline cache for characters and quiz answers.
 */

const KEY_PREFIX = 'seaforgot:'

export interface DeviceSession {
  campaignCode: string
  playerName: string
  deviceToken: string
  role: 'player' | 'dm'
}

function key(name: string): string {
  return KEY_PREFIX + name
}

export function getDeviceSession(): DeviceSession | null {
  try {
    const raw = localStorage.getItem(key('session'))
    return raw ? (JSON.parse(raw) as DeviceSession) : null
  } catch {
    return null
  }
}

export function saveDeviceSession(session: DeviceSession): void {
  localStorage.setItem(key('session'), JSON.stringify(session))
}

export function clearDeviceSession(): void {
  localStorage.removeItem(key('session'))
}

export function mintDeviceToken(): string {
  return crypto.randomUUID()
}

/** Generic cached blob (character build, quiz answers, sheet state…). */
export function readCache<T>(name: string): T | null {
  try {
    const raw = localStorage.getItem(key(name))
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function writeCache<T>(name: string, value: T): void {
  localStorage.setItem(key(name), JSON.stringify(value))
}

// ---- "calm the lanterns": the in-app motion toggle ----

export function isCalm(): boolean {
  return readCache<boolean>('calm') === true
}

export function applyCalm(calm: boolean): void {
  writeCache('calm', calm)
  document.documentElement.classList.toggle('calm', calm)
}

/** Call once at startup so the stored preference takes effect. */
export function initCalm(): void {
  document.documentElement.classList.toggle('calm', isCalm())
}
