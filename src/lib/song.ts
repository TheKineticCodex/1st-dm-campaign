// The Sea's song — the campaign's one melody, synthesized live (original,
// nothing to license, works offline). Chosen by the Lantern-Keeper on
// 2026-08-15: "The Carousel" — G with a flattened seventh, a 6/8 lilt.
//
// Three forms, one tune:
//   carousel  — the loop. The tune with its highest note MISSING (bar six):
//               the reach toward the Moon. Thin, music box only, never
//               resolves — it loops back round before it can land. This is
//               what the players hear under the Missing Note scene, and it
//               is what every fragment in the campaign is a piece of.
//   note      — the missing note, alone. Once. For "someone hums it".
//   whole     — the climb only (~7s): bars 5–8 with the note IN PLACE, a low
//               bowed voice and a second music box joining from the first
//               beat, the tide-drum arriving with the peak, then a chord the
//               loop never reaches. Gated to the Moon-Night by the caller.
//   fragments — pieces other things hum: the seal-pup's three notes, a jar
//               reaching for the hole, Pookie's low hum.
//
// Voice design lives with the data so the whole song is one file.

// ------------------------------------------------------------------ core

let AC: AudioContext | null = null
let master: GainNode, dry: GainNode, conv: ConvolverNode
const active = new Set<AudioScheduledSourceNode>()

function ctx(): AudioContext {
  if (AC) return AC
  AC = new AudioContext()
  master = AC.createGain()
  master.gain.value = 0.85
  master.connect(AC.destination)
  dry = AC.createGain()
  dry.gain.value = 0.7
  dry.connect(master)
  conv = AC.createConvolver()
  conv.buffer = impulse(AC, 3.2, 2.6)
  const wet = AC.createGain()
  wet.gain.value = 0.55
  conv.connect(wet)
  wet.connect(master)
  return AC
}

/** A generated room: decaying stereo noise as an impulse response. */
function impulse(a: AudioContext, seconds: number, decay: number): AudioBuffer {
  const rate = a.sampleRate
  const len = Math.floor(rate * seconds)
  const buf = a.createBuffer(2, len, rate)
  for (let ch = 0; ch < 2; ch++) {
    const d = buf.getChannelData(ch)
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay)
  }
  return buf
}

const midiHz = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
const cents = (c: number) => Math.pow(2, c / 1200)

function track(o: AudioScheduledSourceNode) {
  active.add(o)
  o.onended = () => active.delete(o)
}

/** A music-box tine: bright attack, quick metallic partials, long soft fundamental. */
function tine(midi: number, t: number, dur: number, vel: number, age = 4) {
  const a = ctx()
  const f = midiHz(midi) * cents((Math.random() * 2 - 1) * age)
  const v = vel * (0.92 + Math.random() * 0.16)
  const parts: [number, OscillatorType, number, number][] = [
    [1, 'sine', 1.0, dur],
    [2.0, 'triangle', 0.22, dur * 0.45],
    [4.06, 'sine', 0.1, 0.28],
    [6.7, 'sine', 0.04, 0.12],
  ]
  for (const [ratio, type, gain, dec] of parts) {
    const o = a.createOscillator()
    const g = a.createGain()
    o.type = type
    o.frequency.setValueAtTime(f * ratio, t)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(Math.max(0.0002, v * gain), t + 0.006)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dec)
    o.connect(g)
    g.connect(dry)
    g.connect(conv)
    o.start(t)
    o.stop(t + dec + 0.05)
    track(o)
  }
}

/** Soft low support: a sine that swells and fades. */
function pad(midi: number, t: number, dur: number, vel: number) {
  const a = ctx()
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(midiHz(midi), t)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vel, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
  o.connect(g)
  g.connect(dry)
  g.connect(conv)
  o.start(t)
  o.stop(t + dur + 0.05)
  track(o)
}

