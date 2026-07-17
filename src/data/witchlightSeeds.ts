// Witchlight prep seeds (research amendment 8.6). Original phrasing only —
// these are the DM's private tracking notes, never adventure text. They
// mark the long-fuse threads the module plants in Chapter 1 that pay off
// as late as Chapter 4, so a first-time DM tracks them from night one.

import type { Clue, Npc } from '../types'

export const SEED_CLUES: Omit<Clue, 'id'>[] = [
  {
    conclusion: 'Something is wrong with the carnival’s owners — the real power is elsewhere',
    clues: [
      { text: 'Kettlesteam the kenku echoes words she should never have heard — note each one', found: false },
      { text: 'The staff dodge every question about who truly runs things', found: false },
      { text: 'The lost-property wagon holds things no honest carnival would keep', found: false },
    ],
  },
  {
    conclusion: 'Wishes here have prices — and the party will meet the wish-granters again',
    clues: [
      { text: 'Northwind & Red grant a wish — write down the EXACT wording used', found: false },
      { text: 'Diana Cloppington’s carousel hints that some rides remember their riders', found: false },
      { text: 'A patron mentions a wish that came true wrong, years ago', found: false },
    ],
  },
  {
    conclusion: 'The players’ Lost Things were taken on purpose, by someone who collects',
    clues: [
      { text: 'Each character’s quiz confession (Vault) — the thing they’d risk everything for', found: false },
      { text: 'A carnival game pays out a trinket suspiciously like something once lost', found: false },
      { text: 'Mister Witch or Mister Light flinches at the mention of a specific Lost Thing', found: false },
    ],
  },
]

export const SEED_NPCS: Omit<Npc, 'id'>[] = [
  {
    name: 'Kettlesteam',
    pronunciation: 'KET-tul-steem',
    trait: 'A kenku who only speaks in borrowed voices — repeat things back to her and watch her react',
    motivation: 'Wants the truth about the carnival spoken aloud, but cannot say it first',
    secret: 'Her stolen phrases are clues — track every one; they matter chapters later',
    connection: 'First thread to the power behind the carnival',
  },
  {
    name: 'Diana Cloppington',
    pronunciation: 'die-ANN-a CLOP-ing-ton',
    trait: 'Speaks of her carousel mounts as if they were old friends with opinions',
    motivation: 'Keep the rides turning, keep the questions few',
    secret: 'Knows more about what the carousel remembers than she lets on',
    connection: 'Her hints pay off when the party leaves the carnival behind',
  },
  {
    name: 'Northwind & Red',
    pronunciation: 'as written — they finish each other’s sentences',
    trait: 'A double act: one promises, the other qualifies the promise',
    motivation: 'To grant wishes — exactly as worded, never as meant',
    secret: 'Record the precise wording of any wish; it returns in Chapter 4',
    connection: 'The wish is a loaded gun on the mantel — yours to fire later',
  },
  {
    name: 'The Bog Merchant (homebrew slot)',
    pronunciation: 'your call',
    trait: 'Sells what the module forgot to — fill this card with your own trader',
    motivation: 'The party will have gold and nowhere to spend it; this fixes that',
    secret: 'Everything on the cart was bartered, not bought. From whom?',
    connection: 'Your merchant table — the module under-provides shops (research 8.6)',
  },
]
