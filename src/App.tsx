import { useState } from 'react'
import { DmDashboard } from './components/DmDashboard'
import { JoinScreen } from './components/JoinScreen'
import { TabShell } from './components/TabShell'
import { getDeviceSession, initCalm, type DeviceSession } from './lib/storage'

initCalm()

function App() {
  const [session, setSession] = useState<DeviceSession | null>(() => getDeviceSession())

  if (!session) {
    return <JoinScreen onJoined={setSession} />
  }

  if (session.role === 'dm') {
    return <DmDashboard session={session} onLeave={() => setSession(null)} />
  }

  return <TabShell session={session} onLeave={() => setSession(null)} />
}

export default App
