import { defineConfig } from '@playwright/test'

/**
 * Each framework adapter in a real browser: a small app per adapter in
 * adapters/apps, built with Vite ahead of time. `pnpm test:e2e:adapters` at
 * the repository root builds them first.
 */
export default defineConfig({
  testDir: './adapters',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  failOnFlakyTests: !!process.env.CI,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 15_000,
  use: { trace: 'retain-on-failure' },
  // No device presets: their user agents would change platform detection.
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
})
