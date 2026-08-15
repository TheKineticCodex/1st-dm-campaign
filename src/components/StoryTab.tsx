// 📖 The Story — the phone as a keepsake. The Song (which pieces have come
// home), the whispers you were sent and kept, your own journal, and the
// Ledger of every bargain. Sealed-and-fading whispers don't keep — dreams
// don't — so only the lasting ones appear here.

import { useEffect, useState } from 'react'
import { SONGS } from '../data/songPieces'
import type { Store } from '../lib/store'
import type { Bargain, Handout, SavedCharacter } from '../types'
import { LedgerTab } from './LedgerTab'
import { C, Eyebrow, Fold, H, Section, TextArea, display } from './ui'

interface StoryTabProps {
  store: Store
  character: SavedCharacter | null
  onUpdate: (c: SavedCharacter) => void
  bargains: Bargain[]
  onSign: (bargainId: string, signatureDataUrl: string) => void
}

export function StoryTab({ store, character, onUpdate, bargains, onSign }: StoryTabProps) {
  const [handouts, setHandouts] = useState<Handout[]>([])
  const [open, setOpen] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    void store.listMyHandouts().then((h) => {
      if (!cancelled) setHandouts(h)
    })
    return () => {
      cancelled = true
    }
  }, [store])

  const lit = new Set(handouts.map((h) => h.song).filter((s): s is string => !!s))
  const kept = handouts
    .filter((h) => !h.ephemeral && !h.bargain && !h.song)
    .sort((a, b) => (a.sentAt < b.sentAt ? -1 : 1))
  const litCount = lit.size
  const totalPieces = SONGS.reduce((n, s) => n + s.pieces.length, 0)

  const journal = character?.notes.journal ?? ''
  const setJournal = (text: string) => {
    if (!character) return
    onUpdate({ ...character, notes: { ...character.notes, journal: text }, updatedAt: new Date().toISOString() })
  }

  return (
    <div style={{ animation: 'cardRise .4s ease-out' }}>
      <Eyebrow>📖 the story so far</Eyebrow>
      <H>What the lanterns remember</H>

      {/* ---- The Song ---- */}
      <Section style={{ border: `1px solid ${C.gold}55` }}>
        <div className="flex items-baseline justify-between">
          <Eyebrow>🎵 the song</Eyebrow>
          <span className="text-xs" style={{ color: C.faint }}>
            {litCount} of {totalPieces} pieces home
          </span>
        </div>
        <p className="text-xs mb-3" style={{ color: C.faint }}>
          Five songs. Every piece that comes home lights here — on every phone at the table.
        </p>
        {SONGS.map((song) => {
          const mine = song.pieces.map((p) => ({ ...p, on: lit.has(`${song.key}:${p.key}`) }))
          const n = mine.filter((p) => p.on).length
          return (
            <div key={song.key} className="mb-3">
              <div className="flex items-baseline justify-between">
                <strong style={{ ...display, fontSize: 17, color: n === mine.length ? C.gold : C.parchment }}>
                  {song.name}
                  <span className="text-xs ml-2" style={{ color: C.faint, fontWeight: 400 }}>
                    {song.holder}
                  </span>
                </strong>
                <span className="text-xs" style={{ color: n ? C.sea : C.faint }}>
                  {n}/{mine.length}
                </span>
              </div>
              <p className="text-xs italic" style={{ color: C.faint }}>
                {song.line}
              </p>
              <div className="flex gap-1.5 mt-1.5 flex-wrap">
                {mine.map((p) => (
                  <span
                    key={p.key}
                    title={p.label}
                    className="rounded-full text-xs px-2 py-0.5"
                    style={{
                      background: p.on ? `${C.gold}33` : 'transparent',
                      border: `1px solid ${p.on ? C.gold : C.panelEdge}`,
                      color: p.on ? C.gold : C.faint,
                      lineHeight: '20px',
                    }}
                  >
                    {p.on ? '✦ ' : '· '}
                    {p.on ? p.label : '—'}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </Section>

      {/* ---- Kept whispers ---- */}
      <Fold id="story-whispers" title={`✉ Whispers you kept (${kept.length})`} defaultOpen>
        {kept.length === 0 && (
          <p className="text-sm" style={{ color: C.faint }}>
            Nothing yet. When the lanterns have something to say to you, it will stay here — unless it was the kind that fades.
          </p>
        )}
        {kept.map((h) => {
          const isOpen = open === h.id
          return (
            <div key={h.id} className="rounded-lg mb-2 overflow-hidden" style={{ border: `1px solid ${isOpen ? C.gold : C.panelEdge}`, background: C.night }}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : h.id)}
                className="w-full text-left px-3 py-2 flex justify-between items-center gap-2"
                style={{ background: 'none', border: 'none', color: C.parchment, minHeight: 44, cursor: 'pointer' }}
              >
                <span>
                  <strong style={{ ...display, fontSize: 16 }}>{h.title || 'A whisper'}</strong>
                  <span className="text-xs ml-2" style={{ color: C.faint }}>
                    {new Date(h.sentAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                    {h.target ? ' · only you' : ''}
                    {h.level ? ` · level ${h.level}` : ''}
                  </span>
                </span>
                <span style={{ color: C.gold }}>{isOpen ? '−' : '+'}</span>
              </button>
              {isOpen && (
                <div className="px-3 pb-3">
                  {h.imageDataUrl && <img src={h.imageDataUrl} alt="" className="rounded-md mb-2" style={{ maxWidth: '100%' }} />}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{h.body}</p>
                </div>
              )}
            </div>
          )
        })}
      </Fold>

      {/* ---- Journal ---- */}
      <Fold id="story-journal" title="✎ Your journal" defaultOpen>
        <p className="text-xs mb-2" style={{ color: C.faint }}>
          The story so far, in your words. What happened, who you met, what you owe, what you’re afraid of. Saved to the campaign; only you and the Lantern-Keeper can read it.
        </p>
        <TextArea rows={8} value={journal} onChange={setJournal} placeholder="Session one: the tide went out and forgot to come back…" />
      </Fold>

      {/* ---- Ledger ---- */}
      <Fold id="story-ledger" title={`⚖ The Ledger (${bargains.length})`}>
        <LedgerTab bargains={bargains} onSign={onSign} />
      </Fold>
    </div>
  )
}
