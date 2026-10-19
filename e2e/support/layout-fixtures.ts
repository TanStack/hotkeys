import { test as base, expect } from './fixtures'
import { focusBrowserWindow, press, setLayout } from './x11'
import type { ObservedKeydown } from './page'
import type { Page } from '@playwright/test'

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

/** Mounts the harness on Linux, watches `bindings`, and registers `registered`. */
export function useLayout(
  layout: Layout,
  bindings: Array<string>,
  registered: Array<string> = [],
) {
  const [, name, variant] = layout.match(/^([^(]+)(?:\((.+)\))?$/)!
  const test = base.extend<{ keyboard: LayoutKeyboard }>({
    keyboard: async ({ page, harness }, use) => {
      setLayout(name!, variant)
      const hk = await harness()
      await hk.call('setPlatform', 'linux')
      await hk.call('observe', bindings)
      for (const binding of registered) {
        await hk.register(binding, binding as never)
      }
      focusBrowserWindow()
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
