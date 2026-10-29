import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts'],
  format: ['esm'],
  target: 'es2022',
  unbundle: true,
  // Unbundled output keeps each file's 'use client' directive, which
  // scripts/verify-package.ts checks, so skip rolldown's bundling warning.
  checks: { moduleLevelDirective: false },
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
