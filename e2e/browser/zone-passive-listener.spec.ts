import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { BUNDLE_PATH } from '../support/bundle'
import { expect, test } from '../support/fixtures'

// zone.js runs every patched listener for one event type and phase on a node
// from one native listener, added with the options of the first one. When that
// first listener is passive, preventDefault fails in every listener after it.
const ZONE_PATH = join(
  dirname(
    createRequire(
      new URL('../../packages/angular-hotkeys/package.json', import.meta.url),
    ).resolve('zone.js/package.json'),
  ),
  'fesm2015/zone.js',
)

test('preventDefault works under zone.js after a passive keydown listener', async ({
  page,
}) => {
  await page.setContent('<!doctype html><html><body></body></html>')
  await page.addScriptTag({ path: ZONE_PATH })
  await page.evaluate(() => {
    document.addEventListener('keydown', () => {}, { passive: true })
  })
  await page.addScriptTag({ path: BUNDLE_PATH })
  await page.evaluate(() => {
    const prevented: Array<boolean> = []
    ;(window as any).prevented = prevented
    window.addEventListener('keydown', (event) =>
      prevented.push(event.defaultPrevented),
    )
    window.TanStackHotkeys.getHotkeyManager().register('K', () => {}, {
      stopPropagation: false,
    })
  })
  await page.keyboard.press('k')
  await page.keyboard.press('j')
  expect(await page.evaluate(() => (window as any).prevented)).toEqual([
    true,
    false,
  ])
})

test('the recorder prevents keys under zone.js after a passive capture listener', async ({
  page,
}) => {
  await page.setContent('<!doctype html><html><body></body></html>')
  await page.addScriptTag({ path: ZONE_PATH })
  await page.evaluate(() => {
    document.addEventListener('keydown', () => {}, {
      capture: true,
      passive: true,
    })
  })
  await page.addScriptTag({ path: BUNDLE_PATH })
  await page.evaluate(() => {
    // The recorder stops propagation, so read the result where it prevents.
    const prevented: Array<boolean> = []
    ;(window as any).prevented = prevented
    const preventDefault = Event.prototype.preventDefault
    Event.prototype.preventDefault = function (this: Event) {
      preventDefault.call(this)
      prevented.push(this.defaultPrevented)
    }
    new window.TanStackHotkeys.HotkeyRecorder({
      onRecord: () => {},
    }).start()
  })
  await page.keyboard.press('Shift+K')
  expect(await page.evaluate(() => (window as any).prevented)).toEqual([
    true,
    true,
  ])
})
