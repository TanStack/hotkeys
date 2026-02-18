import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './packages/hotkeys/vitest.config.ts',
      './packages/hotkeys-devtools/vitest.config.ts',
      './packages/react-hotkeys/vitest.config.ts',
      './packages/react-hotkeys-devtools/vitest.config.ts',
      './packages/solid-hotkeys/vitest.config.ts',
      './packages/solid-hotkeys-devtools/vitest.config.ts',
    ],
  },
})
