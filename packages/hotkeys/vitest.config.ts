import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  resolve: {
    // src/adapter.ts imports the main entry by package name
    alias: [
      {
        find: /^@tanstack\/hotkeys$/,
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
    ],
  },
  test: {
    name: packageJson.name,
    dir: './',
    watch: false,
    environment: 'happy-dom',
    // happy-dom 21 leaves iframes empty unless page loading is enabled
    environmentOptions: {
      happyDOM: { settings: { enableIframePageLoading: true } },
    },
    setupFiles: ['./tests/test-setup.ts'],
    globals: true,
  },
})
