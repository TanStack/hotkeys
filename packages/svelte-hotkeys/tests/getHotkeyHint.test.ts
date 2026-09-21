// @vitest-environment happy-dom
import { flushSync } from 'svelte'
import { afterEach, expect, it, vi } from 'vitest'
import { KeyStateTracker } from '@tanstack/hotkeys'
import { harness } from './hint-harness.svelte'

afterEach(() => KeyStateTracker.resetInstance())
it('selects visibility, tracks binding changes and cleans up subscriptions', () => {
  const notify = vi.fn(),
    app = harness(notify)
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
  )
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  const count = notify.mock.calls.length
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'x', code: 'KeyX' }),
  )
  flushSync()
  expect(notify).toHaveBeenCalledTimes(count)
  app.setBinding('Alt+Control+[KeyS]')
  flushSync()
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Control', code: 'ControlLeft' }),
  )
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  app.setBinding('Alt+[KeyS]')
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  document.dispatchEvent(
    new KeyboardEvent('keyup', { key: 'Control', code: 'ControlLeft' }),
  )
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  window.dispatchEvent(new Event('blur'))
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  app.destroy()
})
