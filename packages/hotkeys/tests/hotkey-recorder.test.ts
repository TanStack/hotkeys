import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyRecorder } from '../src/hotkey-recorder'

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
  options: ConstructorParameters<typeof HotkeyRecorder>[0],
) {
  const recorder = new HotkeyRecorder({ platform: 'mac', ...options })
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
  'HotkeyRecorder (recordBy: %s)',
  (recordBy) => {
    afterEach(() => {
      instances.splice(0).forEach((recorder) => recorder.destroy())
      window.dispatchEvent(new Event('blur'))
      document.body.replaceChildren()
      vi.restoreAllMocks()
    })

    describe('ignoreInputs', () => {
      it('should not record when focus is in a text input', () => {
        const onRecord = vi.fn()
        const recorder = createRecorder({ recordBy, onRecord })

        const input = document.createElement('input')
        input.type = 'text'
        document.body.appendChild(input)
        input.focus()

        recorder.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'a'))

        expect(onRecord).not.toHaveBeenCalled()
        expect(recorder.store.state.isRecording).toBe(true)

        recorder.destroy()
        document.body.removeChild(input)
      })

      it('should still cancel via Escape from an input', () => {
        const onCancel = vi.fn()
        const recorder = createRecorder({
          recordBy,
          onRecord: vi.fn(),
          onCancel,
        })

        const input = document.createElement('input')
        input.type = 'text'
        document.body.appendChild(input)
        input.focus()

        recorder.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'Escape'))

        expect(onCancel).toHaveBeenCalledTimes(1)
        expect(recorder.store.state.isRecording).toBe(false)

        document.body.removeChild(input)
      })

      it('should record normally when focus is not in an input', () => {
        const onRecord = vi.fn()
        const recorder = createRecorder({ recordBy, onRecord })

        const div = document.createElement('div')
        div.tabIndex = 0
        document.body.appendChild(div)
        div.focus()

        recorder.start()
        document.dispatchEvent(
          createKeyboardEvent('keydown', 's', { ctrlKey: true }),
        )

        expect(onRecord).toHaveBeenCalledExactlyOnceWith(
          recordBy === 'key' ? 'Control+S' : 'Control+[KeyS]',
        )
        expect(recorder.store.state.isRecording).toBe(false)

        document.body.removeChild(div)
      })

      it('should not record when focus is in a textarea', () => {
        const onRecord = vi.fn()
        const recorder = createRecorder({ recordBy, onRecord })

        const textarea = document.createElement('textarea')
        document.body.appendChild(textarea)
        textarea.focus()

        recorder.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'a'))

        expect(onRecord).not.toHaveBeenCalled()
        expect(recorder.store.state.isRecording).toBe(true)

        recorder.destroy()
        document.body.removeChild(textarea)
      })

      it('should record from inputs when ignoreInputs is false', () => {
        const onRecord = vi.fn()
        const recorder = createRecorder({
          recordBy,
          onRecord,
          ignoreInputs: false,
        })

        const input = document.createElement('input')
        input.type = 'text'
        document.body.appendChild(input)
        input.focus()

        recorder.start()
        document.dispatchEvent(
          createKeyboardEvent('keydown', 's', { ctrlKey: true }),
        )

        expect(onRecord).toHaveBeenCalledExactlyOnceWith(
          recordBy === 'key' ? 'Control+S' : 'Control+[KeyS]',
        )
        expect(recorder.store.state.isRecording).toBe(false)

        document.body.removeChild(input)
      })

      it('should not record when focus is in a contenteditable element', () => {
        const onRecord = vi.fn()
        const recorder = createRecorder({ recordBy, onRecord })

        const div = document.createElement('div')
        div.contentEditable = 'true'
        document.body.appendChild(div)
        div.focus()

        recorder.start()
        document.dispatchEvent(createKeyboardEvent('keydown', 'a'))

        expect(onRecord).not.toHaveBeenCalled()
        expect(recorder.store.state.isRecording).toBe(true)

        recorder.destroy()
        document.body.removeChild(div)
      })
    })
  },
)
