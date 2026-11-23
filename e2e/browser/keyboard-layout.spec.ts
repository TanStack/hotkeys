// The keyboard layout loader in real browsers. Only Chromium has
// `navigator.keyboard.getLayoutMap()`, and it needs a secure context.
import { BUNDLE_PATH } from '../support/bundle'
import { expect, test } from '../support/fixtures'

const PAGE_URL = 'https://hotkeys.test/'

test.beforeEach(async ({ page }) => {
  await page.route(`${PAGE_URL}**`, (route) =>
    route.fulfill({ contentType: 'text/html', body: '<body></body>' }),
  )
  await page.goto(PAGE_URL)
  await page.addScriptTag({ path: BUNDLE_PATH })
})

test('loads the layout the browser reports, or none', async ({ page }) => {
  // What the browser reports, read without the library
  const reported = await page.evaluate(async () => {
    const keyboard = (
      navigator as {
        keyboard?: { getLayoutMap: () => Promise<Map<string, string>> }
      }
    ).keyboard
    try {
      return keyboard ? [...(await keyboard.getLayoutMap())] : null
    } catch {
      return null
    }
  })
  const loaded = await page.evaluate(() => window.harness.loadLayout())
  expect(loaded?.toSorted() ?? null).toEqual(reported?.toSorted() ?? null)
})

test('labels a physical key with the loaded layout', async ({ page }) => {
  const { loaded, label } = await page.evaluate(async () => {
    const entries = await window.harness.loadLayout()
    const { label, layoutLabel } = await window.harness.formatLabels('[KeyQ]')
    return { loaded: entries, label: layoutLabel ?? label }
  })
  const typed = loaded?.find(([code]) => code === 'KeyQ')?.[1]
  // Without a layout, the label is the key's US character
  expect(label).toBe((typed ?? 'q').toUpperCase())
})

test('keeps the loaded layout after the last caller stops', async ({
  page,
}) => {
  const { loaded, kept } = await page.evaluate(async () => {
    // `loadLayout` stops its loader before it returns
    const entries = await window.harness.loadLayout()
    const state = window.TanStackHotkeys.getKeyboardLayoutStore().state
    return { loaded: entries, kept: state ? [...state] : null }
  })
  expect(kept).toEqual(loaded)
})
