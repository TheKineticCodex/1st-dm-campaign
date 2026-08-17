// 🎭 The stage — what the iPad shows the table. A live listener: ambient
// title scene until the MacBook pushes a map; then the living battlefield —
// the map with the party's tokens moving as the DM moves them, the light the
// DM chose, fog the DM reveals, whose turn it is, who's bloodied or down.
// When the DM starts a carnival game, the stage becomes the game board; at
// the finale it becomes the Moon. A small ✕ returns to the Book.

import { useEffect, useRef, useState } from 'react'
import { joinTableChannel } from '../lib/realtime'
import type { RosterEntry, Store } from '../lib/store'
import type { Encounter, FinaleEvent, StageState, VitalsEvent } from '../types'
import type { GameState } from '../lib/games'
import { NIGHT_PATH } from '../data/nightPath'
import { AmbientMode } from './AmbientMode'
import { StageCardView, cardCoversTheScreen } from './StageCardView'
import { FogOverlay, InitiativeRail, StageTokenView, TintOverlay, activeTokenId, vitalsFor } from './Battlefield'
import { GameStageBoard } from './games/GameShell'
import { FinaleStage } from './Finale'
import { C, display, onState } from './ui'
import { Icon, Spark } from './icons'

interface StageScreenProps {
  store: Store
  roster: RosterEntry[]
  onClose: () => void
  /**
   * True on the iPad that IS the stage. The corner ✕ stays (it asks first),
   * but the screen itself stops being one big button — on the DM's own laptop
   * tapping anywhere is a convenience, on the table's screen it is a hazard.
   */
  locked?: boolean
}

export function StageScreen({ store, roster, onClose, locked }: StageScreenProps) {
  const [stage, setStage] = useState<StageState>({ mode: 'ambient', mapUrl: null, tokens: [] })
  const [game, setGame] = useState<GameState | null>(null)
  const [enc, setEnc] = useState<Encounter | null>(null)
  const [live, setLive] = useState<Record<string, VitalsEvent>>({})
  const [finale, setFinale] = useState<FinaleEvent | null>(null)
  const closeRef = useRef(() => {})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [channelId, current, active] = await Promise.all([store.getChannelId(), store.getStage(), store.getActiveEncounter()])
      if (cancelled) return
      if (current && current.mode) setStage(current)
      if (active) setEnc(active)
      const channel = joinTableChannel(channelId, {
        stage: (s) => setStage(s),
        encounter: (e) => setEnc(e.active ? e : null),
        vitals: (v) => setLive((cur) => ({ ...cur, [v.playerName]: v })),
        game: (g) => {
          if (g.kind === 'clear') setGame(null)
          else if (g.kind === 'state' && g.state) setGame(g.state)
        },
        finale: (f) => {
          if (f.phase === 'clear') setFinale(null)
          else if (f.phase === 'arm' || f.phase === 'start') setFinale(f)
        },
      })
      closeRef.current = channel.close
    })()
    return () => {
      cancelled = true
      closeRef.current()
    }
  }, [store])

  const closeButton = (
    <button
      type="button"
      onClick={onClose}
      aria-label="Take this screen off the stage"
      className="absolute rounded-full inline-flex items-center justify-center"
      style={{
        top: 'calc(10px + env(safe-area-inset-top))',
        right: 12,
        width: 44,
        height: 44,
        background: `${C.nightDeep}CC`,
        color: C.faint,
        border: `1px solid ${C.panelEdge}`,
        cursor: 'pointer',
        zIndex: 5,
      }}
    >
      <Icon name="cross" size={17} />
    </button>
  )

  if (finale) {
    return (
      <div className="fixed inset-0" style={{ background: '#05040F', zIndex: 90 }}>
        <FinaleStage event={finale} />
        {closeButton}
      </div>
    )
  }

  if (game) {
    return (
      <div className="fixed inset-0" style={{ background: C.night, zIndex: 90 }}>
        <GameStageBoard state={game} />
        {closeButton}
      </div>
    )
  }

  const rail = enc && enc.active && enc.order.length > 0 ? <InitiativeRail enc={enc} live={live} roster={roster} /> : null
  // An id came over the wire; the room's name is looked up here, from the copy
  // of the night this device already has. No prose ever crosses.
  const place = stage.at ? (NIGHT_PATH.checkpoints.find((c) => c.id === stage.at)?.where ?? null) : null
  const card = stage.card && Array.isArray(stage.card.lines) ? stage.card : null

  if (card && cardCoversTheScreen(card)) {
    return (
      <div className="fixed inset-0" style={{ background: '#0A1012', zIndex: 90 }}>
        <StageCardView card={card} />
        {rail && (
          <div className="fixed inset-0" style={{ zIndex: 93, pointerEvents: 'none' }}>
            {rail}
          </div>
        )}
        {closeButton}
      </div>
    )
  }

  if (stage.mode !== 'map' || !stage.mapUrl) {
    return (
      <div>
        <AmbientMode roster={roster} onClose={locked ? undefined : onClose} place={place} />
        {card && <StageCardView card={card} />}
        {rail && (
          <div className="fixed inset-0" style={{ zIndex: 91, pointerEvents: 'none' }}>
            {rail}
          </div>
        )}
      </div>
    )
  }

  const activeId = activeTokenId(stage, enc)
  const activeRow = enc?.active ? enc.order[enc.activeIndex] : null

  return (
    <div className="fixed inset-0 stage-fx" style={{ background: C.nightDeep, zIndex: 90 }}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <img src={stage.mapUrl} alt="The table map" style={{ maxWidth: '100vw', maxHeight: '100vh', display: 'block' }} />
          <TintOverlay tint={stage.tint} tokens={stage.tokens} />
          <FogOverlay fog={stage.fog} />
          {stage.tokens.map((t) => (
            <StageTokenView key={t.id} t={t} size={46} active={t.id === activeId} vital={vitalsFor(t.playerName, live, roster)} />
          ))}
        </div>
      </div>
      {card && <StageCardView card={card} />}
      {activeRow && (
        <div className="absolute left-0 right-0 text-center" style={{ top: 'calc(12px + env(safe-area-inset-top))', pointerEvents: 'none', zIndex: 3 }} role="status">
          {/* the turn pill: ember, brass rim — lit, never a gold fill */}
          <span
            className="inline-flex items-center gap-2 rounded-full px-5 py-2"
            style={{
              ...display,
              ...onState,
              fontSize: 28,
              fontWeight: 700,
              borderRadius: 999,
              backdropFilter: 'blur(8px)',
              boxShadow: 'inset 0 0 0 1px rgba(240,181,79,0.22), inset 0 1px 0 rgba(255,214,150,0.12), 0 0 26px rgba(240,181,79,0.2)',
            }}
          >
            <Spark size={20} /> {activeRow.name}’s turn
          </span>
        </div>
      )}
      {rail}
      {closeButton}
    </div>
  )
}
