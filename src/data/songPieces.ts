// ✦ The five songs and their pieces — the campaign's progress, made visible.
// The Lantern-Keeper lights a piece from the Book ("a piece comes home"); it
// travels as a persisted handout with a `song` field, so every phone — awake
// or asleep — sees the same lit pieces. Matches campaign/the-story.md.

export interface SongPiece {
  key: string
  label: string
  /** Where it's found — for the DM's picker only; players just see it light. */
  where: string
}

export interface Song {
  key: string
  name: string
  holder: string
  /** The line the phone shows under the name. */
  line: string
  pieces: SongPiece[]
}

export const SONGS: Song[] = [
  {
    key: 'sea',
    name: 'The Sea’s song',
    holder: 'Peaches',
    line: 'The tune with the hole in it. Every sea-born thing hums a piece.',
    pieces: [
      { key: 'note', label: 'the last note — hers', where: 'Peaches has always held it. Light it when she claims it out loud.' },
      { key: 'seal-pup', label: 'the seal-pup’s three notes', where: 'The salt shed, Saltmere.' },
      { key: 'jar', label: 'a jarred piece from the Bog', where: 'The jar-house.' },
      { key: 'gills', label: 'what Grey-Gill still hums', where: 'Her tent, if they earn it.' },
      { key: 'organ', label: 'the carousel organ, turned', where: 'The Fair — the Sea’s own piece, given away.' },
      { key: 'pookie', label: 'Pookie’s hum', where: 'He has it. He always did.' },
    ],
  },
  {
    key: 'grove',
    name: 'The Grove’s song',
    holder: 'Freya Moon',
    line: 'Elowen’s flower-speaking hum under the willow.',
    pieces: [
      { key: 'blossom', label: 'the last blossom, in her pendant', where: 'She carries it. Light it when it first stirs.' },
      { key: 'moths', label: 'the glowing moths', where: 'Under the oldest willow.' },
      { key: 'spring', label: 'ONE SPRING, GROVE-CUT — the sealed lot', where: 'The Under-Sea market.' },
      { key: 'elowen', label: 'Elowen', where: 'Below. How she got there is yours to decide.' },
    ],
  },
  {
    key: 'william',
    name: 'William’s own song',
    holder: 'Billy',
    line: 'The songs he writes about his friends and never shows. Those are him.',
    pieces: [
      { key: 'page', label: 'a page in Wren’s hand', where: 'The Midway prize stall.' },
      { key: 'laugh', label: 'Wren’s laugh, reassembled', where: 'The back room of the Hall of Mirrors.' },
      { key: 'book', label: 'the spellbook, un-writing halted', where: 'Opening Night.' },
      { key: 'name', label: 'his true name, sung home by his friends', where: 'The Moon-Night.' },
    ],
  },
  {
    key: 'philip',
    name: 'His mother’s song',
    holder: 'Philip',
    line: 'A tune she hummed in her garden. His convictions ARE that tune.',
    pieces: [
      { key: 'teacher', label: 'the false teacher, freed or refused', where: 'The Bog road.' },
      { key: 'finest-hour', label: 'his finest hour, un-priced', where: 'The Hall of Mirrors.' },
      { key: 'tune', label: 'the tune, whole', where: 'The Moon-Night.' },
    ],
  },
  {
    key: 'freya-sun',
    name: 'Freya Sun’s song',
    holder: 'Freya Sun',
    line: 'Whole. The one they haven’t got. The whole table laughing.',
    pieces: [
      { key: 'list-voice', label: 'a voice from her list, freed', where: 'The jar-house.' },
      { key: 'protected', label: 'she lets herself be protected', where: 'Whenever it happens. You’ll know.' },
      { key: 'kept', label: 'she never said yes', where: 'The Moon-Night — the last temptation, refused.' },
    ],
  },
]

/** "sea:seal-pup" → { song, piece }. */
export function parsePieceKey(k: string): { song: Song; piece: SongPiece } | null {
  const [sk, pk] = k.split(':')
  const song = SONGS.find((s) => s.key === sk)
  const piece = song?.pieces.find((p) => p.key === pk)
  return song && piece ? { song, piece } : null
}
