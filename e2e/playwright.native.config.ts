import { defineConfig } from '@playwright/test'

/**
 * Nightly tests with real OS-level key input (`native/`). Each environment
 * needs its own machine setup, so run one environment's projects at a time:
 *
 * - `windows-*`: Windows, with keys sent through SendInput.
 * - `wayland-*`: Linux, inside `native/wayland/run.sh` (headless sway).
 * - `ibus-*`: Linux, inside Xvfb, a D-Bus session and `native/ibus/run.sh`.
 *
 * `.github/workflows/nightly.yml` sets each one up.
 */
const wayland = { args: ['--ozone-platform=wayland'] }

export default defineConfig({
  testDir: './native',
  globalSetup: './support/bundle.ts',
  // One keyboard and one focused window at a time.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 30_000,
  use: {
    // Real input needs a real window that can hold keyboard focus.
    headless: false,
    viewport: { width: 900, height: 560 },
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'windows-chromium',
      testMatch: 'windows.spec.ts',
      use: { browserName: 'chromium' },
    },
    {
      name: 'windows-msedge',
      testMatch: 'windows.spec.ts',
      use: { browserName: 'chromium', channel: 'msedge' },
    },
    {
      name: 'windows-firefox',
      testMatch: 'windows.spec.ts',
      use: { browserName: 'firefox' },
    },
    {
      name: 'wayland-chromium',
      testMatch: 'wayland.spec.ts',
      use: { browserName: 'chromium', launchOptions: wayland },
    },
    {
      name: 'wayland-chrome',
      testMatch: 'wayland.spec.ts',
      use: {
        browserName: 'chromium',
        channel: 'chrome',
        launchOptions: wayland,
      },
    },
    {
      name: 'wayland-firefox',
      testMatch: 'wayland.spec.ts',
      use: {
        browserName: 'firefox',
        launchOptions: {
          env: {
            ...process.env,
            MOZ_ENABLE_WAYLAND: '1',
            GDK_BACKEND: 'wayland',
          },
        },
      },
    },
    {
      name: 'ibus-chromium',
      testMatch: 'ibus.spec.ts',
      use: { browserName: 'chromium' },
    },
    {
      name: 'ibus-firefox',
      testMatch: 'ibus.spec.ts',
      use: { browserName: 'firefox' },
    },
  ],
})
