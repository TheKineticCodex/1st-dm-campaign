import { useState } from 'react'
import { DmDashboard } from './components/DmDashboard'
import { JoinScreen } from './components/JoinScreen'
import { NewPages } from './components/NewPages'
import { TabShell } from './components/TabShell'
import { getDeviceSession, initCalm, type DeviceSession } from './lib/storage'

initCalm()

function App() {
  const [session, setSession] = useState<DeviceSession | null>(() => getDeviceSession())

  const screen = !session ? (
    <JoinScreen onJoined={setSession} />
  ) : session.role === 'dm' ? (
    <DmDashboard session={session} onLeave={() => setSession(null)} />
  ) : (
    <TabShell session={session} onLeave={() => setSession(null)} />
  )

  return (
    <>
      {screen}
      <NewPages />
    </>
  )
}

export default App