/** A bowed low voice — two detuned saws through a warm lowpass, slow attack. */
function bow(midi: number, t: number, dur: number, vel: number) {
  const a = ctx()
  const f = midiHz(midi)
  const lp = a.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.7
  lp.frequency.setValueAtTime(420, t)
  lp.frequency.linearRampToValueAtTime(900, t + 0.35)
  lp.frequency.setValueAtTime(900, t + dur * 0.7)
  lp.frequency.linearRampToValueAtTime(400, t + dur)
  const g = a.createGain()
  g.gain.setValueAtTime(0.0001, t)
  g.gain.linearRampToValueAtTime(vel, t + 0.28)
  g.gain.setValueAtTime(vel, t + Math.max(0.3, dur * 0.8))
  g.gain.linearRampToValueAtTime(0.0001, t + dur + 0.15)
  lp.connect(g)
  g.connect(dry)
  g.connect(conv)
  for (const c of [-6, 6]) {
    const o = a.createOscillator()
    o.type = 'sawtooth'
    o.frequency.setValueAtTime(f * cents(c), t)
    o.connect(lp)
    o.start(t)
    o.stop(t + dur + 0.2)
    track(o)
  }
}

/** The tide: a soft low thump. */
function thump(t: number, vel = 0.32) {
  const a = ctx()
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = 'sine'
  o.frequency.setValueAtTime(64, t)
  o.frequency.exponentialRampToValueAtTime(38, t + 0.14)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(vel, t + 0.008)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.32)
  o.connect(g)
  g.connect(dry)
  g.connect(conv)
  o.start(t)
  o.stop(t + 0.4)
  track(o)
}

/** A brushed hush. */
function brush(t: number, vel = 0.05) {
  const a = ctx()
  const len = Math.floor(a.sampleRate * 0.09)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  src.buffer = buf
  const hp = a.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 2400
  const g = a.createGain()
  g.gain.setValueAtTime(vel, t)
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
  src.connect(hp)
  hp.connect(g)
  g.connect(dry)
  g.connect(conv)
  src.start(t)
  track(src)
}

// ------------------------------------------------------------------ the tune

interface Note {
  n: number
  l: number
  peak?: boolean
}

/** G mixolydian: G A B C D E F. */
const SCALE = [7, 9, 11, 0, 2, 4, 5]
/** Seconds per eighth note. Dotted-quarter ≈ 84. */
const EIGHTH = 60 / 84 / 3
const PER_BAR = 6

const BARS: Note[][] = [
  [{ n: 67, l: 2 }, { n: 69, l: 1 }, { n: 71, l: 2 }, { n: 69, l: 1 }],
  [{ n: 67, l: 3 }, { n: 64, l: 3 }],
  [{ n: 67, l: 2 }, { n: 69, l: 1 }, { n: 71, l: 2 }, { n: 72, l: 1 }],
  [{ n: 74, l: 6 }],
  [{ n: 71, l: 2 }, { n: 72, l: 1 }, { n: 74, l: 3 }],
  [{ n: 76, l: 3, peak: true }, { n: 74, l: 3 }],
  [{ n: 71, l: 2 }, { n: 69, l: 1 }, { n: 67, l: 3 }],
]
const LAST_BROKEN: Note[] = [{ n: 69, l: 6 }]
const LAST_WHOLE: Note[] = [{ n: 67, l: 6 }]

const CHORDS = [
  [43, 50, 55],
  [40, 47, 55],
  [43, 50, 55],
  [38, 45, 54],
  [43, 50, 55],
  [36, 43, 52],
  [43, 50, 55],
]
const CHORD_BROKEN = [41, 48, 53]
const CHORD_WHOLE = [43, 50, 55]

/** The low bowed counter-line, one entry per bar. */
const COUNTER: Note[][] = [
  [{ n: 55, l: 3 }, { n: 59, l: 3 }],
  [{ n: 52, l: 3 }, { n: 55, l: 3 }],
  [{ n: 55, l: 3 }, { n: 57, l: 3 }],
  [{ n: 50, l: 6 }],
  [{ n: 55, l: 3 }, { n: 52, l: 3 }],
  [{ n: 48, l: 3 }, { n: 52, l: 3 }],
  [{ n: 55, l: 3 }, { n: 50, l: 3 }],
]
const COUNTER_LAST: Note[] = [{ n: 50, l: 3 }, { n: 55, l: 3 }]
const CODA = { root: 31, chord: [43, 50, 55, 59, 67] }

