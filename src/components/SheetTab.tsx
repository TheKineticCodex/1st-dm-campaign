// The character sheet — prototype layout, upgraded per spec §4.4:
// tappable dice (attack/skill/save) with advantage toggle, HP tracker with
// death-save pips, spell slots, rest buttons, conditions, and free-text
// sections including the private "What I lost".

import { useEffect, useRef, useState } from 'react'
import { ABILITIES, CONDITIONS, SKILL_ABILITY, fmt, mod, type AbilityKey } from '../data/rules'
import type { BagItem } from '../types'
import { computeSheet, saveMod, skillMod } from '../lib/compute'
import { clearDice3d, rollDice3d, type DiceSpec } from '../lib/dice3d'
import { rollD20, rollDamage, type RollMode, type RollResult } from '../lib/dice'
import { joinTableChannelLazy, type TableChannel } from '../lib/realtime'
import type { Store } from '../lib/store'
import type { SavedCharacter } from '../types'
import { CharacterCard } from './CharacterCard'
import { RollingNumber } from './motion'
import { DiceTray } from './DiceTray'
import { buzz, heartbeat } from '../lib/phoneSound'
import { LevelUp } from './LevelUp'
import type { Feature } from '../data/levels'
import { SpellChips, SpellsSection } from './SpellsSection'
import { Btn, C, Eyebrow, H, HintOnce, Section, TextArea, display, Fold } from './ui'

interface SheetTabProps {
  character: SavedCharacter | null
  onUpdate: (c: SavedCharacter) => void
  onEdit: () => void
  onGoFortune: () => void
  store: Store
  playerName: string
  /** The level the Lantern-Keeper has announced (0 = none yet). */
  announcedLevel?: number
}

/** A natural 20: sparks up from the card. Pure CSS, twelve motes. */
function GoldBurst() {
  return (
    <span aria-hidden="true" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            left: `${8 + ((i * 37) % 84)}%`,
            bottom: 6,
            width: 6 + (i % 3) * 3,
            height: 6 + (i % 3) * 3,
            borderRadius: '50%',
            background: i % 4 === 0 ? '#FFF6D0' : C.parchment,
            boxShadow: '0 0 10px #FFF1B8',
            animation: `moteRise ${1.4 + (i % 5) * 0.25}s ease-out ${(i % 7) * 0.09}s both`,
          }}
        />
      ))}
    </span>
  )
}

const ordinal = (n: number) => (n === 1 ? '1st' : n === 2 ? '2nd' : n === 3 ? '3rd' : `${n}th`)

const BAG_EMOJI = ['🗡', '🪄', '🧭', '📜', '🍾', '🪙', '🎻', '🌸', '🗝', '🐚']

/** The Bag: tile inventory. Weapons toggle equipped; trinkets ride along. */
export function BagSection({ bag, onChange }: { bag: BagItem[]; onChange: (next: BagItem[]) => void }) {
  const [newName, setNewName] = useState('')
  const [newIcon, setNewIcon] = useState(BAG_EMOJI[0])
  const [note, setNote] = useState<string | null>(null)

  const toggle = (item: BagItem) => {
    if (item.kind === 'weapon') {
      onChange(bag.map((i) => (i.id === item.id ? { ...i, equipped: !i.equipped } : i)))
      setNote(
        item.equipped
          ? `${item.name} put away — your hands are your weapons now.`
          : `${item.name} in hand.`,
      )
    } else if (item.kind === 'armor') {
      setNote('Armor stays on — it practically sleeps with you.')
    } else {
      setNote(`${item.name}: carried, ready when the story wants it.`)
    }
  }

  const addItem = () => {
    const name = newName.trim()
    if (!name) return
    onChange([
      ...bag,
      { id: `custom-${crypto.randomUUID()}`, name, icon: newIcon, kind: 'trinket', equipped: false },
    ])
    setNewName('')
  }

  return (
    <Section style={{ marginTop: 16 }}>
      <Eyebrow>🎒 the bag</Eyebrow>
      <p className="text-xs" style={{ color: C.faint }}>
        Tap a weapon to equip or put it away. No weapon in hand = unarmed strikes.
      </p>
      <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(88px, 1fr))' }}>
        {bag.map((item) => {
          const lit = item.equipped && item.kind !== 'trinket'
          return (
            <div key={item.id} className="relative">
              <button
                type="button"
                onClick={() => toggle(item)}
                aria-pressed={item.kind === 'weapon' ? item.equipped : undefined}
                className="w-full rounded-lg px-1 py-2 text-center"
                style={{
                  background: lit ? `${C.gold}1f` : C.night,
                  border: `1.5px solid ${lit ? C.gold : C.panelEdge}`,
                  boxShadow: lit ? `0 0 10px ${C.gold}44` : 'none',
                  minHeight: 76,
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontSize: 26, display: 'block', filter: item.kind === 'weapon' && !item.equipped ? 'grayscale(1) opacity(0.6)' : 'none' }}>
                  {item.icon}
                </span>
                <span className="text-xs block mt-1" style={{ color: lit ? C.gold : C.parchment, lineHeight: 1.15 }}>
                  {item.name}
                </span>
                {item.kind !== 'trinket' && (
                  <span className="text-[10px] block" style={{ color: lit ? C.gold : C.faint }}>
                    {item.equipped ? '✦ equipped' : 'put away'}
                  </span>
                )}
              </button>
              {item.id.startsWith('custom-') && (
                <button
                  type="button"
                  aria-label={`Drop ${item.name}`}
                  onClick={() => onChange(bag.filter((i) => i.id !== item.id))}
                  className="absolute -top-1.5 -right-1.5 rounded-full"
                  style={{ width: 22, height: 22, fontSize: 11, background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.faint, cursor: 'pointer' }}
                >
                  ✕
                </button>
              )}
            </div>
          )
        })}
      </div>
      {note && (
        <p role="status" className="text-xs mt-2" style={{ color: C.sea }}>
          {note}
        </p>
      )}
      <div className="flex gap-2 mt-3 items-center">
        <select
          value={newIcon}
          onChange={(e) => setNewIcon(e.target.value)}
          aria-label="Icon for the new thing"
          style={{ background: C.night, border: `1px solid ${C.panelEdge}`, borderRadius: 8, color: C.parchment, fontSize: 18, minHeight: 44, padding: '0 6px' }}
        >
          {BAG_EMOJI.map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
          placeholder="Something the story handed you…"
          className="flex-1 rounded-lg px-3"
          style={{ background: C.night, border: `1px solid ${C.panelEdge}`, color: C.parchment, minHeight: 44 }}
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-lg px-3"
          style={{ background: `${C.gold}22`, border: `1px solid ${C.gold}`, color: C.gold, minHeight: 44, cursor: 'pointer' }}
        >
          + keep it
        </button>
      </div>
    </Section>
  )
}

