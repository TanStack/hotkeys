import { defineConfig } from 'tsdown'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  entry: ['./src/index.ts', './src/production.ts'],
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
