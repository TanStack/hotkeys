import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('svelte').Config} */
const config = {
  preprocess: vitePreprocess(),
  compilerOptions: {
    runes: true,
  },
}

export default config