export type Coins = { gp: number; sp: number; cp: number }
const COIN_META: { key: keyof Coins; name: string; glyph: string; tint: string }[] = [
  { key: 'gp', name: 'Gold', glyph: '🪙', tint: '#E8B84B' },
  { key: 'sp', name: 'Silver', glyph: '⚪', tint: '#C6CCD8' },
  { key: 'cp', name: 'Copper', glyph: '🟤', tint: '#C08B5A' },
]

/** The Purse: gold / silver / copper with big ± taps. 10 sp = 1 gp, 10 cp = 1 sp. */
export function PurseSection({ coins, onChange }: { coins: Coins; onChange: (next: Coins) => void }) {
  const bump = (key: keyof Coins, delta: number) =>
    onChange({ ...coins, [key]: Math.max(0, (coins[key] ?? 0) + delta) })
  return (
    <Section style={{ marginTop: 16 }}>
      <Eyebrow>🪙 the purse</Eyebrow>
      <p className="text-xs" style={{ color: C.faint }}>
        10 copper = 1 silver · 10 silver = 1 gold
      </p>
      <div className="grid gap-2 mt-2" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        {COIN_META.map(({ key, name, glyph, tint }) => (
          <div
            key={key}
            className="rounded-lg p-2 text-center"
            style={{ background: C.night, border: `1.5px solid ${tint}55` }}
          >
            <p className="text-xs" style={{ color: tint }}>
              {glyph} {name}
            </p>
            <p style={{ ...display, fontSize: 30, fontWeight: 700, color: tint, lineHeight: 1.2 }}>
              {coins[key] ?? 0}
            </p>
            <div className="flex justify-center gap-1 mt-1">
              <button
                type="button"
                aria-label={`Spend one ${name.toLowerCase()}`}
                onClick={() => bump(key, -1)}
                className="rounded-md"
                style={{ minWidth: 44, minHeight: 40, background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.parchment, fontSize: 20, cursor: 'pointer' }}
              >
                −
              </button>
              <button
                type="button"
                aria-label={`Gain one ${name.toLowerCase()}`}
                onClick={() => bump(key, 1)}
                className="rounded-md"
                style={{ minWidth: 44, minHeight: 40, background: `${tint}22`, border: `1px solid ${tint}88`, color: tint, fontSize: 20, cursor: 'pointer' }}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
    </Section>
  )
}

/** Tappable spell names — tap one to unfold what it does, in plain words. */

/** Class abilities with a number of uses per rest — pips you tap as you spend them. */
function FeatureUses({
  features,
  uses,
  onChange,
}: {
  features: Feature[]
  uses: Record<string, number>
  onChange: (name: string, spent: number) => void
}) {
  const tracked = features.filter((f) => f.uses && f.uses.n > 0)
  if (tracked.length === 0) return null
  const tag = (a?: Feature['action']) =>
    a === 'action' ? 'action' : a === 'bonus' ? 'bonus action' : a === 'reaction' ? 'reaction' : a === 'free' ? 'free' : null
  return (
    <Section style={{ marginTop: 16 }}>
      <Eyebrow>Abilities — tap a pip when you use one</Eyebrow>
      {tracked.map((f) => {
        const n = f.uses!.n
        const spent = Math.min(n, uses[f.name] ?? 0)
        const t = tag(f.action)
        return (
          <div key={f.name} className="mb-3">
            <div className="flex items-center justify-between">
              <strong className="text-sm" style={{ color: C.parchment }}>
                {f.name}
                {t && (
                  <span className="text-xs ml-2 rounded-full px-2" style={{ background: `${C.sea}22`, color: C.sea, border: `1px solid ${C.sea}55` }}>
                    {t}
                  </span>
                )}
              </strong>
              <span className="text-xs" style={{ color: C.faint }}>
                {n - spent} of {n} · {f.uses!.per} rest
              </span>
            </div>
            <div className="flex gap-2 mt-1">
              {Array.from({ length: n }, (_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`${f.name} use ${i + 1} ${i < spent ? 'spent' : 'available'}`}
                  onClick={() => onChange(f.name, i < spent ? i : i + 1)}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    border: `2px solid ${C.gold}`,
                    background: i < spent ? 'transparent' : C.gold,
                    color: i < spent ? C.faint : C.ink,
                    fontSize: 16,
                    cursor: 'pointer',
                  }}
                >
                  {i < spent ? '·' : '✦'}
                </button>
              ))}
            </div>
            {f.text && (
              <p className="text-xs mt-1" style={{ color: C.parchment, opacity: 0.8 }}>
                {f.text.replace(/\s*\/\/ VERIFY.*$/, '')}
              </p>
            )}
          </div>
        )
      })}
    </Section>
  )
}

