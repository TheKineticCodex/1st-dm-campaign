// Two devices, one wheel — against the LIVE Supabase (env from .env.local at build).
// Not part of CI: creates a throwaway player "_wheeltest" that must be deleted after.
import { test, expect, chromium } from '@playwright/test'

test('DM arms → player spins → both land on the same wedge', async () => {
  test.setTimeout(90_000)
  const browser = await chromium.launch()
  const dmCtx = await browser.newContext()
  const plCtx = await browser.newContext({ viewport: { width: 390, height: 844 } })
  const dm = await dmCtx.newPage()
  const pl = await plCtx.newPage()

  await dm.goto('' + (process.env.LIVE_URL ?? 'http://localhost:4173/') + '')
  await dm.evaluate(() => { localStorage.clear(); localStorage.setItem('seaforgot:session', JSON.stringify({ campaignCode: 'LANTERNKEEPER', playerName: 'Lantern-Keeper', deviceToken: 'dm-e2e', role: 'dm' })) })
  await dm.reload()
  await expect(dm.getByText('campaign-wide')).toBeVisible({ timeout: 15000 })

  // player joins for real (creates the _wheeltest row)
  await pl.goto('' + (process.env.LIVE_URL ?? 'http://localhost:4173/') + '')
  await pl.evaluate(() => localStorage.clear())
  await pl.reload()
  await pl.getByPlaceholder('SEAFORGOT').fill('SEAFORGOT')
  await pl.getByPlaceholder('What shall the lanterns call you?').fill('_wheeltest')
  await pl.getByRole('button', { name: /Step through the gate/ }).click()
  await expect(pl.getByText(/Ten questions/)).toBeVisible({ timeout: 15000 })
  await pl.waitForTimeout(2500) // let the channel join

  // DM → Table → the wheel
  await dm.getByRole('button', { name: 'Table', exact: true }).click()
  await dm.getByRole('button', { name: /The Fortune Wheel/ }).click()
  await dm.getByLabel('Where it lands').selectOption('2') // rig: wedge 3
  await dm.getByRole('button', { name: /Arm the wheel/ }).click()
  await expect(dm.getByText(/Armed\./)).toBeVisible({ timeout: 10000 })

  // player sees the wheel and spins
  const dialog = pl.getByRole('dialog', { name: 'The Fortune Wheel' })
  await expect(dialog).toBeVisible({ timeout: 15000 })
  await dialog.getByRole('button', { name: /Spin the wheel/ }).click()

  // DM decides + broadcasts end; both show landing on 3
  await expect(dm.getByText(/Landed on 3:/)).toBeVisible({ timeout: 15000 })
  await expect(dialog.getByText(/your fortune/i)).toBeVisible({ timeout: 15000 })
  const fortune = await dialog.locator('p').filter({ hasText: /applause/ }).count()
  expect(fortune).toBeGreaterThan(0)

  // whisper it, then return to story clears the phone
  await dm.getByRole('button', { name: /Whisper the fortune to _wheeltest/ }).click()
  await dm.getByRole('button', { name: /Return to the story/ }).click()
  await expect(dialog).toHaveCount(0, { timeout: 10000 })
  await browser.close()
})
