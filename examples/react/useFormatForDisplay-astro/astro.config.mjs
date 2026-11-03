// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import react from '@astrojs/react'

export default defineConfig({
  // The Node adapter renders on-demand pages, such as the cheat sheet
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
})
