import { HotkeyManager, getHotkeyManager } from '@tanstack/hotkeys'
import { createRoot, delegateEvents, flushSync } from 'octane'
import { afterEach, beforeEach, expect, it } from 'vitest'
import { RefTargetFixture, refTargetLog } from './ref-targets.tsrx'
import { flush } from './utils'
import type { Root } from 'octane'

delegateEvents(['click'])
let root: Root
let container: HTMLDivElement

function press(key: string, target: EventTarget) {
  flushSync(() => {
    target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
  })
  flush()
}
function click(id: string) {
  flushSync(() => {
    container.querySelector<HTMLButtonElement>(id)!.click()
  })
  flush()
}
function targets() {
  return Object.fromEntries(
    [...getHotkeyManager().registrations.state.values()].map((registration) => [
      registration.hotkey,
      registration.target,
    ]),
  )
}

beforeEach(() => {
  container = document.createElement('div')
  document.body.append(container)
  root = createRoot(container)
  flushSync(() => root.render(RefTargetFixture))
  flush()
})
afterEach(() => {
  root.unmount()
  flush()
  container.remove()
  HotkeyManager.resetInstance()
  refTargetLog.length = 0
})

it('waits while a ref object is unset, then follows its element across renders', () => {
  expect(targets()).toEqual({})
  press('k', document.body)
  press('j', document.body)
  expect(refTargetLog).toEqual([])

  click('#show-a')
  const a = container.querySelector('#a')!
  const shared = container.querySelector('#shared')!
  expect(targets()).toEqual({ K: a, J: shared })
  press('k', a)
  press('j', shared)
  expect(refTargetLog).toEqual(['K', 'J'])

  click('#show-b')
  const b = container.querySelector('#b')!
  expect(targets()).toEqual({ K: b, J: shared })
  press('k', b)
  expect(refTargetLog).toEqual(['K', 'J', 'K'])
})
