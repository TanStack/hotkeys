import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeySequenceRecorder } from '../src/hotkey-sequence-recorder'

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
const instances: Array<HotkeySequenceRecorder> = []

/** Tracks recorder instances so active listeners and timers cannot leak between cases. */
function createRecorder(
  options: ConstructorParameters<typeof HotkeySequenceRecorder>[0],
) {
  const recorder = new HotkeySequenceRecorder({ platform: 'mac', ...options })
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
  return new KeyboardEvent(type, {
    key,
    code: fixtureCodes[key],
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: true,
  })
}

describe.each(['key', 'code', undefined] as const)(
  'HotkeySequenceRecorder (recordBy: %s)',
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
        recordBy === 'key' ? ['G', 'G'] : ['[KeyG]', '[KeyG]'],
      )
      expect(r.store.state.isRecording).toBe(false)
      const [recorded] = onRecord.mock.calls[0] ?? []
      expect(recorded).toBeDefined()
      expect(r.store.state.recordedSequence).toEqual(recorded)
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
        recordBy === 'key' ? ['A'] : ['[KeyA]'],
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
      expect(idleRecorded).toEqual(recordBy === 'key' ? ['G'] : ['[KeyG]'])
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

    it('commitOnEnter false allows Enter as chord when using commit()', () => {
      const onRecord = vi.fn()
      const r = createRecorder({
        recordBy,
        onRecord,
        commitOnEnter: false,
        commitKeys: 'enter',
      })
      r.start()
      document.dispatchEvent(createKeyboardEvent('keydown', 'a'))
      document.dispatchEvent(createKeyboardEvent('keydown', 'Enter'))
      expect(r.store.state.steps.length).toBe(2)
      r.commit()
      expect(onRecord).toHaveBeenCalledExactlyOnceWith(
        recordBy === 'key' ? ['A', 'Enter'] : ['[KeyA]', '[Enter]'],
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
