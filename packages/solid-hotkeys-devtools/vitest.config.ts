import solid from '@solidjs/vite-plugin'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [solid()],
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['@tanstack/hotkeys-test-utils/setup'],
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // About 1 point below current coverage
      thresholds: { lines: 99, branches: 99, functions: 99, statements: 99 },
    },
    globals: true,
    // The integration test mounts the real Solid panel next to the adapter:
    // share one @tanstack/hotkeys instance between them. The Solid plugin
    // already loads Solid's browser builds in tests.
    server: { deps: { inline: [/@tanstack\//] } },
  },
})
