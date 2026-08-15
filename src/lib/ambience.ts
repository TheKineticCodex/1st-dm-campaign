// 🌊 Ambience — the room under the story. Generative beds (nothing recorded,
// nothing licensed, works offline) that play from the DM's MacBook or the
// iPad, crossfade when the scene changes, and duck under stingers and the
// song. Tone.js is loaded lazily on the first tap, so phones and the first
// paint never pay for it.
//
//   setScene('carnival')   crossfade to a bed (4 s)
//   setScene('silence')    fade everything out
//   duck(seconds)          drop the bed under a stinger, then swell back
//   setVolume(0..1)        remembered on this device
//
// Beds are small "instruments" built from Tone primitives: each is
// { start(), stop() } wired into its own Gain so the engine can crossfade.

import { readCache, writeCache } from './storage'

export type SceneId = 'harbour' | 'carnival' | 'tent' | 'bog' | 'moon-night' | 'silence'

export const SCENES: { id: SceneId; label: string; hint: string }[] = [
  { id: 'harbour', label: '⚓ Saltmere harbour', hint: 'tide, gulls far off, a bell buoy' },
  { id: 'carnival', label: '🎪 The Getting Fair', hint: 'a calliope drifting, crowd-hush, lanterns' },
  { id: 'tent', label: '🕯 Inside a tent', hint: 'close, warm, canvas breathing, one lamp' },
  { id: 'bog', label: '🌫 The Whispering Causeway', hint: 'reeds, drips, something under the water' },
  { id: 'moon-night', label: '🌕 The Moon-Night', hint: 'shimmer, high and thin — the sea listening' },
  { id: 'silence', label: '■ silence', hint: '' },
]

type ToneModule = typeof import('tone')

interface Bed {
  start(): void
  stop(): void
  gain: import('tone').Gain
}

let T: ToneModule | null = null
let master: import('tone').Gain | null = null
let duckGain: import('tone').Gain | null = null
let verb: import('tone').Reverb | null = null
const beds = new Map<SceneId, Bed>()
let current: SceneId = 'silence'
let volume = readCache<number>('ambience-volume') ?? 0.7
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

export function subscribeAmbience(l: () => void): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
export function currentScene(): SceneId {
  return current
}
export function ambienceVolume(): number {
  return volume
}
export function isAmbienceLoaded(): boolean {
  return !!T
}

async function engine(): Promise<ToneModule> {
  if (T) return T
  const mod = await import('tone')
  await mod.start()
  T = mod
  const limiter = new mod.Limiter(-3).toDestination()
  master = new mod.Gain(volume).connect(limiter)
  duckGain = new mod.Gain(1).connect(master)
  verb = new mod.Reverb({ decay: 5, wet: 0.35 }).connect(duckGain)
  await verb.generate()
  return mod
}

const midi = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
// G mixolydian — the Sea's song's scale. Never E5 (76), the missing note.
const SCALE = [55, 57, 59, 60, 62, 65, 67, 69, 71, 72, 74]

// ------------------------------------------------------------ bed builders

function harbour(t: ToneModule): Bed {
  const gain = new t.Gain(0).connect(duckGain!)
  const wet = new t.Gain(0.5).connect(verb!)
  gain.connect(wet)
  // the tide: brown noise through a slow-swept low-pass
  const tide = new t.Noise('brown')
  const tideFilter = new t.Filter(320, 'lowpass')
  const swell = new t.LFO({ frequency: 0.07, min: 180, max: 620 }).start()
  swell.connect(tideFilter.frequency)
  const tideGain = new t.Gain(0.55)
  tide.chain(tideFilter, tideGain, gain)
  // the deep: a low drone breathing
  const drone = new t.Oscillator(midi(31), 'sine')
  const droneGain = new t.Gain(0.12)
  const breathe = new t.LFO({ frequency: 0.05, min: 0.04, max: 0.16 }).start()
  breathe.connect(droneGain.gain)
  drone.chain(droneGain, gain)
  // a bell buoy, now and then
  const bell = new t.MetalSynth({ envelope: { attack: 0.001, decay: 2.8, release: 1.6 }, harmonicity: 3.1, modulationIndex: 16, resonance: 900, octaves: 0.8 })
  const bellGain = new t.Gain(0.05).connect(gain)
  bell.connect(bellGain)
  const buoy = new t.Loop((time) => {
    if (Math.random() < 0.55) bell.triggerAttackRelease(midi(74), '2n', time, 0.4 + Math.random() * 0.4)
  }, 5.5)
  return {
    gain,
    start() {
      tide.start()
      drone.start()
      buoy.start(0)
    },
    stop() {
      tide.stop()
      drone.stop()
      buoy.stop()
    },
  }
}

