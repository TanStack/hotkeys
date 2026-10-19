import { defineConfig } from '@playwright/test'

/**
 * Browser behavior with Playwright's simulated keyboard, in all three engines.
 * Simulated keys skip the OS keyboard layout; layout behavior lives in
 * playwright.layouts.config.ts.
 */
export default defineConfig({
  testDir: './browser',
  globalSetup: './support/bundle.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 15_000,
  use: { trace: 'retain-on-failure' },
  // No device presets: their user agents would change platform detection,
  // while Playwright's ControlOrMeta still follows the host OS.
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
})
