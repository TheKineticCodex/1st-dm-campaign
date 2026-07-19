// 🎭 The stage — what the iPad shows the table. A live listener: ambient
// title scene until the MacBook pushes a map; then the map with the party's
// tokens, moving as the DM moves them. A small ✕ returns to the Book.

import { useEffect, useRef, useState } from 'react'
import { joinTableChannel } from '../lib/realtime'
import type { RosterEntry, Store } from '../lib/store'
import type { StageState } from '../types'
import { AmbientMode } from './AmbientMode'
import { C } from './ui'

interface StageScreenProps {
  store: Store
  roster: RosterEntry[]
  onClose: () => void
}

export function StageScreen({ store, roster, onClose }: StageScreenProps) {
  const [stage, setStage] = useState<StageState>({ mode: 'ambient', mapUrl: null, tokens: [] })
  const closeRef = useRef(() => {})

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [channelId, current] = await Promise.all([store.getChannelId(), store.getStage()])
      if (cancelled) return
      if (current && current.mode) setStage(current)
      const channel = joinTableChannel(channelId, {
        stage: (s) => setStage(s),
      })
      closeRef.current = channel.close
    })()
    return () => {
      cancelled = true
      closeRef.current()
    }
  }, [store])

  if (stage.mode !== 'map' || !stage.mapUrl) {
    return (
      <div>
        <AmbientMode roster={roster} onClose={onClose} />
      </div>
    )
  }

  return (
    <div className="fixed inset-0" style={{ background: '#0D0820', zIndex: 90 }}>
      <div className="w-full h-full flex items-center justify-center">
        <div className="relative" style={{ maxWidth: '100%', maxHeight: '100%' }}>
          <img
            src={stage.mapUrl}
            alt="The table map"
            style={{ maxWidth: '100vw', maxHeight: '100vh', display: 'block' }}
          />
          {stage.tokens.map((t) => (
            <span
              key={t.id}
              className="absolute rounded-full font-bold flex items-center justify-center"
              style={{
                left: `${t.x * 100}%`,
                top: `${t.y * 100}%`,
                transform: 'translate(-50%, -50%)',
                width: 44,
                height: 44,
                background: t.color,
                color: C.ink,
                border: `2.5px solid ${C.night}`,
                boxShadow: `0 0 14px ${t.color}88`,
                fontSize: 15,
                transition: 'left .25s ease, top .25s ease',
              }}
              aria-label={`Token ${t.label}`}
            >
              {t.label}
            </span>
          ))}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label="Leave the stage"
        className="absolute rounded-full"
        style={{
          top: 'calc(10px + env(safe-area-inset-top))',
          right: 12,
          width: 40,
          height: 40,
          background: `${C.night}CC`,
          color: C.faint,
          border: `1px solid ${C.panelEdge}`,
          cursor: 'pointer',
          fontSize: 16,
        }}
      >
        ✕
      </button>
    </div>
  )
}
