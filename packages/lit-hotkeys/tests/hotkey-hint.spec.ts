// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from 'vitest'
import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { HotkeyHintController } from '../src/controllers/hotkey-hint'
import { HotkeyScopesStateController } from '../src/controllers/hotkey-scopes-state'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('tracks relevant modifiers, reactive inputs, and disconnect without unrelated updates', () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Alt+[KeyS]', () => {})
  manager.register('Control+[KeyS]', () => {})
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
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft', altKey: true }),
  )
  expect(hint.value).toBe(true)
  expect(host.requestUpdate).toHaveBeenCalledOnce()
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'x', code: 'KeyX', altKey: true }),
  )
  expect(host.requestUpdate).toHaveBeenCalledOnce()
  binding = 'Control+[KeyS]'
  hint.hostUpdate()
  expect(hint.value).toBe(false)
  binding = 'Alt+[KeyS]'
  hint.hostUpdate()
  expect(hint.value).toBe(true)
  host.requestUpdate.mockClear()
  handle.setOptions({ enabled: false })
  expect(hint.value).toBe(false)
  handle.setOptions({ enabled: true })
  expect(hint.value).toBe(true)
  const release = manager.activateScope('dialog', { exclusive: true })
  expect(hint.value).toBe(false)
  release()
  expect(hint.value).toBe(true)
  expect(host.requestUpdate).toHaveBeenCalledTimes(4)
  hint.hostDisconnected()
  host.requestUpdate.mockClear()
  window.dispatchEvent(new Event('blur'))
  expect(host.requestUpdate).not.toHaveBeenCalled()
})

it('exposes the scopes state and requests updates while connected', () => {
  const manager = HotkeyManager.getInstance()
  const host = {
    addController: vi.fn(),
    removeController: vi.fn(),
    requestUpdate: vi.fn(),
    updateComplete: Promise.resolve(true),
  }
  const scopes = new HotkeyScopesStateController(host)
  expect(host.addController).toHaveBeenCalledWith(scopes)
  scopes.hostConnected()
  expect(scopes.value.exclusive).toBeNull()

  const release = manager.activateScope('dialog', { exclusive: true })
  expect(scopes.value).toMatchObject({
    active: ['dialog'],
    exclusive: 'dialog',
    suspended: ['global'],
  })
  expect(host.requestUpdate).toHaveBeenCalledOnce()

  release()
  expect(scopes.value).toMatchObject({ exclusive: null, suspended: [] })
  expect(host.requestUpdate).toHaveBeenCalledTimes(2)

  scopes.hostDisconnected()
  manager.activateScope('dialog', { exclusive: true })
  expect(host.requestUpdate).toHaveBeenCalledTimes(2)
})
