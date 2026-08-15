// The host: runs in the DM's Book. Owns the state, applies inputs, ticks the
// clock, and broadcasts. Pure functions where possible so they're testable;
// the tiny bit of timing lives in `createHost`.

import {
  DRAW_WORDS,
  NOTE_POOL,
  guessMatches,
  shuffle,
  type BargainInput,
  type BargainState,
  type DmAction,
  type DrawInput,
  type DrawState,
  type GameEvent,
  type GameInput,
  type GameState,
  type NoteInput,
  type NoteState,
  type TollInput,
  type TollState,
} from './games'

// ------------------------------------------------------------ constructors

export function newDraw(players: string[], opts?: { rounds?: number; seconds?: number; words?: string[] }): DrawState {
  const rounds = Math.min(opts?.rounds ?? Math.min(5, Math.max(1, players.length)), 12)
  const words = shuffle(opts?.words?.length ? opts.words : DRAW_WORDS)
  return {
    kind: 'draw',
    gameId: crypto.randomUUID(),
    phase: 'intro',
    players,
    round: 0,
    totalRounds: rounds,
    artist: players[0] ?? '',
    word: words[0] ?? 'the carousel',
    strokes: [],
    guesses: [],
    solvedBy: null,
    score: 0,
    timeLeft: opts?.seconds ?? 45,
    roundSeconds: opts?.seconds ?? 45,
    // stash the deck in a non-enumerable way? Keep it simple: recompute per round from DRAW_WORDS order.
  }
}

export function newNote(players: string[], opts?: { seconds?: number }): NoteState {
  const notes: Record<string, number> = {}
  players.forEach((p, i) => (notes[p] = NOTE_POOL[i % NOTE_POOL.length]))
  const held: Record<string, boolean> = {}
  players.forEach((p) => (held[p] = false))
  return {
    kind: 'note',
    gameId: crypto.randomUUID(),
    phase: 'intro',
    players,
    notes,
    held,
    chord: 0,
    timeLeft: opts?.seconds ?? 25,
    totalSeconds: opts?.seconds ?? 25,
    heldTogether: 0,
    distract: null,
    won: null,
  }
}

export function newToll(players: string[], question: string): TollState {
  return { kind: 'toll', gameId: crypto.randomUUID(), phase: 'answer', players, question, answers: [], order: [], revealed: 0 }
}

export function newBargain(players: string[], offer: string): BargainState {
  return { kind: 'bargain', gameId: crypto.randomUUID(), phase: 'bid', players, offer, bids: [], opened: [], accepted: null }
}

// ------------------------------------------------------------ reducers

const wordDeck = (s: DrawState) => {
  // Deterministic per game: rotate DRAW_WORDS by a hash of the gameId so rounds don't repeat.
  const seed = [...s.gameId].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7)
  const start = seed % DRAW_WORDS.length
  return [...DRAW_WORDS.slice(start), ...DRAW_WORDS.slice(0, start)]
}

export function reduceDraw(s: DrawState, from: string, input: DrawInput): DrawState {
  if (s.phase !== 'drawing') return s
  switch (input.type) {
    case 'stroke':
      if (from !== s.artist) return s
      return { ...s, strokes: [...s.strokes, input.stroke] }
    case 'stroke-append': {
      if (from !== s.artist || s.strokes.length === 0) return s
      const strokes = s.strokes.slice()
      const last = strokes[strokes.length - 1]
      strokes[strokes.length - 1] = { ...last, p: [...last.p, ...input.p] }
      return { ...s, strokes }
    }
    case 'clear':
      if (from !== s.artist) return s
      return { ...s, strokes: [] }
    case 'guess': {
      if (from === s.artist || s.solvedBy) return s
      const right = guessMatches(input.text, s.word)
      const guesses = [...s.guesses, { by: from, text: input.text, right }].slice(-12)
      if (right) return { ...s, guesses, solvedBy: from, score: s.score + 1, phase: 'reveal', timeLeft: 3 }
      return { ...s, guesses }
    }
  }
}