function carnival(t: ToneModule): Bed {
  const gain = new t.Gain(0).connect(duckGain!)
  const wet = new t.Gain(0.7).connect(verb!)
  gain.connect(wet)
  // a calliope somewhere across the fairground — reedy, slightly out of tune, far away
  const pipes = new t.PolySynth(t.Synth, { oscillator: { type: 'square' }, envelope: { attack: 0.02, decay: 0.15, sustain: 0.5, release: 0.4 }, volume: -22 })
  const pipeFilter = new t.Filter(1400, 'lowpass')
  const pipesGain = new t.Gain(0.35)
  pipes.chain(pipeFilter, pipesGain, gain)
  // 6/8 lilt: a waltzing tune that wanders the mixolydian scale and never lands on E
  let step = 0
  let root = 67
  const tune = new t.Loop((time) => {
    const beat = step % 6
    if (beat === 0 && Math.random() < 0.3) root = SCALE[Math.floor(Math.random() * SCALE.length)]
    const n = beat === 0 ? root : SCALE[Math.max(0, Math.min(SCALE.length - 1, SCALE.indexOf(root) + Math.round((Math.random() - 0.5) * 4)))]
    if (beat === 0 || Math.random() < 0.7) pipes.triggerAttackRelease(midi(n) * Math.pow(2, (Math.random() * 10 - 5) / 1200), '8n', time, beat === 0 ? 0.6 : 0.35)
    step++
  }, 0.24)
  // crowd-hush: pink noise, band-passed and slowly moving
  const crowd = new t.Noise('pink')
  const crowdFilter = new t.Filter(900, 'bandpass')
  const crowdLfo = new t.LFO({ frequency: 0.11, min: 500, max: 1500 }).start()
  crowdLfo.connect(crowdFilter.frequency)
  const crowdGain = new t.Gain(0.09)
  crowd.chain(crowdFilter, crowdGain, gain)
  // lantern chimes, sparse
  const chime = new t.MetalSynth({ envelope: { attack: 0.001, decay: 1.4, release: 0.6 }, harmonicity: 5.1, modulationIndex: 20, resonance: 4000, octaves: 1.2 })
  const chimeGain = new t.Gain(0.02).connect(gain)
  chime.connect(chimeGain)
  const chimes = new t.Loop((time) => {
    if (Math.random() < 0.4) chime.triggerAttackRelease(midi(SCALE[Math.floor(Math.random() * SCALE.length)] + 12), '16n', time, 0.3)
  }, 1.7)
  return {
    gain,
    start() {
      crowd.start()
      tune.start(0)
      chimes.start(0.4)
    },
    stop() {
      crowd.stop()
      tune.stop()
      chimes.stop()
    },
  }
}

function tent(t: ToneModule): Bed {
  const gain = new t.Gain(0).connect(duckGain!)
  const wet = new t.Gain(0.25).connect(verb!)
  gain.connect(wet)
  // close air: very quiet brown noise, low
  const air = new t.Noise('brown')
  const airFilter = new t.Filter(200, 'lowpass')
  const airGain = new t.Gain(0.18)
  air.chain(airFilter, airGain, gain)
  // canvas breathing: slow LFO on a soft filtered noise
  const canvas = new t.Noise('pink')
  const canvasFilter = new t.Filter(600, 'bandpass', -24)
  const canvasGain = new t.Gain(0.02)
  const breath = new t.LFO({ frequency: 0.13, min: 0.005, max: 0.05 }).start()
  breath.connect(canvasGain.gain)
  canvas.chain(canvasFilter, canvasGain, gain)
  // one lamp hum + a warm low drone
  const hum = new t.Oscillator(midi(43), 'triangle')
  const humGain = new t.Gain(0.05)
  hum.chain(humGain, gain)
  // creaks now and then
  const creak = new t.PluckSynth({ attackNoise: 2, dampening: 1200, resonance: 0.9 })
  const creakGain = new t.Gain(0.09).connect(gain)
  creak.connect(creakGain)
  const creaks = new t.Loop((time) => {
    if (Math.random() < 0.35) creak.triggerAttack(midi(38 + Math.floor(Math.random() * 7)), time)
  }, 4.2)
  return {
    gain,
    start() {
      air.start()
      canvas.start()
      hum.start()
      creaks.start(1)
    },
    stop() {
      air.stop()
      canvas.stop()
      hum.stop()
      creaks.stop()
    },
  }
}

