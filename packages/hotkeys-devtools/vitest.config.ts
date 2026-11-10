import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [solid()],
  test: {
    name: packageJson.name,
    dir: './',
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['@tanstack/hotkeys-test-utils/setup'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // About 1 point below current coverage
      thresholds: { lines: 96, branches: 85, functions: 96, statements: 96 },
    },
    globals: true,
  },
})