/** One second passed. */
export function tickDraw(s: DrawState): DrawState {
  if (s.phase === 'intro') return { ...s, phase: 'drawing', round: 1, word: wordDeck(s)[0], timeLeft: s.roundSeconds }
  if (s.phase === 'drawing') {
    if (s.timeLeft > 1) return { ...s, timeLeft: s.timeLeft - 1 }
    return { ...s, phase: 'reveal', timeLeft: 3 } // time's up: show the word
  }
  if (s.phase === 'reveal') {
    if (s.timeLeft > 1) return { ...s, timeLeft: s.timeLeft - 1 }
    if (s.round >= s.totalRounds) return { ...s, phase: 'end', timeLeft: 0 }
    const round = s.round + 1
    const artist = s.players[(round - 1) % Math.max(1, s.players.length)] ?? s.artist
    return { ...s, phase: 'drawing', round, artist, word: wordDeck(s)[(round - 1) % DRAW_WORDS.length], strokes: [], guesses: [], solvedBy: null, timeLeft: s.roundSeconds }
  }
  return s
}

export function reduceNote(s: NoteState, from: string, input: NoteInput): NoteState {
  if (input.type !== 'hold' || !(from in s.held)) return s
  return { ...s, held: { ...s.held, [from]: input.held } }
}

const DISTRACTIONS = [
  'A stall-keeper knows your name. Look.',
  'Your fortune, free of charge — just glance.',
  'Something wet touches your ankle.',
  'A page in a hand you know flutters past.',
  'The Twins are writing something down about you.',
  'Pookie has wandered off. Where?',
]

/** Ten times a second. */
export function tickNote(s: NoteState, dt = 0.1): NoteState {
  if (s.phase === 'intro') return { ...s, phase: 'holding' }
  if (s.phase !== 'holding') return s
  const all = s.players.length > 0 && s.players.every((p) => s.held[p])
  const chord = Math.max(0, Math.min(100, s.chord + (all ? 22 : -14) * dt))
  const heldTogether = all ? s.heldTogether + dt : s.heldTogether
  const timeLeft = Math.max(0, s.timeLeft - dt)
  let distract = s.distract
  const now = Date.now()
  if (distract && distract.until < now) distract = null
  if (!distract && Math.random() < 0.06 * dt * 10 && s.players.length && timeLeft > 4) {
    const target = s.players[Math.floor(Math.random() * s.players.length)]
    distract = { target, text: DISTRACTIONS[Math.floor(Math.random() * DISTRACTIONS.length)], until: now + 2500 }
  }
  if (timeLeft <= 0) {
    return { ...s, chord, heldTogether, timeLeft: 0, distract: null, phase: 'end', won: heldTogether >= s.totalSeconds * 0.55 }
  }
  return { ...s, chord, heldTogether, timeLeft, distract }
}

export function reduceToll(s: TollState, from: string, input: TollInput): TollState {
  if (s.phase !== 'answer' || input.type !== 'answer' || !s.players.includes(from)) return s
  const answers = s.answers.filter((a) => a.by !== from).concat({ by: from, text: input.text.trim().slice(0, 240) })
  return { ...s, answers }
}
export function tollReveal(s: TollState): TollState {
  if (s.phase === 'answer') return { ...s, phase: 'reveal', order: shuffle(s.answers.map((_, i) => i)), revealed: 0 }
  if (s.phase === 'reveal') {
    const revealed = s.revealed + 1
    return revealed >= s.answers.length ? { ...s, revealed, phase: 'end' } : { ...s, revealed }
  }
  return s
}

export function reduceBargain(s: BargainState, from: string, input: BargainInput): BargainState {
  if (s.phase !== 'bid' || input.type !== 'bid' || !s.players.includes(from)) return s
  const text = input.text.trim().slice(0, 240)
  if (!text) return s
  const bids = s.bids.filter((b) => b.by !== from).concat({ by: from, coin: input.coin, text })
  return { ...s, bids }
}
/** DM actions on the Bargain: close the bids, open one envelope, accept one bid. */
export function bargainAct(s: BargainState, a: DmAction): BargainState {
  if (a.type === 'advance') {
    if (s.phase === 'bid') return { ...s, phase: 'closed' }
    if (s.phase === 'closed') return { ...s, phase: 'end' }
    return s
  }
  if (s.phase !== 'closed') return s
  if (!s.bids.some((b) => b.by === a.by)) return s
  if (a.type === 'open') return s.opened.includes(a.by) ? s : { ...s, opened: [...s.opened, a.by] }
  if (a.type === 'accept') return { ...s, accepted: a.by, opened: s.opened.includes(a.by) ? s.opened : [...s.opened, a.by], phase: 'end' }
  return s
}

