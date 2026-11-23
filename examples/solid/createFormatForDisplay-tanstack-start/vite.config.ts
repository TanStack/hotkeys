import solid from '@solidjs/vite-plugin'
import { tanstackStart } from '@tanstack/solid-start/plugin/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [tanstackStart(), solid({ ssr: true })],
})
