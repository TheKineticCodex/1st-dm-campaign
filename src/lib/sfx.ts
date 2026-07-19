// The soundboard — every effect synthesized live with WebAudio, so nothing
// is downloaded, nothing is copyrighted, and it works offline. Played on
// the DM's MacBook speakers at the table.

let ctx: AudioContext | null = null
const ac = () => (ctx ??= new AudioContext())

function env(g: GainNode, t: number, peak: number, dur: number) {
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + 0.02)
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
}

function tone(freq: number, dur: number, type: OscillatorType, peak = 0.2, when = 0, bend = 0) {
  const a = ac()
  const t = a.currentTime + when
  const o = a.createOscillator()
  const g = a.createGain()
  o.type = type
  o.frequency.setValueAtTime(freq, t)
  if (bend) o.frequency.exponentialRampToValueAtTime(Math.max(20, freq + bend), t + dur)
  env(g, t, peak, dur)
  o.connect(g).connect(a.destination)
  o.start(t)
  o.stop(t + dur + 0.1)
}

function noise(dur: number, peak: number, when = 0, lowpass = 800) {
  const a = ac()
  const t = a.currentTime + when
  const len = Math.ceil(a.sampleRate * dur)
  const buf = a.createBuffer(1, len, a.sampleRate)
  const d = buf.getChannelData(0)
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len)
  const src = a.createBufferSource()
  src.buffer = buf
  const f = a.createBiquadFilter()
  f.type = 'lowpass'
  f.frequency.value = lowpass
  const g = a.createGain()
  env(g, t, peak, dur)
  src.connect(f).connect(g).connect(a.destination)
  src.start(t)
}

export const SFX: Record<string, { label: string; play: () => void }> = {
  bell: {
    label: '🔔 The Toll Bell',
    play: () => {
      tone(660, 1.6, 'sine', 0.25)
      tone(1320, 1.2, 'sine', 0.08)
      tone(660 * 2.76, 0.5, 'sine', 0.04)
    },
  },
  sparkle: {
    label: '✨ Fey Sparkle',
    play: () => {
      ;[1200, 1600, 2100, 2700, 3300].forEach((f, i) => tone(f, 0.35, 'sine', 0.08, i * 0.07))
    },
  },
  ocean: {
    label: '🌊 The Sea Breathes',
    play: () => {
      noise(2.8, 0.16, 0, 500)
      noise(2.2, 0.1, 1.4, 400)
    },
  },
  thunder: {
    label: '⛈ Distant Thunder',
    play: () => {
      noise(2.4, 0.3, 0, 120)
      tone(50, 2.0, 'sine', 0.2, 0.1, -20)
    },
  },
  heartbeat: {
    label: '💓 Heartbeat',
    play: () => {
      ;[0, 0.35, 1.0, 1.35, 2.0, 2.35].forEach((w) => tone(55, 0.18, 'sine', 0.35, w, -15))
    },
  },
  trombone: {
    label: '🎺 Sad Trombone',
    play: () => {
      ;[233, 220, 208, 196].forEach((f, i) => tone(f, i === 3 ? 0.9 : 0.28, 'sawtooth', 0.12, i * 0.32, i === 3 ? -30 : 0))
    },
  },
  ominous: {
    label: '🕳 Something Notices',
    play: () => {
      tone(65, 3.0, 'sine', 0.15, 0, -10)
      tone(66.5, 3.0, 'sine', 0.15, 0, -12)
      tone(98, 2.4, 'triangle', 0.05, 0.4)
    },
  },
  carnival: {
    label: '🎪 Carnival Chime',
    play: () => {
      const notes = [523, 659, 784, 659, 523, 784, 1047]
      notes.forEach((f, i) => tone(f, 0.22, 'triangle', 0.12, i * 0.16))
    },
  },
  gavel: {
    label: '🔨 The Gavel',
    play: () => {
      noise(0.12, 0.4, 0, 2000)
      noise(0.1, 0.3, 0.22, 2000)
      noise(0.25, 0.45, 0.44, 1500)
    },
  },
  splash: {
    label: '💧 Something Surfaces',
    play: () => {
      noise(0.5, 0.3, 0, 1800)
      ;[900, 700, 500].forEach((f, i) => tone(f, 0.15, 'sine', 0.06, 0.1 + i * 0.08, -100))
    },
  },
}
