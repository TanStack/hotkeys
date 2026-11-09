import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  test: {
    watch: false,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      // About 1 point below current coverage
      thresholds: { lines: 84, branches: 82, functions: 79, statements: 84 },
    },
    projects: [
      {
        plugins: [solid()],
        test: {
          name: packageJson.name,
          dir: './tests',
          exclude: ['**/*.server.test.tsx'],
          environment: 'happy-dom',
          setupFiles: [
            '@tanstack/hotkeys-test-utils/setup',
            './tests/setup.ts',
          ],
          globals: true,
        },
      },
      // Server rendering needs Solid's server build and SSR-compiled JSX.
      {
        plugins: [solid({ ssr: true })],
        test: {
          name: `${packageJson.name}:server`,
          dir: './tests',
          include: ['**/*.server.test.tsx'],
          environment: 'node',
        },
      },
    ],
  },
})
