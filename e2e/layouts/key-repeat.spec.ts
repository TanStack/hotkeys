// A key held down for real, so the X server sends auto-repeat keydowns.
//
// requireReset and sequences tell a held key from a new press by
// event.repeat. Mozilla bug 1594003 reports that Firefox on X11 can send
// repeat: false on auto-repeats (see BUG-070). These tests check what each
// browser reports here, and that a held key fires a requireReset hotkey once
// and doesn't advance a sequence.
import { expect, test } from '../support/fixtures'
import { waitForKeyboardInput } from '../support/layout-fixtures'
import {
  keyDown,
  keyUp,
  press,
  resetAutoRepeat,
  setAutoRepeat,
  setLayout,
} from '../support/x11'
import type { Page } from '@playwright/test'
import type { LoadedHarness } from '../support/fixtures'

/** Longer than the 250ms auto-repeat delay, so about 15 repeats arrive. */
const HOLD_MS = 800

test.describe('held key auto-repeat', () => {
  test.beforeEach(() => {
    setLayout('us')
    setAutoRepeat({ delayMs: 250, perSecond: 30 })
  })
  test.afterEach(() => resetAutoRepeat())

  test('marks auto-repeat keydowns as repeats', async ({ page, harness }) => {
    const hk = await setUp(page, await harness())
    const keydowns = await hold(page, hk, 'KeyS')
    expect(keydowns.length, 'auto-repeat keydowns').toBeGreaterThan(5)
    expect(keydowns.map((keydown) => keydown.repeat)).toEqual([
      false,
      ...keydowns.slice(1).map(() => true),
    ])
  })

  test('fires a requireReset hotkey once per press', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('once', 'Control+S', { requireReset: true })
    await hk.register('every', 'Control+S')
    await setUp(page, hk)

    const keydowns = await hold(page, hk, 'Control+KeyS')
    expect(keydowns.length, 'auto-repeat keydowns').toBeGreaterThan(5)
    const fired = await hk.firedNames()
    expect(fired.filter((name) => name === 'once')).toHaveLength(1)
    // Without requireReset, every repeat fires.
    expect(fired.filter((name) => name === 'every')).toHaveLength(
      keydowns.length,
    )

    // Releasing the keys re-arms it.
    await hk.clear()
    press('Control+KeyS')
    await waitForRelease(page)
    expect(await hk.firedNames()).toEqual(['once', 'every'])
  })

  test('a held key does not advance a sequence', async ({ page, harness }) => {
    const hk = await harness()
    await hk.register('G G', ['G', 'G'])
    await setUp(page, hk)

    const keydowns = await hold(page, hk, 'KeyG')
    expect(keydowns.length, 'auto-repeat keydowns').toBeGreaterThan(5)
    expect(await hk.firedNames()).toEqual([])

    // Two separate presses still complete it.
    press('KeyG')
    press('KeyG')
    await waitForRelease(page)
    expect(await hk.firedNames()).toEqual(['G G'])
  })
})

async function setUp(page: Page, hk: LoadedHarness): Promise<LoadedHarness> {
  await hk.call('setPlatform', 'linux')
  await hk.call('heldKeys') // starts the tracker
  await waitForKeyboardInput(page, hk)
  return hk
}

/** Holds real keys for HOLD_MS and returns the non-modifier keydowns. */
async function hold(page: Page, hk: LoadedHarness, combo: string) {
  await hk.clear()
  keyDown(combo)
  try {
    await page.waitForTimeout(HOLD_MS)
  } finally {
    keyUp(combo)
  }
  await waitForRelease(page)
  return hk.keydowns()
}

/** Waits until the page has seen every key's keyup. */
async function waitForRelease(page: Page): Promise<void> {
  await page.waitForFunction(
    () => window.harness.heldKeys().length === 0,
    undefined,
    { timeout: 2000 },
  )
}
