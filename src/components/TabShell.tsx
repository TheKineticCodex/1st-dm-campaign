import { useEffect, useMemo, useRef, useState, Suspense, lazy } from 'react'
import { clearDeviceSession, type DeviceSession, readCache, writeCache } from '../lib/storage'
import { CLASSES } from '../data/rules'
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
  type VitalsEvent,
} from '../types'
import { CharacterCard } from './CharacterCard'
import { PlayerLive } from './PlayerLive'
import { SheetTab } from './SheetTab'
import { YourTurn } from './YourTurn'
import { armPhoneSound, buzz, chimeUpNext } from '../lib/phoneSound'
import { clearDice3d, warmDice3d } from '../lib/dice3d'
import { startTilt, tiltPermission, tiltPossible } from '../lib/tilt'
import { LanternToggle, goWithTransition } from './motion'
import { computeSheet } from '../lib/compute'

// Secondary tabs load on first visit — the sheet is what a phone opens to.
const BuildTab = lazy(() => import('./BuildTab').then((m) => ({ default: m.BuildTab })))
const FortuneTab = lazy(() => import('./FortuneTab').then((m) => ({ default: m.FortuneTab })))
const GuideTab = lazy(() => import('./GuideTab').then((m) => ({ default: m.GuideTab })))
const StoryTab = lazy(() => import('./StoryTab').then((m) => ({ default: m.StoryTab })))
const SpellsTab = lazy(() => import('./SpellsTab').then((m) => ({ default: m.SpellsTab })))
const BagTab = lazy(() => import('./BagTab').then((m) => ({ default: m.BagTab })))
import { C, CalmToggle, body } from './ui'

export type TabId = 'fortune' | 'build' | 'sheet' | 'spells' | 'bag' | 'story' | 'guide'

// Quiet Interface law 2: the tab bar shows only the current chapter of a
// player's story. Before the forge seals: the path to a character. After:
// the tools of play. Build stays reachable via "Edit character".
const TABS_CREATION: [TabId, string, string][] = [
  ['fortune', '✦', 'Fortune'],
  ['build', '⚒', 'Build'],
  ['sheet', '❖', 'Sheet'],
  ['guide', '✧', 'Guide'],
]

const TABS_PLAY: [TabId, string, string][] = [
  ['sheet', '❖', 'Sheet'],
  ['spells', '✦', 'Spells'],
  ['bag', '🎒', 'Bag'],
  ['story', '📖', 'Story'],
  ['guide', '✧', 'Guide'],
]

interface TabShellProps {
  session: DeviceSession
  onLeave: () => void
}

const isCaster = (c: SavedCharacter): boolean => {
  const k = c.build.klass ? CLASSES[c.build.klass] : null
  return !!k?.spells || c.build.species === 'Fairy ✦'
}

export function TabShell({ session, onLeave }: TabShellProps) {
  const store = useMemo(() => getStore(session), [session])
  const [tab, setTab] = useState<TabId>('fortune')
  const [loaded, setLoaded] = useState(false)
  const [character, setCharacter] = useState<SavedCharacter | null>(null)
  const [draftBuild, setDraftBuild] = useState<CharacterBuild>(EMPTY_BUILD)
  const [quiz, setQuiz] = useState<QuizResult | null>(null)
  const [announcedLevel, setAnnouncedLevel] = useState<number>(() => readCache<number>('announced-level') ?? 0)
  const [turn, setTurn] = useState<{ mine: boolean; next: boolean }>({ mine: false, next: false })
  const [turnSeen, setTurnSeen] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => keepGlassLit(), [])
  useEffect(() => armPhoneSound(), [])

  // Once a sheet exists: warm the dice engine in the background, and — where
  // no permission prompt is needed (Android) or it was granted before — let
  // the lantern light follow the hand from the first touch.
  useEffect(() => {
    if (!character) return
    warmDice3d()
    if (!tiltPossible()) return
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: unknown }
    const needsPrompt = typeof DOE.requestPermission === 'function'
    if (needsPrompt && tiltPermission() !== 'granted') return
    const once = () => {
      void startTilt()
      window.removeEventListener('pointerdown', once)
    }
    window.addEventListener('pointerdown', once, { passive: true })
    return () => window.removeEventListener('pointerdown', once)
  }, [character])

  /** Change tabs under a page transition (Safari 18+/Chrome); plain otherwise. */
  const go = (id: TabId) => {
    clearDice3d()
    goWithTransition(() => setTab(id))
  }

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

  const liveSheet = character ? computeSheet(character.build) : null
  const vitals: VitalsEvent | null =
    character && liveSheet
      ? {
          playerName: session.playerName,
          characterName: character.build.name || session.playerName,
          hp: Math.max(0, liveSheet.hpMax - character.state.damage),
          hpMax: liveSheet.hpMax,
          deathSaves: character.state.deathSaves,
          conditions: character.state.conditions,
          concentrating: !!character.state.concentrating,
          at: character.updatedAt,
        }
      : null

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
        onLevel={(level) => {
          setAnnouncedLevel((cur) => {
            const next = Math.max(cur, level)
            writeCache('announced-level', next)
            return next
          })
        }}
        onTurn={(mine, next) => {
          setTurn((cur) => {
            if (mine && !cur.mine) {
              setTurnSeen(false)
              setTab('sheet')
            }
            if (next && !cur.next && !mine) {
              chimeUpNext()
              buzz(40)
            }
            return { mine, next }
          })
        }}
        vitals={vitals}
      />
      {turn.mine && !turnSeen && character && liveSheet && (
        <YourTurn character={character} sheet={liveSheet} onGo={() => setTurnSeen(true)} />
      )}
      <div className="w-full" style={{ maxWidth: 560 }}>
        <div className="flex items-center justify-between mb-4" style={{ viewTransitionName: 'topbar' }}>
          <p className="text-xs" style={{ color: C.faint }}>
            ✦ {session.playerName} · {session.campaignCode}
            {!store.shared && ' · offline'}
          </p>
          <span className="flex items-center gap-3">
            {character && <LanternToggle />}
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
          <Suspense fallback={<p className="text-center mt-10" style={{ color: C.faint }}>The lanterns are lighting…</p>}>
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
                announcedLevel={announcedLevel}
              />
            )}
            {tab === 'spells' && (
              <SpellsTab character={character} onUpdate={persistCharacter} />
            )}
            {tab === 'bag' && <BagTab character={character} onUpdate={persistCharacter} />}
            {tab === 'story' && (
              <StoryTab
                store={store}
                character={character}
                onUpdate={persistCharacter}
                bargains={character?.notes.bargains ?? []}
                onSign={signBargain}
              />
            )}
            {tab === 'guide' && <GuideTab />}
          </Suspense>
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

      {(tab === 'build' || tab === 'fortune') && character && (
        <button
          type="button"
          onClick={() => setTab('sheet')}
          className="fixed left-4 text-sm rounded-lg px-4 py-2"
          style={{
            top: 'calc(8px + env(safe-area-inset-top))',
            background: C.panel,
            border: `1px solid ${C.panelEdge}`,
            color: C.sea,
            minHeight: 44,
            cursor: 'pointer',
            zIndex: 55,
          }}
        >
          ← back to your sheet
        </button>
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
          viewTransitionName: 'tabbar',
        }}
        aria-label="Sections"
      >
        <div className="flex w-full" style={{ maxWidth: 560 }}>
          {(character ? TABS_PLAY.filter(([id]) => id !== 'spells' || isCaster(character)) : TABS_CREATION).map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => go(id)}
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
