import { expect, test } from '../support/fixtures'
import type { Page } from '@playwright/test'

// React, Svelte and Octane run declarative key handlers from one listener on
// the app's root container, and Solid from one on the document. The page
// stands in for that with a listener that calls each element's handler from
// the event's target outwards. Handlers log into the harness's fired list, so
// the order includes both handlers and hotkeys.

const PAGE = `
  <div id="root">
    <div id="panel" tabindex="0">
      <span id="child" tabindex="0">child</span>
    </div>
  </div>
`

/** Installs a delegating listener on `#root` or the document. */
async function delegate(
  page: Page,
  on: 'root' | 'document',
  { childStops = false } = {},
) {
  await page.evaluate(
    ([on, childStops]) => {
      const log = (name: string) =>
        window.harness.fired.push({ name } as (typeof window.harness.fired)[0])
      const handlers = new Map<EventTarget, (event: Event) => void>([
        [
          document.getElementById('child')!,
          (event) => {
            log('child')
            if (childStops) event.stopPropagation()
          },
        ],
        [document.getElementById('panel')!, () => log('panel')],
      ])
      const node = on === 'root' ? document.getElementById('root')! : document
      node.addEventListener('keydown', (event) => {
        for (const element of event.composedPath()) {
          if (element === node || event.cancelBubble) break
          handlers.get(element)?.(event)
        }
      })
    },
    [on, childStops] as const,
  )
}

test.describe('afterDelegatedHandlers', () => {
  test('runs an element hotkey after delegated handlers inside its target', async ({
    page,
    harness,
  }) => {
    const hk = await harness(PAGE)
    await delegate(page, 'root')
    await hk.register('hotkey', 'K', {
      target: '#panel',
      afterDelegatedHandlers: true,
    })
    await page.focus('#child')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['child', 'panel', 'hotkey'])
  })

  test('lets a delegated handler stop the hotkey', async ({
    page,
    harness,
  }) => {
    const hk = await harness(PAGE)
    await delegate(page, 'root', { childStops: true })
    await hk.register('hotkey', 'K', {
      target: '#panel',
      afterDelegatedHandlers: true,
    })
    await page.focus('#child')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['child'])
  })

  test('honors a stop by a handler delegated to the document', async ({
    page,
    harness,
  }) => {
    const hk = await harness(PAGE)
    await delegate(page, 'document', { childStops: true })
    await hk.register('element hotkey', 'K', {
      target: '#panel',
      afterDelegatedHandlers: true,
    })
    await hk.register('document hotkey', 'J', { afterDelegatedHandlers: true })
    await page.focus('#child')
    await page.keyboard.press('k')
    await page.keyboard.press('j')
    expect(await hk.firedNames()).toEqual(['child', 'child'])
  })

  test('runs before document hotkeys, which its stop skips', async ({
    page,
    harness,
  }) => {
    const hk = await harness(PAGE)
    await hk.register('document hotkey', 'K')
    await hk.register('panel hotkey', 'K', {
      target: '#panel',
      afterDelegatedHandlers: true,
    })
    await page.focus('#child')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['panel hotkey'])
  })

  test('without the option, an element hotkey runs before delegated handlers', async ({
    page,
    harness,
  }) => {
    const hk = await harness(PAGE)
    await delegate(page, 'root')
    await hk.register('hotkey', 'K', {
      target: '#panel',
      stopPropagation: false,
    })
    await page.focus('#child')
    await page.keyboard.press('k')
    expect(await hk.firedNames()).toEqual(['hotkey', 'child', 'panel'])
  })
})
