// @vitest-environment happy-dom
import { flushSync } from 'svelte'
import { afterEach, expect, it, vi } from 'vitest'
import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { harness } from './hint-harness.svelte'

afterEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('selects visibility, tracks binding changes and cleans up subscriptions', () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Alt+[KeyS]', () => {})
  manager.register('Alt+Control+[KeyS]', () => {})
  const notify = vi.fn(),
    app = harness(notify)
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft', altKey: true }),
  )
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  const count = notify.mock.calls.length
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'x', code: 'KeyX', altKey: true }),
  )
  flushSync()
  expect(notify).toHaveBeenCalledTimes(count)
  app.setBinding('Alt+Control+[KeyS]')
  flushSync()
  document.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: 'Control',
      code: 'ControlLeft',
      ctrlKey: true,
      altKey: true,
    }),
  )
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  app.setBinding('Alt+[KeyS]')
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  document.dispatchEvent(
    new KeyboardEvent('keyup', {
      key: 'Control',
      code: 'ControlLeft',
      altKey: true,
    }),
  )
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  handle.setOptions({ enabled: false })
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  handle.setOptions({ enabled: true })
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  const release = manager.activateScope('dialog', { exclusive: true })
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  release()
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(true)
  window.dispatchEvent(new Event('blur'))
  flushSync()
  expect(notify).toHaveBeenLastCalledWith(false)
  app.destroy()
})
