import { injectHotkeyRecorder } from '../src/injectHotkeyRecorder'
import { injectHotkeySequenceRecorder } from '../src/injectHotkeySequenceRecorder'
import { provideZonelessChangeDetection, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { HotkeyManager } from '@tanstack/hotkeys'
import { expect, it, vi } from 'vitest'
import { injectHotkey } from '../src/injectHotkey'
it('updates a property getter without user setOptions', () => {
  HotkeyManager.resetInstance()
  TestBed.configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  })
  const enabled = signal(true),
    callback = vi.fn()
  const press = () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    )
  try {
    TestBed.runInInjectionContext(() =>
      injectHotkey('A', callback, {
        get enabled() {
          return enabled()
        },
      }),
    )
    TestBed.flushEffects()
    press()
    expect(callback).toHaveBeenCalledTimes(1)
    enabled.set(false)
    TestBed.flushEffects()
    press()
    expect(callback).toHaveBeenCalledTimes(1)
  } finally {
    TestBed.resetTestingModule()
    HotkeyManager.resetInstance()
  }
})

it.each(['single', 'sequence'] as const)(
  'updates an active %s recorder callback getter',
  (kind) => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    })
    const current = signal(false),
      first = vi.fn(),
      second = vi.fn()
    try {
      const options = {
        onRecord() {},
        get onCancel() {
          return current() ? second : first
        },
      }
      const recorder = TestBed.runInInjectionContext(() =>
        kind === 'single'
          ? injectHotkeyRecorder(options)
          : injectHotkeySequenceRecorder(options),
      )
      TestBed.flushEffects()
      recorder.startRecording()
      current.set(true)
      TestBed.flushEffects()
      recorder.cancelRecording()
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledOnce()
    } finally {
      TestBed.resetTestingModule()
    }
  },
)
