import { Suspense, lazy, useState } from 'react'
import { JoinScreen } from './components/JoinScreen'
import { NewPages } from './components/NewPages'
import { getDeviceSession, initCalm, type DeviceSession } from './lib/storage'

// The DM's Book is one device's worth of code; players never download it.
const DmDashboard = lazy(() => import('./components/DmDashboard').then((m) => ({ default: m.DmDashboard })))
const TabShell = lazy(() => import('./components/TabShell').then((m) => ({ default: m.TabShell })))

const Lighting = () => (
  <p style={{ color: '#B3AA97', textAlign: 'center', marginTop: 80, fontFamily: "'Vollkorn', Georgia, serif" }}>The lanterns are lighting…</p>
)

initCalm()

function App() {
  const [session, setSession] = useState<DeviceSession | null>(() => getDeviceSession())

  const screen = !session ? (
    <JoinScreen onJoined={setSession} />
  ) : session.role === 'dm' ? (
    <Suspense fallback={<Lighting />}>
      <DmDashboard session={session} onLeave={() => setSession(null)} />
    </Suspense>
  ) : (
    <Suspense fallback={<Lighting />}>
      <TabShell session={session} onLeave={() => setSession(null)} />
    </Suspense>
  )

  return (
    <>
      {screen}
      <NewPages />
    </>
  )
}

export default App
