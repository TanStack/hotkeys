// @vitest-environment happy-dom
import { provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, expect, it } from 'vitest'
import { HotkeyManager, KeyStateTracker } from '@tanstack/hotkeys'
import { injectHotkeyHint } from '../src/injectHotkeyHint'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => {
  TestBed.resetTestingModule()
  HotkeyManager.resetInstance()
  KeyStateTracker.resetInstance()
})
it('reacts to modifier state, binding signals, and blur', () => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  })
  const manager = HotkeyManager.getInstance()
  const handle = manager.register('Alt+[KeyS]', () => {})
  manager.register('Control+[KeyS]', () => {})
  const binding = signal<Hotkey>('Alt+[KeyS]')
  const hint = TestBed.runInInjectionContext(() => injectHotkeyHint(binding))
  TestBed.flushEffects()
  expect(hint()).toBe(false)
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }),
  )
  expect(hint()).toBe(true)
  binding.set('Control+[KeyS]')
  expect(hint()).toBe(false)
  binding.set('Alt+[KeyS]')
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
})
