import { useState } from 'react'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'

export type TabId = 'fortune' | 'build' | 'sheet' | 'guide'

const TABS: { id: TabId; label: string; glyph: string }[] = [
  { id: 'fortune', label: 'Fortune', glyph: '☾' },
  { id: 'build', label: 'Build', glyph: '⚒' },
  { id: 'sheet', label: 'Sheet', glyph: '✎' },
  { id: 'guide', label: 'Guide', glyph: '❧' },
]

/**
 * Placeholder copy until the witchlight-quiz / players-companion prototypes
 * are ported into each tab. Each placeholder is replaced by a real screen
 * in Phase 1.
 */
const PLACEHOLDERS: Record<TabId, { title: string; body: string }> = {
  fortune: {
    title: 'The Fortune Teller is still unpacking her wagon',
    body: 'Soon she will read what the sea took from you. The divination quiz arrives here.',
  },
  build: {
    title: 'The Character Forge is being stoked',
    body: 'Species, class, background — the makings of a traveler. The builder arrives here.',
  },
  sheet: {
    title: 'Your page in the ledger is still blank',
    body: 'When your character is forged, their sheet lives here — dice, hit points, spells and all.',
  },
  guide: {
    title: 'The Rules of the Road are being lettered',
    body: 'A gentle guide for first-time travelers of the Feywild. It arrives here.',
  },
}

interface TabShellProps {
  session: DeviceSession
  onLeave: () => void
}

export function TabShell({ session, onLeave }: TabShellProps) {
  const [tab, setTab] = useState<TabId>('fortune')
  const placeholder = PLACEHOLDERS[tab]

  function handleLeave() {
    if (window.confirm('Leave the carnival? Your things stay saved on this device.')) {
      clearDeviceSession()
      onLeave()
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        maxWidth: 720,
        margin: '0 auto',
      }}
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          padding: '18px 20px 6px',
        }}
      >
        <h1 style={{ fontSize: 22 }}>
          <span className="spark" aria-hidden="true">
            ✦
          </span>{' '}
          The Song the Sea Forgot
        </h1>
        <button
          type="button"
          onClick={handleLeave}
          className="faint"
          style={{
            background: 'none',
            border: 'none',
            fontSize: 14,
            minHeight: 'var(--tap-target)',
            cursor: 'pointer',
          }}
        >
          {session.playerName} · leave
        </button>
      </header>

      <main style={{ flex: 1, padding: '12px 20px 20px' }}>
        <section key={tab} className="panel rise" aria-live="polite">
          <h2 style={{ fontSize: 24 }}>{placeholder.title}</h2>
          <p className="faint" style={{ marginTop: 10 }}>
            {placeholder.body}
          </p>
        </section>
      </main>

      <nav
        aria-label="Sections"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 6,
          padding: '8px 12px calc(10px + env(safe-area-inset-bottom))',
          background: 'var(--panel)',
          borderTop: '1px solid var(--panel-edge)',
          position: 'sticky',
          bottom: 0,
        }}
      >
        {TABS.map((t) => {
          const active = t.id === tab
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              aria-current={active ? 'page' : undefined}
              style={{
                minHeight: 'var(--tap-target)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                background: active ? 'var(--night)' : 'transparent',
                color: active ? 'var(--gold)' : 'var(--faint)',
                fontFamily: 'var(--font-display)',
                fontSize: 16,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'grid',
                gap: 2,
                placeItems: 'center',
                padding: '6px 0',
              }}
            >
              <span aria-hidden="true" style={{ fontSize: 15 }}>
                {t.glyph}
              </span>
              {t.label}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
