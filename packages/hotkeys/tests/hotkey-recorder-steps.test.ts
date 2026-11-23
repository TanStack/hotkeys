import { keyEvent, keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { HotkeyRecorder } from '../src/hotkey-recorder'
import type { HotkeySequenceRecorderOptions } from '../src/hotkey-recorder'

// Explicit US-layout fixtures; production recording must never infer a code from a key.
const fixtureCodes: Record<string, string> = {
  a: 'KeyA',
  b: 'KeyB',
  g: 'KeyG',
  s: 'KeyS',
  x: 'KeyX',
  z: 'KeyZ',
  Enter: 'Enter',
  Escape: 'Escape',
  Backspace: 'Backspace',
}
const instances: Array<HotkeyRecorder> = []

/** Tracks recorder instances so active listeners and timers cannot leak between cases. */
function createRecorder(
  options: Omit<HotkeySequenceRecorderOptions, 'maxSteps'> & {
    maxSteps?: number
  },
) {
  const recorder = new HotkeyRecorder({
    platform: 'mac',
    maxSteps: Infinity,
    ...options,
  })
  instances.push(recorder)
  return recorder
}

/** Builds a keyboard event with independently specified logical and physical fixture values. */
function createKeyboardEvent(
  type: 'keydown' | 'keyup',
  key: string,
  options: {
    ctrlKey?: boolean
    shiftKey?: boolean
    altKey?: boolean
    metaKey?: boolean
  } = {},
): KeyboardEvent {
  return keyEvent(type, { ...options, key, code: fixtureCodes[key] })
}

describe.each(['key', 'code', undefined] as const)(
  'HotkeyRecorder with maxSteps (recordBy: %s)',
  (recordBy) => {
    afterEach(() => {
      instances.splice(0).forEach((recorder) => recorder.destroy())
      window.dispatchEvent(new Event('blur'))
      document.body.replaceChildren()
      vi.useRealTimers()
    })

    it('appends chords and commits on Enter by default', () => {
      const onRecord = vi.fn()
      const r = createRecorder({ recordBy, onRecord })
      r.start()

      document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
      expect(r.store.state.steps.length).toBe(1)

      document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
      expect(r.store.state.steps.length).toBe(2)

      document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
      expect(onRecord).toHaveBeenCalledTimes(1)
      expect(onRecord).toHaveBeenCalledWith(
        recordBy !== 'code' ? ['G', 'G'] : ['[KeyG]', '[KeyG]'],
        expect.anything(),
      )
      expect(r.store.state.isRecording).toBe(false)
      const [recorded] = onRecord.mock.calls[0] ?? []
      expect(recorded).toBeDefined()
      expect(r.store.state.recordedHotkey).toEqual(recorded)
    })

    it('commits on Enter while the button that started recording has focus', () => {
      const onRecord = vi.fn()
      const r = createRecorder({ recordBy, onRecord })
      const button = document.createElement('button')
      document.body.appendChild(button)
      button.focus()
      r.start()

      button.dispatchEvent(createKeyboardEvent('keydown', 'g'))
      button.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))

      expect(onRecord).toHaveBeenCalledExactlyOnceWith(
        recordBy !== 'code' ? 'G' : '[KeyG]',
        expect.anything(),
      )
      expect(r.store.state.isRecording).toBe(false)
    })

    it('commitKeys none requires commit()', () => {
      const onRecord = vi.fn()
      const r = createRecorder({
        recordBy,
        onRecord,
        commitKeys: 'none',
      })
      r.start()

      document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
      document.dispatchEvent(createKeyboardEvent('keydown', 'b'))
      expect(r.store.state.steps.length).toBe(2)

      document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
      expect(onRecord).not.toHaveBeenCalled()
      expect(r.store.state.isRecording).toBe(true)

      r.commit()
      expect(onRecord).toHaveBeenCalledTimes(1)
      expect(r.store.state.isRecording).toBe(false)
    })

    it('commit() is no-op with zero steps', () => {
      const onRecord = vi.fn()
      const r = createRecorder({ recordBy, onRecord })
      r.start()
      r.commit()
      expect(onRecord).not.toHaveBeenCalled()
      expect(r.store.state.isRecording).toBe(true)
    })

    it('Escape calls onCancel and stops', () => {
      const onRecord = vi.fn()
      const onCancel = vi.fn()
      const r = createRecorder({ recordBy, onRecord, onCancel })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'x'))
      document.dispatchEvent(createKeyboardEvent('keydown', 'Escape'))

      expect(onCancel).toHaveBeenCalledTimes(1)
      expect(onRecord).not.toHaveBeenCalled()
      expect(r.store.state.isRecording).toBe(false)
      expect(r.store.state.steps).toEqual([])
    })

    it('Backspace pops last step', () => {
      const onRecord = vi.fn()
      const r = createRecorder({ recordBy, onRecord })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
      document.dispatchEvent(createKeyboardEvent('keydown', 'b'))
      expect(r.store.state.steps.length).toBe(2)

      document.dispatchEvent(createKeyboardEvent('keydown', 'Backspace'))
      expect(r.store.state.steps).toEqual(
        recordBy !== 'code' ? ['A'] : ['[KeyA]'],
      )
      expect(onRecord).not.toHaveBeenCalled()
    })

    it('Backspace with no steps clears via onClear only', () => {
      const onRecord = vi.fn()
      const onClear = vi.fn()
      const r = createRecorder({ recordBy, onRecord, onClear })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'Backspace'))

      expect(onClear).toHaveBeenCalledTimes(1)
      expect(onRecord).not.toHaveBeenCalled()
      expect(r.store.state.isRecording).toBe(false)
    })

    it('idle timeout commits only after first step', () => {
      vi.useFakeTimers()
      const onRecord = vi.fn()
      const r = createRecorder({
        recordBy,
        onRecord,
        idleTimeoutMs: 500,
      })
      r.start()

      vi.advanceTimersByTime(2000)
      expect(onRecord).not.toHaveBeenCalled()

      document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
      vi.advanceTimersByTime(499)
      expect(onRecord).not.toHaveBeenCalled()
      vi.advanceTimersByTime(2)
      expect(onRecord).toHaveBeenCalledTimes(1)
      const [idleRecorded] = onRecord.mock.calls[0] ?? []
      expect(idleRecorded).toBeDefined()
      // A one-step recording commits as a chord string.
      expect(idleRecorded).toEqual(recordBy !== 'code' ? 'G' : '[KeyG]')
    })

    it('stop does not call onRecord or onCancel', () => {
      const onRecord = vi.fn()
      const onCancel = vi.fn()
      const r = createRecorder({ recordBy, onRecord, onCancel })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'z'))
      r.stop()

      expect(onCancel).not.toHaveBeenCalled()
      expect(onRecord).not.toHaveBeenCalled()
      expect(r.store.state.isRecording).toBe(false)
    })

    it('commitKeys none records Enter as a step', () => {
      const onRecord = vi.fn()
      const r = createRecorder({
        recordBy,
        onRecord,
        commitKeys: 'none',
      })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
      document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
      expect(r.store.state.steps.length).toBe(2)
      r.commit()
      expect(onRecord).toHaveBeenCalledExactlyOnceWith(
        recordBy !== 'code' ? ['A', 'Enter'] : ['[KeyA]', '[Enter]'],
        expect.anything(),
      )
    })

    it('commits automatically when it reaches maxSteps', () => {
      const onRecord = vi.fn()
      const r = createRecorder({ recordBy, onRecord, maxSteps: 2 })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
      expect(onRecord).not.toHaveBeenCalled()
      document.dispatchEvent(createKeyboardEvent('keydown', 's'))
      expect(onRecord).toHaveBeenCalledExactlyOnceWith(
        recordBy !== 'code' ? ['G', 'S'] : ['[KeyG]', '[KeyS]'],
        expect.anything(),
      )
      expect(r.store.state.isRecording).toBe(false)
    })

    it('commits one step on Enter as a chord string', () => {
      const onRecord = vi.fn()
      const r = createRecorder({ recordBy, onRecord })
      r.start()
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { metaKey: true }),
      )
      document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
      expect(onRecord).toHaveBeenCalledExactlyOnceWith(
        recordBy !== 'code' ? 'Mod+S' : 'Mod+[KeyS]',
        expect.anything(),
      )
    })

    describe('ignoreInputs', () => {
      it('should not record when focus is in a text input', () => {
        const onRecord = vi.fn()
        const r = createRecorder({ recordBy, onRecord })

        const input = document.createElement('input')
        input.type = 'text'
        document.body.appendChild(input)
        input.focus()

        r.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'g'))

        expect(r.store.state.steps.length).toBe(0)
        expect(r.store.state.isRecording).toBe(true)

        r.destroy()
        document.body.removeChild(input)
      })

      it('should still cancel via Escape from an input', () => {
        const onCancel = vi.fn()
        const r = createRecorder({
          recordBy,
          onRecord: vi.fn(),
          onCancel,
        })

        const input = document.createElement('input')
        input.type = 'text'
        document.body.appendChild(input)
        input.focus()

        r.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'Escape'))

        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(r.store.state.isRecording).toBe(false)

        document.body.removeChild(input)
      })

      it('should record normally when focus is not in an input', () => {
        const onRecord = vi.fn()
        const r = createRecorder({ recordBy, onRecord })

        const div = document.createElement('div')
        div.tabIndex = 0
        document.body.appendChild(div)
        div.focus()

        r.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
        document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
        document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))

        expect(onRecord).toHaveBeenCalledTimes(1)
        expect(r.store.state.isRecording).toBe(false)

        document.body.removeChild(div)
      })

      it('should record from inputs when ignoreInputs is false', () => {
        const onRecord = vi.fn()
        const r = createRecorder({
          recordBy,
          onRecord,
          ignoreInputs: false,
        })

        const input = document.createElement('input')
        input.type = 'text'
        document.body.appendChild(input)
        input.focus()

        r.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
        document.dispatchEvent(createKeyboardEvent('keydown', 'g'))
        document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))

        expect(onRecord).toHaveBeenCalledTimes(1)
        expect(r.store.state.isRecording).toBe(false)

        document.body.removeChild(input)
      })
    })
  },
)

