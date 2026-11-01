// @ts-check
import { defineConfig } from 'astro/config'
import node from '@astrojs/node'
import preact from '@astrojs/preact'

export default defineConfig({
  // The Node adapter renders on-demand pages, such as the cheat sheet
  adapter: node({ mode: 'standalone' }),
  integrations: [preact()],
})
