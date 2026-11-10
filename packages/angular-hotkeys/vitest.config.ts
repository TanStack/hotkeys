import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['@tanstack/hotkeys-test-utils/setup', './tests/setup.ts'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // About 1 point below current coverage
      thresholds: { lines: 95, branches: 86, functions: 93, statements: 95 },
    },
    globals: true,
  },
})
