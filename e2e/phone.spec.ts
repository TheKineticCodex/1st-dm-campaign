// The flows that would ruin a session if they broke. Runs against the built
// app in offline mode (no Supabase env) — the device is the whole world, so
// we seed localStorage exactly the way a phone would hold it.

import { expect, test, type Page } from '@playwright/test'

const fighter = {
  build: {
    name: 'Philip',
    species: 'Halfling',
    klass: 'Fighter',
    bg: 'Soldier',
    bump2: 'STR',
    bump1: 'CON',
    assign: { STR: 15, DEX: 14, CON: 13, INT: 10, WIS: 12, CHA: 8 },
    skills: ['Perception', 'Insight'],
    subclass: 'Battle Master',
    level: 4,
    feats: ['Sentinel'],
    asi: { STR: 1 },
  },
  state: { damage: 5, slotsUsed: 0, deathSaves: { successes: 0, failures: 0 }, conditions: [] },
  notes: { appearance: '', personality: '', lost: '', notes: '' },
  updatedAt: new Date().toISOString(),
}

const druid = {
  build: {
    name: 'Peaches',
    species: 'Aasimar',
    klass: 'Druid',
    bg: 'Sailor',
    bump2: 'WIS',
    bump1: 'CON',
    assign: { STR: 10, DEX: 14, CON: 13, INT: 8, WIS: 15, CHA: 12 },
    skills: ['Nature', 'Perception'],
    subclass: 'Circle of the Sea',
    level: 3,
  },
  state: { damage: 0, slotsUsed: 0, deathSaves: { successes: 0, failures: 0 }, conditions: [] },
  notes: { appearance: '', personality: '', lost: '', notes: '' },
  updatedAt: new Date().toISOString(),
}

async function seedPlayer(page: Page, name: string, character: unknown, extra: Record<string, unknown> = {}) {
  await page.goto('/')
  await page.evaluate(
    ({ name, character, extra }) => {
      const K = (n: string) => `seaforgot:${n}`
      localStorage.clear()
      localStorage.setItem(K('session'), JSON.stringify({ campaignCode: 'SEAFORGOT', playerName: name, deviceToken: `e2e-${name}`, role: 'player' }))
      localStorage.setItem(K('character'), JSON.stringify(character))
      localStorage.setItem(K('handouts'), '[]')
      localStorage.setItem(K('announced-level'), String((character as { build: { level: number } }).build.level))
      for (const [k, v] of Object.entries(extra)) localStorage.setItem(K(k), typeof v === 'string' ? v : JSON.stringify(v))
    },
    { name, character, extra },
  )
  await page.reload()
}

test('joining: code + name lands on the Fortune tab, and the session survives a reload', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
  await page.getByPlaceholder('SEAFORGOT').fill('SEAFORGOT')
  await page.getByPlaceholder('What shall the lanterns call you?').fill('Test Traveler')
  await page.getByRole('button', { name: /Step through the gate/ }).click()
  await expect(page.getByText(/Ten questions\. The lanterns will read/)).toBeVisible()
  await page.reload()
  await expect(page.getByText(/Test Traveler/)).toBeVisible()
  await expect(page.getByPlaceholder('SEAFORGOT')).toHaveCount(0)
})

test('the sheet: vitals, abilities with pips, HP amount, and a roll', async ({ page }) => {
  await seedPlayer(page, 'Philip', fighter)
  await expect(page.getByText('♥ 31/36')).toBeVisible()
  await expect(page.getByText('Level 4 · Battle Master')).toBeVisible()
  await expect(page.getByText(/Combat Superiority/).first()).toBeVisible()
  // spend a Second Wind pip
  await page.getByRole('button', { name: 'Second Wind use 1 available' }).click()
  await expect(page.getByRole('button', { name: 'Second Wind use 1 spent' })).toBeVisible()
  // take 7 damage in one go
  await page.getByRole('button', { name: 'more…' }).click()
  await page.getByLabel('Amount of damage or healing').fill('7')
  await page.getByRole('button', { name: '− hurt' }).click()
  await expect(page.getByText('♥ 24/36')).toBeVisible()
  // roll: attack streams a result card
  await page.getByRole('button', { name: /Longsword/ }).click()
  await expect(page.getByText(/to hit|Attack/).first()).toBeVisible()
  // the tray in the sticky bar
  await page.getByRole('button', { name: '🎲 Roll' }).click()
  await page.getByRole('button', { name: 'd6', exact: true }).click()
  await page.getByRole('button', { name: /^🎲 Roll 1d6/ }).click()
  await expect(page.getByText(/1d6 · \[\d\]/)).toBeVisible()
})

