/**
 * Firing a scene's cue — one implementation, on purpose.
 *
 * The cue buttons now appear in two places: under the checkpoint he is
 * standing on, and inside the older run-the-night panel. They must be the
 * same code, because one of them plays the Sea's song whole, and there is
 * exactly one confirm guarding that in the whole app.
 */

import type { SceneCue } from '../data/act1Scenes'
import type { TableChannel } from './realtime'
import { SFX } from './sfx'
import { duck } from './ambience'
import { isCarouselPlaying, playFragment, playMissingNote, playWhole, toggleCarousel } from './song'
import type { Store } from './store'
import type { Handout } from '../types'

export interface CueContext {
  store: Store
  channel: TableChannel | null
  /** Tell him what just happened, in a line that fades. */
  note: (msg: string) => void
  /** Take him somewhere — the ⚔ Table cues use this. */
  onGo?: (section: string) => void
}

export function fireCue(cue: SceneCue, ctx: CueContext): void {
  if (cue.kind === 'sfx' && cue.sfx) {
    duck(2.5)
    SFX[cue.sfx]?.play()
    return
  }

  if (cue.kind === 'song' && cue.song) {
    if (cue.song === 'carousel') {
      if (!isCarouselPlaying()) duck(60, 0.35)
      toggleCarousel()
    } else if (cue.song === 'note') {
      duck(5)
      playMissingNote()
    } else if (cue.song === 'whole') {
      // The one thing in the app that must never sound by accident.
      if (window.confirm('This plays the Sea’s song WHOLE — the note lands, once. Are you at the end?')) {
        duck(12, 0.15)
        playWhole()
        ctx.note('The song, whole. ✦')
      }
    } else {
      duck(6)
      playFragment(cue.song)
    }
    return
  }

  if (cue.kind === 'go-table') {
    ctx.onGo?.('table')
    return
  }

  if (cue.kind === 'whisper' && cue.whisper) {
    const h: Handout = {
      id: crypto.randomUUID(),
      target: cue.whisper.target,
      title: cue.whisper.title,
      body: cue.whisper.body,
      ephemeral: cue.whisper.ephemeral,
      sentAt: new Date().toISOString(),
    }
    void ctx.store.sendHandout(h)
    ctx.channel?.sendHandout(h)
    ctx.note(`Whisper sealed and sent ${cue.whisper.target ? `to ${cue.whisper.target}` : 'to everyone'} ✦`)
  }
}
