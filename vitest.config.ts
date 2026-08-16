import { defineConfig } from 'vitest/config'

// Unit tests live next to the code in src/. Phone flows (e2e/) are Playwright's.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    environment: 'node',
    // Vitest blanks CSS to an empty string unless asked otherwise, which
    // would quietly hand theme.test.ts nothing to check. It reads theme.css
    // through `?raw` — this lets the real text through.
    css: { include: [/theme\.css/] },
  },
})