export function SheetTab({ character, onUpdate, onEdit, onGoFortune, store, playerName, announcedLevel = 0 }: SheetTabProps) {
  const [rollMode, setRollMode] = useState<RollMode>('normal')
  const [quickRoll, setQuickRoll] = useState(false)
  const [hpAmt, setHpAmt] = useState<string>('')
  const [hpMore, setHpMore] = useState(false)
  const [roll, setRoll] = useState<RollResult | null>(null)
  const [damage, setDamage] = useState<{ rolls: number[]; total: number } | null>(null)
  const [inTheAir, setInTheAir] = useState(false)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [concPrompt, setConcPrompt] = useState(false)
  const [concOutcome, setConcOutcome] = useState<'held' | 'slipped' | null>(null)
  const channelRef = useRef<TableChannel | null>(null)

  // Send-only channel: rolls stream to the table's feed (A5).
  useEffect(() => {
    channelRef.current = joinTableChannelLazy(store.getChannelId(), {})
    return () => {
      channelRef.current?.close()
    }
  }, [store])

  // Dying: a heartbeat under everything, and a buzz, until healed. (Battle mode P2.)
  const dyingNow = !!character && (() => {
    const sh = computeSheet(character.build)
    return !!sh && sh.hpMax - character.state.damage <= 0
  })()
  useEffect(() => {
    if (!dyingNow) return
    heartbeat()
    buzz([80, 120, 80])
    const t = setInterval(() => heartbeat(), 2400)
    return () => clearInterval(t)
  }, [dyingNow])

  // Auto-dismiss the roll card after a few beats.
  useEffect(() => {
    if (!roll) return
    const t = setTimeout(() => {
      setRoll(null)
      setDamage(null)
      clearDice3d()
    }, 6500)
    return () => clearTimeout(t)
  }, [roll])

  if (!character) {
    return (
      <div className="text-center mt-10">
        <H>No character yet</H>
        <p className="mt-2" style={{ color: C.faint }}>
          Take the fortune, then forge your character — your sheet will live here, saved to the
          campaign.
        </p>
        <Btn onClick={onGoFortune}>Consult the lanterns</Btn>
      </div>
    )
  }

  const sheet = computeSheet(character.build)
  if (!sheet) {
    return (
      <div className="text-center mt-10">
        <H>This page resists being read</H>
        <p className="mt-2" style={{ color: C.faint }}>
          Your character is missing a choice or two. Return to the forge to finish them.
        </p>
        <Btn onClick={onEdit}>Back to the forge</Btn>
      </div>
    )
  }

  const { build, state, notes } = character
  const hpCurrent = Math.max(0, sheet.hpMax - state.damage)
  const dying = hpCurrent === 0

  const update = (patch: Partial<SavedCharacter>) =>
    onUpdate({ ...character, ...patch, updatedAt: new Date().toISOString() })
  const updateState = (patch: Partial<SavedCharacter['state']>) => update({ state: { ...state, ...patch } })
  const updateNotes = (patch: Partial<SavedCharacter['notes']>) => update({ notes: { ...notes, ...patch } })

  const broadcastRoll = (r: RollResult) => {
    channelRef.current?.sendRoll({
      playerName,
      characterName: build.name,
      label: r.label,
      total: r.total,
      kept: r.kept,
      modifier: r.modifier,
      mode: r.mode,
      isNat20: r.isNat20,
      isNat1: r.isNat1,
      at: new Date().toISOString(),
    })
  }

  /**
   * Show a roll the way a table sees one: the dice tumble (real physics,
   * forced to land on the numbers already rolled), THEN the card lands.
   * If the theatre isn't available the card just appears.
   */
  const present = async (r: RollResult, dmg: { rolls: number[]; total: number; die?: number } | null) => {
    setRoll(null)
    setDamage(null)
    const spec: DiceSpec[] = [{ die: 20, values: r.mode === 'normal' ? [r.dice[0]] : [r.dice[0], r.dice[1]] }]
    if (dmg?.die && dmg.rolls.length) spec.push({ die: dmg.die, values: dmg.rolls })
    setInTheAir(true)
    await rollDice3d(spec)
    setInTheAir(false)
    setRoll(r)
    setDamage(dmg ? { rolls: dmg.rolls, total: dmg.total } : null)
    if (r.isNat20) buzz([30, 40, 30, 40, 90])
    else if (r.isNat1) buzz(160)
    else buzz(18)
  }

  const doRoll = (label: string, modifier: number) => {
    const r = rollD20(label, modifier, rollMode)
    broadcastRoll(r)
    void present(r, null)
  }

  // No weapon equipped in the Bag → fists. Unarmed strike: STR + prof to
  // hit, flat 1 + STR bludgeoning damage. // VERIFY PHB 2024 Unarmed Strike
  const weaponInHand = !state.bag || state.bag.some((i) => i.kind === 'weapon' && i.equipped)
  const unarmedMod = mod(sheet.A.STR) + sheet.prof

  const rollAttack = () => {
    if (!weaponInHand) {
      const r = rollD20('Unarmed strike', unarmedMod, rollMode)
      broadcastRoll(r)
      void present(r, { rolls: [], total: Math.max(1, 1 + mod(sheet.A.STR)) })
      return
    }
    const r = rollD20(`${sheet.K.weapon.name} attack`, sheet.atkMod, rollMode)
    broadcastRoll(r)
    const dmg = rollDamage(sheet.K.weapon.die, mod(sheet.A[sheet.K.weapon.ab]))
    const die = Number(sheet.K.weapon.die.match(/d(\d+)/)?.[1] ?? 0) || undefined
    void present(r, { ...dmg, die })
  }

  const rollConcentration = () => {
    const r = rollD20('Concentration (CON save)', saveMod(sheet, 'CON'), rollMode)
    broadcastRoll(r)
    void present(r, null)
    const held = r.total >= 10
    setConcOutcome(held ? 'held' : 'slipped')
    setConcPrompt(false)
    if (!held) updateState({ concentrating: false })
  }

  const changeHp = (delta: number) => {
    // delta > 0 heals (reduces damage), delta < 0 is damage taken
    const nextDamage = Math.min(sheet.hpMax, Math.max(0, state.damage - delta))
    const patch: Partial<SavedCharacter['state']> = { damage: nextDamage }
    // Healing from 0 HP wakes you: clear death saves.
    if (hpCurrent === 0 && delta > 0) patch.deathSaves = { successes: 0, failures: 0 }
    updateState(patch)
    // Concentration co-pilot: damage while concentrating prompts the check.
    if (delta < 0 && state.concentrating) {
      setConcPrompt(true)
      setConcOutcome(null)
    }
  }

  const usedSlots = (lvl: number): number => (lvl === 1 ? state.slotsUsed : (state.slotsByLevel?.[lvl] ?? 0))

  const shortRest = () => {
    if (!window.confirm('Take a Short Rest (1 hour)? Warlock pact slots return; spend Hit Dice with your DM.')) return
    const uses = { ...(state.uses ?? {}) }
    for (const f of sheet.featureList) if (f.uses?.per === 'short') delete uses[f.name]
    updateState({ slotsUsed: sheet.K.caster === 'pact' ? 0 : state.slotsUsed, uses })
  }

  const longRest = () => {
    if (!window.confirm('Take a Long Rest (8 hours)? HP and all spell slots return in the morning.')) return
    updateState({ damage: 0, slotsUsed: 0, slotsByLevel: {}, uses: {}, deathSaves: { successes: 0, failures: 0 } })
  }

  /** One atomic update: spend a slot and (maybe) light concentration. */
  const castSpell = (slotLvl: number | null, concentration: boolean) => {
    const patch: Partial<SavedCharacter['state']> = {}
    if (slotLvl) {
      const next = usedSlots(slotLvl) + 1
      patch.slotsByLevel = { ...(state.slotsByLevel ?? {}), [slotLvl]: next }
      if (slotLvl === 1) patch.slotsUsed = next
    }
    if (concentration) patch.concentrating = true
    updateState(patch)
  }

  const toggleSlot = (i: number, lvl = 1) => {
    const used = usedSlots(lvl)
    const next = i < used ? i : i + 1
    if (lvl === 1) updateState({ slotsUsed: next, slotsByLevel: { ...(state.slotsByLevel ?? {}), 1: next } })
    else updateState({ slotsByLevel: { ...(state.slotsByLevel ?? {}), [lvl]: next } })
  }

  const deathPip = (kind: 'successes' | 'failures', i: number) => {
    const current = state.deathSaves[kind]
    updateState({
      deathSaves: { ...state.deathSaves, [kind]: i < current ? i : i + 1 },
    })
  }

  return (
    <div style={{ animation: 'cardRise .4s ease-out', paddingBottom: roll ? 120 : 0 }}>
      {/* Quick-bar: the three mid-scene needs, always in reach. Sticky. */}
      <div
        className="sticky top-0 -mx-1 px-1 pt-1 pb-1.5"
        style={{ zIndex: 40, background: `${C.night}F0`, backdropFilter: 'blur(6px)' }}
      >
        <div
          className="flex items-center gap-2 rounded-xl px-2.5 py-1.5"
          style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}
        >
          <span
            className="rounded-full px-2.5 py-1 text-sm"
            style={{
              ...display,
              fontWeight: 700,
              background:
                hpCurrent === 0 ? '#3d2030' : hpCurrent <= sheet.hpMax / 3 ? '#4a2a35' : `${C.sea}1a`,
              color: hpCurrent === 0 ? '#C96A6A' : hpCurrent <= sheet.hpMax / 3 ? '#E0928F' : C.sea,
              border: `1px solid ${hpCurrent <= sheet.hpMax / 3 ? '#C96A6A66' : `${C.sea}55`}`,
              whiteSpace: 'nowrap',
            }}
          >
            ♥ <RollingNumber value={hpCurrent} />/{sheet.hpMax}
          </span>
          <span className="text-sm" style={{ color: C.faint, whiteSpace: 'nowrap' }}>
            🛡 {sheet.ac.val}
          </span>
          <span className="flex-1 flex flex-wrap gap-1 overflow-hidden" style={{ maxHeight: 26 }}>
            {state.conditions.map((c) => (
              <span
                key={c}
                className="rounded-full px-2 text-xs"
                style={{ background: `${C.gold}1a`, border: `1px solid ${C.gold}55`, color: C.gold, lineHeight: '22px' }}
              >
                {c}
              </span>
            ))}
          </span>
          <button
            type="button"
            aria-expanded={quickRoll}
            onClick={() => setQuickRoll(!quickRoll)}
            className="rounded-lg px-3 py-1.5 text-sm"
            style={{
              ...display,
              fontWeight: 700,
              background: quickRoll ? C.gold : `${C.gold}22`,
              color: quickRoll ? C.ink : C.gold,
              border: `1px solid ${C.gold}`,
              minHeight: 38,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            🎲 Roll
          </button>
        </div>
        {quickRoll && (
          <div
            className="grid grid-cols-6 gap-1 mt-1 rounded-xl p-1.5"
            style={{ background: C.panel, border: `1px solid ${C.gold}44` }}
          >
            {ABILITIES.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => {
                  doRoll(`${a} check`, mod(sheet.A[a as AbilityKey]))
                  setQuickRoll(false)
                }}
                className="rounded-lg py-1.5 text-center"
                style={{ background: C.night, border: `1px solid ${C.panelEdge}`, color: C.parchment, minHeight: 48, cursor: 'pointer' }}
              >
                <span className="text-xs block" style={{ color: C.sea }}>
                  {a}
                </span>
                <span className="text-sm block" style={{ ...display, fontWeight: 700 }}>
                  {fmt(mod(sheet.A[a as AbilityKey]))}
                </span>
              </button>
            ))}
            <p className="col-span-6 text-center text-xs" style={{ color: C.faint }}>
              ability checks · saves &amp; skills live below on the sheet
            </p>
          </div>
        )}
        {quickRoll && (
          <DiceTray
            mode={rollMode}
            onD20={(r) => {
              broadcastRoll(r)
              void present(r, null)
            }}
          />
        )}
      </div>

      <div className="mb-2">
        <CharacterCard build={build} size="full" />
      </div>
      <p className="text-xs text-center" style={{ color: C.faint }}>
        Level {sheet.level}
        {build.subclass === null ? ` · subclass unlocks at level ${sheet.K.subclassAt} 🔒` : ` · ${build.subclass}`}
      </p>

      {(announcedLevel > sheet.level || sheet.subclassDue || sheet.featDue) && (
        <div className="mt-3">
          <LevelUp
            build={build}
            targetLevel={Math.max(announcedLevel, sheet.level)}
            onSeal={(nextBuild) => onUpdate({ ...character, build: nextBuild, updatedAt: new Date().toISOString() })}
          />
        </div>
      )}

      {/* HP / AC / Speed */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="rounded-lg py-3 text-center" style={{ background: C.parchment, color: C.ink, position: 'relative', overflow: 'hidden' }}>
          <span className="parchment-sheen" aria-hidden="true" />
          <p className="text-xs" style={{ color: C.goldDim }}>
            HP
          </p>
          <p style={{ ...display, fontSize: 26, fontWeight: 700 }}>
            <RollingNumber value={hpCurrent} />/{sheet.hpMax}
          </p>
          <div className="flex justify-center gap-2 mt-1">
            <button
              type="button"
              aria-label="Take 1 damage"
              onClick={() => changeHp(-1)}
              className="rounded-md px-3"
              style={{ background: C.ink, color: C.parchment, minWidth: 44, minHeight: 32, cursor: 'pointer' }}
            >
              −
            </button>
            <button
              type="button"
              aria-label="Heal 1 HP"
              onClick={() => changeHp(1)}
              className="rounded-md px-3"
              style={{ background: C.ink, color: C.parchment, minWidth: 44, minHeight: 32, cursor: 'pointer' }}
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => setHpMore(!hpMore)}
            className="text-xs mt-1 underline"
            style={{ color: C.goldDim, background: 'none', border: 'none', cursor: 'pointer', minHeight: 24 }}
          >
            {hpMore ? 'less' : 'more…'}
          </button>
        </div>
        <div className="rounded-lg py-3 text-center" style={{ background: C.parchment, color: C.ink, position: 'relative', overflow: 'hidden' }}>
          <span className="parchment-sheen" aria-hidden="true" />
          <p className="text-xs" style={{ color: C.goldDim }}>
            AC
          </p>
          <p style={{ ...display, fontSize: 26, fontWeight: 700 }}>{sheet.ac.val}</p>
        </div>
        <div className="rounded-lg py-3 text-center" style={{ background: C.parchment, color: C.ink, position: 'relative', overflow: 'hidden' }}>
          <span className="parchment-sheen" aria-hidden="true" />
          <p className="text-xs" style={{ color: C.goldDim }}>
            Speed
          </p>
          <p style={{ ...display, fontSize: 26, fontWeight: 700 }}>{sheet.S.speed} ft</p>
        </div>
      </div>
      <p className="text-xs mt-1" style={{ color: C.faint }}>
        AC: {sheet.ac.note} · Hit Die: d{sheet.K.die} · Proficiency +{sheet.prof} ·{' '}
        <button
          type="button"
          onClick={() => doRoll('Initiative', mod(sheet.A.DEX))}
          style={{ color: C.sea, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
        >
          Initiative {fmt(mod(sheet.A.DEX))}
        </button>
      </p>
      {hpMore && (
        <div className="flex items-center gap-2 mt-2 rounded-lg p-2" style={{ background: C.panel, border: `1px solid ${C.panelEdge}` }}>
          <input
            inputMode="numeric"
            pattern="[0-9]*"
            value={hpAmt}
            onChange={(e) => setHpAmt(e.target.value.replace(/[^0-9]/g, ''))}
            placeholder="how much?"
            aria-label="Amount of damage or healing"
            className="rounded-md px-3 py-2 text-base"
            style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 44, width: 110 }}
          />
          <button
            type="button"
            disabled={!hpAmt}
            onClick={() => {
              changeHp(-Number(hpAmt))
              setHpAmt('')
            }}
            className="flex-1 rounded-md px-3 py-2 text-sm font-semibold"
            style={{ background: '#4a2a35', color: '#E0928F', border: '1px solid #C96A6A66', minHeight: 44, cursor: 'pointer', opacity: hpAmt ? 1 : 0.5 }}
          >
            − hurt
          </button>
          <button
            type="button"
            disabled={!hpAmt}
            onClick={() => {
              changeHp(Number(hpAmt))
              setHpAmt('')
            }}
            className="flex-1 rounded-md px-3 py-2 text-sm font-semibold"
            style={{ background: `${C.sea}1a`, color: C.sea, border: `1px solid ${C.sea}55`, minHeight: 44, cursor: 'pointer', opacity: hpAmt ? 1 : 0.5 }}
          >
            + heal
          </button>
        </div>
      )}

      {/* Death saves at 0 HP */}
      {dying && (
        <Section style={{ marginTop: 12, border: `2px solid #C96A6A`, boxShadow: '0 0 28px #C96A6A44', animation: 'dyingPulse 1.6s ease-in-out infinite' }}>
          <Eyebrow>Death saving throws — hold on</Eyebrow>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm">Successes</span>
            <span>
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Death save success ${i + 1}`}
                  onClick={() => deathPip('successes', i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 22,
                    cursor: 'pointer',
                    color: i < state.deathSaves.successes ? C.sea : C.panelEdge,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  ●
                </button>
              ))}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Failures</span>
            <span>
              {[0, 1, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Death save failure ${i + 1}`}
                  onClick={() => deathPip('failures', i)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: 22,
                    cursor: 'pointer',
                    color: i < state.deathSaves.failures ? '#C96A6A' : C.panelEdge,
                    minWidth: 44,
                    minHeight: 44,
                  }}
                >
                  ●
                </button>
              ))}
            </span>
          </div>
          <Btn onClick={() => doRoll('Death save (10+ succeeds)', 0)}>Roll a death save</Btn>
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            d20, no bonus. 10+ succeeds. Three successes: stable. Any healing wakes you.
          </p>
        </Section>
      )}

      {/* Concentration co-pilot */}
      {concPrompt && (
        <Section style={{ marginTop: 12, border: `2px solid ${C.gold}` }}>
          <Eyebrow>The spell wavers —</Eyebrow>
          <p className="text-sm">
            You took damage while concentrating. <strong>Concentration check, DC 10</strong>
            <span className="text-xs" style={{ color: C.faint }}>
              {' '}
              (or half the damage if that's higher — ask your DM){/* VERIFY */}
            </span>
          </p>
          <Btn shimmer onClick={rollConcentration}>
            Hold the spell — roll CON {fmt(saveMod(sheet, 'CON'))}
          </Btn>
        </Section>
      )}
      {concOutcome && (
        <p
          role="status"
          className="text-sm mt-2 text-center italic"
          style={{ color: concOutcome === 'held' ? C.sea : '#C96A6A' }}
        >
          {concOutcome === 'held' ? '✦ The spell holds.' : 'The spell slips away like water…'}
        </p>
      )}

      {/* Conditions */}
      <Section style={{ marginTop: 12 }}>
        <Eyebrow>Conditions</Eyebrow>
        {state.conditions.length === 0 && (
          <p className="text-sm" style={{ color: C.faint }}>
            None — may it stay that way.
          </p>
        )}
        {state.conditions.map((c) => (
          <div key={c} className="mb-2">
            <div className="flex items-center justify-between">
              <strong className="text-sm" style={{ color: C.gold }}>
                {c}
              </strong>
              <button
                type="button"
                onClick={() => updateState({ conditions: state.conditions.filter((x) => x !== c) })}
                className="text-xs"
                style={{ color: C.faint, background: 'none', border: 'none', minHeight: 44, cursor: 'pointer' }}
              >
                clear ✕
              </button>
            </div>
            <p className="text-xs" style={{ color: C.parchment, opacity: 0.85 }}>
              {CONDITIONS[c]}
            </p>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setShowConditionPicker(!showConditionPicker)}
          className="text-sm underline"
          style={{ color: C.sea, background: 'none', border: 'none', padding: 0, minHeight: 44, cursor: 'pointer' }}
        >
          {showConditionPicker ? 'close' : '+ add a condition'}
        </button>
        {showConditionPicker && (
          <div className="flex flex-wrap gap-2 mt-2">
            {Object.keys(CONDITIONS)
              .filter((c) => !state.conditions.includes(c))
              .map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    updateState({ conditions: [...state.conditions, c] })
                    setShowConditionPicker(false)
                  }}
                  className="text-xs rounded-md px-3 py-2"
                  style={{ background: C.night, color: C.parchment, border: `1px solid ${C.panelEdge}`, minHeight: 40, cursor: 'pointer' }}
                >
                  {c}
                </button>
              ))}
          </div>
        )}
      </Section>

      <p className="uppercase text-xs tracking-widest mt-5 mb-1" style={{ color: C.gold, letterSpacing: '0.25em' }}>
        on your turn
      </p>
      {/* Advantage toggle */}
      <div className="flex gap-2 mt-3" role="group" aria-label="Roll mode">
        {(['disadvantage', 'normal', 'advantage'] as RollMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setRollMode(m)}
            className="flex-1 rounded-md py-2 text-sm"
            style={{
              background: rollMode === m ? (m === 'advantage' ? C.sea : m === 'disadvantage' ? '#B36B6B' : C.gold) : C.panel,
              color: rollMode === m ? C.ink : C.faint,
              border: `1px solid ${C.panelEdge}`,
              minHeight: 44,
              cursor: 'pointer',
            }}
          >
            {m === 'normal' ? 'Normal' : m === 'advantage' ? 'Advantage' : 'Disadvantage'}
          </button>
        ))}
      </div>
      <div className="mt-2">
        <HintOnce id="sheet-tap-to-roll">
          Your sheet rolls for you — tap any ability, skill, or the attack, and the dice answer.
        </HintOnce>
      </div>

      {/* Attack */}
      <Section style={{ marginTop: 16 }}>
        <Eyebrow>Attack — tap to roll{sheet.attacks > 1 ? ` · ×${sheet.attacks} per Attack action` : ''}</Eyebrow>
        <button
          type="button"
          onClick={rollAttack}
          className="text-left w-full rounded-lg px-3 py-2"
          style={{ background: C.night, border: `1px solid ${C.panelEdge}`, color: C.parchment, minHeight: 44, cursor: 'pointer' }}
        >
          {weaponInHand ? (
            <>
              <strong>{sheet.K.weapon.name}</strong>: d20 {fmt(sheet.atkMod)} to hit · damage{' '}
              {sheet.K.weapon.die} {fmt(mod(sheet.A[sheet.K.weapon.ab]))} 🎲
            </>
          ) : (
            <>
              <strong>👊 Unarmed strike</strong>: d20 {fmt(unarmedMod)} to hit · damage{' '}
              {Math.max(1, 1 + mod(sheet.A.STR))} flat 🎲
            </>
          )}
        </button>
        {!weaponInHand && (
          <p className="text-xs mt-1" style={{ color: C.faint }}>
            Your {sheet.K.weapon.name.toLowerCase()} is put away. Fists, furniture, and wit remain.
          </p>
        )}
      </Section>

      {/* Class abilities with uses — tap a pip when you spend one */}
      <FeatureUses features={sheet.featureList} uses={state.uses ?? {}} onChange={(name, spent) => updateState({ uses: { ...(state.uses ?? {}), [name]: spent } })} />
      {/* Fairy Magic — species-born, no class required. Faerie Fire arrives at level 3. VERIFY Witchlight fairy */}
      {character.build.species === 'Fairy ✦' && (
        <Section>
          <Eyebrow>fairy magic — born in you, no slots needed</Eyebrow>
          <p className="text-xs" style={{ color: C.faint }}>
            Tap a spell to see what it does.
          </p>
          <SpellChips
            label="Always yours"
            names={sheet.level >= 3 ? ['Druidcraft', 'Faerie Fire'] : ['Druidcraft']}
          />
          {sheet.level < 3 && (
            <p className="text-xs mt-2" style={{ color: C.faint }}>
              Faerie Fire wakes in your blood at level 3 — once per long rest. 🔒
            </p>
          )}
        </Section>
      )}

      {/* Spells & slots */}
      {sheet.K.spells && (
        <SpellsSection
          build={build}
          state={state}
          sheet={sheet}
          usedSlots={usedSlots}
          castSpell={castSpell}
          updateBuild={(patch) => update({ build: { ...build, ...patch } })}
          onRollSpellAttack={() => doRoll('Spell attack', sheet.spellAttack ?? 0)}
        />
      )}
      {sheet.K.spells && (
        <Section>
          <Eyebrow>Concentration &amp; slots</Eyebrow>
          <button
            type="button"
            aria-pressed={!!state.concentrating}
            onClick={() => {
              updateState({ concentrating: !state.concentrating })
              setConcPrompt(false)
              setConcOutcome(null)
            }}
            className="mt-3 rounded-md px-3 py-2 text-sm"
            style={{
              background: state.concentrating ? C.gold : C.night,
              color: state.concentrating ? C.ink : C.faint,
              border: `1px solid ${state.concentrating ? C.gold : C.panelEdge}`,
              minHeight: 44,
              cursor: 'pointer',
            }}
          >
            ◐ {state.concentrating ? 'Concentrating — tap when the spell ends' : 'Tap when you cast a concentration spell'}
          </button>
          {sheet.slotCount > 0 && (
            <div className="mt-3">
              <p className="text-sm mb-1" style={{ color: C.sea }}>
                {sheet.K.caster === 'pact' ? 'Pact slots (return on short rest)' : 'Spell slots'}
              </p>
              {(sheet.slotsByLevel.length ? sheet.slotsByLevel : [sheet.slotCount]).map((count, li) => {
                const lvl = li + 1
                const used = usedSlots(lvl)
                return (
                  <div key={lvl} className="flex items-center gap-2 mb-2">
                    <span className="text-xs" style={{ color: C.faint, width: 44 }}>
                      {ordinal(lvl)}
                    </span>
                    <div className="flex gap-2">
                      {Array.from({ length: count }, (_, i) => (
                        <button
                          key={i}
                          type="button"
                          aria-label={`Level ${lvl} spell slot ${i + 1} ${i < used ? 'used' : 'available'}`}
                          onClick={() => toggleSlot(i, lvl)}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: 10,
                            border: `2px solid ${C.gold}`,
                            background: i < used ? 'transparent' : C.gold,
                            color: i < used ? C.faint : C.ink,
                            fontSize: 18,
                            cursor: 'pointer',
                          }}
                        >
                          {i < used ? '·' : '✦'}
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </Section>
      )}

      {/* Rests */}
      <div className="grid grid-cols-2 gap-2">
        <Btn secondary onClick={shortRest}>
          Short Rest
        </Btn>
        <Btn secondary onClick={longRest}>
          Long Rest
        </Btn>
      </div>

      <p className="uppercase text-xs tracking-widest mt-5 mb-1" style={{ color: C.gold, letterSpacing: '0.25em' }}>
        the rest of the sheet
      </p>
      <Fold id="sheet-rolls" title="🎯 Abilities, saves & skills" defaultOpen>
      {/* Abilities (tap = save roll) */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        {ABILITIES.map((a) => (
          <button
            key={a}
            type="button"
            onClick={() => doRoll(`${a} save`, saveMod(sheet, a as AbilityKey))}
            className="rounded-lg py-3 text-center"
            style={{
              background: C.panel,
              border: `1px solid ${sheet.K.saves.includes(a) ? C.gold : C.panelEdge}`,
              color: C.parchment,
              cursor: 'pointer',
            }}
          >
            <p className="text-xs" style={{ color: C.faint }}>
              {a}
              {sheet.K.saves.includes(a) ? ' ◈' : ''}
            </p>
            <p style={{ ...display, fontSize: 24, fontWeight: 700 }}>{fmt(mod(sheet.A[a]))}</p>
            <p className="text-xs" style={{ color: C.faint }}>
              {sheet.A[a]}
            </p>
          </button>
        ))}
      </div>
      <p className="text-xs mt-1" style={{ color: C.faint }}>
        ◈ = proficient saving throw (add +{sheet.prof}) · tap to roll a save
      </p>

      {/* Skills (tap = check) */}
      <Section>
        <Eyebrow>Skills — tap to roll (add +{sheet.prof} when ◈)</Eyebrow>
        <div className="flex flex-wrap gap-2">
          {Object.keys(SKILL_ABILITY).map((s) => {
            const proficient = sheet.allSkills.includes(s)
            return (
              <button
                key={s}
                type="button"
                onClick={() => doRoll(s, skillMod(sheet, s))}
                className="text-xs rounded-md px-3 py-2"
                style={{
                  background: proficient ? C.panel : C.night,
                  color: proficient ? C.parchment : C.faint,
                  border: `1px solid ${proficient ? C.gold : C.panelEdge}`,
                  minHeight: 40,
                  cursor: 'pointer',
                }}
              >
                {proficient ? '◈ ' : ''}
                {s} {fmt(skillMod(sheet, s))}
              </button>
            )
          })}
        </div>
      </Section>

      </Fold>
      <Fold id="sheet-features" title="✦ Features, traits & equipment">
      {/* Features */}
      <Section>
        <Eyebrow>Features & traits</Eyebrow>
        {sheet.featureList.map((f, i) => (
          <p key={`${f.name}-${i}`} className="text-sm mb-1">
            • <strong style={{ color: C.parchment }}>{f.name}</strong>
            {f.text && <span style={{ opacity: 0.85 }}> — {f.text}</span>}
            {f.uses && (
              <span className="text-xs" style={{ color: C.sea }}>
                {' '}
                · {f.uses.n}/{f.uses.per} rest
              </span>
            )}
          </p>
        ))}
        {sheet.speciesTraits.map((t) => (
          <p key={t} className="text-sm mb-1">
            • {t}
          </p>
        ))}
        <p className="text-sm mb-1">• Background gift: {sheet.B.feat}</p>
      </Section>

      {/* Equipment */}
      <Section>
        <Eyebrow>Equipment</Eyebrow>
        <p className="text-sm">{sheet.K.kit}</p>
      </Section>

      </Fold>
      <Fold id="sheet-me" title="✎ Who I am">
      {/* Free text */}
      <Section>
        <Eyebrow>Appearance</Eyebrow>
        <TextArea rows={3} value={notes.appearance} onChange={(v) => updateNotes({ appearance: v })} placeholder="The picture in everyone's head when you walk in…" />
      </Section>
      <Section>
        <Eyebrow>Personality</Eyebrow>
        <TextArea rows={3} value={notes.personality} onChange={(v) => updateNotes({ personality: v })} placeholder="How you talk, what you love, what you can't resist…" />
      </Section>
      <Section style={{ border: `1px solid ${C.gold}` }}>
        <Eyebrow>What I lost 🔒 private</Eyebrow>
        <p className="text-xs mb-2" style={{ color: C.faint }}>
          Only you and the Dungeon Master can read this. The carnival keeps its secrets.
        </p>
        <TextArea rows={3} value={notes.lost} onChange={(v) => updateNotes({ lost: v })} placeholder="What did the Feywild take from you?" />
      </Section>
      <Section>
        <Eyebrow>Notes</Eyebrow>
        <TextArea rows={4} value={notes.notes} onChange={(v) => updateNotes({ notes: v })} placeholder="Anything else worth remembering…" />
      </Section>

      </Fold>
      <Btn secondary onClick={onEdit}>
        Edit character
      </Btn>

      {/* Roll result card */}
      {inTheAir && !roll && (
        <p
          role="status"
          className="fixed left-0 right-0 text-center text-xs uppercase tracking-widest"
          style={{ bottom: 'calc(84px + env(safe-area-inset-bottom))', color: C.gold, letterSpacing: '0.3em', zIndex: 40, pointerEvents: 'none', animation: 'ceremony-fade 2s ease-out infinite' }}
        >
          the dice are in the air
        </p>
      )}
      {roll && (
        <div
          role="status"
          className="fixed left-4 right-4 rounded-xl p-4 text-center"
          style={{
            bottom: 'calc(76px + env(safe-area-inset-bottom))',
            maxWidth: 520,
            margin: '0 auto',
            background: roll.isNat20 ? C.gold : roll.isNat1 ? '#3d2030' : C.panel,
            color: roll.isNat20 ? C.ink : C.parchment,
            border: `1px solid ${roll.isNat20 ? C.gold : roll.isNat1 ? '#C96A6A' : C.panelEdge}`,
            boxShadow: '0 8px 32px rgba(0,0,0,.5)',
            animation: roll.isNat20 ? 'cardRise .3s ease-out, natTwentyGlow 1.6s ease-in-out infinite' : roll.isNat1 ? 'cardRise .3s ease-out, natOneGutter .5s ease-out' : 'cardRise .3s ease-out',
            zIndex: 46,
            overflow: 'hidden',
          }}
          onClick={() => {
            setRoll(null)
            setDamage(null)
            clearDice3d()
          }}
        >
          {roll.isNat20 && <GoldBurst />}
          <p className="text-xs uppercase tracking-widest" style={{ opacity: 0.8 }}>
            {roll.label}
            {roll.mode !== 'normal' ? ` · ${roll.mode}` : ''}
          </p>
          <p style={{ ...display, fontSize: 52, fontWeight: 700, lineHeight: 1.1 }}>
            {roll.total}
            {roll.isNat20 ? ' ✦!' : roll.isNat1 ? ' …oh no' : ''}
          </p>
          <p className="text-xs" style={{ opacity: 0.8 }}>
            d20: {roll.mode === 'normal' ? roll.dice[0] : `${roll.dice[0]} / ${roll.dice[1]} → kept ${roll.kept}`}
            {roll.modifier !== 0 ? ` ${fmt(roll.modifier)}` : ''}
            {damage ? ` · damage: ${damage.total} (${damage.rolls.join('+')}${damage.total - damage.rolls.reduce((s, r) => s + r, 0) !== 0 ? fmt(damage.total - damage.rolls.reduce((s, r) => s + r, 0)) : ''})` : ''}
          </p>
        </div>
      )}
    </div>
  )
}
