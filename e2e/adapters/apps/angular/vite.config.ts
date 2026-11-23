import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  // The JIT compiler makes the bundle large; size doesn't matter here
  build: { chunkSizeWarningLimit: 2000 },
})
