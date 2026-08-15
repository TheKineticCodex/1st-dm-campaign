// ⚔ The living battlefield — what the iPad shows during a fight. Owlbear-
// simple: the DM's map with tokens, the light on it (a tint), fog of war the
// DM reveals by touch, and the fight's pulse laid over the top: whose turn it
// is, who's bloodied, who's down, what conditions ride them. Everything here
// is driven by state the Book already broadcasts (stage, encounter, vitals).

import { useEffect, useRef } from 'react'
import { computeSheet } from '../lib/compute'
import type { RosterEntry } from '../lib/store'
import type { Encounter, StageFog, StageState, StageTint, VitalsEvent } from '../types'
import { C, display } from './ui'

export const TINTS: { id: StageTint; label: string; hint: string }[] = [
  { id: 'none', label: '☀ plain', hint: 'the map as it is' },
  { id: 'dusk', label: '🌇 dusk', hint: 'long light, warm and low' },
  { id: 'night', label: '🌑 night', hint: 'blue dark, edges gone' },
  { id: 'lantern', label: '🏮 lantern', hint: 'dark, but each token carries a light' },
  { id: 'moon', label: '🌕 moonlit', hint: 'silver, cold, everything visible' },
  { id: 'storm', label: '⛈ storm', hint: 'grey — and now and then, lightning' },
  { id: 'underwater', label: '🌊 under the sea', hint: 'green-blue, slow light through water' },
]

