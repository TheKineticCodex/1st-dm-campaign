import { useEffect, useMemo, useRef, useState } from 'react'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'
import { getStore } from '../lib/store'
import { EMPTY_BUILD, EMPTY_NOTES, EMPTY_STATE, type CharacterBuild, type QuizResult, type SavedCharacter } from '../types'
import { BuildTab } from './BuildTab'
import { FortuneTab } from './FortuneTab'
import { GuideTab } from './GuideTab'
import { PlayerLive } from './PlayerLive'
import { SheetTab } from './SheetTab'
import { C, body } from './ui'

export type TabId = 'fortune' | 'build' | 'sheet' | 'guide'

const TABS: [TabId, string, string][] = [
  ['fortune', '✦', 'Fortune'],
  ['build', '⚒', 'Build'],
  ['sheet', '❖', 'Sheet'],
  ['guide', '✧', 'Guide'],
]

interface TabShellProps {
  session: DeviceSession
  onLeave: () => void
}

export function TabShell({ session, onLeave }: TabShellProps) {
  const store = useMemo(() => getStore(session), [session])
  const [tab, setTab] = useState<TabId>('fortune')
  const [loaded, setLoaded] = useState(false)
  const [character, setCharacter] = useState<SavedCharacter | null>(null)
  const [draftBuild, setDraftBuild] = useState<CharacterBuild>(EMPTY_BUILD)
  const [quiz, setQuiz] = useState<QuizResult | null>(null)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [c, q] = await Promise.all([store.getCharacter(), store.getQuizResult()])
      if (cancelled) return
      if (c) {
        setCharacter(c)
        setDraftBuild(c.build)
        setTab('sheet')
      }
      if (q) setQuiz(q)
      setLoaded(true)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  const persistCharacter = (c: SavedCharacter) => {
    setCharacter(c)
    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => void store.saveCharacter(c), 600)
  }

  const forgeCharacter = () => {
    const c: SavedCharacter = {
      build: draftBuild,
      state: character?.state ?? EMPTY_STATE,
      notes: character?.notes ?? EMPTY_NOTES,
      updatedAt: new Date().toISOString(),
    }
    setCharacter(c)
    void store.saveCharacter(c)
    setTab('sheet')
  }

  const handleLeave = () => {
    if (window.confirm('Leave the carnival? Your things stay saved.')) {
      clearDeviceSession()
      onLeave()
    }
  }

  return (
    <div
      style={{
        minHeight: '100dvh',
        background: `radial-gradient(1200px 600px at 50% -10%, #2B1E55 0%, ${C.night} 55%)`,
        ...body,
        color: C.parchment,
      }}
      className="flex flex-col items-center px-4 pt-4 pb-24"
    >
      <PlayerLive store={store} playerName={session.playerName} />
      <div className="w-full" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: C.faint }}>
            ✦ {session.playerName} · {session.campaignCode}
            {!store.shared && ' · offline'}
          </p>
          <button
            type="button"
            onClick={handleLeave}
            className="text-xs"
            style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
          >
            leave
          </button>
        </div>

        {!loaded ? (
          <p className="text-center mt-10" style={{ color: C.faint }}>
            The lanterns are lighting…
          </p>
        ) : (
          <>
            {tab === 'fortune' && (
              <FortuneTab
                store={store}
                playerName={session.playerName}
                savedResult={quiz}
                onSaved={setQuiz}
                onBuildFromQuiz={(name, klass) => {
                  setDraftBuild({ ...draftBuild, name: draftBuild.name || name, klass: klass ?? draftBuild.klass })
                  setTab('build')
                }}
              />
            )}
            {tab === 'build' && <BuildTab build={draftBuild} onChange={setDraftBuild} onForged={forgeCharacter} />}
            {tab === 'sheet' && (
              <SheetTab
                character={character}
                onUpdate={persistCharacter}
                onEdit={() => {
                  if (character) setDraftBuild(character.build)
                  setTab('build')
                }}
                onGoFortune={() => setTab('fortune')}
              />
            )}
            {tab === 'guide' && <GuideTab />}
          </>
        )}
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 flex justify-center"
        style={{
          background: `${C.night}F2`,
          borderTop: `1px solid ${C.panelEdge}`,
          backdropFilter: 'blur(8px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          zIndex: 50,
        }}
        aria-label="Sections"
      >
        <div className="flex w-full" style={{ maxWidth: 560 }}>
          {TABS.map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className="flex-1 py-3 text-center"
              style={{ color: tab === id ? C.gold : C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
              aria-current={tab === id ? 'page' : undefined}
            >
              <span className="block text-lg" aria-hidden="true">
                {icon}
              </span>
              <span className="text-xs">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
