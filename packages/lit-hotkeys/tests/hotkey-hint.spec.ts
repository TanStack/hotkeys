// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { KeyStateTracker } from '@tanstack/hotkeys'
import { HotkeyHintController } from '../src/controllers/hotkey-hint'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => KeyStateTracker.resetInstance())
it('tracks relevant modifiers, reactive inputs, and disconnect without unrelated updates', () => {
  const host = {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  }
  let binding: Hotkey = 'Alt+[KeyS]'
  const hint = new HotkeyHintController(host, () => binding)
  hint.hostConnected()
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
  )
  expect(hint.value).toBe(true)
  expect(host.requestUpdate).toHaveBeenCalledOnce()
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'x', code: 'KeyX' }),
  )
  expect(host.requestUpdate).toHaveBeenCalledOnce()
  binding = 'Control+[KeyS]'
  hint.hostUpdate()
  expect(hint.value).toBe(false)
  binding = 'Alt+[KeyS]'
  hint.hostUpdate()
  expect(hint.value).toBe(true)
  hint.hostDisconnected()
  host.requestUpdate.mockClear()
  window.dispatchEvent(new Event('blur'))
  expect(host.requestUpdate).not.toHaveBeenCalled()
})
