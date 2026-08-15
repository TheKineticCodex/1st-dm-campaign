// Three screens, one game — against the LIVE Supabase (env from .env.local at build).
// DM Book hosts, a phone plays, the iPad stage shows the board.
// Not part of CI: creates a throwaway player "_gametest" that must be deleted after.
import { test, expect, chromium, type Page } from '@playwright/test'

const BASE = process.env.LIVE_URL ?? 'http://localhost:4173/'

async function dmSession(page: Page) {
  await page.goto(BASE)
  await page.evaluate(() => {
    localStorage.clear()
    localStorage.setItem('seaforgot:session', JSON.stringify({ campaignCode: 'LANTERNKEEPER', playerName: 'Lantern-Keeper', deviceToken: 'dm-e2e', role: 'dm' }))
  })
  await page.reload()
  await expect(page.getByText('campaign-wide')).toBeVisible({ timeout: 15000 })
}

test('Hold the Note → The Toll: phone plays, stage shows the board, DM whispers the prize', async () => {
  test.setTimeout(150_000)
  const browser = await chromium.launch()
  const dm = await (await browser.newContext()).newPage()
  const stage = await (await browser.newContext({ viewport: { width: 1180, height: 820 } })).newPage()
  const pl = await (await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true })).newPage()

  await dmSession(dm)
  await dmSession(stage)

  // player joins for real (creates the _gametest row)
  await pl.goto(BASE)
  await pl.evaluate(() => localStorage.clear())
  await pl.reload()
  await pl.getByPlaceholder('SEAFORGOT').fill('SEAFORGOT')
  await pl.getByPlaceholder('What shall the lanterns call you?').fill('_gametest')
  await pl.getByRole('button', { name: /Step through the gate/ }).click()
  await expect(pl.getByText(/Ten questions/)).toBeVisible({ timeout: 15000 })

  // stage: open the ambient screen (it listens for game state)
  await stage.getByRole('button', { name: /stage/ }).click()
  await pl.waitForTimeout(2500) // channels join

  // DM → Table → Carnival games → Hold the Note (short)
  await dm.getByRole('button', { name: 'Table', exact: true }).click()
  await dm.getByRole('button', { name: /The game booth/ }).click()
  await dm.getByRole('button', { name: /^🎵 Hold the Note/ }).click()
  await dm.getByLabel(/seconds/).fill('12')
  await dm.getByRole('button', { name: /Start .*Hold the Note/ }).click()
  await expect(dm.getByText(/Hold the Note — live/)).toBeVisible({ timeout: 10000 })

  // phone gets the controller; stage gets the board
  const dialog = pl.getByRole('dialog', { name: /Hold the Note/ })
  await expect(dialog).toBeVisible({ timeout: 15000 })
  await expect(stage.getByRole('heading', { name: 'Hold the Note' })).toBeVisible({ timeout: 15000 })

  // hold through the whole thing (intro is 6s; then 12s of holding)
  const hold = dialog.getByRole('button', { name: /Hold your note/ })
  await expect(hold).toBeEnabled({ timeout: 15000 })
  const box = await hold.boundingBox()
  if (!box) throw new Error('no hold button')
  await pl.mouse.move(box.x + box.width / 2, box.y + box.height / 2)
  await pl.mouse.down()
  // the chord climbs on the stage while the only player holds
  await expect(stage.getByText(/held together [1-9]/)).toBeVisible({ timeout: 15000 })
  await expect(dm.getByText(/holding: _gametest/)).toBeVisible({ timeout: 10000 })
  await expect(dialog.getByText(/the end/)).toBeVisible({ timeout: 25000 })
  await pl.mouse.up()
  await expect(dialog.getByText(/You held it/)).toBeVisible({ timeout: 5000 })
  await expect(stage.getByText(/The tune came/)).toBeVisible({ timeout: 5000 })

  // whisper the prize → sealed envelope on the phone after we return to the story
  await dm.getByRole('button', { name: /Whisper the prize/ }).click()
  await expect(dm.getByText(/Prize whispered/)).toBeVisible()
  await dm.getByRole('button', { name: /Return to the story/ }).click()
  await expect(dialog).toHaveCount(0, { timeout: 10000 })
  await expect(pl.getByText(/Hold the Note · the prize/)).toBeVisible({ timeout: 15000 })

  // ---- The Toll
  await dm.getByRole('button', { name: /^🕯 The Toll/ }).click()
  await dm.getByPlaceholder('Or ask your own…').fill('What would you never sell?')
  await dm.getByRole('button', { name: /Start .*The Toll/ }).click()
  const toll = pl.getByRole('dialog', { name: /The Toll/ })
  await expect(toll).toBeVisible({ timeout: 15000 })
  await expect(toll.getByText(/What would you never sell/)).toBeVisible()
  await toll.getByPlaceholder(/One true answer/).fill('Pookie')
  await toll.getByRole('button', { name: /Seal it/ }).click()
  await expect(dm.getByText(/1\/1 sealed/)).toBeVisible({ timeout: 10000 })
  await expect(stage.getByText(/1 of 1 sealed/)).toBeVisible({ timeout: 10000 })
  await dm.getByRole('button', { name: /Put the answers up/ }).click()
  await expect(stage.getByText('Pookie')).toBeVisible({ timeout: 10000 })
  await expect(stage.getByText('— ?')).toBeVisible()
  await dm.getByRole('button', { name: /Reveal the next name/ }).click()
  await expect(stage.getByText('— _gametest')).toBeVisible({ timeout: 10000 })
  await expect(toll.getByText('— _gametest')).toBeVisible({ timeout: 10000 })
  await dm.getByRole('button', { name: /Return to the story/ }).click()
  await expect(toll).toHaveCount(0, { timeout: 10000 })

  // ---- Draw the Missing Piece: the lone player is the artist; a stroke reaches the stage canvas
  await dm.getByRole('button', { name: /^🎨 Draw the Missing Piece/ }).click()
  await dm.getByLabel(/rounds/).fill('1')
  await dm.getByLabel(/seconds each/).fill('20')
  await dm.getByRole('button', { name: /Start .*Draw the Missing Piece/ }).click()
  const draw = pl.getByRole('dialog', { name: /Draw the Missing Piece/ })
  await expect(draw).toBeVisible({ timeout: 15000 })
  await expect(stage.getByRole('heading', { name: 'Draw the Missing Piece' })).toBeVisible({ timeout: 15000 })
  await expect(draw.getByText(/^draw/)).toBeVisible({ timeout: 10000 }) // artist sees the word
  const canvas = draw.locator('canvas')
  const cb = await canvas.boundingBox()
  if (!cb) throw new Error('no canvas')
  await pl.mouse.move(cb.x + cb.width * 0.2, cb.y + cb.height * 0.2)
  await pl.mouse.down()
  for (let i = 1; i <= 10; i++) await pl.mouse.move(cb.x + cb.width * (0.2 + i * 0.06), cb.y + cb.height * (0.2 + i * 0.05), { steps: 3 })
  await pl.mouse.up()
  await expect
    .poll(
      async () =>
        stage.locator('canvas').evaluate((c) => {
          const el = c as HTMLCanvasElement
          const d = el.getContext('2d')!.getImageData(0, 0, el.width, el.height).data
          let dark = 0
          for (let i = 0; i < d.length; i += 4) if (d[i] < 100) dark++
          return dark
        }),
      { timeout: 10000 },
    )
    .toBeGreaterThan(50)
  await dm.getByRole('button', { name: /Return to the story/ }).click()
  await expect(draw).toHaveCount(0, { timeout: 10000 })

  // ---- The Bargain: sealed bid → close → open → take; the stage shows the envelope
  await dm.getByRole('button', { name: /^⚖ The Bargain/ }).click()
  await dm.getByPlaceholder('Or put your own thing on the table…').fill('A door that opens home. Once.')
  await dm.getByRole('button', { name: /Start .*The Bargain/ }).click()
  const bargain = pl.getByRole('dialog', { name: /The Bargain/ })
  await expect(bargain).toBeVisible({ timeout: 15000 })
  await expect(stage.getByRole('heading', { name: /A door that opens home/ })).toBeVisible({ timeout: 15000 })
  await bargain.getByRole('button', { name: /a promise/ }).click()
  await bargain.getByPlaceholder(/which one\? Say it plainly/).fill('I will go home when this is done')
  await bargain.getByRole('button', { name: /Seal the bid/ }).click()
  await expect(dm.getByText(/1\/1 sealed/)).toBeVisible({ timeout: 10000 })
  await expect(stage.getByText('a promise')).toBeVisible({ timeout: 10000 })
  await expect(stage.getByText('sealed', { exact: true })).toBeVisible()
  await dm.getByRole('button', { name: /Close the bids/ }).click()
  await expect(stage.getByText(/The bids are closed/)).toBeVisible({ timeout: 10000 })
  await dm.getByRole('button', { name: 'open', exact: true }).click()
  await expect(stage.getByText('I will go home when this is done')).toBeVisible({ timeout: 10000 })
  await dm.getByRole('button', { name: /take this one/ }).click()
  await expect(stage.getByText(/The Buyer takes _gametest’s/)).toBeVisible({ timeout: 10000 })
  await expect(bargain.getByText(/The Buyer takes yours/)).toBeVisible({ timeout: 10000 })
  await dm.getByRole('button', { name: /Return to the story/ }).click()
  await expect(bargain).toHaveCount(0, { timeout: 10000 })

  await browser.close()
})
