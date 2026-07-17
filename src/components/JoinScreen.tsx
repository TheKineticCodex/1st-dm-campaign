import { useState } from 'react'
import { mintDeviceToken, saveDeviceSession, type DeviceSession } from '../lib/storage'
import { getStore } from '../lib/store'
import { Btn, C, Lanterns, TextInput, body, display } from './ui'

interface JoinScreenProps {
  onJoined: (session: DeviceSession) => void
}

export function JoinScreen({ onJoined }: JoinScreenProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

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
        background: `radial-gradient(1200px 600px at 50% -10%, #2B1E55 0%, ${C.night} 55%)`,
        ...body,
        color: C.parchment,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: 24,
      }}
    >
      <Lanterns />
      <div className="w-full mx-auto" style={{ maxWidth: 480 }}>
        <div className="text-center mb-7" style={{ animation: 'cardRise .45s ease-out' }}>
          <div className="spark" style={{ fontSize: 28 }} aria-hidden="true">
            ✦
          </div>
          <h1 className="title-glow" style={{ ...display, fontSize: 36, fontWeight: 700, color: C.gold, marginTop: 8 }}>
            The Song the Sea Forgot
          </h1>
          <p className="mt-3 italic" style={{ color: C.faint }}>
            The carnival never charges coin. What it does charge is another matter.
          </p>
        </div>

        <div
          className="rounded-xl p-5 grid gap-4 gate-card"
          style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, animation: 'cardRise .55s ease-out' }}
        >
          <label className="grid gap-1">
            <span className="text-sm" style={{ color: C.sea }}>
              Invitation code
            </span>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="SEAFORGOT"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              className="w-full rounded-lg px-4 py-3 outline-none uppercase"
              style={{
                background: C.night,
                border: `1px solid ${C.panelEdge}`,
                color: C.parchment,
                letterSpacing: '0.12em',
                minHeight: 44,
              }}
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm" style={{ color: C.sea }}>
              Your name
            </span>
            <TextInput value={name} onChange={setName} placeholder="What shall the lanterns call you?" />
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

        <p className="text-center mt-6" style={{ color: C.faint, fontSize: 11, lineHeight: 1.5 }}>
          Unofficial Fan Content permitted under the Fan Content Policy. Not approved/endorsed by
          Wizards. Portions of the materials used are property of Wizards of the Coast. ©Wizards
          of the Coast LLC. Includes content from the SRD 5.2, © Wizards of the Coast, licensed
          under CC-BY-4.0.
        </p>
      </div>
    </main>
  )
}
