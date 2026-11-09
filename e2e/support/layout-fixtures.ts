import { test as base, expect } from './fixtures'
import { focusBrowserWindow, press, setLayout } from './x11'
import type { Page } from '@playwright/test'
import type { LoadedHarness } from './fixtures'
import type { ObservedKeydown } from './page'

/** A layout as setxkbmap takes it: `'no'`, `'us(dvorak)'`, `'tanstack(winno)'`. */
export type Layout = `${string}` | `${string}(${string})`

export interface LayoutKeyboard {
  /**
   * Presses real keys and returns the single keydown the page saw, with the
   * observed bindings that matched it, plus the names of registered hotkeys
   * that fired.
   */
  press: (
    combo: string,
  ) => Promise<{ keydown: ObservedKeydown; fired: Array<string> }>
  /** Presses real keys while a recorder runs and returns its result. */
  record: (
    combo: string,
    options?: { recordBy?: 'code' | 'key' },
  ) => Promise<unknown>
}

/** Setup that applies to every case of a `useLayout` call. */
export interface LayoutOptions {
  /** NumLock state for each test. Default: off. */
  numLock?: boolean
}

/**
 * Mounts the harness on Linux, watches `bindings`, and registers `registered`.
 * The page has an HTTPS URL, so Chromium's `navigator.keyboard.getLayoutMap()`
 * works (it needs a secure context).
 */
export function useLayout(
  layout: Layout,
  bindings: Array<string>,
  registered: Array<string> = [],
  { numLock = false }: LayoutOptions = {},
) {
  const [, name, variant] = layout.match(/^([^(]+)(?:\((.+)\))?$/)!
  const test = base.extend<{ keyboard: LayoutKeyboard }>({
    keyboard: async ({ page, harness }, use) => {
      setLayout(name!, variant)
      await page.route(PAGE_URL, (route) =>
        route.fulfill({ contentType: 'text/html', body: '' }),
      )
      await page.goto(PAGE_URL)
      const hk = await harness()
      await hk.call('setPlatform', 'linux')
      await hk.call('observe', bindings)
      for (const binding of registered) {
        await hk.register(binding, binding as never)
      }
      const probe = await waitForKeyboardInput(page, hk)
      // X11 keeps NumLock across tests, so every test sets the state it needs.
      if (probe.numLock !== numLock) await toggleNumLock(page, hk, numLock)
      await use({
        press: async (combo) => {
          await hk.clear()
          press(combo)
          const keydown = await nextKeydown(page)
          return { keydown, fired: await hk.firedNames() }
        },
        record: async (combo, options) => {
          await hk.call('startRecorder', options)
          press(combo)
          await page.waitForFunction(
            () => window.harness.recorderState().recorded !== undefined,
            undefined,
            { timeout: 2000 },
          )
          const { recorded } = await hk.call('recorderState')
          await hk.call('stopRecorder')
          return recorded
        },
      })
    },
  })
  return test
}

/**
 * Focuses the browser window and waits until real key presses reach the page.
 * Right after Chromium starts, it can drop the first press, so this probes
 * with Escape, which no layout test uses, and focuses again until one arrives.
 * A press that never arrives would otherwise fail the first test case.
 * Returns the probe's keydown.
 */
export async function waitForKeyboardInput(
  page: Page,
  hk: LoadedHarness,
): Promise<ObservedKeydown> {
  for (let attempt = 1; attempt <= 5; attempt++) {
    focusBrowserWindow()
    await hk.clear()
    press('Escape')
    const arrived = await page
      .waitForFunction(() => window.harness.keydowns.length > 0, undefined, {
        timeout: 1000,
      })
      .then(
        () => true,
        () => false,
      )
    if (arrived) {
      // Let the probe's keyup reach the page before the test presses keys.
      await page.waitForTimeout(50)
      const [probe] = await hk.keydowns()
      await hk.clear()
      return probe!
    }
    const state = await page.evaluate(() => ({
      hasFocus: document.hasFocus(),
      visibility: document.visibilityState,
      activeElement: document.activeElement?.tagName,
    }))
    console.warn(
      `Probe key press ${attempt} didn't reach the page: ${JSON.stringify(state)}`,
    )
  }
  throw new Error('Real key presses never reached the page')
}

const PAGE_URL = 'https://hotkeys.test/'

/**
 * Presses NumLock, then checks the state on an Escape press. Browsers differ
 * on whether the NumLock keydown itself reports the old or the new state.
 */
async function toggleNumLock(
  page: Page,
  hk: LoadedHarness,
  on: boolean,
): Promise<void> {
  press('NumLock')
  await page.waitForTimeout(50)
  await hk.clear()
  press('Escape')
  const { numLock } = await nextKeydown(page)
  expect(numLock, 'NumLock state after pressing it').toBe(on)
  await hk.clear()
}

async function nextKeydown(page: Page): Promise<ObservedKeydown> {
  await page.waitForFunction(
    () => window.harness.keydowns.length > 0,
    undefined,
    {
      timeout: 2000,
    },
  )
  // Let the matching keyup reach the page before the next press.
  await page.waitForTimeout(50)
  const keydowns = await page.evaluate(() => window.harness.keydowns)
  expect(keydowns, 'one non-modifier keydown per press').toHaveLength(1)
  return keydowns[0]!
}

export { expect }
