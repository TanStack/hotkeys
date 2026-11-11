// Playwright global setup: bundles the hotkeys source and the page harness
// into one script that each test page loads.
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'
import type { BuildOptions } from 'esbuild'

/**
 * The bundle most tests load. `process.env.NODE_ENV` becomes `'development'`,
 * as a dev server does it, and the page has no `process` global.
 */
export const BUNDLE_PATH = fileURLToPath(
  new URL('../.cache/page.js', import.meta.url),
)

/** As a production build does it: `'production'`, minified. */
export const PRODUCTION_BUNDLE_PATH = fileURLToPath(
  new URL('../.cache/page.production.js', import.meta.url),
)

/** As a page with no bundler gets it: `process.env.NODE_ENV` is left in. */
export const UNREPLACED_BUNDLE_PATH = fileURLToPath(
  new URL('../.cache/page.unreplaced.js', import.meta.url),
)

export default async function bundle(): Promise<void> {
  const page: BuildOptions = {
    entryPoints: [fileURLToPath(new URL('./page.ts', import.meta.url))],
    bundle: true,
    format: 'iife',
    target: 'es2022',
    logLevel: 'warning',
  }
  await Promise.all([
    build({
      ...page,
      outfile: BUNDLE_PATH,
      define: { 'process.env.NODE_ENV': '"development"' },
      sourcemap: 'inline',
    }),
    build({
      ...page,
      outfile: PRODUCTION_BUNDLE_PATH,
      define: { 'process.env.NODE_ENV': '"production"' },
      minify: true,
    }),
    build({
      ...page,
      outfile: UNREPLACED_BUNDLE_PATH,
      // esbuild replaces it by default in a browser bundle
      define: { 'process.env.NODE_ENV': 'process.env.NODE_ENV' },
    }),
  ])
}
