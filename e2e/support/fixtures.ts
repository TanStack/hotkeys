import { test as base, expect } from '@playwright/test'
import { BUNDLE_PATH } from './bundle'
import type { Page } from '@playwright/test'
import type { RegisterableHotkey } from '../../packages/hotkeys/src'
import type { HarnessOptions } from './page'

type Harness = Window['harness']

/** Typed access to the in-page harness from test code. */
function harnessFor(page: Page) {
  const call = <TKey extends keyof Harness>(
    method: TKey,
    ...args: Parameters<Harness[TKey] & ((...a: Array<any>) => any)>
  ) =>
    page.evaluate(
      ([name, rest]) =>
        (window.harness[name] as (...a: Array<unknown>) => unknown)(...rest),
      [method, args] as const,
    ) as Promise<ReturnType<Harness[TKey] & ((...a: Array<any>) => any)>>

  return {
    call,
    register: (
      name: string,
      hotkey: RegisterableHotkey,
      options?: HarnessOptions,
    ) => call('register', name, hotkey, options),
    fired: () => page.evaluate(() => window.harness.fired),
    /** Names of the callbacks that ran, in order. */
    firedNames: () =>
      page.evaluate(() => window.harness.fired.map((fired) => fired.name)),
    keydowns: () => page.evaluate(() => window.harness.keydowns),
    clear: () => call('clear'),
  }
}

type LoadedHarness = ReturnType<typeof harnessFor> & {
  /**
   * The key `Mod` resolves to in this page. Use it instead of Playwright's
   * ControlOrMeta, which follows the host OS: Playwright's WebKit reports a
   * Mac user agent on Linux, so the page expects Meta there.
   */
  mod: 'Meta' | 'Control'
}

/** Loads the hotkeys bundle into a page with the given body HTML. */
async function load(page: Page, body = ''): Promise<LoadedHarness> {
  await page.setContent(`<!doctype html><html><body>${body}</body></html>`)
  await page.addScriptTag({ path: BUNDLE_PATH })
  const mod = await page.evaluate(() =>
    window.TanStackHotkeys.detectPlatform() === 'mac' ? 'Meta' : 'Control',
  )
  return { ...harnessFor(page), mod }
}

export const test = base.extend<{
  /** Loads a page with `body` and the hotkeys bundle, and returns its harness. */
  harness: (body?: string) => Promise<LoadedHarness>
}>({
  harness: async ({ page }, use) => {
    await use((body) => load(page, body))
  },
})

export { expect }
