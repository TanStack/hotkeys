// Playwright global setup: bundles the hotkeys source and the page harness
// into one script that each test page loads.
import { fileURLToPath } from 'node:url'
import { build } from 'esbuild'

export const BUNDLE_PATH = fileURLToPath(
  new URL('../.cache/page.js', import.meta.url),
)

export default async function bundle(): Promise<void> {
  await build({
    entryPoints: [fileURLToPath(new URL('./page.ts', import.meta.url))],
    outfile: BUNDLE_PATH,
    bundle: true,
    format: 'iife',
    target: 'es2022',
    sourcemap: 'inline',
    logLevel: 'warning',
  })
}
