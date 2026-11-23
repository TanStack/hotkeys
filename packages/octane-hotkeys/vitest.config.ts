import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vitest/config'
export default defineConfig({
  plugins: [octane({ ssr: false })],
  test: {
    name: '@tanstack/octane-hotkeys',
    dir: './tests',
    exclude: ['**/ssr/**'],
    watch: false,
    environment: 'happy-dom',
    setupFiles: ['@tanstack/hotkeys-test-utils/setup'],
  },
})
