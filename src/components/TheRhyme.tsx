// 📖 The rhyme — tonight's verse, and only tonight's verse.
//
// Sits at the top of Tonight because it is the first thing said, before the
// Moon line. It shows one verse: reading ahead by accident is the one way to
// spoil a tale whose whole trick is that the ending was in it all along. The
// rest of it is behind a fold that says so.

import { useEffect, useState } from 'react'
import { REFRAIN, TALE, TALE_HOW, TALE_TITLE, verseFor, type TaleVerse } from '../data/tale'
import type { Store } from '../lib/store'
import { C, Fold, display, eyebrow, panelSurface, seaLit, wellSurface } from './ui'
import { Icon, Spark } from './icons'

/** The call and its answer, in the shape this verse leaves it. */
function Refrain({ v, big }: { v: TaleVerse; big?: boolean }) {
  const answer =
    v.refrain === 'falters' ? REFRAIN.faltered : v.refrain === 'breaks' ? REFRAIN.broken : REFRAIN.answer
  return (
    <div className="mt-3">
      <p style={{ ...display, fontSize: big ? 20 : 16, fontStyle: 'italic', fontWeight: 600, color: C.brassDim }}>
        {REFRAIN.call}
      </p>
      <p
        style={{
          ...display,
          fontSize: big ? 21 : 17,
          fontStyle: v.refrain === 'breaks' ? 'normal' : 'italic',
          fontWeight: v.refrain === 'breaks' ? 700 : 600,
          color: v.refrain === 'as written' ? C.brassDim : C.gold,
        }}
      >
        {answer}
      </p>
    </div>
  )
}

export function TheRhyme({ store, started }: { store: Store; started: boolean }) {
  const [session, setSession] = useState<number | null>(null)
  // Open at the top of the night, because it is the first thing he says. Shut
  // the moment the night is walking, because after that it is a card sitting
  // between him and the gold words. He can open it again whenever he likes.
  const [open, setOpen] = useState(!started)
  useEffect(() => setOpen(!started), [started])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const notes = await store.listSessionNotes()
      if (cancelled) return
      const played = notes.map((n) => n.sessionNumber)
      setSession((played.length ? Math.max(...played) : 0) + 1)
    })()
    return () => {
      cancelled = true
    }
  }, [store])

  if (session === null) return null
  const v = verseFor(session)
  return (
    <div className="rounded-xl p-4 mb-4" style={{ ...panelSurface, border: `1px solid ${C.brassDim}` }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full text-left"
        style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', minHeight: 44 }}
      >
        <span className="flex items-baseline justify-between gap-3">
          <span style={{ ...eyebrow, letterSpacing: '0.22em' }}>
            <Icon name="story" size={12} style={{ marginRight: 5, marginTop: -2 }} />
            the rhyme — say this first
          </span>
          <span style={{ ...eyebrow, color: C.faint, whiteSpace: 'nowrap' }}>
            verse {v.numeral} of {TALE.length} {open ? '−' : '+'}
          </span>
        </span>
        <span className="block mt-0.5" style={{ ...display, fontSize: 20, fontWeight: 700, color: C.parchment }}>
          {TALE_TITLE}
        </span>
      </button>

      {open && (
        <>
      <div className="mb-2" />

      {/* the gold words — the only part he reads out */}
      <div
        className="rounded-lg px-3.5 py-3"
        style={{ ...seaLit, borderColor: C.gold, display: 'grid', gap: '0.65rem' }}
      >
        {v.lines.map((line, i) => (
          <p key={i} style={{ color: C.gold, fontStyle: 'italic', fontSize: 18, lineHeight: 1.55 }}>
            {line}
          </p>
        ))}
        <Refrain v={v} big />
      </div>

      {v.direction && (
        <p className="text-sm mt-2.5 flex items-start gap-2" style={{ color: C.faint }}>
          <Spark size={11} style={{ color: C.sea, marginTop: 6, flexShrink: 0 }} />
          <span>{v.direction}</span>
        </p>
      )}

      <div className="mt-3">
        <Fold id="tale-how" title="🕯 How to run the rhyme">
          <ul className="grid gap-2">
            {TALE_HOW.map((line) => (
              <li key={line} className="text-sm flex items-start gap-2" style={{ color: C.parchment }}>
                <Spark size={10} style={{ color: C.brassDim, marginTop: 6, flexShrink: 0 }} />
                <span>{line}</span>
              </li>
            ))}
          </ul>
        </Fold>

        <Fold id="tale-all" title="📖 The whole rhyme — not for the table">
          <p className="text-xs mb-3" style={{ color: C.faint }}>
            All seven, for planning. The ending is in verse V and verse VII, so read this away from the table.
          </p>
          <div className="grid gap-2">
            {TALE.map((t) => (
              <div key={t.numeral} className="rounded-lg px-3 py-2.5" style={wellSurface}>
                <p style={{ ...eyebrow, color: t.numeral === v.numeral ? C.gold : C.brassDim }}>
                  {t.numeral} · session {t.session}
                  {t.numeral === v.numeral && ' · tonight'}
                </p>
                {t.lines.map((line, i) => (
                  <p key={i} className="text-sm mt-1" style={{ color: C.parchment, lineHeight: 1.5 }}>
                    {line}
                  </p>
                ))}
                <Refrain v={t} />
              </div>
            ))}
          </div>
        </Fold>
      </div>
        </>
      )}
    </div>
  )
}
