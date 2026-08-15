// Shared chrome for every carnival game: the phone overlay (title, the
// game's own view, "the stall-keeper is watching") and the stage board.
// Add a game: one case in each switch.

import type { GameInput, GameState } from '../../lib/games'
import { GAME_TITLES } from '../../lib/games'
import { C, display } from '../ui'
import { DrawPhone, DrawStage } from './DrawGame'
import { NotePhone, NoteStage } from './NoteGame'
import { TollPhone, TollStage } from './TollGame'

export function GamePhoneOverlay({ state, me, send }: { state: GameState; me: string; send: (i: GameInput) => void }) {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-start p-5"
      style={{ background: `${C.night}FA`, zIndex: 76, overflowY: 'auto' }}
      role="dialog"
      aria-label={GAME_TITLES[state.kind]}
    >
      <p className="text-xs uppercase tracking-widest mt-3" style={{ color: C.sea, letterSpacing: '0.25em' }}>
        The carnival presents
      </p>
      <h2 style={{ ...display, fontSize: 28, fontWeight: 700, color: C.gold, textAlign: 'center', lineHeight: 1.1 }}>{GAME_TITLES[state.kind]}</h2>
      <div className="mt-3 w-full flex justify-center">
        {state.kind === 'draw' && <DrawPhone state={state} me={me} send={send} />}
        {state.kind === 'note' && <NotePhone state={state} me={me} send={send} />}
        {state.kind === 'toll' && <TollPhone state={state} me={me} send={send} />}
      </div>
      <p className="text-xs mt-6" style={{ color: C.faint }}>
        the stall-keeper will say when it’s done
      </p>
    </div>
  )
}

export function GameStageBoard({ state }: { state: GameState }) {
  return (
    <div className="w-full h-full" style={{ background: C.night, color: C.parchment }}>
      {state.kind === 'draw' && <DrawStage state={state} />}
      {state.kind === 'note' && <NoteStage state={state} />}
      {state.kind === 'toll' && <TollStage state={state} />}
    </div>
  )
}

export default GamePhoneOverlay
