import { existsSync, readFileSync } from 'node:fs'
import { extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test as base, expect } from '@playwright/test'
import type { Page } from '@playwright/test'
import type { Fixture, FixtureRegistration } from './shared/fixture'

/** One run of the adapter specs against an app in `apps/`. */
export interface AdapterApp {
  /** Shown in test titles. */
  name: string
  /** Folder under `apps/`. */
  folder: string
  /** Appended to the page URL, such as `?strict`. */
  query?: string
  /**
   * Tests skipped for this app because of a suspected adapter bug, by test
   * title, each with its GitHub issue, such as `{ 'a sequence…': '#123' }`.
   */
  knownBugs?: Record<string, string>
}

export const adapterApps: Array<AdapterApp> = [
  { name: 'react', folder: 'react' },
  // StrictMode mounts, unmounts and remounts every effect once in development
  { name: 'react (StrictMode)', folder: 'react', query: '?strict' },
  { name: 'preact', folder: 'preact' },
  // Preact's StrictMode is a Fragment: it doesn't double-mount. Kept so the
  // Preact app runs the same tree as React's.
  { name: 'preact (StrictMode)', folder: 'preact', query: '?strict' },
  { name: 'vue', folder: 'vue' },
  { name: 'solid', folder: 'solid' },
  { name: 'svelte', folder: 'svelte' },
  { name: 'angular', folder: 'angular' },
  { name: 'lit', folder: 'lit' },
  { name: 'alpine', folder: 'alpine' },
  { name: 'octane', folder: 'octane' },
  { name: 'ember', folder: 'ember' },
]

const ORIGIN = 'http://adapters.test'

const CONTENT_TYPES: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
}

/** Serves each app's `dist` folder from a made-up origin, so no server runs. */
async function serveApps(page: Page): Promise<void> {
  await page.route(`${ORIGIN}/**`, async (route) => {
    const { pathname } = new URL(route.request().url())
    const [, folder, ...rest] = pathname.split('/')
    const file = fileURLToPath(
      new URL(
        `./apps/${folder}/dist/${rest.join('/') || 'index.html'}`,
        import.meta.url,
      ),
    )
    if (!existsSync(file)) return route.fulfill({ status: 404 })
    await route.fulfill({
      body: readFileSync(file),
      contentType: CONTENT_TYPES[extname(file)] ?? 'application/octet-stream',
    })
  })
}

/** Typed access to the app's `window.fixture`. */
function fixtureFor(page: Page) {
  const call = <TKey extends 'setShown' | 'setEnabled' | 'setHotkey'>(
    method: TKey,
    arg: Parameters<Fixture[TKey]>[0],
  ) =>
    page.evaluate(
      ([name, value]) =>
        (window.fixture![name] as (value: unknown) => void)(value),
      [method, arg] as const,
    )

  return {
    setShown: (shown: boolean) => call('setShown', shown),
    setEnabled: (enabled: boolean) => call('setEnabled', enabled),
    setHotkey: (hotkey: string) => call('setHotkey', hotkey),
    startRecording: () => page.evaluate(() => window.fixture!.startRecording()),
    /** Names logged by callbacks, in order. Clears the log. */
    takeLog: () => page.evaluate(() => window.fixture!.log.splice(0)),
    recorded: () => page.evaluate(() => window.fixture!.recorded),
    /** The key `Mod` resolves to in this page. */
    mod: () => page.evaluate(() => window.fixture!.mod),
    /** Registrations of one hotkey, such as `K` or `G G`. */
    registrationsOf: async (
      hotkey: string,
    ): Promise<Array<FixtureRegistration>> =>
      (await page.evaluate(() => window.fixture!.registrations())).filter(
        (registration) => registration.hotkey === hotkey,
      ),
  }
}

export type AppFixture = ReturnType<typeof fixtureFor>

/** Loads an app and waits until it has published `window.fixture`. */
async function open(page: Page, app: AdapterApp): Promise<AppFixture> {
  const errors: Array<string> = []
  page.on('pageerror', (error) => errors.push(error.message))
  await serveApps(page)
  await page.goto(`${ORIGIN}/${app.folder}/index.html${app.query ?? ''}`)
  await page
    .waitForFunction(() => !!window.fixture, undefined, { timeout: 10_000 })
    .catch((error: unknown) => {
      throw new Error(
        `${app.name} never published window.fixture. Page errors: ${errors.join('; ') || 'none'}`,
        { cause: error },
      )
    })
  return fixtureFor(page)
}

export const test = base.extend<{
  openApp: (app: AdapterApp) => Promise<AppFixture>
}>({
  openApp: async ({ page }, use) => {
    await use((app) => open(page, app))
  },
})

export { expect }
