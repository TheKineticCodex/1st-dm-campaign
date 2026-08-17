// The Gate — the ticket booth at the edge of the Getting Fair. One string of
// bulbs along the top, the lantern hung over the Sea, the title lit from
// above, one brass action. The card is the only thing with brass corner
// marks; the legal line sits clear of the card's shadow at full --faint.

import { useEffect, useState } from 'react'
import { mintDeviceToken, saveDeviceSession, type DeviceSession } from '../lib/storage'
import { getStore } from '../lib/store'
import { Btn, C, Lanterns, TextInput, body, display, eyebrow, nightGround, panelSurface, wellSurface } from './ui'
import { Lantern, SparkRule } from './icons'

interface JoinScreenProps {
  onJoined: (session: DeviceSession) => void
}

export function JoinScreen({ onJoined }: JoinScreenProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  // The Gate hangs one more lantern over the ground — through the CSS variable
  // theme.css reads (html.gate sets --gate-glow), never a second fixed layer.
  useEffect(() => {
    const root = document.documentElement
    root.classList.add('gate')
    return () => root.classList.remove('gate')
  }, [])

  async function handleJoin() {
    const trimmedCode = code.trim().toUpperCase()
    const trimmedName = name.trim()
    if (!trimmedCode) {
      setError('The lanterns need a word to light your way. Enter your invitation code.')
      return
    }
    if (!trimmedName) {
      setError('Every traveler owes the carnival a name — even a borrowed one.')
      return
    }
    setBusy(true)
    const provisional: DeviceSession = {
      campaignCode: trimmedCode,
      playerName: trimmedName,
      deviceToken: mintDeviceToken(),
      role: 'player',
    }
    const role = await getStore(provisional).joinCampaign(trimmedCode, trimmedName, provisional.deviceToken)
    setBusy(false)
    if (role === 'invalid') {
      setError('The lanterns do not recognize that word. Check the code your Dungeon Master sent you.')
      return
    }
    const session: DeviceSession = { ...provisional, role }
    saveDeviceSession(session)
    onJoined(session)
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: nightGround,
        ...body,
        color: C.parchment,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px 24px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* the fair's string of bulbs — top edge only, faded at both ends */}
      <div
        aria-hidden="true"
        className="bulb-row"
        style={{ position: 'absolute', top: 'calc(10px + env(safe-area-inset-top))', left: 0, right: 0, opacity: 0.7 }}
      />
      <Lanterns />
      <div className="w-full mx-auto" style={{ maxWidth: 480, position: 'relative' }}>
        <div className="text-center mb-6" style={{ animation: 'cardRise .45s var(--ease-lantern)' }}>
          {/* the emblem: the lantern hung over two lines of the Sea */}
          <div className="mx-auto" style={{ display: 'inline-block', filter: 'drop-shadow(0 0 18px rgba(240,181,79,0.28))' }} aria-hidden="true">
            <Lantern size={84} waves />
          </div>
          <p style={{ ...eyebrow, letterSpacing: '0.3em', marginTop: 8 }}>The Getting Fair · Saltmere</p>
          <h1
            className="title-glow"
            style={{
              ...display,
              fontVariationSettings: "'opsz' 144",
              fontSize: 42,
              fontWeight: 700,
              color: C.gold,
              marginTop: 4,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              textWrap: 'balance',
            }}
          >
            The Song the Sea Forgot
          </h1>
          <SparkRule style={{ maxWidth: 220, margin: '14px auto 0' }} />
          <p className="mt-3" style={{ ...display, fontStyle: 'italic', fontWeight: 600, fontSize: 18, lineHeight: 1.4, color: C.faint, textWrap: 'balance' }}>
            The carnival never charges coin. What it does charge is another matter.
          </p>
        </div>

        <div
          className="rounded-xl p-5 grid gap-4 gate-card"
          style={{ ...panelSurface, borderRadius: 14, animation: 'cardRise .55s var(--ease-lantern)', position: 'relative' }}
        >
          {/* brass corner marks — the ticket booth. On the card only. */}
          {(['nw', 'ne', 'sw', 'se'] as const).map((k) => (
            <span
              key={k}
              aria-hidden="true"
              style={{
                position: 'absolute',
                width: 14,
                height: 14,
                top: k[0] === 'n' ? 6 : undefined,
                bottom: k[0] === 's' ? 6 : undefined,
                left: k[1] === 'w' ? 6 : undefined,
                right: k[1] === 'e' ? 6 : undefined,
                borderTop: k[0] === 'n' ? `1px solid ${C.brassDim}` : undefined,
                borderBottom: k[0] === 's' ? `1px solid ${C.brassDim}` : undefined,
                borderLeft: k[1] === 'w' ? `1px solid ${C.brassDim}` : undefined,
                borderRight: k[1] === 'e' ? `1px solid ${C.brassDim}` : undefined,
                opacity: 0.85,
                pointerEvents: 'none',
              }}
            />
          ))}
          <label className="grid gap-1">
            <span style={{ ...eyebrow, letterSpacing: '0.18em' }}>Invitation code</span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && void handleJoin()}
              placeholder="SEAFORGOT"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-lg px-4 py-3 outline-none uppercase"
              style={{
                ...body,
                ...wellSurface,
                color: C.goldHi,
                letterSpacing: '0.18em',
                fontWeight: 600,
                fontSize: 17,
                minHeight: 46,
              }}
            />
          </label>

          <label className="grid gap-1">
            <span style={{ ...eyebrow, letterSpacing: '0.18em' }}>Your name</span>
            <TextInput
              value={name}
              onChange={setName}
              placeholder="What shall the lanterns call you?"
              onEnter={() => void handleJoin()}
            />
          </label>

          {error && (
            <p role="alert" className="text-sm" style={{ color: C.gold }}>
              {error}
            </p>
          )}

          <Btn shimmer onClick={handleJoin} disabled={busy}>
            {busy ? 'The gate is listening…' : 'Step through the gate ✦'}
          </Btn>
        </div>

        {/* the legal line — full --faint, 11px, clear of the card's shadow */}
        <p className="text-center" style={{ color: C.faint, fontSize: 11, lineHeight: 1.5, marginTop: 40, position: 'relative' }}>
          Unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by
          Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards
          of the Coast LLC. Includes content from the SRD 5.2, © Wizards of the Coast, licensed
          under CC-BY-4.0.
        </p>
      </div>
    </main>
  )
}
