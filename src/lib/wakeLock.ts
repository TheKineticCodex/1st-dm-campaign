// Keep the glass lit: at the table, a sleeping screen means whispers and
// turn banners arrive to darkness. Holds a screen wake lock while the app
// is open and re-acquires it when the tab returns to the foreground.
// Silently does nothing where unsupported.

export function keepGlassLit(): () => void {
  let sentinel: { release(): Promise<void> } | null = null
  let released = false

  const request = async () => {
    try {
      const wl = (navigator as Navigator & { wakeLock?: { request(type: 'screen'): Promise<never> } }).wakeLock
      if (!wl || released) return
      sentinel = (await wl.request('screen')) as unknown as { release(): Promise<void> }
    } catch {
      // Battery saver or unsupported — the mundane world wins this one.
    }
  }

  const onVisibility = () => {
    if (document.visibilityState === 'visible') void request()
  }

  void request()
  document.addEventListener('visibilitychange', onVisibility)

  return () => {
    released = true
    document.removeEventListener('visibilitychange', onVisibility)
    void sentinel?.release().catch(() => {})
  }
}