/** The missing note. E5. */
export const MISSING_NOTE = 76
export const MISSING_NOTE_NAME = 'the high E'

function thirdBelow(midi: number): number {
  let m = midi - 1
  let steps = 0
  while (steps < 2 && m > 0) {
    if (SCALE.includes(((m % 12) + 12) % 12)) steps++
    if (steps < 2) m--
  }
  return m
}

interface Layers {
  fromBar?: number
  joined?: boolean
}

/** Schedules one pass of the tune. Returns its length in seconds. */
function schedulePass(mode: 'broken' | 'whole', t0: number, layers: Layers = {}): number {
  const beat = EIGHTH
  const barLen = beat * PER_BAR
  const bars = BARS.concat([mode === 'whole' ? LAST_WHOLE : LAST_BROKEN])
  const chords = CHORDS.concat([mode === 'whole' ? CHORD_WHOLE : CHORD_BROKEN])
  const counters = COUNTER.concat([COUNTER_LAST])
  const from = layers.fromBar ?? 0
  let t = t0
  bars.forEach((bar, bi) => {
    if (bi < from) return
    const k = bi - from
    const ch = chords[bi]
    const joined = !!layers.joined
    const tide = joined && k >= 1
    pad(ch[0], t, beat * 2.6, joined ? 0.13 : 0.1)
    pad(ch[1], t + beat * 3, beat * 2.4, 0.045)
    pad(ch[2], t + beat * 3, beat * 2.4, 0.045)
    pad(ch[2], t + beat * 2, beat * 0.6, 0.02)
    pad(ch[1], t + beat * 5, beat * 0.6, 0.02)
    if (tide) {
      thump(t, 0.3)
      thump(t + beat * 3, 0.16)
      brush(t + beat * 2, 0.04)
      brush(t + beat * 5, 0.04)
    }
    if (joined) {
      let ct = t
      for (const cn of counters[bi]) {
        bow(cn.n, ct, cn.l * beat * 0.98, 0.075)
        ct += cn.l * beat
      }
    }
    let bt = t
    for (const note of bar) {
      const len = note.l * beat
      const play = !(note.peak && mode === 'broken')
      if (play) {
        const ring = Math.max(1.1, len * 1.3)
        const vel = note.peak ? 0.42 : bt === t ? 0.34 : 0.28
        tine(note.n, bt, ring, vel)
        if (joined) tine(thirdBelow(note.n), bt + 0.012, ring * 0.9, vel * 0.55)
        if (joined && note.peak) tine(note.n + 12, bt + 0.03, ring * 1.2, 0.16, 1)
      }
      bt += len
    }
    t += barLen
  })
  return t - t0
}

/** Home: a held chord the loop never reaches. */
function scheduleCoda(t: number): number {
  const codaBeat = EIGHTH * 1.2
  const top = CODA.chord[CODA.chord.length - 1]
  thump(t, 0.34)
  pad(CODA.root, t, codaBeat * 3, 0.16)
  bow(CODA.root + 12, t, codaBeat * 2.8, 0.08)
  bow(CODA.chord[1], t + 0.05, codaBeat * 2.8, 0.06)
  bow(CODA.chord[2] - 12, t + 0.1, codaBeat * 2.8, 0.05)
  CODA.chord.forEach((n, i) => tine(n, t + i * 0.07, codaBeat * 2.6, 0.26))
  tine(top, t + codaBeat * 0.7, codaBeat * 2.3, 0.22)
  tine(top + 12, t + codaBeat * 0.75, codaBeat * 2.3, 0.12, 1)
  return codaBeat * 3
}

// ------------------------------------------------------------------ public