function bog(t: ToneModule): Bed {
  const gain = new t.Gain(0).connect(duckGain!)
  const wet = new t.Gain(0.6).connect(verb!)
  gain.connect(wet)
  // reeds: high pink noise, thin
  const reeds = new t.Noise('pink')
  const reedFilter = new t.Filter(2400, 'highpass')
  const reedGain = new t.Gain(0.02)
  const wind = new t.LFO({ frequency: 0.09, min: 0.005, max: 0.035 }).start()
  wind.connect(reedGain.gain)
  reeds.chain(reedFilter, reedGain, gain)
  // drips
  const drip = new t.MembraneSynth({ pitchDecay: 0.08, octaves: 6, envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 } })
  const dripGain = new t.Gain(0.12).connect(gain)
  drip.connect(dripGain)
  const drips = new t.Loop((time) => {
    if (Math.random() < 0.6) drip.triggerAttackRelease(midi(84 + Math.floor(Math.random() * 12)), '32n', time, 0.3 + Math.random() * 0.4)
  }, 0.9)
  // something under the water: a very low, slow, detuned pair
  const under1 = new t.Oscillator(midi(29), 'sine')
  const under2 = new t.Oscillator(midi(29) * 1.004, 'sine')
  const underGain = new t.Gain(0.08)
  const surface = new t.LFO({ frequency: 0.03, min: 0.02, max: 0.11 }).start()
  surface.connect(underGain.gain)
  under1.connect(underGain)
  under2.connect(underGain)
  underGain.connect(gain)
  return {
    gain,
    start() {
      reeds.start()
      under1.start()
      under2.start()
      drips.start(0)
    },
    stop() {
      reeds.stop()
      under1.stop()
      under2.stop()
      drips.stop()
    },
  }
}

function moonNight(t: ToneModule): Bed {
  const gain = new t.Gain(0).connect(duckGain!)
  const wet = new t.Gain(0.9).connect(verb!)
  gain.connect(wet)
  // shimmer: a high, thin pad wandering the scale — the sea listening
  const pad = new t.PolySynth(t.AMSynth, { harmonicity: 2, envelope: { attack: 2.5, decay: 1, sustain: 0.8, release: 4 }, volume: -26 })
  const padGain = new t.Gain(0.5)
  pad.chain(padGain, gain)
  const chords = [
    [67, 74, 79],
    [65, 72, 79],
    [62, 69, 74],
    [60, 67, 72],
  ]
  let ci = 0
  const drift = new t.Loop((time) => {
    const ch = chords[ci % chords.length]
    ci++
    ch.forEach((n, i) => pad.triggerAttackRelease(midi(n + 12), 7, time + i * 0.4, 0.5))
  }, 8)
  // the tide, far below and slow
  const tide = new t.Noise('brown')
  const tideFilter = new t.Filter(220, 'lowpass')
  const tideGain = new t.Gain(0.02)
  const slow = new t.LFO({ frequency: 0.04, min: 0.005, max: 0.05 }).start()
  slow.connect(tideGain.gain)
  tide.chain(tideFilter, tideGain, gain)
  return {
    gain,
    start() {
      tide.start()
      drift.start(0)
    },
    stop() {
      tide.stop()
      drift.stop()
    },
  }
}

const BUILDERS: Record<Exclude<SceneId, 'silence'>, (t: ToneModule) => Bed> = {
  harbour,
  carnival,
  tent,
  bog,
  'moon-night': moonNight,
}

// ------------------------------------------------------------ control

const XFADE = 4

/** Crossfade to a scene. Loads Tone.js on the first call (must follow a tap). */
export async function setScene(id: SceneId): Promise<void> {
  const t = await engine()
  if (t.getTransport().state !== 'started') t.getTransport().start()
  const prev = current
  current = id
  emit()
  if (prev !== 'silence' && prev !== id) {
    const b = beds.get(prev)
    if (b) {
      b.gain.gain.rampTo(0, XFADE)
      setTimeout(() => {
        if (current !== prev) b.stop()
      }, (XFADE + 0.5) * 1000)
    }
  }
  if (id === 'silence') return
  let bed = beds.get(id)
  if (!bed) {
    bed = BUILDERS[id](t)
    beds.set(id, bed)
  }
  bed.start()
  bed.gain.gain.rampTo(1, XFADE)
}

/** Duck the bed under a stinger, then come back. */
export function duck(seconds = 2.5, depth = 0.25): void {
  if (!duckGain || current === 'silence') return
  duckGain.gain.cancelScheduledValues(0)
  duckGain.gain.rampTo(depth, 0.15)
  setTimeout(() => duckGain?.gain.rampTo(1, 1.8), seconds * 1000)
}

export function setVolume(v: number): void {
  volume = Math.max(0, Math.min(1, v))
  writeCache('ambience-volume', volume)
  master?.gain.rampTo(volume, 0.2)
  emit()
}

export function stopAmbience(): void {
  void setScene('silence')
}
