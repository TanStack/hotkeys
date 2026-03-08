import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    projects: [
      './packages/hotkeys-devtools/vitest.config.ts',
      './packages/hotkeys/vitest.config.ts',
      './packages/preact-hotkeys-devtools/vitest.config.ts',
      './packages/preact-hotkeys/vitest.config.ts',
      './packages/react-hotkeys-devtools/vitest.config.ts',
      './packages/react-hotkeys/vitest.config.ts',
      './packages/solid-hotkeys-devtools/vitest.config.ts',
      './packages/solid-hotkeys/vitest.config.ts',
      './packages/angular-hotkeys/vitest.config.ts',
    ],
  },
})
