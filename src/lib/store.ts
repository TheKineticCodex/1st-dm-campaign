// The "never block" storage adapter (handoff/PROMPT.md):
// one interface, two implementations. LocalStore is the default and makes
// the whole app usable on a single device with no backend. SupabaseStore
// activates automatically when VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY
// are present, and mirrors writes into LocalStore as the offline cache.

import { supabase } from './supabase'
import { readCache, writeCache, type DeviceSession } from './storage'
import type {
  Clue,
  Encounter,
  Handout,
  LostThing,
  Npc,
  QuizResult,
  SavedCharacter,
  SessionNote,
} from '../types'

export interface RosterEntry {
  playerId: string
  playerName: string
  /** Server row id for DM-only records (lost_things); null until a character exists. */
  characterId: string | null
  character: SavedCharacter | null
  quiz: QuizResult | null
}

export interface Store {
  /** True when data leaves this device (Supabase configured). */
  readonly shared: boolean

  /** Validates the code and registers the device. Returns the role. */
  joinCampaign(code: string, name: string, deviceToken: string): Promise<'player' | 'dm' | 'invalid'>

  getCharacter(): Promise<SavedCharacter | null>
  saveCharacter(c: SavedCharacter): Promise<void>
  getQuizResult(): Promise<QuizResult | null>
  saveQuizResult(r: QuizResult): Promise<void>

  // ---- DM side (no-ops or device-local views in LocalStore) ----
  listRoster(): Promise<RosterEntry[]>
  getLostThings(characterId: string): Promise<LostThing | null>
  saveLostThings(l: LostThing): Promise<void>
  listNpcs(): Promise<Npc[]>
  saveNpc(n: Npc): Promise<void>
  deleteNpc(id: string): Promise<void>
  listClues(): Promise<Clue[]>
  saveClue(c: Clue): Promise<void>
  deleteClue(id: string): Promise<void>
  listSessionNotes(): Promise<SessionNote[]>
  saveSessionNote(n: SessionNote): Promise<void>
  deleteSessionNote(id: string): Promise<void>

  // ---- Phase 3: Table Mode ----
  /** Campaign id for the realtime channel; null in offline mode. */
  getChannelId(): Promise<string | null>
  /** DM: persist encounter state (also broadcast separately). */
  saveEncounter(e: Encounter): Promise<void>
  /** Player: current active encounter, for late joiners. */
  getActiveEncounter(): Promise<Encounter | null>
  /** DM: persist a handout so late joiners still receive it. */
  sendHandout(h: Handout): Promise<void>
  /** Player: handouts addressed to me (or everyone). */
  listMyHandouts(): Promise<Handout[]>
}

// --------------------------------------------------------------- LocalStore

class LocalStore implements Store {
  readonly shared = false
  private session: DeviceSession

  constructor(session: DeviceSession) {
    this.session = session
  }

  async joinCampaign(code: string): Promise<'player' | 'dm' | 'invalid'> {
    // Offline mode can't validate against a server. The known seed codes
    // still route correctly so the owner can rehearse both views today.
    return code.trim().toUpperCase() === 'LANTERNKEEPER' ? 'dm' : 'player'
  }

  async getCharacter() {
    return readCache<SavedCharacter>('character')
  }
  async saveCharacter(c: SavedCharacter) {
    writeCache('character', c)
  }
  async getQuizResult() {
    return readCache<QuizResult>('quiz')
  }
  async saveQuizResult(r: QuizResult) {
    writeCache('quiz', r)
  }

