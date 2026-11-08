// @ts-check

import node from '@astrojs/node'
import octane from '@octanejs/astro'
import { defineConfig } from 'astro/config'

export default defineConfig({
  // The Node adapter renders on-demand pages, such as the cheat sheet
  adapter: node({ mode: 'standalone' }),
  integrations: [octane()],
})
