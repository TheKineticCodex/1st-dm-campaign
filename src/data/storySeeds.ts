// The Song the Sea Forgot — the story timeline seeds. Matches
// campaign/the-story.md (the Lantern-Keeper's Copy). Beat TITLES double as
// keys into act1Scenes.ts, so a title change here needs a key change there.
//
// Voice: promises and songs, no paperwork.

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

export const SEEDS: SeedNode[] = [
  // ---------------------------------------------------------------- Act 1
  {
    key: 'gate',
    act: 1,
    ord: 0,
    status: 'current',
    title: 'The Gate of Paper Lanterns',
    summary:
      'The Fair stands where the tide never reaches. At the gate: the Twins of the Toll — Brother Hush (writes on slate) and Sister Hum (half-sings everything). Admission is never coin: one HONEST ANSWER each, out loud. Write them down — they come back once, at the very end. Slate: ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE.',
  },
  {
    key: 'midway',
    act: 1,
    ord: 1,
    title: 'The Games of the Midway',
    summary:
      'Run the Snail Derby (prizes: a paper crown that never tears, bottled applause). At a prize stall, Billy is paid with a loose PAGE in his mentor Wren\'s handwriting. The stallkeep shrugs: "It washed up." Sneaking behind the stall finds crates marked BELOW — the same glass as Tarn\'s bottle.',
  },
  {
    key: 'greygill',
    act: 1,
    ord: 2,
    title: "Grandmother Grey-Gill's Tent",
    summary:
      'The heart of the night. Grey-Gill has old gills behind a shawl. She takes Peaches\' hand first: "You walked in on borrowed feet, child." She reads everyone their own confessions as prophecy — fire the ✉ readings one at a time. She gave away her own NAME for the tent; when she tries to say who has it, only bubbles come. She and Billy share that wound. Don\'t say it.',
  },
  {
    key: 'missing-note',
    act: 1,
    ord: 3,
    title: 'The Missing Note',
    summary:
      'The carousel organ plays the Sea\'s song with one note always skipped — the piece the Sea gave away, with a hole where Peaches\' note should be. If she hums along, every lantern in the Fair turns to look, and the hunt begins because of a choice made at your table. Do not warn her. If anyone hums the note: three seconds of true silence.',
  },
  {
    key: 'whispers',
    act: 1,
    ord: 4,
    title: 'Whispers in the Dark',
    summary:
      'The lanterns dim for the midnight show. Fire all five vision whispers (60-second ephemeral) — each player\'s lost thing, glimpsed, moving away. Then let the table decide what to share. Every vision walks toward the back fence.',
  },
  {
    key: 'three-gates',
    act: 1,
    ord: 5,
    title: 'The Three Gates',
    summary:
      'The back fence is three gates. Slate: ONE OPENS TONIGHT. THE OTHERS REMEMBER BEING CHOSEN LAST. Every gate pulls two players — Bog: Freya Sun + Philip · Mirrors: Billy + Philip · Below: Peaches + Freya Moon. Let them argue. Someone hears "we\'ll come back for yours." Level 2 on the crossing; the music ends the session, not you.',
    branches: [
      { label: 'Green lanterns — the Bog', toKey: 'bog-1' },
      { label: 'Silver lanterns — the Hall of Mirrors', toKey: 'mirror-1' },
      { label: 'Blue lanterns — the Under-Sea', toKey: 'sea-1' },
    ],
  },

  // ---------------------------------------------------- Act 2 · the Bog
  {
    key: 'bog-1',
    act: 2,
    ord: 0,
    title: 'The Whispering Causeway (Bog road)',
    summary:
      'A road of floating lanterns over black water full of polite voices — the jar-woman\'s leaking shelves. One voice knows a story: "the sea gave its song away, but a mermaid was born holding a piece of it, after." Threads: Freya Sun hears a voice she KNOWS · Philip hears preaching from the reeds — the false teacher, hollow.',
  },
  {
    key: 'bog-2',
    act: 2,
    ord: 1,
    title: "The Jar-House ✦ LEVEL 3",
    summary:
      'A house on stilts, shelves of humming green jars. The jar-woman is behind on her rent to the Buyer and will deal. THE PROOF happens here if it hasn\'t yet: a jar hums back at Peaches and unlatches on its own. Freeing any voice = Level 3 — the bog goes silent for one full minute, then a thousand jars whisper thank you.',
  },
  {
    key: 'bog-3',
    act: 2,
    ord: 2,
    title: 'The Rent Comes Due (Bog climax)',
    summary:
      'A grey barge without a wake comes to collect the jar-woman\'s rent, poled by a coat with no one in it. It leaves on the hour regardless — the fight has a clock. Win: the jarred piece of the Sea\'s song, and Freya Sun\'s voice, and the false teacher freed or refused. The Buyer is glimpsed for the first time, on the deck, taking tea.',
  },

  // ------------------------------------------------ Act 2 · the Mirrors
  {
    key: 'mirror-1',
    act: 2,
    ord: 0,
    title: 'The Gallery of Best Faces (Mirror road)',
    summary:
      'Standing mirrors with no walls. None show you; all show someone\'s finest hour on loop. One plays Wren mid-laugh. One is covered — Billy, unsmiling: PENDING. One loops the day Philip chose not to kill — already priced. Billy reaches for the chain on his book here and finds it EMPTY.',
  },
  {
    key: 'mirror-2',
    act: 2,
    ord: 1,
    title: 'The Back Room ✦ LEVEL 3',
    summary:
      'The mirror-man\'s workshop: faces in clamps, a laugh disassembled on velvet — Wren\'s. He believes keeping is love: "In here, nothing is ever lost." Reassembling the laugh (group effort, three skills) frees it — it flies home into Billy\'s book. Level 3: every mirror in the Hall ripples like water.',
  },
  {
    key: 'mirror-3',
    act: 2,
    ord: 2,
    title: 'Opening Night (Mirror climax)',
    summary:
      'The gallery is a theatre; the mirrors are the audience. The mirror-man narrates the fight as a review. Broken mirrors free moments that CHEER the party. Win: Wren\'s book, mid-transit, and Philip\'s finest hour un-priced. The Buyer is in the front row.',
  },

  // ----------------------------------------------- Act 2 · the Under-Sea
  {
    key: 'sea-1',
    act: 2,
    ord: 0,
    title: 'The Stairs Below (Under-Sea road)',
    summary:
      'Stairs into water that lets you breathe if you were ever owed a life below. Peaches breathes free; the rest speak one small truth into the water. Drowned commuters gossip: "the tail lot," not looking at Peaches. Freya Moon\'s pendant WARMS the deeper they go.',
  },
  {
    key: 'sea-2',
    act: 2,
    ord: 1,
    title: "The Market-Mother's Window ✦ LEVEL 3",
    summary:
      'A window the size of a cathedral door: a mermaid\'s tail on black velvet — ONE SONG, ALREADY PAID. Peaches never said yes; that is the crack. Beside it, a sealed lot: ONE SPRING, GROVE-CUT — the pendant burns. Elowen is close. The market-mother sells "one scale, for sentiment," smiling. Level 3: every price-card in the market flickers, uncertain.',
  },
  {
    key: 'sea-3',
    act: 2,
    ord: 2,
    title: 'The Sale of the Tail (Under-Sea climax)',
    summary:
      'An amphitheater of shells; the audience bids on the fight. The market-mother must be beaten by the RULES — the gavel, the crack in the promise, or out-bid — never killed. If Peaches sings her note, the tail glows and the whole room forgets to breathe. Win: the tail (wrapped, waiting for the song to be whole) and the sealed grove-lot opened. The Buyer raises a hand.',
  },

  // ---------------------------------------------------------------- Act 3
  {
    key: 'moon-night',
    act: 3,
    ord: 0,
    title: 'The Moon-Night',
    summary:
      'The moon fills the sky; the Sea is standing up on its hind legs to reach her. The Fair\'s biggest stage. Everyone the party freed — the seal-pup, the jarred voices, the mirror-moments, the organ turned, Pookie — in one place. The Twins read the five Gate answers, in the players\' own words. All five sing; five songs, one chord. The Sea remembers her. The tide comes home up Saltmere harbor at dawn. Then five doors open, and you ask each player: "The tide is in. Where do you go?"',
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