  // DM views in offline mode show only what lives on this device —
  // enough for the owner to rehearse alone before Supabase exists.
  async listRoster(): Promise<RosterEntry[]> {
    const character = readCache<SavedCharacter>('character')
    const quiz = readCache<QuizResult>('quiz')
    if (!character && !quiz) return []
    return [
      {
        playerId: 'this-device',
        playerName: quiz?.playerName || character?.build.name || this.session.playerName,
        characterId: character ? 'this-device' : null,
        character,
        quiz,
      },
    ]
  }
  async getLostThings(characterId: string) {
    return readCache<LostThing>(`lost:${characterId}`)
  }
  async saveLostThings(l: LostThing) {
    writeCache(`lost:${l.characterId}`, l)
  }
  async listNpcs() {
    return readCache<Npc[]>('npcs') ?? []
  }
  async saveNpc(n: Npc) {
    const all = (readCache<Npc[]>('npcs') ?? []).filter((x) => x.id !== n.id)
    writeCache('npcs', [...all, n])
  }
  async deleteNpc(id: string) {
    writeCache('npcs', (readCache<Npc[]>('npcs') ?? []).filter((x) => x.id !== id))
  }
  async listClues() {
    return readCache<Clue[]>('clues') ?? []
  }
  async saveClue(c: Clue) {
    const all = (readCache<Clue[]>('clues') ?? []).filter((x) => x.id !== c.id)
    writeCache('clues', [...all, c])
  }
  async deleteClue(id: string) {
    writeCache('clues', (readCache<Clue[]>('clues') ?? []).filter((x) => x.id !== id))
  }
  async listSessionNotes() {
    return readCache<SessionNote[]>('session-notes') ?? []
  }
  async saveSessionNote(n: SessionNote) {
    const all = (readCache<SessionNote[]>('session-notes') ?? []).filter((x) => x.id !== n.id)
    writeCache('session-notes', [...all, n].sort((a, b) => a.sessionNumber - b.sessionNumber))
  }
  async deleteSessionNote(id: string) {
    writeCache('session-notes', (readCache<SessionNote[]>('session-notes') ?? []).filter((x) => x.id !== id))
  }

  // Table Mode offline: the DM can still run initiative on the iPad;
  // nothing broadcasts, handouts stay on-device.
  async getChannelId() {
    return null
  }
  async saveEncounter(e: Encounter) {
    writeCache('encounter', e)
  }
  async getActiveEncounter() {
    const e = readCache<Encounter>('encounter')
    return e?.active ? e : null
  }
  async sendHandout(h: Handout) {
    writeCache('handouts', [...(readCache<Handout[]>('handouts') ?? []), h])
  }
  async listMyHandouts() {
    const all = readCache<Handout[]>('handouts') ?? []
    return all.filter((h) => !h.target || h.target === this.session.playerName)
  }
}

// ------------------------------------------------------------ SupabaseStore

class SupabaseStore implements Store {
  readonly shared = true
  private local: LocalStore
  private session: DeviceSession

  constructor(session: DeviceSession) {
    this.session = session
    this.local = new LocalStore(session)
  }

  private get token() {
    return this.session.deviceToken
  }
  private get dmCode() {
    return this.session.campaignCode
  }

  private async rpc<T>(fn: string, args: Record<string, unknown>): Promise<T | null> {
    const { data, error } = await supabase!.rpc(fn, args)
    if (error) {
      console.error(`rpc ${fn}:`, error.message)
      return null
    }
    return data as T
  }

  async joinCampaign(code: string, name: string, deviceToken: string) {
    const role = await this.rpc<string>('join_campaign', {
      p_code: code.trim().toUpperCase(),
      p_name: name,
      p_device_token: deviceToken,
    })
    if (role === 'player' || role === 'dm') return role
    return 'invalid' as const
  }

  async getCharacter() {
    const remote = await this.rpc<SavedCharacter>('get_character', { p_device_token: this.token })
    if (remote) {
      await this.local.saveCharacter(remote)
      return remote
    }
    return this.local.getCharacter()
  }
  async saveCharacter(c: SavedCharacter) {
    await this.local.saveCharacter(c)
    await this.rpc('save_character', {
      p_device_token: this.token,
      p_build: c.build,
      p_state: c.state,
      p_private_notes: c.notes,
    })
  }
  async getQuizResult() {
    const remote = await this.rpc<QuizResult>('get_quiz', { p_device_token: this.token })
    if (remote) {
      const normalized = extractTopSpecies(remote)
      await this.local.saveQuizResult(normalized)
      return normalized
    }
    return this.local.getQuizResult()
  }
  async saveQuizResult(r: QuizResult) {
    await this.local.saveQuizResult(r)
    // topSpecies rides inside the answers jsonb (no schema change needed);
    // extractTopSpecies pulls it back out on every read path.
    await this.rpc('save_quiz', {
      p_device_token: this.token,
      p_answers: { ...r.answers, _topSpecies: r.topSpecies ?? [] },
      p_top_classes: r.topClasses,
    })
  }

