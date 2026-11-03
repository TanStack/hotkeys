// @vitest-environment happy-dom
import { createRoot, createSignal, flush } from 'solid-js'
import { afterEach, expect, it } from 'vitest'
import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { createHotkeyHint } from '../src/createHotkeyHint'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => {
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('reacts to held modifiers and changing bindings', () => {
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Alt+[KeyS]', () => {})
  manager.register('Control+[KeyS]', () => {})
  const [binding, setBinding] = createSignal<Hotkey>('Alt+[KeyS]')
  const { hint, dispose } = createRoot((dispose) => ({
    hint: createHotkeyHint(binding),
    dispose,
  }))
  expect(hint()).toBe(false)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
  )
  flush()
  expect(hint()).toBe(true)
  setBinding('Control+[KeyS]')
  flush()
  expect(hint()).toBe(false)
  setBinding('Alt+[KeyS]')
  flush()
  expect(hint()).toBe(true)
  handle.setOptions({ enabled: false })
  flush()
  expect(hint()).toBe(false)
  handle.setOptions({ enabled: true })
  flush()
  expect(hint()).toBe(true)
  const release = manager.activateScope('dialog', { exclusive: true })
  flush()
  expect(hint()).toBe(false)
  release()
  flush()
  expect(hint()).toBe(true)
  window.dispatchEvent(new Event('blur'))
  flush()
  expect(hint()).toBe(false)
  dispose()
})
