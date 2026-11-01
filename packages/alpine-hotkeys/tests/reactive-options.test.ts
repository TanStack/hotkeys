import Alpine from 'alpinejs'
import { expect, it, vi } from 'vitest'
import { createHotkeyRecorder, createHotkeysScope, HotkeyManager } from '../src'
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
          ? createHotkeyRecorder(scope, options)
          : createHotkeyRecorder(
              scope,
              Object.defineProperties(
                { maxSteps: Infinity },
                Object.getOwnPropertyDescriptors(options),
              ) as typeof options & { maxSteps: number },
            )
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

it('creates a recorder from an owner read through Alpine state', () => {
  // Alpine component data wraps stored objects in reactive proxies.
  const owner = createHotkeysScope()
  const data = Alpine.reactive({ hotkeys: owner as object })
  expect(data.hotkeys).not.toBe(owner)
  try {
    const recorder = createHotkeyRecorder(data.hotkeys as typeof owner, {
      onRecord() {},
    })
    recorder.startRecording()
    expect(recorder.isRecording).toBe(true)
    recorder.cancelRecording()
  } finally {
    owner.destroy()
  }
})
