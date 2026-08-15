import { defineConfig } from '@playwright/test'
// Live two-device tests: preview must already be running on 4173 built with .env.local.
export default defineConfig({ testDir: '.', timeout: 90_000, workers: 1, reporter: 'list', use: { trace: 'retain-on-failure' } })
