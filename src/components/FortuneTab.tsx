// The Witchlight Divination Booth — ported from the prototype's quiz.
// New vs. prototype: results save via the Store (they flow to the DM
// automatically in Supabase mode); copy button kept as fallback.

import { useState } from 'react'
import { QUIZ } from '../data/quiz'
import { CLASSES } from '../data/rules'
import type { Store } from '../lib/store'
import type { QuizResult } from '../types'
import { Btn, C, Eyebrow, H, Pick, TextInput, display } from './ui'

type Stage = 'intro' | 'quiz' | 'results'

interface FortuneTabProps {
  store: Store
  playerName: string
  savedResult: QuizResult | null
  onSaved: (r: QuizResult) => void
  onBuildFromQuiz: (name: string, klass: string | null) => void
}

export function FortuneTab({ store, playerName, savedResult, onSaved, onBuildFromQuiz }: FortuneTabProps) {
  const [stage, setStage] = useState<Stage>(savedResult ? 'results' : 'intro')
  const [idx, setIdx] = useState(0)
  const [name, setName] = useState(savedResult?.playerName ?? playerName)
  const [answers, setAnswers] = useState<Record<string, string>>(savedResult?.answers ?? {})
  const [scores, setScores] = useState<Record<string, number>>({})
  const [draft, setDraft] = useState('')
  const [copied, setCopied] = useState(false)

  const q = QUIZ[idx]

  const topClasses = () =>
    savedResult && stage === 'results' && Object.keys(scores).length === 0
      ? savedResult.topClasses
      : Object.entries(scores)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 3)
          .map(([n]) => n)

  const finish = (finalAnswers: Record<string, string>, finalScores: Record<string, number>) => {
    const top = Object.entries(finalScores)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([n]) => n)
    const result: QuizResult = {
      playerName: name || 'A stranger',
      answers: finalAnswers,
      topClasses: top,
      updatedAt: new Date().toISOString(),
    }
    void store.saveQuizResult(result)
    onSaved(result)
    setStage('results')
  }

  const choose = (opt: { label: string; pts: Record<string, number> }) => {
    const nextAnswers = { ...answers, [q.id]: opt.label }
    setAnswers(nextAnswers)
    let nextScores = scores
    if (!q.captureOnly) {
      nextScores = { ...scores }
      for (const [k, p] of Object.entries(opt.pts)) nextScores[k] = (nextScores[k] || 0) + p
      setScores(nextScores)
    }
    if (idx + 1 < QUIZ.length) setIdx(idx + 1)
    else finish(nextAnswers, nextScores)
  }

  const submitText = () => {
    const v = draft.trim()
    if (!v) return
    const nextAnswers = { ...answers, [q.id]: v }
    setAnswers(nextAnswers)
    setDraft('')
    if (idx + 1 < QUIZ.length) setIdx(idx + 1)
    else finish(nextAnswers, scores)
  }

  const copy = async () => {
    const lines = [
      `🎪 WITCHLIGHT DIVINATION — ${name || 'A stranger'}`,
      ``,
      `Callings: ${topClasses().join(', ')}`,
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
        <Eyebrow>Admit one · free of charge*</Eyebrow>
        <h1 style={{ ...display, fontSize: 40, lineHeight: 1.05, fontWeight: 700 }}>
          The Witchlight
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
        <Btn onClick={() => setStage('quiz')}>Step inside</Btn>
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
            className="text-sm px-3 py-2 rounded-md"
            style={{ color: C.faint, border: `1px solid ${C.panelEdge}`, minHeight: 44 }}
          >
            ← Back
          </button>
          <div style={{ color: C.gold, letterSpacing: 4, fontSize: 12 }} aria-label={`Question ${idx + 1} of ${QUIZ.length}`}>
            {QUIZ.map((_, i) => (
              <span key={i} style={{ opacity: i <= idx ? 1 : 0.25 }}>
                ✦
              </span>
            ))}
          </div>
        </div>
        <div key={idx} style={{ animation: 'cardRise .4s ease-out' }}>
          <Eyebrow>The lanterns ask —</Eyebrow>
          <H>{q.prompt}</H>
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
                style={{ background: C.panel, border: `1px solid ${C.panelEdge}`, color: C.parchment, resize: 'vertical' }}
              />
              <Btn onClick={submitText} disabled={!draft.trim()}>
                Tell the lanterns
              </Btn>
            </div>
          )}
        </div>
      </div>
    )
  }

  const top = topClasses()
  const displayAnswers = Object.keys(answers).length > 0 ? answers : (savedResult?.answers ?? {})

  return (
    <div style={{ animation: 'cardRise .5s ease-out' }}>
      <Eyebrow>Your fortune, {name || 'stranger'}</Eyebrow>
      <H>The lanterns have spoken</H>
      <div className="mt-4 flex flex-col gap-3">
        {top.map((n, i) => (
          <div
            key={n}
            className="rounded-xl p-4"
            style={{
              background: i === 0 ? C.parchment : C.panel,
              color: i === 0 ? C.ink : C.parchment,
              border: `1px solid ${i === 0 ? C.gold : C.panelEdge}`,
            }}
          >
            <h3 style={{ ...display, fontSize: 24, fontWeight: 700 }}>
              {i === 0 ? '✦ ' : ''}
              {n}
            </h3>
            <p className="text-sm mt-1" style={{ opacity: 0.9 }}>
              {CLASSES[n].blurb} <em>({CLASSES[n].complexity})</em>
            </p>
          </div>
        ))}
      </div>
      <p className="text-sm mt-3" style={{ color: C.sea }}>
        {store.shared
          ? '✦ Your fortune has already flown to the Dungeon Master on lantern-light.'
          : 'Saved on this device. Use the copy button to send it to your DM.'}
      </p>
      <Btn onClick={copy}>{copied ? 'Copied — send it to your DM' : 'Copy my fortune for the DM'}</Btn>
      <Btn secondary onClick={() => onBuildFromQuiz(name, top[0] ?? null)}>
        Build this character →
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
                <span className="block" style={{ color: C.parchment }}>
                  → {displayAnswers[x.id]}
                </span>
              </p>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
