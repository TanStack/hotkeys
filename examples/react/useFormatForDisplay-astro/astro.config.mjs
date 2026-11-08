// @ts-check

import node from '@astrojs/node'
import react from '@astrojs/react'
import { defineConfig } from 'astro/config'

export default defineConfig({
  // The Node adapter renders on-demand pages, such as the cheat sheet
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
})
