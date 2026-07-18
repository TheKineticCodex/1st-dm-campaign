import { useEffect, useMemo, useRef, useState } from 'react'
import { clearDeviceSession, type DeviceSession } from '../lib/storage'
import { getStore } from '../lib/store'
import { keepGlassLit } from '../lib/wakeLock'
import {
  EMPTY_BUILD,
  EMPTY_NOTES,
  EMPTY_STATE,
  type Bargain,
  type CharacterBuild,
  type QuizResult,
  type SavedCharacter,
} from '../types'
import { BuildTab } from './BuildTab'
import { CharacterCard } from './CharacterCard'
import { FortuneTab } from './FortuneTab'
import { GuideTab } from './GuideTab'
import { LedgerTab } from './LedgerTab'
import { PlayerLive } from './PlayerLive'
import { SheetTab } from './SheetTab'
import { C, CalmToggle, body } from './ui'

export type TabId = 'fortune' | 'build' | 'sheet' | 'ledger' | 'guide'

const TABS: [TabId, string, string][] = [
  ['fortune', '✦', 'Fortune'],
  ['build', '⚒', 'Build'],
  ['sheet', '❖', 'Sheet'],
  ['ledger', '⚖', 'Ledger'],
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

  useEffect(() => keepGlassLit(), [])

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

  const [sealing, setSealing] = useState(false)

  const forgeCharacter = (appearance: string) => {
    const baseNotes = character?.notes ?? EMPTY_NOTES
    const c: SavedCharacter = {
      build: draftBuild,
      state: character?.state ?? EMPTY_STATE,
      notes: { ...baseNotes, appearance: appearance.trim() || baseNotes.appearance },
      updatedAt: new Date().toISOString(),
    }
    setCharacter(c)
    void store.saveCharacter(c)
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) {
      setTab('sheet')
      return
    }
    setSealing(true)
    setTimeout(() => {
      setSealing(false)
      setTab('sheet')
    }, 2100)
  }

  // A1 — the player's device is the authority on its own bargains.
  // Bargain changes persist IMMEDIATELY (no debounce): a signature must
  // survive the player locking their phone the moment the wax sets.
  const mutateBargains = (fn: (list: Bargain[]) => Bargain[]) => {
    setCharacter((cur) => {
      if (!cur) return cur
      const next: SavedCharacter = {
        ...cur,
        notes: { ...cur.notes, bargains: fn(cur.notes.bargains ?? []) },
        updatedAt: new Date().toISOString(),
      }
      if (saveTimer.current) clearTimeout(saveTimer.current)
      void store.saveCharacter(next)
      return next
    })
  }

  const offerBargain = (b: Bargain) =>
    mutateBargains((list) => (list.some((x) => x.id === b.id) ? list : [...list, b]))

  const signBargain = (id: string, signatureDataUrl: string) =>
    mutateBargains((list) =>
      list.map((x) =>
        x.id === id && x.status === 'offered'
          ? { ...x, status: 'sealed' as const, signatureDataUrl, sealedAt: new Date().toISOString() }
          : x,
      ),
    )

  const resolveBargain = (id: string, outcome: 'fulfilled' | 'broken') =>
    mutateBargains((list) =>
      list.map((x) =>
        x.id === id && x.status === 'sealed'
          ? { ...x, status: outcome, resolvedAt: new Date().toISOString() }
          : x,
      ),
    )

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
      <PlayerLive
        store={store}
        playerName={session.playerName}
        onCondition={(condition, active) => {
          if (!character) return
          const has = character.state.conditions.includes(condition)
          if (active === has) return
          persistCharacter({
            ...character,
            state: {
              ...character.state,
              conditions: active
                ? [...character.state.conditions, condition]
                : character.state.conditions.filter((c) => c !== condition),
            },
            updatedAt: new Date().toISOString(),
          })
        }}
        onBargainOffer={offerBargain}
        onBargainSign={signBargain}
        onBargainResolve={resolveBargain}
      />
      <div className="w-full" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs" style={{ color: C.faint }}>
            ✦ {session.playerName} · {session.campaignCode}
            {!store.shared && ' · offline'}
          </p>
          <span className="flex items-center gap-3">
            <CalmToggle />
            <button
              type="button"
              onClick={handleLeave}
              className="text-xs"
              style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
            >
              leave
            </button>
          </span>
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
                onBuildFromQuiz={(name, klass, species) => {
                  setDraftBuild({
                    ...draftBuild,
                    name: draftBuild.name || name,
                    klass: klass ?? draftBuild.klass,
                    species: species ?? draftBuild.species,
                  })
                  setTab('build')
                }}
              />
            )}
            {tab === 'build' && (
              <BuildTab
                build={draftBuild}
                onChange={setDraftBuild}
                onForged={forgeCharacter}
                quizLook={quiz?.answers.look === '(left to chance)' ? undefined : quiz?.answers.look}
              />
            )}
            {tab === 'sheet' && (
              <SheetTab
                character={character}
                onUpdate={persistCharacter}
                onEdit={() => {
                  if (character) setDraftBuild(character.build)
                  setTab('build')
                }}
                onGoFortune={() => setTab('fortune')}
                store={store}
                playerName={session.playerName}
              />
            )}
            {tab === 'ledger' && (
              <LedgerTab bargains={character?.notes.bargains ?? []} onSign={signBargain} />
            )}
            {tab === 'guide' && <GuideTab />}
          </>
        )}
      </div>

      {sealing && (
        <div
          role="status"
          aria-label="The forge seals"
          className="fixed inset-0 flex flex-col items-center justify-center"
          style={{ background: `${C.night}F5`, zIndex: 80 }}
        >
          <div style={{ position: 'relative' }}>
            {[0, 0.35, 0.7].map((delay) => (
              <div
                key={delay}
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  inset: -20,
                  borderRadius: '50%',
                  border: `2px solid ${C.gold}`,
                  animation: `ring-burst 1.6s ease-out ${delay}s both`,
                }}
              />
            ))}
            <CharacterCard build={draftBuild} size="full" />
          </div>
          <p
            className="mt-6 text-center px-8"
            style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 24,
              fontWeight: 600,
              color: C.gold,
              animation: 'ceremony-fade 2.1s ease-out both',
            }}
          >
            The Feywild takes notice of you.
          </p>
        </div>
      )}

      {(quiz || character) && (
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
      )}
    </div>
  )
}
