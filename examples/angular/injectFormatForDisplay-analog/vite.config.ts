import analog from '@analogjs/platform'
import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    target: ['es2020'],
  },
  resolve: {
    mainFields: ['module'],
  },
  plugins: [
    analog({
      ssr: true,
      vite: { tsconfig: 'tsconfig.json' },
      // Render on every request, so labels use each user's platform. A
      // prerendered page has no request to read the platform from.
      prerender: { routes: [] },
    }),
  ],
})
