// The Book's seed cast and clue tracker — matches campaign/the-story.md.
// Cast is deliberately small: the players should be able to hold every
// name here in their heads. Clues are "pieces of the song," not paperwork.
// The DM's "Lay the threads" button on the Book home writes these once.

import type { Clue, Npc } from '../types'

export const SEED_NPCS: Omit<Npc, 'id'>[] = [
  {
    name: 'Brother Hush & Sister Hum',
    pronunciation: '',
    trait: 'Hush writes 3–5 words on slate (hold up scraps of paper). Hum answers everything in half-sung fragments that trail off.',
    motivation: 'Collect the toll: one honest answer per guest, out loud, written down.',
    secret: 'The answers come back once, at the very end, in the players’ own words. Slate: ADMISSION IS SOLD IN SETS. YOU FIVE ARRIVED ON ONE TIDE.',
    connection: 'The gate of the Getting Fair.',
  },
  {
    name: 'Grandmother Grey-Gill',
    pronunciation: '',
    trait: 'Warm gravel voice; shawl pinned high over old gills; eyes like the hour before a storm.',
    motivation: 'Reads their real confessions back as prophecy. Charges in kindnesses, not coin.',
    secret: 'Gave away her own NAME for her tent. When she tries to say who has it, only bubbles come — mime it once. She and Billy have the same wound; don’t say it.',
    connection: 'Knows Peaches on sight: “You walked in on borrowed feet, child. The sea still sets a place for you at supper.” Her line for “what is a song?”: “It’s the bit of you other people are keeping safe, dear.”',
  },
  {
    name: 'The carousel operator',
    pronunciation: '',
    trait: 'Hums the Sea’s song with a hole in it, weeps steadily, notices neither. Answers mid-hum without stopping.',
    motivation: 'Keeps the ride turning. Will stop it for a song sung live.',
    secret: 'The organ IS the Sea’s song — the piece the Sea gave away. The hole is Peaches’s note. If she hums along, every lantern in the Fair turns to look.',
    connection: 'The Missing Note. If anyone hums the note: three full seconds of true silence at your table.',
  },
  {
    name: 'The Appraiser',
    pronunciation: '',
    trait: 'ABSENT tonight — that is the scary part. A closed tent, a coat on a hook, no one inside.',
    motivation: 'Prices things ashore. Every carnival-folk gives the same four words: “He’s out. Appraising.”',
    secret: 'One day he will price Tarn’s sight — and hand Billy the pen.',
    connection: 'The Ones Below, ashore.',
  },
  {
    name: 'The Buyer',
    pronunciation: '',
    trait: 'One face for the Ones Below. Courteous, punctual, tea. He has never told a lie. Unseen until the middle of the campaign.',
    motivation: 'To close. He never takes — he waits for the yes.',
    secret: 'His one honest sentence, mid-Act 2: “The Sea wasn’t robbed. It asked us. It wanted to forget her. Who are you to give it back its grief?” Then he leaves.',
    connection: 'He survives the ending. Card + genuine compliment to whoever out-sang him: “We’ll be watching your career with interest.”',
  },
  {
    name: 'The jar-woman (Bog road)',
    pronunciation: '',
    trait: 'A house on stilts wearing other houses’ shutters; shelves of green jars, each humming, each labeled in a shaking hand.',
    motivation: 'Behind on her rent to the Buyer. Hates him, fears him more. Will deal.',
    secret: 'One jar holds a voice from Freya Sun’s list. The false teacher preaches to the reeds outside — hollow — and can be freed. A jarred piece of the Sea’s song is IN THE ROOM.',
    connection: 'The Bog. Threads: Freya Sun · Philip.',
  },
  {
    name: 'The mirror-man (Mirror road)',
    pronunciation: '',
    trait: 'Curates everyone’s finest hour on loop. Believes keeping is love: “In here, nothing is ever lost.”',
    motivation: 'Wants Billy’s smile. Narrates everything as a review.',
    secret: 'One mirror loops the day Philip chose not to kill — already priced. Wren’s laugh is disassembled on velvet in the back room. The chain on Billy’s book is empty here.',
    connection: 'The Hall of Mirrors. Threads: Billy · Philip.',
  },
  {
    name: 'The market-mother (Under-Sea road)',
    pronunciation: '',
    trait: 'Runs the drowned market where large things are sold. Delighted by Peaches: “The lot, come to view itself!”',
    motivation: 'Loves a contested sale more than she loves the Buyer. Future chaotic ally.',
    secret: 'The tail is in her window, priced ONE SONG, ALREADY PAID. A sealed lot marked ONE SPRING, GROVE-CUT sits in her inventory — the pendant burns near it. Elowen is close.',
    connection: 'The Under-Sea. Threads: Peaches · Freya Moon.',
  },
  {
    name: 'Tarn',
    pronunciation: '',
    trait: 'Netmender, newly blind; calm hands, dry kindness, zero self-pity.',
    motivation: '“Sit down, lad. Skip to the end of the apology.” Restitution is Billy’s to invent.',
    secret: 'Dark-sight: sees the price tags on precious things. Billy’s says PENDING. Saltmere’s one true seer — your clue dispenser.',
    connection: 'Blinded by Billy’s bottle — prize-stall glass. His boy Pip (9, all glare) becomes anyone’s fiercest ally the moment they’re kind to Tarn.',
  },
  {
    name: 'Old Griff',
    pronunciation: '',
    trait: 'Harbormaster; slow, certain, forty years of weather in his voice.',
    motivation: '“Sat here through nine hurricanes. Never once heard it this quiet.”',
    secret: 'Forty years ago, aged eight, he saw lights on the sand the last time the Moon came near; the tide came back by dawn and took his chalk drawing. He tore that page from the tide log at nine. He’ll say so if asked straight.',
    connection: 'The Moon clock’s witness. Tell his story once, mid-campaign, and let them do the math.',
  },
  {
    name: 'Maddy Brine',
    pronunciation: '',
    trait: 'Hands on hips; everyone is “love” or “trouble.” Feeds people instead of comforting them.',
    motivation: '“Eat. The sea’s gone, not the porridge.”',
    secret: '',
    connection: 'The Dry Anchor. Held their weapons overnight after the brawl.',
  },
]

