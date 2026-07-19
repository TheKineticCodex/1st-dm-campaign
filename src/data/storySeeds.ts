// The Song the Sea Forgot — original campaign story seeds (Act 1 complete,
// Acts 2-3 as prepared branches). Entirely original content: our carnival,
// our NPCs, our mystery — built from the real players' vault confessions.

import type { Store } from '../lib/store'
import type { StoryNode } from '../types'

interface SeedNode {
  key: string
  act: number
  ord: number
  title: string
  summary: string
  status?: StoryNode['status']
  branches?: { label: string; toKey: string }[]
}

const SEEDS: SeedNode[] = [
  {
    key: 'gate',
    act: 1,
    ord: 0,
    status: 'current',
    title: 'The Gate of Paper Lanterns',
    summary:
      'The carnival appears where the tide never reaches. At the gate stand the Twins of the Toll — Brother Hush (never speaks, writes on slate) and Sister Hum (never stops half-singing). Admission is never coin: each traveler owes ONE HONEST ANSWER. Ask each player their character\'s answer aloud — the Twins write them down. (You keep these; they matter in Act 3.)',
  },
  {
    key: 'midway',
    act: 1,
    ord: 1,
    title: 'The Games of the Midway',
    summary:
      'Run the Snail Derby from the app (real prizes: a paper crown that never tears, a bottle of "bottled applause"). At a prize stall, Billy is paid with a loose PAGE — handwriting he knows: his mentor\'s. The stallkeep shrugs: "It washed up. Lots of things wash up here."',
  },
  {
    key: 'greygill',
    act: 1,
    ord: 2,
    title: "Grandmother Grey-Gill's Tent",
    summary:
      'The fortune-teller\'s tent smells of salt. Grey-Gill has gills, old ones, kept behind a shawl. She takes Peaches\' hand first: "You walked in on borrowed feet, child. The sea still sets a place for you at supper." She will read anyone — use their real quiz answers as her prophecies. She will NOT say who buys lost things. "I sold my own name for this tent. I know better than to say theirs."',
  },
  {
    key: 'missing-note',
    act: 1,
    ord: 3,
    title: 'The Missing Note',
    summary:
      'The carousel organ plays a sea-tune with one note always skipped — the same note, every round. Peaches recognizes the tune: it is in HER key, the song she was born to. Anyone who hums the missing note feels the whole carnival lean in to listen. First real clue: the carnival is built around something taken from the sea.',
  },
  {
    key: 'whispers',
    act: 1,
    ord: 4,
    title: 'Whispers in the Dark',
    summary:
      'As the lanterns dim for the midnight show, send each player a SEALED WHISPER (use the ✉✦ buttons in the Vault — their own confessions, returned): a glimpse of their Lost Thing, near, moving away. Peaches: wet footprints that end mid-stride. Billy: ink drying on a page no hand is writing. This is the hook that pulls them past the back fence.',
  },
  {
    key: 'three-gates',
    act: 1,
    ord: 5,
    title: 'The Three Gates',
    summary:
      'At midnight the back fence is three gates, each lit differently. Brother Hush holds up a slate: "ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST." Let the table argue. Whatever they pick, you are ready — every road is prepared.',
    branches: [
      { label: 'Green lanterns — the Bog Gate', toKey: 'bog' },
      { label: 'Silver lanterns — the Mirror Gate', toKey: 'mirrors' },
      { label: 'Blue lanterns — the Gate Below', toKey: 'undersea' },
    ],
  },
  {
    key: 'bog',
    act: 2,
    ord: 0,
    title: 'The Drowned Bog',
    summary:
      'ACT 2, ROAD A. A marsh where sound sinks: the bog-wife Old Cassia keeps stolen VOICES in green glass jars, half-mad with the noise of them. She trades in secrets and owes the Still Court a tithe she can no longer pay. She knows where tails and songs are kept — for a price written in the app\'s contract quill.',
  },
  {
    key: 'mirrors',
    act: 2,
    ord: 0,
    title: 'The Hall of Facets',
    summary:
      'ACT 2, ROAD B. A palace of standing mirrors that show not reflections but PERFORMANCES — everyone\'s best face, kept. Billy\'s road: one mirror holds his mentor mid-laugh, another holds Billy with no smile at all. The keeper, the Curator of Faces, collects masks for the Still Court and would dearly love Billy\'s.',
  },
  {
    key: 'undersea',
    act: 2,
    ord: 0,
    title: 'The Under-Sea',
    summary:
      'ACT 2, ROAD C. Stairs into water that lets you breathe if you were owed a life there. The drowned market where large things are sold: seasons, first loves, tails. Peaches\' road: her tail hangs in the Collector\'s window, priced at "one song, already paid." The merchants fear the Still Court\'s buyer, who is overdue for a visit.',
  },
  {
    key: 'still-court',
    act: 3,
    ord: 0,
    title: 'The Still Court',
    summary:
      'ACT 3. The power that bought the Sea\'s song and salts it away — because where there is no song, nothing changes, and nothing is ever lost again. The Court does not steal; it BUYS, with consent, on signed paper. Every contract in the campaign was legal. The finale: the party must find the flaw in the very first bargain — the one the Sea itself signed. (Fill in from what the table has done; their Reliquary fragments are the evidence.)',
  },
]

export async function seedStory(store: Store): Promise<void> {
  const ids = new Map(SEEDS.map((s) => [s.key, crypto.randomUUID()]))
  for (const s of SEEDS) {
    await store.saveStoryNode({
      id: ids.get(s.key)!,
      act: s.act,
      ord: s.ord,
      title: s.title,
      summary: s.summary,
      status: s.status ?? 'possible',
      branches: (s.branches ?? []).map((b) => ({ label: b.label, toId: ids.get(b.toKey)! })),
    })
  }
}
