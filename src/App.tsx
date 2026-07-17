import { useState } from 'react'
import { JoinScreen } from './components/JoinScreen'
import { TabShell } from './components/TabShell'
import { getDeviceSession, type DeviceSession } from './lib/storage'

function App() {
  const [session, setSession] = useState<DeviceSession | null>(() =>
    getDeviceSession(),
  )

  if (!session) {
    return <JoinScreen onJoined={setSession} />
  }

  return <TabShell session={session} onLeave={() => setSession(null)} />
}

export default App