export const SEED_CLUES: Omit<Clue, 'id'>[] = [
  {
    conclusion: 'The Sea’s song — pieces of it, still out in the world',
    clues: [
      { text: 'Peaches — the last note (she has never said yes)', found: false },
      { text: 'The seal-pup / Pookie / Grey-Gill’s gills — every sea-born thing hums a piece', found: false },
      { text: 'The carousel organ — the Sea’s own piece, the one it gave away', found: false },
    ],
  },
  {
    conclusion: 'The players see two pieces PULL toward each other (show once, never explain)',
    clues: [
      { text: 'A jar hums back at Peaches (Bog)', found: false },
      { text: 'The pendant warms near the seal-pup / the sealed lot (Under-Sea)', found: false },
      { text: 'Something small unlatches on its own — the table builds the finale’s theory themselves', found: false },
    ],
  },
  {
    conclusion: 'The Ones Below — what the players have learned about them',
    clues: [
      { text: 'They never take; they get you to say yes (crates behind the prize stall marked BELOW)', found: false },
      { text: 'What they hold, they hold on a promise (Grey-Gill’s name; her lockbox receipt)', found: false },
      { text: 'They cannot be fought — only outlasted, out-thought, or out-sung', found: false },
    ],
  },
  {
    conclusion: 'The Moon is coming near — and Griff saw it last time',
    clues: [
      { text: 'Wick’s charts: eleven feet of horizon gone in a lifetime', found: false },
      { text: 'Griff’s torn tide-log page — the night he was eight', found: false },
      { text: 'The moon line, every session, bigger and wronger', found: false },
    ],
  },
]
