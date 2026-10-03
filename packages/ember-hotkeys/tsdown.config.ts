import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  deps: { neverBundle: [/^@ember\//] },
  exports: false,
  format: ['esm'],
  target: 'es2022',
  unbundle: true,
  dts: true,
  sourcemap: false,
  clean: true,
  minify: false,
  fixedExtension: false,
  publint: {
    strict: true,
  },
})
