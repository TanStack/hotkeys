import { defineConfig, mergeConfig } from 'vitest/config'
import base from './vitest.config'

// Oracle files only, in the package's own environment (happy-dom, setup
// files, the @tanstack/hotkeys alias). Run them through `oracle-gaps`.
export default mergeConfig(
  base,
  defineConfig({
    test: {
      include: ['tests/oracles/**/*.oracle.ts'],
    },
  }),
)