describe('HotkeyRecorder with maxSteps: rejection and conflicts', () => {
  afterEach(() => {
    instances.splice(0).forEach((recorder) => recorder.destroy())
    window.dispatchEvent(new Event('blur'))
    HotkeyManager.resetInstance()
    document.body.replaceChildren()
  })

  /** Presses and releases a key on the document. */
  const tap = (key: string, code: string) => {
    keydown({ key, code, target: document })
    keyup({ key, code, target: document })
  }

  it('retains rejected sequence steps, allows editing, and clears without onRecord', () => {
    const onRecord = vi.fn(),
      onReject = vi.fn(),
      onClear = vi.fn()
    const r = new HotkeyRecorder({
      maxSteps: Infinity,
      onRecord,
      onReject,
      onClear,
      validate: (hotkey) =>
        (Array.isArray(hotkey) && hotkey.length >= 2) || 'Two steps required',
    })
    instances.push(r)
    r.start()
    tap('g', 'KeyG')
    r.commit()
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'validation' }),
    )
    expect(r.store.state.steps).toEqual(['G'])
    tap('g', 'KeyG')
    r.commit()
    expect(onRecord).toHaveBeenCalledWith(['G', 'G'], expect.anything())
    r.start()
    tap('x', 'KeyX')
    tap('Backspace', 'Backspace')
    expect(r.store.state.steps).toEqual([])
    keydown({ key: 'Backspace', code: 'Backspace', target: document })
    expect(onClear).toHaveBeenCalledOnce()
    expect(onRecord).toHaveBeenCalledTimes(1)
  })

  it('rejects a sequence-prefix conflict at commit without executing registered sequences', () => {
    const callback = vi.fn(),
      onRecord = vi.fn(),
      onReject = vi.fn()
    HotkeyManager.getInstance().register(['[KeyG]', '[KeyG]'], callback)
    const r = new HotkeyRecorder({
      maxSteps: Infinity,
      onRecord,
      onReject,
      detectConflicts: true,
    })
    instances.push(r)
    r.start()
    tap('g', 'KeyG')
    r.commit()
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'conflict',
        conflicts: [
          {
            registration: expect.objectContaining({ kind: 'sequence' }),
          },
        ],
      }),
    )
    expect(r.store.state.steps).toEqual(['G'])
    tap('g', 'KeyG')
    expect(callback).not.toHaveBeenCalled()
    expect(onRecord).not.toHaveBeenCalled()
  })
})
