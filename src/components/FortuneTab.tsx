// The Getting Fair Divination Booth — ported from the prototype's quiz.
// New vs. prototype: results save via the Store (they flow to the DM
// automatically in Supabase mode); copy button kept as fallback.

import { useState } from 'react'
import { LEFT_TO_CHANCE, QUIZ } from '../data/quiz'
import { CLASSES, SPECIES } from '../data/rules'
import type { Store } from '../lib/store'
import type { QuizResult } from '../types'
import { CLASS_SIGILS, SPECIES_GLYPHS } from './glyphs'
import { Btn, C, Eyebrow, H, Lanterns, Pick, TextInput, display, onState, panelSurface, seaLit, wellSurface } from './ui'
import { Icon, Spark } from './icons'

type Stage = 'intro' | 'quiz' | 'results'

interface FortuneTabProps {
  store: Store
  playerName: string
  savedResult: QuizResult | null
  onSaved: (r: QuizResult) => void
  onBuildFromQuiz: (name: string, klass: string | null, species: string | null) => void
}

const topOf = (scores: Record<string, number>, n: number) =>
  Object.entries(scores)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([k]) => k)

export function FortuneTab({ store, playerName, savedResult, onSaved, onBuildFromQuiz }: FortuneTabProps) {
  const [stage, setStage] = useState<Stage>(savedResult ? 'results' : 'intro')
  const [idx, setIdx] = useState(0)
  const [name, setName] = useState(savedResult?.playerName ?? playerName)
  const [answers, setAnswers] = useState<Record<string, string>>(savedResult?.answers ?? {})
  const [scores, setScores] = useState<Record<string, number>>({})
  const [speciesScores, setSpeciesScores] = useState<Record<string, number>>({})
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)
  // The verdict is tappable: players may take the lanterns' first word or
  // tap any other card. null = the top recommendation.
  const [pickClass, setPickClass] = useState<string | null>(null)
  const [pickSpecies, setPickSpecies] = useState<string | null>(null)

  const q = QUIZ[idx]
  const freshRun = Object.keys(scores).length > 0

  const topClasses = () =>
    savedResult && stage === 'results' && !freshRun ? savedResult.topClasses : topOf(scores, 3)

  const topSpecies = () =>
    savedResult && stage === 'results' && !freshRun
      ? (savedResult.topSpecies ?? [])
      : topOf(speciesScores, 2)

  const finish = (
    finalAnswers: Record<string, string>,
    finalScores: Record<string, number>,
    finalSpecies: Record<string, number>,
  ) => {
    const result: QuizResult = {
      playerName: name || 'A stranger',
      answers: finalAnswers,
      topClasses: topOf(finalScores, 3),
      topSpecies: topOf(finalSpecies, 2),
      updatedAt: new Date().toISOString(),
    }
    void store.saveQuizResult(result)
    onSaved(result)
    setStage('results')
  }

  const choose = (opt: { label: string; pts: Record<string, number>; speciesPts?: Record<string, number> }) => {
    const nextAnswers = { ...answers, [q.id]: opt.label }
    setAnswers(nextAnswers)
    let nextScores = scores
    let nextSpecies = speciesScores
    if (!q.captureOnly) {
      nextScores = { ...scores }
      for (const [k, p] of Object.entries(opt.pts)) nextScores[k] = (nextScores[k] || 0) + p
      setScores(nextScores)
      if (opt.speciesPts) {
        nextSpecies = { ...speciesScores }
        for (const [k, p] of Object.entries(opt.speciesPts)) nextSpecies[k] = (nextSpecies[k] || 0) + p
        setSpeciesScores(nextSpecies)
      }
    }
    if (idx + 1 < QUIZ.length) setIdx(idx + 1)
    else finish(nextAnswers, nextScores, nextSpecies)
  }

  const submitText = (leaveToChance = false) => {
    const v = leaveToChance ? LEFT_TO_CHANCE : draft.trim()
    if (!v) return
    const nextAnswers = { ...answers, [q.id]: v }
    setAnswers(nextAnswers)
    setDraft('')
    if (idx + 1 < QUIZ.length) setIdx(idx + 1)
    else finish(nextAnswers, scores, speciesScores)
  }

  // "I already know my path" jumps past the seven reading questions,
  // straight to the ones the Dungeon Master keeps.
  const firstKeeperQuestion = QUIZ.findIndex((x) => x.type === 'text')
  const skipReading = () => {
    setStage('quiz')
    setIdx(firstKeeperQuestion)
  }

  const copy = async () => {
    const lines = [
      `🎪 GETTING FAIR DIVINATION — ${name || 'A stranger'}`,
      ``,
      `Callings: ${topClasses().join(', ')}`,
      `Reflection: ${topSpecies().join(' or ') || '(unread)'}`,
      ``,
      ...QUIZ.map((x) => `• ${x.prompt}\n  → ${answers[x.id] || '(skipped)'}`),
      ``,
      `Send this to your DM.`,
    ].join('\n')
    try {
      await navigator.clipboard.writeText(lines)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = lines
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2500)
  }

  if (stage === 'intro') {
    return (
      <div className="text-center" style={{ animation: 'cardRise .4s ease-out' }}>
        <Lanterns />
        <Eyebrow>Admit one · free of charge*</Eyebrow>
        <h1 className="title-glow" style={{ ...display, fontSize: 40, lineHeight: 1.05, fontWeight: 700, color: C.gold }}>
          The Getting Fair
          <br />
          Divination Booth
        </h1>
        <p className="mt-4 leading-relaxed" style={{ color: C.faint }}>
          Ten questions. The lanterns will read what kind of hero you were always meant to be — then
          head to the Build tab to make it real.
        </p>
        <div className="mt-6 text-left">
          <label className="block text-sm mb-2" style={{ color: C.sea }} htmlFor="qn">
            What shall the lanterns call you?
          </label>
          <TextInput id="qn" value={name} onChange={setName} placeholder="Your name" />
        </div>
        <Btn shimmer onClick={() => setStage('quiz')}>
          Step inside ✦
        </Btn>
        <Btn secondary onClick={skipReading}>
          I already know my path — skip the reading
        </Btn>
        <p className="mt-1 text-xs" style={{ color: C.faint }}>
          (Even the certain answer four small questions — the carnival keeps its records.)
        </p>
        <p className="mt-3 text-xs" style={{ color: C.faint }}>
          *The carnival never charges coin. What it does charge is another matter.
        </p>
        {savedResult && (
          <Btn secondary onClick={() => setStage('results')}>
            See my last fortune
          </Btn>
        )}
      </div>
    )
  }

  if (stage === 'quiz') {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <button
            type="button"
            onClick={() => (idx === 0 ? setStage('intro') : setIdx(idx - 1))}
            className="text-sm px-3 py-2 rounded-md inline-flex items-center gap-1.5"
            style={{ ...panelSurface, color: C.parchment, minHeight: 44, cursor: 'pointer' }}
          >
            <Icon name="arrow" size={14} style={{ transform: 'scaleX(-1)' }} />Back
          </button>
          <div className="flex items-center gap-1" style={{ color: C.gold }} role="img" aria-label={`Question ${idx + 1} of ${QUIZ.length}`}>
            {QUIZ.map((_, i) => (
              <span
                key={i}
                className={i <= idx ? 'twinkle' : undefined}
                style={{ display: 'inline-flex', opacity: i <= idx ? 1 : 0.3, color: i <= idx ? C.gold : C.brassDim, animationDelay: `${i * 0.25}s` }}
              >
                <Spark size={10} />
              </span>
            ))}
          </div>
        </div>
        <div key={idx} style={{ animation: 'cardRise .4s ease-out' }}>
          <Eyebrow>The lanterns ask —</Eyebrow>
          <H>{q.prompt}</H>
          {q.hint && (
            <p className="text-sm mt-2 italic flex items-start gap-1.5" style={{ color: C.gold }}>
              <Spark size={11} style={{ marginTop: 5 }} />
              <span>{q.hint}</span>
            </p>
          )}
          {q.type === 'choice' ? (
            <div className="mt-5 flex flex-col gap-3">
              {q.options!.map((o) => (
                <Pick key={o.label} selected={answers[q.id] === o.label} onClick={() => choose(o)}>
                  {o.label}
                </Pick>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={q.placeholder}
                rows={4}
                className="w-full rounded-lg px-4 py-3 outline-none"
                style={{ ...wellSurface, color: C.parchment, resize: 'vertical' }}
              />
              <Btn onClick={() => submitText()} disabled={!draft.trim()}>
                Tell the lanterns
              </Btn>
              {q.optional && (
                <Btn secondary onClick={() => submitText(true)}>
                  Leave it to chance ✦
                </Btn>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  const top = topClasses()
  const species = topSpecies()
  const chosenClass = pickClass ?? top[0] ?? null
  const chosenSpecies = pickSpecies ?? species[0] ?? null
  const displayAnswers = Object.keys(answers).length > 0 ? answers : (savedResult?.answers ?? {})

  return (
    <div style={{ animation: 'cardRise .5s ease-out' }}>
      <Eyebrow>Your fortune, {name || 'stranger'}</Eyebrow>
      <H>{top.length > 0 ? 'The lanterns have spoken' : 'You kept your own counsel'}</H>
      {top.length > 0 ? (
        <p className="text-sm mt-1" style={{ color: C.sea }}>
          Tap any card to choose it — the lanterns only suggest.
        </p>
      ) : (
        <p className="text-sm mt-1" style={{ color: C.sea }}>
          The lanterns respect a made-up mind. Every door in the forge stands open.
        </p>
      )}

      {species.length > 0 && (
        <div className="grid gap-2 mt-3" style={{ gridTemplateColumns: species.length > 1 ? '1fr 1fr' : '1fr' }}>
          {species.map((sp, i) => {
            const selected = chosenSpecies === sp
            return (
              <button
                key={sp}
                type="button"
                aria-pressed={selected}
                onClick={() => setPickSpecies(sp)}
                className="rounded-xl p-3 text-center"
                style={{
                  ...(selected ? seaLit : panelSurface),
                  color: C.parchment,
                  cursor: 'pointer',
                  animation: `cardRise .5s ease-out ${0.15 + i * 0.12}s both`,
                  transition: 'border-color .2s ease, box-shadow .2s ease',
                }}
              >
                <span
                  className="block mx-auto mb-1"
                  style={{ width: 54, height: 54, color: selected ? C.sea : C.faint }}
                  aria-hidden="true"
                >
                  {SPECIES_GLYPHS[sp]}
                </span>
                <p className="text-xs uppercase tracking-widest" style={{ color: C.sea, letterSpacing: '0.18em' }}>
                  {i === 0 ? 'the mirror shows' : 'or perhaps'}
                </p>
                <h3 style={{ ...display, fontSize: 20, fontWeight: 700, color: selected ? C.sea : C.parchment }}>
                  {sp}
                </h3>
                <p className="text-xs" style={{ color: C.faint }}>
                  {SPECIES[sp]?.traits[0].split(':')[0]}
                </p>
              </button>
            )
          })}
        </div>
      )}

      <div className="mt-3 flex flex-col gap-3">
        {top.map((n, i) => {
          const selected = chosenClass === n
          return (
            <button
              key={n}
              type="button"
              aria-pressed={selected}
              onClick={() => setPickClass(n)}
              className="rounded-xl p-4 flex items-center gap-4 text-left w-full"
              style={{
                ...(selected ? onState : { ...panelSurface, color: C.parchment }),
                cursor: 'pointer',
                animation: `cardRise .5s ease-out ${0.3 + i * 0.18}s both`,
                transition: 'border-color .2s ease, box-shadow .2s ease',
              }}
            >
              <span
                style={{
                  width: selected ? 60 : 44,
                  height: selected ? 60 : 44,
                  color: selected ? C.goldHi : C.sea,
                  flexShrink: 0,
                }}
                aria-hidden="true"
              >
                {CLASS_SIGILS[n]}
              </span>
              <div>
                <h3 className="flex items-center gap-2" style={{ ...display, fontSize: selected ? 26 : 21, fontWeight: 700, color: selected ? C.goldHi : C.parchment }}>
                  {selected && <Spark size={16} />}
                  {n}
                </h3>
                <p className="text-sm" style={{ opacity: 0.9 }}>
                  {CLASSES[n].blurb} <em>({CLASSES[n].complexity})</em>
                </p>
              </div>
            </button>
          )
        })}
      </div>

      <p
        className="text-sm mt-4 text-center italic"
        style={{ color: C.faint, animation: 'cardRise .5s ease-out .9s both' }}
      >
        Not seeing yourself here? Every species and every class stays open in the forge.
      </p>
      <p className="text-sm mt-2 flex items-start gap-1.5" style={{ color: C.sea }}>
        {store.shared && <Spark size={11} style={{ marginTop: 5 }} />}
        <span>{store.shared
          ? 'Your fortune has already flown to the Dungeon Master on lantern-light.'
          : 'Saved on this device. Use the copy button to send it to your DM.'}</span>
      </p>
      <Btn shimmer onClick={() => onBuildFromQuiz(name, chosenClass, chosenSpecies)}>
        {chosenClass || chosenSpecies
          ? `Step into the forge as a ${[chosenSpecies, chosenClass].filter(Boolean).join(' ')} ✦`
          : 'Step into the forge ✦'}
      </Btn>
      <Btn secondary onClick={copy}>
        {copied ? 'Copied — send it to your DM' : 'Copy my fortune for the DM'}
      </Btn>
      <Btn
        secondary
        onClick={() => {
          setAnswers({})
          setScores({})
          setIdx(0)
          setStage('intro')
        }}
      >
        Ask the lanterns again
      </Btn>
      {Object.keys(displayAnswers).length > 0 && (
        <div className="mt-4">
          <Eyebrow>What you told the lanterns</Eyebrow>
          {QUIZ.map((x) =>
            displayAnswers[x.id] ? (
              <p key={x.id} className="text-sm mb-2" style={{ color: C.faint }}>
                {x.prompt}
                <span className="block flex items-start gap-1.5" style={{ color: C.parchment }}>
                  <Icon name="arrow" size={13} style={{ marginTop: 4, color: C.brassDim }} />
                  <span>{displayAnswers[x.id]}</span>
                </span>
              </p>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
