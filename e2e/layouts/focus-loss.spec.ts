// Keys released while another X window has focus. The page never sees their
// keyup, so the key state tracker must forget them, and a later plain key
// must not fire a modifier chord.
//
// Playwright makes pages report focus even when their window doesn't have
// it. Chromium can turn that off per page; Playwright's Firefox can't, so
// Firefox never sees the blur and only the stuck-modifier checks run there.
// (browser/held-keys-and-recorder.spec.ts covers a synthetic blur in all
// three browsers.)
import { expect, test } from '../support/fixtures'
import { waitForKeyboardInput } from '../support/layout-fixtures'
import {
  focusBrowserWindow,
  focusWindow,
  keyDown,
  keyUp,
  openOtherWindow,
  press,
  resetAutoRepeat,
  setAutoRepeat,
  setLayout,
} from '../support/x11'
import type { Page } from '@playwright/test'
import type { LoadedHarness } from '../support/fixtures'

test.describe('focus moves to another window while keys are held', () => {
  test.beforeEach(() => {
    setLayout('us')
    // Keys stay held for a while; repeats would fire hotkeys again.
    setAutoRepeat('off')
  })
  test.afterEach(() => resetAutoRepeat())

  for (const held of ['Control', 'Control+KeyS']) {
    test(`forgets ${held} released in the other window`, async ({
      page,
      harness,
    }, testInfo) => {
      const realFocus = testInfo.project.name === 'chromium'
      const hk = await setUp(page, await harness(), realFocus)
      const other = openOtherWindow()
      try {
        keyDown(held)
        await expect
          .poll(() => hk.call('heldKeys'))
          .toEqual(held === 'Control' ? ['Control'] : ['Control', 'S'])
        expect(await hk.firedNames()).toEqual(
          held === 'Control' ? [] : ['Control+S'],
        )

        focusWindow(other.id)
        if (realFocus) {
          await expect
            .poll(() => page.evaluate(() => document.hasFocus()))
            .toBe(false)
          expect(await hk.call('heldKeys'), 'cleared on blur').toEqual([])
        }
      } finally {
        // Released while the other window has focus. Also keeps a failed
        // check from leaving keys held for later tests.
        keyUp(held)
        other.close()
      }

      focusBrowserWindow()
      if (realFocus) {
        await expect
          .poll(() => page.evaluate(() => document.hasFocus()))
          .toBe(true)
        expect(await hk.call('heldKeys')).toEqual([])
      } else {
        // Without the blur, the click's modifier state still clears Control.
        // S stays held until its next keyup.
        expect(await hk.call('heldKeys')).not.toContain('Control')
      }

      await hk.clear()
      press('KeyS')
      await expect.poll(() => hk.keydowns()).toHaveLength(1)
      expect((await hk.keydowns())[0]!.ctrlKey).toBe(false)
      expect(await hk.firedNames()).toEqual(['S'])
      expect(await hk.call('heldKeys')).toEqual([])
    })
  }
})

async function setUp(
  page: Page,
  hk: LoadedHarness,
  realFocus: boolean,
): Promise<LoadedHarness> {
  if (realFocus) {
    const cdp = await page.context().newCDPSession(page)
    await cdp.send('Emulation.setFocusEmulationEnabled', { enabled: false })
  }
  await hk.call('setPlatform', 'linux')
  await hk.register('S', 'S')
  await hk.register('Control+S', 'Control+S')
  await hk.call('heldKeys') // starts the tracker
  await waitForKeyboardInput(page, hk)
  return hk
}
