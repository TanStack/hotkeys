// @vitest-environment happy-dom
import { provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { afterEach, expect, it } from 'vitest'
import { KeyStateTracker } from '@tanstack/hotkeys'
import { injectHotkeyHint } from '../src/injectHotkeyHint'
import type { Hotkey } from '@tanstack/hotkeys'

afterEach(() => {
  TestBed.resetTestingModule()
  KeyStateTracker.resetInstance()
})
it('reacts to modifier state, binding signals, and blur', () => {
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  })
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
  window.dispatchEvent(new Event('blur'))
  expect(hint()).toBe(false)
})
