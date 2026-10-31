import { afterEach, expect, it } from 'vitest'
import { createRoot, drainPassiveEffects, flushSync } from 'octane'
import { HotkeyManager } from '@tanstack/hotkeys'
import { CustomHooksFixture, customHookLog } from './custom-hooks/fixture.tsrx'

afterEach(() => {
  HotkeyManager.resetInstance()
})

// A custom hook that calls the same hook twice needs a module the compiler
// slots: .tsx, or .ts with a value import from octane or the pragma.
it('keeps every hotkey in custom hooks from compiled modules', () => {
  const container = document.createElement('div')
  document.body.append(container)
  const root = createRoot(container)
  flushSync(() => root.render(CustomHooksFixture))
  drainPassiveEffects()

  for (const key of 'ghijkl') {
    document.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }))
    document.dispatchEvent(new KeyboardEvent('keyup', { key, bubbles: true }))
  }
  expect(customHookLog).toEqual(['G', 'H', 'I', 'J', 'K', 'L'])

  root.unmount()
  container.remove()
})
