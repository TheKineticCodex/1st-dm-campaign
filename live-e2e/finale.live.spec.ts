// The living stage + the finale — against the LIVE Supabase (env from .env.local at build).
// DM Book pushes a map with light + fog and runs a fight; the stage shows the order and
// the light; then the finale: arm → the phone wakes → start → "The song, whole." everywhere.
// Not part of CI: creates a throwaway player "_gametest", a stage row and a map object —
// clean up after (see README).
import { test, expect, chromium, type Page } from '@playwright/test'

const BASE = process.env.LIVE_URL ?? 'http://localhost:4173/'

// a 4×4 grey PNG
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAIAAAAmkwkpAAAAEklEQVR4nGNgYGD4z8DAwAAABQMB/9wJ0AcAAAAASUVORK5CYII=',
  'base64',
)

async function dmSession(page: Page) {
  await page.goto(BASE)
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('seaforgot:session', JSON.stringify({ campaignCode: 'LANTERNKEEPER', playerName: 'Lantern-Keeper', deviceToken: 'dm-e2e', role: 'dm' }))
  })
  await page.reload()
  await expect(page.getByText('campaign-wide')).toBeVisible({ timeout: 15000 })
}

test('living stage: map + light + fog + the order; finale: arm → wake → sing', async () => {
  test.setTimeout(180_000)
  const browser = await chromium.launch()
  const dm = await (await browser.newContext()).newPage()
  const stage = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage()
  const pl = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage()
  dm.on('dialog', (d) => d.accept())

  await dmSession(dm)
  await dmSession(stage)

  await pl.goto(BASE)
  await pl.evaluate(() => localStorage.clear())
  await pl.reload()
  await pl.getByPlaceholder('SEAFORGOT').fill('SEAFORGOT')
  await pl.getByPlaceholder('What shall the lanterns call you?').fill('_gametest')
  await pl.getByRole('button', { name: /Step through the gate/ }).click()
  await expect(pl.getByText(/Ten questions/)).toBeVisible({ timeout: 15000 })

  await stage.getByRole('button', { name: /stage/ }).click()
  await pl.waitForTimeout(8000) // the phone's realtime channel takes a few seconds to join

  // ---- the living stage: Table → the stage remote (open by default)
  await dm.getByRole('navigation', { name: 'DM sections' }).getByRole('button', { name: 'Table', exact: true }).click()
  const fileInput = dm.locator('input[type=file]').last()
  await fileInput.setInputFiles({ name: 'e2e-map.png', mimeType: 'image/png', buffer: PNG })
  await expect(dm.getByRole('button', { name: /Change the map image/ })).toBeVisible({ timeout: 20000 })
  await expect(stage.getByRole('img', { name: 'The table map' })).toBeVisible({ timeout: 15000 })
  // an enemy token, the light, and fog
  await dm.getByRole('button', { name: /\+ enemy/ }).click()
  await expect(stage.getByLabel('Token En')).toBeVisible({ timeout: 10000 })
  await dm.getByRole('button', { name: /^🌑 night$/ }).click()
  await dm.getByRole('button', { name: /fog off/ }).click()
  await expect(dm.getByRole('button', { name: /fog on/ })).toBeVisible()
  await expect(stage.locator('canvas')).toHaveCount(1, { timeout: 10000 })

  // a fight: initiative with the enemy → the stage shows the order + turn banner
  await dm.getByPlaceholder(/Add an enemy/).fill('Enemy 1')
  await dm.getByRole('button', { name: 'add', exact: true }).click()
  await dm.getByRole('button', { name: /Begin the encounter/ }).click()
  await expect(stage.getByLabel('Initiative')).toBeVisible({ timeout: 15000 })
  await expect(stage.getByRole('status')).toContainText(/Enemy 1’s turn/, { timeout: 10000 })

  // ---- the finale
  await dm.getByRole('button', { name: /The finale — the song on every phone/ }).click()
  // the roster refreshes every 30 s; the button waits for a player
  await expect(dm.getByRole('button', { name: /Ready the phones/ })).toBeEnabled({ timeout: 45000 })
  await dm.getByRole('button', { name: /Ready the phones/ }).click()
  const fin = pl.getByRole('dialog', { name: 'The finale' })
  await expect(fin).toBeVisible({ timeout: 15000 })
  await expect(fin.getByText('The tide is in.')).toBeVisible()
  await expect(stage.getByText('The tide is in.')).toBeVisible({ timeout: 15000 })
  await fin.getByRole('button', { name: /wake it/ }).click()
  await expect(fin.getByText('Ready.')).toBeVisible()
  await expect(dm.getByText('♪ _gametest')).toBeVisible({ timeout: 10000 })
  await expect(dm.getByText(/1\/1 phones awake/)).toBeVisible()
  await dm.getByRole('button', { name: /Sing it — in three/ }).click() // confirm auto-accepted
  await expect(dm.getByText(/Singing in/)).toBeVisible()
  await expect(fin.getByText('The song, whole.')).toBeVisible({ timeout: 15000 })
  await expect(stage.getByText('The song, whole.')).toBeVisible({ timeout: 15000 })
  await dm.getByRole('button', { name: /Return to the story/ }).last().click()
  await expect(fin).toHaveCount(0, { timeout: 10000 })

  // end the fight so the live table is clean
  await dm.getByRole('button', { name: 'End encounter' }).click({ timeout: 10000 }) // confirm auto-accepted
  await expect(stage.getByLabel('Initiative')).toHaveCount(0, { timeout: 10000 })
  await browser.close()
})
