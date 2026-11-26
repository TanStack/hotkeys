// Alpine's CSP build parses expressions itself and rejects arrow functions,
// so the documented CSP pattern names a component method in `x-hotkey`.
import Alpine from '@alpinejs/csp'
import { afterEach, expect, it } from 'vitest'
import {
  HotkeyManager,
  getHotkeyManager,
  hotkeyDirective,
  hotkeysPlugin,
} from '../src'

Alpine.plugin(hotkeysPlugin)
Alpine.plugin(hotkeyDirective)
Alpine.data('counter', () => ({
  count: 0,
  increment() {
    this.count++
  },
}))
Alpine.start()

async function pressIn(html: string) {
  document.body.innerHTML = html
  await Alpine.nextTick()
  document.body.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'k',
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    }),
  )
  const element = document.body.firstElementChild as HTMLElement
  return (Alpine.$data(element) as { count: number }).count
}

afterEach(async () => {
  document.body.replaceChildren()
  await Alpine.nextTick()
  expect(getHotkeyManager().registrations.state.size).toBe(0)
  HotkeyManager.resetInstance()
})

it('runs a method name or call from x-hotkey', async () => {
  expect(
    await pressIn(
      `<div x-data="counter" x-hotkey.control.k="increment"></div>`,
    ),
  ).toBe(1)
  document.body.replaceChildren()
  await Alpine.nextTick()
  expect(
    await pressIn(
      `<div x-data="counter" x-hotkey.control.k="increment()"></div>`,
    ),
  ).toBe(1)
})
