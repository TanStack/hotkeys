import { defineConfig } from 'vitest/config'
import { octane } from 'octane/compiler/vite'

export default defineConfig({
  plugins: [octane({ ssr: true })],
  test: {
    name: '@tanstack/octane-hotkeys:ssr',
    include: ['tests/ssr/**/*.test.ts'],
    watch: false,
    environment: 'node',
  },
})
