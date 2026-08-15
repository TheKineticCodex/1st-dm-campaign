import { defineConfig } from 'vitest/config'

// Unit tests live next to the code in src/. Phone flows (e2e/) are Playwright's.
export default defineConfig({
  test: { include: ['src/**/*.test.ts'], environment: 'node' },
})