export function reduce(s: GameState, from: string, input: GameInput): GameState {
  if (s.kind === 'draw') return reduceDraw(s, from, input as DrawInput)
  if (s.kind === 'note') return reduceNote(s, from, input as NoteInput)
  if (s.kind === 'toll') return reduceToll(s, from, input as TollInput)
  return reduceBargain(s, from, input as BargainInput)
}

// ------------------------------------------------------------ the host loop

export interface Host {
  get(): GameState | null
  start(s: GameState): void
  input(ev: GameEvent): void
  /** Host-side manual advance (Toll reveal, Bargain close, etc.). */
  advance(): void
  /** Any DM action (open / accept an envelope, advance). */
  act(a: DmAction): void
  stop(): void
}

/**
 * Create a host bound to a `send` function. Broadcasts a state snapshot on
 * every change (throttled to ~12/s for drawing) and a heartbeat every 2 s.
 */
export function createHost(send: (ev: GameEvent) => void, onChange: (s: GameState | null) => void): Host {
  let state: GameState | null = null
  let tick: ReturnType<typeof setInterval> | null = null
  let beat: ReturnType<typeof setInterval> | null = null
  let lastSent = 0
  let pending: ReturnType<typeof setTimeout> | null = null

  const broadcast = (force = false) => {
    if (!state) return
    const now = Date.now()
    const gap = now - lastSent
    const minGap = state.kind === 'draw' && state.phase === 'drawing' ? 80 : 40
    if (!force && gap < minGap) {
      if (!pending) pending = setTimeout(() => { pending = null; broadcast(true) }, minGap - gap)
      return
    }
    lastSent = now
    send({ gameId: state.gameId, kind: 'state', state, at: new Date().toISOString() })
    onChange(state)
  }
  const set = (s: GameState | null, force = false) => {
    state = s
    if (s) broadcast(force)
    else onChange(null)
  }
  const clearTimers = () => {
    if (tick) clearInterval(tick)
    if (beat) clearInterval(beat)
    tick = beat = null
  }

  return {
    get: () => state,
    start(s) {
      clearTimers()
      set(s, true)
      // The clock never advances the intro; the intro timer below does.
      if (s.kind === 'draw') tick = setInterval(() => state?.kind === 'draw' && state.phase !== 'intro' && set(tickDraw(state)), 1000)
      if (s.kind === 'note') tick = setInterval(() => state?.kind === 'note' && state.phase !== 'intro' && set(tickNote(state)), 100)
      beat = setInterval(() => broadcast(true), 2000)
      // Draw/note intros advance on their own; toll waits for the DM.
      const intro = s.kind === 'draw' ? 3000 : s.kind === 'note' ? 6000 : 0
      if (s.kind === 'draw') setTimeout(() => state?.kind === 'draw' && state.gameId === s.gameId && state.phase === 'intro' && set(tickDraw(state), true), intro)
      if (s.kind === 'note') setTimeout(() => state?.kind === 'note' && state.gameId === s.gameId && state.phase === 'intro' && set(tickNote(state), true), intro)
    },
    input(ev) {
      if (!state || ev.kind !== 'input' || ev.gameId !== state.gameId || !ev.from || !ev.input) return
      const next = reduce(state, ev.from, ev.input)
      if (next !== state) set(next)
    },
    advance() {
      this.act({ type: 'advance' })
    },
    act(a) {
      if (!state) return
      if (state.kind === 'bargain') return set(bargainAct(state, a), true)
      if (a.type !== 'advance') return
      if (state.kind === 'toll') set(tollReveal(state), true)
      if (state.kind === 'draw' && state.phase === 'intro') set(tickDraw(state), true)
    },
    stop() {
      clearTimers()
      if (pending) clearTimeout(pending)
      const id = state?.gameId ?? 'none'
      state = null
      onChange(null)
      send({ gameId: id, kind: 'clear', at: new Date().toISOString() })
    },
  }
}
