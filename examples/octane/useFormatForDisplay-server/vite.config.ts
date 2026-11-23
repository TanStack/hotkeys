import { octane } from 'octane/compiler/vite'
import { defineConfig } from 'vite'

// The plugin compiles server code for `vite build --ssr` and SSR module loading
export default defineConfig({ plugins: [octane()] })
