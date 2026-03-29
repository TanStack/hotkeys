import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyRecorder } from '../src/hotkey-recorder'

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
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    bubbles: true,
  })
}

describe('HotkeyRecorder', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('ignoreInputs', () => {
    it('should not record when focus is in a text input', () => {
      const onRecord = vi.fn()
      const recorder = new HotkeyRecorder({ onRecord })

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
      const recorder = new HotkeyRecorder({ onRecord: vi.fn(), onCancel })

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
      const recorder = new HotkeyRecorder({ onRecord })

      const div = document.createElement('div')
      div.tabIndex = 0
      document.body.appendChild(div)
      div.focus()

      recorder.start()
      document.dispatchEvent(
        createKeyboardEvent('keydown', 's', { ctrlKey: true }),
      )

      expect(onRecord).toHaveBeenCalledTimes(1)
      expect(recorder.store.state.isRecording).toBe(false)

      document.body.removeChild(div)
    })

    it('should not record when focus is in a textarea', () => {
      const onRecord = vi.fn()
      const recorder = new HotkeyRecorder({ onRecord })

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
      const recorder = new HotkeyRecorder({
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

      expect(onRecord).toHaveBeenCalledTimes(1)
      expect(recorder.store.state.isRecording).toBe(false)

      document.body.removeChild(input)
    })

    it('should not record when focus is in a contenteditable element', () => {
      const onRecord = vi.fn()
      const recorder = new HotkeyRecorder({ onRecord })

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
})
