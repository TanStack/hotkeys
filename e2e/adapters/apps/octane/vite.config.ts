import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  plugins: [octane()],
})
