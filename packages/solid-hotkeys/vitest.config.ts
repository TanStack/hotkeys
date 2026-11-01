import { defineConfig } from 'vitest/config'
import solid from 'vite-plugin-solid'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  test: {
    watch: false,
    projects: [
      {
        plugins: [solid()],
        test: {
          name: packageJson.name,
          dir: './tests',
          exclude: ['**/*.server.test.tsx'],
          environment: 'happy-dom',
          globals: true,
          setupFiles: ['./tests/setup.ts'],
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
