import Alpine from 'alpinejs'
import { expect, it, vi } from 'vitest'
import { createHotkeysScope, HotkeyManager } from '../src'
it('tracks an enabled property getter', async () => {
  const state = Alpine.reactive({ enabled: true }),
    callback = vi.fn(),
    scope = createHotkeysScope()
  const press = () =>
    document.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'a', bubbles: true }),
    )
  try {
    scope.createHotkey('A', callback, {
      get enabled() {
        return state.enabled
      },
    })
    press()
    expect(callback).toHaveBeenCalledTimes(1)
    state.enabled = false
    await Alpine.nextTick()
    press()
    expect(callback).toHaveBeenCalledTimes(1)
  } finally {
    scope.destroy()
    HotkeyManager.resetInstance()
  }
})

it.each(['single', 'sequence'] as const)(
  'updates an active %s recorder callback getter',
  (kind) => {
    const state = Alpine.reactive({ current: false }),
      first = vi.fn(),
      second = vi.fn(),
      scope = createHotkeysScope()
    try {
      const options = {
        onRecord() {},
        get onCancel() {
          return state.current ? second : first
        },
      }
      const recorder =
        kind === 'single'
          ? scope.createHotkeyRecorder(options)
          : scope.createHotkeySequenceRecorder(options)
      recorder.startRecording()
      state.current = true
      recorder.cancelRecording()
      expect(first).not.toHaveBeenCalled()
      expect(second).toHaveBeenCalledOnce()
    } finally {
      scope.destroy()
    }
  },
)