type Listener = () => void
const listeners = new Set<Listener>()
let looping = false
let loopTimer: ReturnType<typeof setTimeout> | null = null
let stopAt = 0

function emit() {
  for (const l of listeners) l()
}

/** Subscribe to play-state changes (for the toggle button). Returns unsubscribe. */
export function subscribeSong(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function isCarouselPlaying(): boolean {
  return looping
}

/** Silence everything the song has scheduled. */
export function stopSong(): void {
  for (const o of active) {
    try {
      o.stop()
    } catch {
      /* already stopped */
    }
  }
  active.clear()
  if (loopTimer) clearTimeout(loopTimer)
  loopTimer = null
  looping = false
  emit()
}

function loopOnce() {
  const a = ctx()
  const len = schedulePass('broken', a.currentTime + 0.05)
  loopTimer = setTimeout(() => {
    if (looping) loopOnce()
  }, (len - 0.15) * 1000)
}

/** The carousel: the broken tune, looping. Toggle. */
export function toggleCarousel(): void {
  if (looping) {
    stopSong()
    return
  }
  stopSong()
  looping = true
  emit()
  void ctx()
    .resume()
    .then(() => loopOnce())
}

/** The missing note, alone. Once. */
export function playMissingNote(): void {
  stopSong()
  void ctx()
    .resume()
    .then(() => {
      tine(MISSING_NOTE, ctx().currentTime + 0.05, 4.5, 0.4, 1)
    })
}

/**
 * The song, whole — the climb only. ~7 seconds. The caller gates this to
 * the Moon-Night; nothing here checks. Returns its length in seconds.
 */
export function playWhole(): number {
  stopSong()
  const a = ctx()
  let len = 0
  void a.resume().then(() => {
    const t = a.currentTime + 0.05
    const l1 = schedulePass('whole', t, { fromBar: 4, joined: true })
    const l2 = scheduleCoda(t + l1)
    stopAt = t + l1 + l2
    len = l1 + l2
  })
  return len || 7
}

/** Pieces of the song that other things hum. */
export type Fragment = 'seal-pup' | 'jar' | 'pookie'

export function playFragment(which: Fragment): void {
  stopSong()
  void ctx()
    .resume()
    .then(() => {
      const t = ctx().currentTime + 0.05
      const b = EIGHTH * 1.25 // fragments are a little slower — hummed, not played
      if (which === 'seal-pup') {
        // the first three notes of the tune, thin and uncertain — with the hole after
        tine(67, t, 1.4, 0.26, 8)
        tine(69, t + b * 2, 1.4, 0.24, 8)
        tine(71, t + b * 3, 1.8, 0.28, 8)
      } else if (which === 'jar') {
        // a jar reaching for the hole: bar five, then silence where the note should be, then the fall
        tine(71, t, 1.2, 0.22, 6)
        tine(72, t + b * 2, 1.2, 0.22, 6)
        tine(74, t + b * 3, 1.6, 0.26, 6)
        // (silence: b*6 .. b*9)
        tine(74, t + b * 9, 1.4, 0.2, 6)
        tine(71, t + b * 11, 1.6, 0.18, 6)
      } else if (which === 'pookie') {
        // the missing note, two octaves down, barely there — an alligator's hum
        pad(MISSING_NOTE - 24, t, 3.2, 0.12)
        pad(MISSING_NOTE - 12, t + 0.02, 3.0, 0.05)
      }
    })
}

/**
 * Wake the phone's voice inside a tap (iOS): create + resume the context and
 * play a moment of silence so the finale can start later without a gesture.
 */
export function armSong(): Promise<boolean> {
  const a = ctx()
  return a
    .resume()
    .then(() => {
      const buf = a.createBuffer(1, 1, a.sampleRate)
      const src = a.createBufferSource()
      src.buffer = buf
      src.connect(a.destination)
      src.start()
      return a.state === 'running'
    })
    .catch(() => false)
}

/** True while the whole song is still sounding (for UI). */
export function isWholeSounding(): boolean {
  return !!AC && AC.currentTime < stopAt
}
