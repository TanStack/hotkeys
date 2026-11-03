import { flushSync, mount, unmount } from 'svelte'
import { afterEach, expect, it } from 'vitest'
import { HotkeyManager } from '@tanstack/hotkeys'
import ElementOrder from './ElementOrder.svelte'

// Svelte runs onkeydown from one listener on the app's root, after native
// listeners on elements inside it.

afterEach(() => {
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

function run(childStops: boolean) {
  const log: Array<string> = []
  const component = mount(ElementOrder, {
    target: document.body,
    props: { log, childStops },
  })
  flushSync()
  const child = document.querySelector<HTMLElement>('[data-testid="child"]')!
  child.focus()
  child.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  )
  unmount(component)
  return log
}

it("runs an attachment's hotkey after onkeydown handlers inside its element", () => {
  expect(run(false)).toEqual(['child', 'panel', 'hotkey'])
})

it('lets an onkeydown handler inside the element stop the hotkey', () => {
  expect(run(true)).toEqual(['child'])
})
