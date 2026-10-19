import { defineConfig } from '@playwright/test'

/**
 * Keyboard layout tests with real key presses on Linux (X11). Needs DISPLAY,
 * xdotool and setxkbmap, or run them through Docker:
 * `pnpm test:e2e:layouts:docker`, which sets E2E_X11_CONTAINER and
 * E2E_WS_ENDPOINT so browsers run in the container.
 */
const wsEndpoint = process.env.E2E_WS_ENDPOINT

export default defineConfig({
  testDir: './layouts',
  globalSetup: './support/bundle.ts',
  // One X display, one keyboard layout and one focused window at a time.
  workers: 1,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['github']] : 'list',
  timeout: 20_000,
  use: {
    // Real input needs a real window that can hold X11 keyboard focus.
    headless: false,
    viewport: { width: 1000, height: 600 },
    trace: 'retain-on-failure',
    ...(wsEndpoint && { connectOptions: { wsEndpoint } }),
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
})
