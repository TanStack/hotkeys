import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import packageJson from './package.json' with { type: 'json' }

export default defineConfig({
  plugins: [react()],
  resolve: { conditions: ['browser'] },
  test: {
    name: packageJson.name,
    dir: './',
    watch: false,
    environment: 'happy-dom',
    globals: true,
    // The integration test mounts the real Solid panel next to the adapter: load
    // browser builds, and share one @tanstack/hotkeys instance between them.
    server: { deps: { inline: [/solid-js/, /@tanstack\//] } },
  },
})
