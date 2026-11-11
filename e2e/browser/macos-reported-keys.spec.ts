import { expect, test } from '../support/fixtures'
import type { Page } from '@playwright/test'

// Playwright's keyboard has a built-in US layout and does not go through the
// operating system, so it cannot type what macOS Option or Command make a key
// report. These tests dispatch the events a Mac sends, with the values from
// Apple's layout tables, to check the bundled library in each browser engine.

type KeyInit = Pick<
  KeyboardEventInit,
  'key' | 'code' | 'keyCode' | 'altKey' | 'metaKey' | 'shiftKey'
>

/** Dispatches a keydown and keyup on the document, as the page would see them. */
async function press(page: Page, init: KeyInit) {
  await page.evaluate((options) => {
    for (const type of ['keydown', 'keyup']) {
      document.dispatchEvent(
        new KeyboardEvent(type, {
          bubbles: true,
          cancelable: true,
          ...options,
        }),
      )
    }
  }, init)
}

test.describe('keys as macOS reports them', () => {
  test('Option fires the letter on the keycap', async ({ page, harness }) => {
    const hk = await harness()
    for (const letter of ['A', 'Q', 'O', 'S', 'Z', 'Y', 'L'] as const) {
      await hk.register(`alt-${letter}`, `Alt+${letter}`, { platform: 'mac' })
    }
    // French Option+A: the A key sits on the US Q position
    await press(page, { key: 'æ', code: 'KeyQ', keyCode: 65, altKey: true })
    // Dvorak Option+O: the O key sits on the US S position
    await press(page, { key: 'ø', code: 'KeyS', keyCode: 79, altKey: true })
    // German Option+Z: the Z key sits on the US Y position
    await press(page, { key: 'Ω', code: 'KeyY', keyCode: 90, altKey: true })
    // German Option+L types `@`
    await press(page, { key: '@', code: 'KeyL', keyCode: 76, altKey: true })
    expect(await hk.firedNames()).toEqual(['alt-A', 'alt-O', 'alt-Z', 'alt-L'])
  })

  test('Cmd+Option+N fires when Command cancels the dead key', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('new', 'Mod+Alt+N', { platform: 'mac' })
    // Chromium and WebKit report `~` and a keyCode that names no letter
    await press(page, {
      key: '~',
      code: 'KeyN',
      keyCode: 192,
      altKey: true,
      metaKey: true,
    })
    expect(await hk.firedNames()).toEqual(['new'])
  })

  test('Cmd+Shift+/ fires the binding that names Shift', async ({
    page,
    harness,
  }) => {
    const hk = await harness()
    await hk.register('comment', 'Mod+/', { platform: 'mac' })
    const shifted = {
      key: '/',
      code: 'Slash',
      keyCode: 191,
      metaKey: true,
      shiftKey: true,
    }
    await press(page, shifted)
    expect(await hk.firedNames()).toEqual([])

    await hk.register('help', 'Mod+Shift+/', { platform: 'mac' })
    await press(page, shifted)
    await press(page, { key: '/', code: 'Slash', keyCode: 191, metaKey: true })
    expect(await hk.firedNames()).toEqual(['help', 'comment'])
  })
})
