import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: { conditions: ['browser'] },
  test: {
    environment: 'happy-dom',
    globals: true,
    // The integration test mounts the real Solid panel next to the adapter: load
    // browser builds, and share one @tanstack/hotkeys instance between them.
    server: { deps: { inline: [/solid-js/, /@tanstack\//] } },
  },
})
