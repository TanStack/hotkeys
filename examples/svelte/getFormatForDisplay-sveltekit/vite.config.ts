import { sveltekit } from '@sveltejs/kit/vite'
import adapter from '@sveltejs/adapter-node'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    // The Node adapter builds a server that renders each request
    sveltekit({ adapter: adapter() }),
  ],
})
