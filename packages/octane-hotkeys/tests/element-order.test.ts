import { afterEach, expect, it } from 'vitest'
import {
  createRoot,
  delegateEvents,
  drainPassiveEffects,
  flushSync,
} from 'octane'
import { HotkeyManager } from '@tanstack/hotkeys'
import { ElementOrderFixture, elementOrderLog } from './element-order.tsrx'
import type { Root } from 'octane'

// Octane runs onKeyDown from one listener on the root container, after native
// listeners on elements inside it.

delegateEvents(['keydown'])
let root: Root | undefined

afterEach(() => {
  root?.unmount()
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
  elementOrderLog.length = 0
})

function run(childStops: boolean) {
  const container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  flushSync(() => root!.render(ElementOrderFixture, { childStops }))
  drainPassiveEffects()
  flushSync(() => {})
  drainPassiveEffects()
  const child = container.querySelector<HTMLElement>('#child')!
  child.focus()
  child.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Escape',
      bubbles: true,
      cancelable: true,
    }),
  )
  return [...elementOrderLog]
}

it("runs an element target's hotkey after onKeyDown handlers inside it", () => {
  expect(run(false)).toEqual(['child', 'panel', 'hotkey'])
})

it('lets an onKeyDown handler inside the target stop the hotkey', () => {
  expect(run(true)).toEqual(['child'])
})
