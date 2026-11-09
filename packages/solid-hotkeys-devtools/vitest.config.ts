import solid from 'vite-plugin-solid'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [solid()],
  resolve: { conditions: ['browser'] },
  test: {
    name: packageJson.name,
    dir: './tests',
    watch: false,
    environment: 'happy-dom',
    globals: true,
    // The integration test mounts the real Solid panel next to the adapter: load
    // browser builds, and share one @tanstack/hotkeys instance between them.
    server: { deps: { inline: [/solid-js/, /@tanstack\//] } },
  },
})
