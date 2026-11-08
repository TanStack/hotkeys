import { tanstackConfig } from '@tanstack/oxfmt-config'
import { defineConfig } from 'oxfmt'

export default defineConfig({
  ...tanstackConfig,
  svelte: true,
  ignorePatterns: [
    ...tanstackConfig.ignorePatterns,
    '**/.angular',
    '**/.astro',
    '**/.nitro',
    '**/.nuxt',
    '**/.nx',
    '**/.output',
    '**/.react-router',
    '**/.tanstack',
    '**/.vinxi',
    '**/.vitepress/cache',
    '**/.vitepress/dist',
    '**/docs',
    '**/old-examples',
    '**/playwright-report',
    '**/test-results',
    // TanStack Router regenerates this on build, in an order `sortImports` rejects
    '**/routeTree.gen.ts',
  ],
})
