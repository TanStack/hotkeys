import { fileURLToPath } from 'node:url'
import { defineConfig } from '@playwright/test'
import { exampleUrl, examples } from './ssr/examples'

/**
 * The server-rendered cheat sheet examples: labels in the server's HTML follow
 * the request's User-Agent header, and the page hydrates without mismatches.
 * Runs against production builds; `pnpm test:e2e:ssr` at the repository root
 * builds the examples first.
 */
export default defineConfig({
  testDir: './ssr',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 30_000,
  use: { trace: 'retain-on-failure' },
  // Chromium only: these tests check the frameworks' server rendering and
  // hydration, not browser differences, which the browser suite covers.
  projects: [{ name: 'chromium', use: { browserName: 'chromium' } }],
  webServer: examples.map((example) => ({
    name: example.folder,
    command: example.command,
    cwd: fileURLToPath(
      new URL(`../examples/${example.folder}`, import.meta.url),
    ),
    url: exampleUrl(example),
    env: { PORT: String(example.port) },
    reuseExistingServer: !process.env.CI,
    // Nineteen servers start at once
    timeout: 120_000,
    stdout: 'ignore',
    stderr: 'pipe',
  })),
})
