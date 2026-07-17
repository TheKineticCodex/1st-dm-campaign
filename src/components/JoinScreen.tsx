import { useState } from 'react'
import {
  mintDeviceToken,
  saveDeviceSession,
  type DeviceSession,
} from '../lib/storage'

interface JoinScreenProps {
  onJoined: (session: DeviceSession) => void
}

export function JoinScreen({ onJoined }: JoinScreenProps) {
  const [code, setCode] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  function handleJoin() {
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
    // Campaign code validation against the server happens once Supabase is
    // configured; until then any code opens the door (offline mode).
    const session: DeviceSession = {
      campaignCode: trimmedCode,
      playerName: trimmedName,
      deviceToken: mintDeviceToken(),
      role: 'player',
    }
    saveDeviceSession(session)
    onJoined(session)
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '24px',
        maxWidth: 480,
        margin: '0 auto',
      }}
    >
      <div className="rise" style={{ textAlign: 'center', marginBottom: 28 }}>
        <div className="spark" style={{ fontSize: 28 }} aria-hidden="true">
          ✦
        </div>
        <h1 style={{ fontSize: 34, marginTop: 8 }}>The Song the Sea Forgot</h1>
        <p className="faint" style={{ marginTop: 10, fontStyle: 'italic' }}>
          The carnival never charges coin. What it does charge is another
          matter.
        </p>
      </div>

      <div className="panel rise" style={{ display: 'grid', gap: 14 }}>
        <label style={{ display: 'grid', gap: 6 }}>
          <span className="accent" style={{ fontSize: 15 }}>
            Invitation code
          </span>
          <input
            className="field"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="SEAFORGOT"
            autoCapitalize="characters"
            autoCorrect="off"
            spellCheck={false}
            style={{ letterSpacing: '0.12em', textTransform: 'uppercase' }}
          />
        </label>

        <label style={{ display: 'grid', gap: 6 }}>
          <span className="accent" style={{ fontSize: 15 }}>
            Your name
          </span>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What shall the lanterns call you?"
            autoComplete="given-name"
          />
        </label>

        {error && (
          <p role="alert" style={{ color: 'var(--gold)', fontSize: 15 }}>
            {error}
          </p>
        )}

        <button type="button" className="btn btn-gold" onClick={handleJoin}>
          Step through the gate ✦
        </button>
      </div>
    </main>
  )
}
