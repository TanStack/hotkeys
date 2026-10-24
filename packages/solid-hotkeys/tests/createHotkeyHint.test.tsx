// @vitest-environment happy-dom
import { createRoot, createSignal } from 'solid-js'
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
  createRoot((dispose) => {
    const [binding, setBinding] = createSignal<Hotkey>('Alt+[KeyS]')
    const hint = createHotkeyHint(binding)
    expect(hint()).toBe(false)
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
    )
    expect(hint()).toBe(true)
    setBinding('Control+[KeyS]')
    expect(hint()).toBe(false)
    setBinding('Alt+[KeyS]')
    expect(hint()).toBe(true)
    handle.setOptions({ enabled: false })
    expect(hint()).toBe(false)
    handle.setOptions({ enabled: true })
    expect(hint()).toBe(true)
    const release = manager.activateScope('dialog', { exclusive: true })
    expect(hint()).toBe(false)
    release()
    expect(hint()).toBe(true)
    window.dispatchEvent(new Event('blur'))
    expect(hint()).toBe(false)
    dispose()
  })
})
