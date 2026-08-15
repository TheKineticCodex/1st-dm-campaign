// Phone flows, on two engines: an iPhone (WebKit) and a Pixel (Chromium).
// Emulation catches layout/touch-flow regressions — not real iOS Safari
// quirks or real device performance. Keep the manual real-phone walk.
//
//   npm run test:e2e          (builds, previews, runs both projects)
//   npx playwright test --ui  (interactive)

import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run build && npx vite preview --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: 'iphone', use: { ...devices['iPhone 15'] } },
    { name: 'pixel', use: { ...devices['Pixel 7'] } },
  ],
})
