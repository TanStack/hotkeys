import { defineConfig } from 'vite'
import { octane } from 'octane/compiler/vite'

// The plugin compiles server code for `vite build --ssr` and SSR module loading
export default defineConfig({ plugins: [octane()] })