  async listRoster() {
    const roster = (await this.rpc<RosterEntry[]>('dm_roster', { p_dm_code: this.dmCode })) ?? []
    return roster.map((r) => (r.quiz ? { ...r, quiz: extractTopSpecies(r.quiz) } : r))
  }
  async getLostThings(characterId: string) {
    return this.rpc<LostThing>('dm_get_lost_things', { p_dm_code: this.dmCode, p_character_id: characterId })
  }
  async saveLostThings(l: LostThing) {
    await this.rpc('dm_save_lost_things', {
      p_dm_code: this.dmCode,
      p_character_id: l.characterId,
      p_taken: l.taken,
      p_believed: l.believed,
      p_truth: l.truth,
    })
  }
  async listNpcs() {
    return (await this.rpc<Npc[]>('dm_list_npcs', { p_dm_code: this.dmCode })) ?? []
  }
  async saveNpc(n: Npc) {
    await this.rpc('dm_save_npc', { p_dm_code: this.dmCode, p_npc: n })
  }
  async deleteNpc(id: string) {
    await this.rpc('dm_delete_npc', { p_dm_code: this.dmCode, p_id: id })
  }
  async listClues() {
    return (await this.rpc<Clue[]>('dm_list_clues', { p_dm_code: this.dmCode })) ?? []
  }
  async saveClue(c: Clue) {
    await this.rpc('dm_save_clue', { p_dm_code: this.dmCode, p_clue: c })
  }
  async deleteClue(id: string) {
    await this.rpc('dm_delete_clue', { p_dm_code: this.dmCode, p_id: id })
  }
  async listSessionNotes() {
    return (await this.rpc<SessionNote[]>('dm_list_session_notes', { p_dm_code: this.dmCode })) ?? []
  }
  async saveSessionNote(n: SessionNote) {
    await this.rpc('dm_save_session_note', { p_dm_code: this.dmCode, p_note: n })
  }
  async deleteSessionNote(id: string) {
    await this.rpc('dm_delete_session_note', { p_dm_code: this.dmCode, p_id: id })
  }

  async getChannelId() {
    // Works with either code: players hold the join code, the DM the DM code.
    return this.rpc<string>('get_channel', { p_code: this.session.campaignCode })
  }
  async saveEncounter(e: Encounter) {
    await this.local.saveEncounter(e)
    await this.rpc('dm_save_encounter', { p_dm_code: this.dmCode, p_encounter: e })
  }
  async getActiveEncounter() {
    return this.rpc<Encounter>('get_active_encounter', { p_device_token: this.token })
  }
  async sendHandout(h: Handout) {
    await this.rpc('dm_send_handout', { p_dm_code: this.dmCode, p_handout: h })
  }
  async listMyHandouts() {
    return (await this.rpc<Handout[]>('list_my_handouts', { p_device_token: this.token })) ?? []
  }
}

/** Server rows carry topSpecies inside answers._topSpecies — lift it out. */
function extractTopSpecies(q: QuizResult): QuizResult {
  const raw = (q.answers as Record<string, unknown>)?._topSpecies
  if (!Array.isArray(raw)) return q
  const { _topSpecies, ...answers } = q.answers as Record<string, string> & { _topSpecies?: unknown }
  void _topSpecies
  return { ...q, answers, topSpecies: raw as string[] }
}

export function getStore(session: DeviceSession): Store {
  return supabase ? new SupabaseStore(session) : new LocalStore(session)
}
