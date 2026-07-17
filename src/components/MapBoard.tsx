// Phase 3 map — "a picture with movable pieces, not Foundry" (spec §6).
// Lives on the DM's iPad only: the iPad IS the shared table surface.
// The owner uploads his own image (licensing guardrail: no WotC assets
// ship with the app). Token positions persist on this device.

import { useRef, useState } from 'react'
import type { PointerEvent } from 'react'
import { readCache, writeCache } from '../lib/storage'
import { Btn, C, Eyebrow } from './ui'

interface Token {
  id: string
  label: string
  color: string
  /** Position as fractions of the board size (survives resizes). */
  x: number
  y: number
}

interface MapState {
  imageDataUrl: string | null
  tokens: Token[]
}

const TOKEN_COLORS = [C.sea, C.gold, '#C08BE0', '#C96A6A', '#8BB8E0', '#A8C97F']

interface MapBoardProps {
  pcNames: string[]
}

export function MapBoard({ pcNames }: MapBoardProps) {
  const [map, setMap] = useState<MapState>(
    () => readCache<MapState>('map') ?? { imageDataUrl: null, tokens: [] },
  )
  const boardRef = useRef<HTMLDivElement>(null)
  const dragging = useRef<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const persist = (m: MapState) => {
    setMap(m)
    writeCache('map', m)
  }

  const onFile = (file: File | undefined) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      const tokens =
        map.tokens.length > 0
          ? map.tokens
          : pcNames.map((n, i) => ({
              id: `pc-${n}`,
              label: n.slice(0, 2),
              color: TOKEN_COLORS[i % TOKEN_COLORS.length],
              x: 0.1 + i * 0.08,
              y: 0.9,
            }))
      persist({ imageDataUrl: reader.result as string, tokens })
    }
    reader.readAsDataURL(file)
  }

  const addEnemy = () => {
    const n = map.tokens.filter((t) => t.id.startsWith('foe-')).length + 1
    persist({
      ...map,
      tokens: [
        ...map.tokens,
        {
          id: `foe-${crypto.randomUUID()}`,
          label: `E${n}`,
          color: '#C96A6A',
          x: 0.5,
          y: 0.1,
        },
      ],
    })
  }

  const move = (e: PointerEvent) => {
    if (!dragging.current || !boardRef.current) return
    const rect = boardRef.current.getBoundingClientRect()
    const x = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
    const y = Math.min(1, Math.max(0, (e.clientY - rect.top) / rect.height))
    setMap((m) => ({
      ...m,
      tokens: m.tokens.map((t) => (t.id === dragging.current ? { ...t, x, y } : t)),
    }))
  }

  return (
    <div>
      <Eyebrow>The table map — iPad only, players see the real table</Eyebrow>
      {!map.imageDataUrl ? (
        <>
          <p className="text-sm" style={{ color: C.faint }}>
            Upload a map image (a photo or scan of your own — the app ships none). Tokens for the
            party appear automatically; drag them with a finger.
          </p>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => onFile(e.target.files?.[0])}
          />
          <Btn onClick={() => fileRef.current?.click()}>Choose a map image</Btn>
        </>
      ) : (
        <>
          <div
            ref={boardRef}
            onPointerMove={move}
            onPointerUp={() => (dragging.current = null)}
            onPointerLeave={() => (dragging.current = null)}
            className="relative w-full rounded-xl overflow-hidden select-none"
            style={{ border: `1px solid ${C.panelEdge}`, touchAction: 'none' }}
          >
            <img src={map.imageDataUrl} alt="Table map" className="w-full block" draggable={false} />
            {map.tokens.map((t) => (
              <button
                key={t.id}
                type="button"
                aria-label={`Token ${t.label}`}
                onPointerDown={(e) => {
                  dragging.current = t.id
                  ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
                }}
                onPointerUp={() => {
                  dragging.current = null
                  writeCache('map', map)
                }}
                className="absolute rounded-full flex items-center justify-center font-bold"
                style={{
                  left: `${t.x * 100}%`,
                  top: `${t.y * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  width: 44,
                  height: 44,
                  background: t.color,
                  color: C.ink,
                  border: `2px solid ${C.night}`,
                  boxShadow: '0 2px 10px rgba(0,0,0,.45)',
                  cursor: 'grab',
                  touchAction: 'none',
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Btn secondary onClick={addEnemy}>
              + Enemy token
            </Btn>
            <Btn
              secondary
              onClick={() => {
                if (window.confirm('Clear the map and its tokens?')) persist({ imageDataUrl: null, tokens: [] })
              }}
            >
              Clear map
            </Btn>
          </div>
        </>
      )}
    </div>
  )
}
