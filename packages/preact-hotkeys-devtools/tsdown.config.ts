import preact from '@preact/preset-vite'
import { defineConfig } from 'tsdown'

export default defineConfig({
  plugins: [preact()],
  entry: ['./src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  unbundle: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  fixedExtension: false,
  exports: true,
  publint: {
    strict: true,
  },
})