test('spells: a druid casts Entangle, spends a slot, and lights concentration', async ({ page }) => {
  await seedPlayer(page, 'Peaches capiche', druid)
  await expect(page.getByText('1st-level 4 of 4 slots left')).toBeVisible()
  await page.getByRole('button', { name: /^Entangle/ }).first().click()
  await page.getByRole('button', { name: /Cast with a 1st slot/ }).click()
  await expect(page.getByText('1st-level 3 of 4 slots left')).toBeVisible()
  await expect(page.getByRole('button', { name: /Concentrating — tap when the spell ends/ })).toBeVisible()
  // the Spells tab exists for a caster and lists the whole druid list
  await page.getByRole('button', { name: /Spells/ }).click()
  await expect(page.getByText(/spells · you can cast up to 2nd level/)).toBeVisible()
})

test('level-up: an announced level 3 opens the ceremony; choosing a path seals it', async ({ page }) => {
  const lvl1 = { ...fighter, build: { ...fighter.build, level: 1, subclass: null, feats: undefined, asi: undefined } }
  await seedPlayer(page, 'Philip', lvl1, {
    handouts: [{ id: 'lvl3', target: null, title: '✦ Level 3', body: '(Level 3)', level: 3, sentAt: new Date().toISOString() }],
    'handouts-seen': ['lvl3'],
    'announced-level': '3',
  })
  await expect(page.getByText(/the Feywild notices you/i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Rise to level 3/ })).toBeDisabled()
  await page.getByRole('button', { name: /^Champion/ }).click()
  await page.getByRole('button', { name: /Rise to level 3/ }).click()
  await expect(page.getByText('Level 3 · Champion')).toBeVisible()
  await page.getByRole('button', { name: /Features, traits & equipment/ }).click()
  await expect(page.getByText(/Improved Critical/).first()).toBeVisible()
})

test('the guide: search finds an action, a condition, and a guide card', async ({ page }) => {
  await seedPlayer(page, 'Philip', fighter)
  await page.getByRole('button', { name: /Guide/ }).click()
  await page.getByLabel('Search the rules').fill('grapple')
  await expect(page.getByRole('button', { name: /^Grapple(?!d)/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /^Grappled/ })).toBeVisible()
  await expect(page.getByRole('button', { name: /Grappling & shoving/ })).toBeVisible()
})

test('battle mode: your turn takes over the phone, shows what you can do, then drops to the sheet', async ({ page }) => {
  await seedPlayer(page, 'Philip', fighter, {
    encounter: {
      id: 'enc1',
      active: true,
      activeIndex: 1,
      order: [
        { id: 'a', name: 'The Understudy', init: 18, isPc: false },
        { id: 'b', name: 'Philip', init: 15, isPc: true, playerName: 'Philip' },
        { id: 'c', name: 'Peaches', init: 12, isPc: true, playerName: 'Peaches capiche' },
      ],
    },
  })
  const dialog = page.getByRole('dialog', { name: 'Your turn' })
  await expect(dialog).toBeVisible()
  await expect(dialog.getByText('Your turn', { exact: true })).toBeVisible()
  await expect(dialog.getByText(/Attack/)).toBeVisible()
  await expect(dialog.getByText(/Second Wind/)).toBeVisible()
  await expect(dialog.getByText(/Combat Superiority/)).toBeVisible()
  await expect(dialog.getByText(/Dodge/)).toBeVisible()
  await dialog.getByRole('button', { name: /Let’s go/ }).click()
  await expect(dialog).toHaveCount(0)
  // the strip stays while it's still your turn
  await expect(page.getByRole('status')).toContainText('Your turn')
})

test('battle mode: at 0 HP the death-save ceremony shows and the DM-facing vitals reflect it', async ({ page }) => {
  const down = { ...fighter, state: { ...fighter.state, damage: 36 } }
  await seedPlayer(page, 'Philip', down)
  await expect(page.getByText('Death saving throws — hold on')).toBeVisible()
  await expect(page.getByRole('button', { name: /Roll a death save/ })).toBeVisible()
  await expect(page.getByText('♥ 0/36')).toBeVisible()
})