/** The light. Pure CSS layers over the map; `tokens` only matter for lantern. */
export function TintOverlay({ tint, tokens }: { tint: StageTint | undefined; tokens: { x: number; y: number }[] }) {
  if (!tint || tint === 'none') return null
  const base: React.CSSProperties = { position: 'absolute', inset: 0, pointerEvents: 'none' }
  switch (tint) {
    case 'dusk':
      return <div style={{ ...base, background: 'linear-gradient(180deg, rgba(255,150,60,.18), rgba(60,20,80,.45))', mixBlendMode: 'multiply' }} />
    case 'night':
      return (
        <>
          <div style={{ ...base, background: 'rgba(12,16,60,.62)', mixBlendMode: 'multiply' }} />
          <div style={{ ...base, background: 'radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,10,.75) 100%)' }} />
        </>
      )
    case 'lantern':
      return (
        <>
          <div style={{ ...base, background: 'rgba(8,6,24,.78)' }} />
          {tokens.map((t, i) => (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${t.x * 100}%`,
                top: `${t.y * 100}%`,
                width: '28vmin',
                height: '28vmin',
                transform: 'translate(-50%,-50%)',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,205,120,.55) 0%, rgba(255,180,90,.22) 40%, transparent 70%)',
                mixBlendMode: 'screen',
                pointerEvents: 'none',
                transition: 'left .5s ease, top .5s ease',
                animation: 'lanternFlicker 3.4s ease-in-out infinite',
                animationDelay: `${(i * 0.7) % 3}s`,
              }}
            />
          ))}
        </>
      )
    case 'moon':
      return (
        <>
          <div style={{ ...base, background: 'rgba(120,150,210,.35)', mixBlendMode: 'multiply' }} />
          <div style={{ ...base, background: 'radial-gradient(ellipse at 70% 10%, rgba(220,230,255,.28), transparent 45%)', mixBlendMode: 'screen' }} />
        </>
      )
    case 'storm':
      return (
        <>
          <div style={{ ...base, background: 'rgba(60,70,90,.55)', mixBlendMode: 'multiply' }} />
          <div style={{ ...base, background: 'rgba(230,240,255,.9)', mixBlendMode: 'screen', animation: 'lightning 11s linear infinite', opacity: 0 }} />
        </>
      )
    case 'underwater':
      return (
        <>
          <div style={{ ...base, background: 'rgba(20,90,110,.5)', mixBlendMode: 'multiply' }} />
          <div style={{ ...base, background: 'repeating-linear-gradient(100deg, rgba(180,240,255,.10) 0 6%, transparent 6% 14%)', mixBlendMode: 'screen', animation: 'caustics 9s ease-in-out infinite alternate' }} />
        </>
      )
  }
}

/** Fog of war: a dark sheet with soft holes where the DM has revealed. */
export function FogOverlay({ fog, opacity = 0.96, onReveal }: { fog: StageFog | undefined; opacity?: number; onReveal?: (x: number, y: number) => void }) {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const c = ref.current
    if (!c || !fog?.on) return
    const paint = () => {
      const r = c.getBoundingClientRect()
      c.width = Math.max(1, Math.round(r.width))
      c.height = Math.max(1, Math.round(r.height))
      const ctx = c.getContext('2d')
      if (!ctx) return
      ctx.clearRect(0, 0, c.width, c.height)
      ctx.fillStyle = `rgba(6,4,18,${opacity})`
      ctx.fillRect(0, 0, c.width, c.height)
      ctx.globalCompositeOperation = 'destination-out'
      for (const h of fog.reveals) {
        const rad = h.r * Math.min(c.width, c.height)
        const g = ctx.createRadialGradient(h.x * c.width, h.y * c.height, rad * 0.55, h.x * c.width, h.y * c.height, rad)
        g.addColorStop(0, 'rgba(0,0,0,1)')
        g.addColorStop(1, 'rgba(0,0,0,0)')
        ctx.fillStyle = g
        ctx.beginPath()
        ctx.arc(h.x * c.width, h.y * c.height, rad, 0, Math.PI * 2)
        ctx.fill()
      }
      ctx.globalCompositeOperation = 'source-over'
    }
    paint()
    const ro = new ResizeObserver(paint)
    ro.observe(c)
    return () => ro.disconnect()
  }, [fog, opacity])
  if (!fog?.on) return null
  return (
    <canvas
      ref={ref}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: onReveal ? 'auto' : 'none', cursor: onReveal ? 'crosshair' : undefined, touchAction: 'none' }}
      onPointerDown={
        onReveal
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect()
              onReveal((e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height)
            }
          : undefined
      }
      aria-label={onReveal ? 'Fog of war — tap to reveal' : undefined}
    />
  )
}

// ------------------------------------------------------------ the fight's pulse

interface Vital {
  hp: number
  hpMax: number
  down: boolean
  bloodied: boolean
  conditions: string[]
  concentrating: boolean
  saves?: { successes: number; failures: number }
}

/** Live vitals win; the roster row (≤30 s old) fills in until the phone speaks. */
export function vitalsFor(playerName: string | undefined, live: Record<string, VitalsEvent>, roster: RosterEntry[]): Vital | null {
  if (!playerName) return null
  const v = live[playerName]
  if (v) {
    return { hp: v.hp, hpMax: v.hpMax, down: v.hp <= 0, bloodied: v.hp > 0 && v.hp <= v.hpMax / 2, conditions: v.conditions ?? [], concentrating: v.concentrating, saves: v.deathSaves }
  }
  const r = roster.find((x) => x.playerName === playerName)
  if (!r?.character) return null
  const sheet = computeSheet(r.character.build)
  if (!sheet) return null
  const hpMax = sheet.hpMax
  const hp = Math.max(0, hpMax - (r.character.state?.damage ?? 0))
  return { hp, hpMax, down: hp <= 0, bloodied: hp > 0 && hp <= hpMax / 2, conditions: r.character.state?.conditions ?? [], concentrating: !!r.character.state?.concentrating, saves: r.character.state?.deathSaves }
}

const norm = (s: string | undefined) => (s ?? '').trim().toLowerCase()

/** Which token is the active combatant? PC rows match by player; foes by name. */
export function activeTokenId(stage: StageState, enc: Encounter | null): string | null {
  if (!enc?.active) return null
  const row = enc.order[enc.activeIndex]
  if (!row) return null
  const t = stage.tokens.find((tk) => (row.playerName && tk.playerName === row.playerName) || (norm(tk.name) && norm(tk.name) === norm(row.name)) || (norm(tk.label) === norm(row.name)))
  return t?.id ?? null
}

/** The rail: initiative order down the side, the active name big. */
export function InitiativeRail({ enc, live, roster }: { enc: Encounter; live: Record<string, VitalsEvent>; roster: RosterEntry[] }) {
  const active = enc.order[enc.activeIndex]
  const next = enc.order[(enc.activeIndex + 1) % Math.max(1, enc.order.length)]
  return (
    <div
      className="absolute flex flex-col gap-1"
      style={{ top: 'calc(14px + env(safe-area-inset-top))', right: 14, width: 230, background: `${C.night}D9`, border: `1px solid ${C.panelEdge}`, borderRadius: 14, padding: '10px 12px', backdropFilter: 'blur(8px)', zIndex: 3 }}
      aria-label="Initiative"
    >
      <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.25em' }}>
        ⚔ the order
      </p>
      {enc.order.map((row, i) => {
        const on = i === enc.activeIndex
        const v = vitalsFor(row.playerName, live, roster)
        return (
          <div key={row.id} className="flex items-center justify-between gap-2 rounded-lg px-2 py-1" style={{ background: on ? `${C.gold}22` : 'transparent', border: `1px solid ${on ? C.gold : 'transparent'}` }}>
            <span style={{ ...display, fontSize: on ? 20 : 16, fontWeight: on ? 700 : 400, color: on ? C.gold : row.isPc ? C.parchment : '#E0928F', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {row.name}
            </span>
            {v && (
              <span className="text-xs" style={{ color: v.down ? '#C96A6A' : v.bloodied ? '#E8B84B' : C.faint, whiteSpace: 'nowrap' }}>
                {v.down ? '✕ down' : `♥ ${v.hp}`}
              </span>
            )}
          </div>
        )
      })}
      {active && (
        <p className="text-xs mt-1" style={{ color: C.faint }}>
          up next: <span style={{ color: C.parchment }}>{next?.name}</span>
        </p>
      )}
    </div>
  )
}

/** A token on the stage, with its ring of state. */
export function StageTokenView({ t, size, active, vital }: { t: { id: string; label: string; color: string; x: number; y: number }; size: number; active: boolean; vital: Vital | null }) {
  const ring = vital?.down ? '#C96A6A' : active ? C.gold : vital?.bloodied ? '#E8B84B' : C.night
  return (
    <div
      className="absolute"
      style={{ left: `${t.x * 100}%`, top: `${t.y * 100}%`, transform: 'translate(-50%, -50%)', transition: 'left .55s cubic-bezier(.2,.8,.2,1), top .55s cubic-bezier(.2,.8,.2,1)', zIndex: active ? 2 : 1 }}
      aria-label={`Token ${t.label}`}
    >
      {active && <span style={{ position: 'absolute', inset: -10, borderRadius: '50%', border: `3px solid ${C.gold}`, animation: 'turnPulse 1.6s ease-out infinite', pointerEvents: 'none' }} />}
      <span
        className="rounded-full font-bold flex items-center justify-center"
        style={{
          width: size,
          height: size,
          background: vital?.down ? '#3d2030' : t.color,
          color: vital?.down ? '#E0928F' : C.ink,
          border: `3px solid ${ring}`,
          boxShadow: active ? `0 0 26px ${C.gold}AA` : `0 0 14px ${t.color}88`,
          fontSize: size * 0.34,
          opacity: vital?.down ? 0.9 : 1,
          animation: vital?.down ? 'dyingPulse 1.4s ease-in-out infinite' : undefined,
        }}
      >
        {vital?.down ? '✕' : t.label}
      </span>
      {vital && !vital.down && (
        <span style={{ position: 'absolute', left: '50%', bottom: -8, transform: 'translateX(-50%)', width: size * 0.9, height: 4, borderRadius: 3, background: `${C.night}CC`, overflow: 'hidden' }}>
          <span style={{ display: 'block', width: `${(vital.hp / Math.max(1, vital.hpMax)) * 100}%`, height: '100%', background: vital.bloodied ? '#E8B84B' : C.sea, transition: 'width .3s' }} />
        </span>
      )}
      {vital && (vital.conditions.length > 0 || vital.concentrating) && (
        <span className="flex gap-1 justify-center" style={{ position: 'absolute', left: '50%', top: '100%', transform: 'translateX(-50%)', marginTop: 8, whiteSpace: 'nowrap' }}>
          {vital.concentrating && <span className="text-xs rounded-full px-1.5" style={{ background: `${C.night}DD`, border: `1px solid ${C.sea}88`, color: C.sea }}>◐</span>}
          {vital.conditions.slice(0, 3).map((c) => (
            <span key={c} className="text-xs rounded-full px-1.5" style={{ background: `${C.night}DD`, border: `1px solid ${C.gold}88`, color: C.gold }}>
              {c}
            </span>
          ))}
        </span>
      )}
    </div>
  )
}
