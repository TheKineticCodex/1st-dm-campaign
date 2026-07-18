// The character sheet — prototype layout, upgraded per spec §4.4:
// tappable dice (attack/skill/save) with advantage toggle, HP tracker with
// death-save pips, spell slots, rest buttons, conditions, and free-text
// sections including the private "What I lost".

import { useEffect, useRef, useState } from 'react'
import { ABILITIES, CONDITIONS, SKILL_ABILITY, fmt, mod, type AbilityKey } from '../data/rules'
import { computeSheet, saveMod, skillMod } from '../lib/compute'
import { rollD20, rollDamage, type RollMode, type RollResult } from '../lib/dice'
import { joinTableChannel, type TableChannel } from '../lib/realtime'
import type { Store } from '../lib/store'
import type { SavedCharacter } from '../types'
import { CharacterCard } from './CharacterCard'
import { Btn, C, Eyebrow, H, HintOnce, Section, TextArea, display } from './ui'

interface SheetTabProps {
  character: SavedCharacter | null
  onUpdate: (c: SavedCharacter) => void
  onEdit: () => void
  onGoFortune: () => void
  store: Store
  playerName: string
}

export function SheetTab({ character, onUpdate, onEdit, onGoFortune, store, playerName }: SheetTabProps) {
  const [rollMode, setRollMode] = useState<RollMode>('normal')
  const [roll, setRoll] = useState<RollResult | null>(null)
  const [damage, setDamage] = useState<{ rolls: number[]; total: number } | null>(null)
  const [showConditionPicker, setShowConditionPicker] = useState(false)
  const [concPrompt, setConcPrompt] = useState(false)
  const [concOutcome, setConcOutcome] = useState<'held' | 'slipped' | null>(null)
  const channelRef = useRef<TableChannel | null>(null)

  // Send-only channel: rolls stream to the table's feed (A5).
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const id = await store.getChannelId()
      if (!cancelled) channelRef.current = joinTableChannel(id, {})
    })()
    return () => {
      cancelled = true
      channelRef.current?.close()
    }
  }, [store])

  // Auto-dismiss the roll card after a few beats.
  useEffect(() => {
    if (!roll) return
    const t = setTimeout(() => {
      setRoll(null)
      setDamage(null)
    }, 6000)
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

  const doRoll = (label: string, modifier: number) => {
    setDamage(null)
    const r = rollD20(label, modifier, rollMode)
    setRoll(r)
    broadcastRoll(r)
  }

  const rollAttack = () => {
    const r = rollD20(`${sheet.K.weapon.name} attack`, sheet.atkMod, rollMode)
    setRoll(r)
    broadcastRoll(r)
    setDamage(rollDamage(sheet.K.weapon.die, mod(sheet.A[sheet.K.weapon.ab])))
  }

  const rollConcentration = () => {
    const r = rollD20('Concentration (CON save)', saveMod(sheet, 'CON'), rollMode)
    setRoll(r)
    broadcastRoll(r)
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

  const shortRest = () => {
    if (!window.confirm('Take a Short Rest (1 hour)? Warlock pact slots return; spend Hit Dice with your DM.')) return
    updateState({ slotsUsed: sheet.K.caster === 'pact' ? 0 : state.slotsUsed })
  }

  const longRest = () => {
    if (!window.confirm('Take a Long Rest (8 hours)? HP and all spell slots return in the morning.')) return
    updateState({ damage: 0, slotsUsed: 0, deathSaves: { successes: 0, failures: 0 } })
  }

  const toggleSlot = (i: number) => {
    updateState({ slotsUsed: i < state.slotsUsed ? i : i + 1 })
  }

  const deathPip = (kind: 'successes' | 'failures', i: number) => {
    const current = state.deathSaves[kind]
    updateState({
      deathSaves: { ...state.deathSaves, [kind]: i < current ? i : i + 1 },
    })
  }

  return (
    <div style={{ animation: 'cardRise .4s ease-out', paddingBottom: roll ? 120 : 0 }}>
      <div className="mb-2">
        <CharacterCard build={build} size="full" />
      </div>
      <p className="text-xs text-center" style={{ color: C.faint }}>
        Level {sheet.level}
        {build.subclass === null ? ` · subclass unlocks at level ${sheet.K.subclassAt} 🔒` : ` · ${build.subclass}`}
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

      {/* HP / AC / Speed */}
      <div className="grid grid-cols-3 gap-2 mt-3">
        <div className="rounded-lg py-3 text-center" style={{ background: C.parchment, color: C.ink }}>
          <p className="text-xs" style={{ color: C.goldDim }}>
            HP
          </p>
          <p style={{ ...display, fontSize: 26, fontWeight: 700 }}>
            {hpCurrent}/{sheet.hpMax}
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
        </div>
        <div className="rounded-lg py-3 text-center" style={{ background: C.parchment, color: C.ink }}>
          <p className="text-xs" style={{ color: C.goldDim }}>
            AC
          </p>
          <p style={{ ...display, fontSize: 26, fontWeight: 700 }}>{sheet.ac.val}</p>
        </div>
        <div className="rounded-lg py-3 text-center" style={{ background: C.parchment, color: C.ink }}>
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

      {/* Death saves at 0 HP */}
      {dying && (
        <Section style={{ marginTop: 12, border: `1px solid ${C.gold}` }}>
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

      {/* Attack */}
      <Section style={{ marginTop: 16 }}>
        <Eyebrow>Attack — tap to roll</Eyebrow>
        <button
          type="button"
          onClick={rollAttack}
          className="text-left w-full rounded-lg px-3 py-2"
          style={{ background: C.night, border: `1px solid ${C.panelEdge}`, color: C.parchment, minHeight: 44, cursor: 'pointer' }}
        >
          <strong>{sheet.K.weapon.name}</strong>: d20 {fmt(sheet.atkMod)} to hit · damage{' '}
          {sheet.K.weapon.die} {fmt(mod(sheet.A[sheet.K.weapon.ab]))} 🎲
        </button>
      </Section>

      {/* Spells & slots */}
      {sheet.K.spells && (
        <Section>
          <Eyebrow>Spellcasting</Eyebrow>
          {sheet.K.spells.cantrips.length > 0 && (
            <p className="text-sm">
              <strong>Cantrips (always free):</strong> {sheet.K.spells.cantrips.join(', ')}
            </p>
          )}
          <p className="text-sm mt-1">
            <strong>Level 1 (use spell slots):</strong> {sheet.K.spells.leveled.join(', ')}
          </p>
          <p className="text-xs mt-2" style={{ color: C.faint }}>
            <button
              type="button"
              onClick={() => doRoll('Spell attack', sheet.spellAttack ?? 0)}
              style={{ color: C.sea, background: 'none', border: 'none', padding: 0, cursor: 'pointer', textDecoration: 'underline' }}
            >
              Spell attack {fmt(sheet.spellAttack ?? 0)}
            </button>{' '}
            · Save DC {sheet.spellDc}
          </p>
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
              <div className="flex gap-2">
                {Array.from({ length: sheet.slotCount }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    aria-label={`Spell slot ${i + 1} ${i < state.slotsUsed ? 'used' : 'available'}`}
                    onClick={() => toggleSlot(i)}
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 10,
                      border: `2px solid ${C.gold}`,
                      background: i < state.slotsUsed ? 'transparent' : C.gold,
                      color: i < state.slotsUsed ? C.faint : C.ink,
                      fontSize: 18,
                      cursor: 'pointer',
                    }}
                  >
                    {i < state.slotsUsed ? '·' : '✦'}
                  </button>
                ))}
              </div>
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

      {/* Conditions */}
      <Section style={{ marginTop: 16 }}>
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

      {/* Features */}
      <Section>
        <Eyebrow>Features & traits</Eyebrow>
        {sheet.features.map((f) => (
          <p key={f} className="text-sm mb-1">
            • {f}
          </p>
        ))}
        {sheet.S.traits.map((t) => (
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

      <Btn secondary onClick={onEdit}>
        Edit character
      </Btn>

      {/* Roll result card */}
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
            animation: 'cardRise .3s ease-out',
            zIndex: 40,
          }}
          onClick={() => {
            setRoll(null)
            setDamage(null)
          }}
        >
          <p className="text-xs uppercase tracking-widest" style={{ opacity: 0.8 }}>
            {roll.label}
            {roll.mode !== 'normal' ? ` · ${roll.mode}` : ''}
          </p>
          <p style={{ ...display, fontSize: 40, fontWeight: 700 }}>
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
