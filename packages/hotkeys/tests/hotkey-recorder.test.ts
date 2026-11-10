import { keyEvent, keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { HotkeyManager } from '../src/hotkey-manager'
import { HotkeyRecorder } from '../src/hotkey-recorder'
import { matchesKeyboardEvent } from '../src/match'
import type {
  HotkeyChordRecorderOptions,
  HotkeySequenceRecorderOptions,
} from '../src/hotkey-recorder'
import type { HotkeyChord } from '../src/hotkey.types'

// Explicit US-layout fixtures; production recording must never infer a code from a key.
const fixtureCodes: Record<string, string> = {
  a: 'KeyA',
  b: 'KeyB',
  g: 'KeyG',
  s: 'KeyS',
  x: 'KeyX',
  z: 'KeyZ',
  ' ': 'Space',
  ArrowDown: 'ArrowDown',
  Enter: 'Enter',
  Escape: 'Escape',
  Backspace: 'Backspace',
}
const instances: Array<HotkeyRecorder> = []

/** Tracks recorder instances so active listeners and timers cannot leak between cases. */
function createRecorder(options: HotkeyChordRecorderOptions) {
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
  return keyEvent(type, { ...options, key, code: fixtureCodes[key] })
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

      it.each([
        ['Enter', 'Enter'],
        [' ', 'Space'],
      ])(
        'should record %j while the button that started recording has focus',
        (key, name) => {
          // Focus usually stays on the Record button after clicking it
          const onRecord = vi.fn()
          const recorder = createRecorder({ recordBy, onRecord })
          const button = document.createElement('button')
          document.body.appendChild(button)
          button.focus()

          recorder.start()
          button.dispatchEvent(createKeyboardEvent('keydown', key))

          expect(onRecord).toHaveBeenCalledExactlyOnceWith(
            recordBy === 'key' ? name : `[${name}]`,
          )
        },
      )

      it('should record navigation keys while focus is in an ARIA menu', () => {
        const onRecord = vi.fn()
        const recorder = createRecorder({ recordBy, onRecord })
        document.body.innerHTML =
          '<div role="menu"><div role="menuitem" tabindex="0">Item</div></div>'
        const item = document.querySelector<HTMLElement>('[role="menuitem"]')!
        item.focus()

        recorder.start()
        item.dispatchEvent(createKeyboardEvent('keydown', 'ArrowDown'))

        expect(onRecord).toHaveBeenCalledExactlyOnceWith(
          recordBy === 'key' ? 'ArrowDown' : '[ArrowDown]',
        )
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

describe.each([1, Infinity])(
  'HotkeyRecorder (maxSteps: %s) shadow inputs',
  (maxSteps) => {
    const multi = maxSteps > 1
    const createRecorder = (
      options: Omit<HotkeySequenceRecorderOptions, 'maxSteps'>,
    ) => {
      const recorder = new HotkeyRecorder({ ...options, maxSteps })
      instances.push(recorder)
      return recorder
    }
    afterEach(() => {
      instances.splice(0).forEach((recorder) => recorder.destroy())
      window.dispatchEvent(new Event('blur'))
      HotkeyManager.resetInstance()
      document.body.replaceChildren()
    })

    it.each(['key', 'code'] as const)(
      'ignores typing but allows Escape with recordBy %s',
      (recordBy) => {
        const host = document.createElement('div')
        document.body.append(host)
        const input = document.createElement('input')
        host.attachShadow({ mode: 'open' }).append(input)
        input.focus()
        const onRecord = vi.fn(),
          onCancel = vi.fn()
        const recorder = createRecorder({ recordBy, onRecord, onCancel })
        recorder.start()
        expect(
          keydown({ key: 's', code: 'KeyS', composed: true, target: input })
            .defaultPrevented,
        ).toBe(false)
        expect(onRecord).not.toHaveBeenCalled()
        expect(recorder.store.state.isRecording).toBe(true)
        expect(recorder.store.state.steps).toEqual([])
        keydown({
          key: 'Escape',
          code: 'Escape',
          composed: true,
          target: input,
        })
        expect(onCancel).toHaveBeenCalledOnce()
        expect(recorder.store.state.isRecording).toBe(false)
      },
    )

    it('records inside shadow inputs when ignoreInputs is false', () => {
      const host = document.createElement('div')
      document.body.append(host)
      const input = document.createElement('input')
      host.attachShadow({ mode: 'open' }).append(input)
      input.focus()
      const onRecord = vi.fn()
      const recorder = createRecorder({ onRecord, ignoreInputs: false })
      recorder.start()
      keydown({ key: 's', code: 'KeyS', composed: true, target: input })
      if (multi) recorder.commit()
      // One step records as a chord string with either maxSteps.
      expect(onRecord).toHaveBeenCalledExactlyOnceWith('[KeyS]')
    })

    it.each(['Ę', '@'])(
      'replays shifted AltGraph logical recordings of %s',
      (key) => {
        const onRecord = vi.fn()
        const recorder = createRecorder({
          onRecord,
          recordBy: 'key',
          platform: 'windows',
        })
        recorder.start()
        const event = keydown({
          key,
          code: 'KeyE',
          ctrlKey: true,
          altKey: true,
          shiftKey: true,
          altGraph: true,
          target: document,
        })
        if (multi) recorder.commit()
        const binding = onRecord.mock.calls[0]![0]
        expect(binding).toBe(`Shift+${key}`)
        expect(matchesKeyboardEvent(event, binding, 'windows')).toBe(true)
      },
    )
  },
)

describe('HotkeyRecorder with layouts and registered hotkeys', () => {
  /** Unlike createRecorder, leaves the platform to each test. */
  function recorder(options: HotkeyChordRecorderOptions) {
    const value = new HotkeyRecorder(options)
    instances.push(value)
    return value
  }
  afterEach(() => {
    instances.splice(0).forEach((r) => r.destroy())
    window.dispatchEvent(new Event('blur'))
    HotkeyManager.resetInstance()
    document.body.replaceChildren()
  })

  it.each([
    ['ß', 'KeyS', { altKey: true }, 'Alt+[KeyS]'],
    ['™', 'Digit2', { altKey: true }, 'Alt+[Digit2]'],
    ['Dead', 'KeyE', { altKey: true }, 'Alt+[KeyE]'],
    ['A', 'KeyQ', { shiftKey: true }, 'Shift+[KeyQ]'],
    ["'", 'KeyQ', {}, '[KeyQ]'],
    ['+', 'NumpadAdd', {}, '[NumpadAdd]'],
  ] as const)(
    'records and replays %s without layout conversion',
    (key, code, flags, expected) => {
      let binding: HotkeyChord | undefined
      const r = recorder({
        platform: 'mac',
        onRecord: (value) => {
          binding = value
        },
      })
      r.start()
      keydown({ key, code, ...flags, target: document })
      expect(binding).toBe(expected)
      keyup({ key, code, ...flags, target: document })
      const callback = vi.fn()
      HotkeyManager.getInstance().register(binding!, callback, {
        platform: 'mac',
      })
      keydown({ key, code, ...flags, target: document })
      expect(callback).toHaveBeenCalledOnce()
    },
  )

  it('preserves shifted layout letters and Unicode in key mode', () => {
    const onRecord = vi.fn(),
      r = recorder({ recordBy: 'key', onRecord })
    r.start()
    const event = keydown({
      key: 'A',
      code: 'KeyQ',
      shiftKey: true,
      target: document,
    })
    expect(onRecord).toHaveBeenCalledWith('Shift+A')
    expect(matchesKeyboardEvent(event, onRecord.mock.calls[0]![0])).toBe(true)
    keyup({ key: 'A', code: 'KeyQ', target: document })
    r.start()
    keydown({ key: 'ß', code: 'Minus', target: document })
    expect(onRecord).toHaveBeenLastCalledWith('ß')
  })
  // BUG-124: Turkish ı and i are different letters
  it('records Turkish ı and i as different keys in key mode', () => {
    const onRecord = vi.fn(),
      r = recorder({ recordBy: 'key', onRecord, platform: 'windows' })
    r.start()
    const dotless = keydown({ key: 'ı', code: 'KeyI', target: document })
    expect(onRecord).toHaveBeenLastCalledWith('ı')
    keyup({ key: 'ı', code: 'KeyI', target: document })
    expect(matchesKeyboardEvent(dotless, 'ı' as HotkeyChord, 'windows')).toBe(
      true,
    )
    r.start()
    const dotted = keydown({ key: 'i', code: 'Quote', target: document })
    expect(onRecord).toHaveBeenLastCalledWith('I')
    keyup({ key: 'i', code: 'Quote', target: document })
    expect(matchesKeyboardEvent(dotted, 'ı' as HotkeyChord, 'windows')).toBe(
      false,
    )
    r.start()
    keydown({ key: 'ı', code: 'KeyI', ctrlKey: true, target: document })
    expect(onRecord).toHaveBeenLastCalledWith('Mod+ı')
  })
  // Chrome on Linux Wayland reports Ctrl+` as key Unidentified (#229)
  it('records an Unidentified key by code, and skips it in key mode', () => {
    const onRecord = vi.fn(),
      r = recorder({ onRecord, platform: 'linux' })
    r.start()
    const unidentified = {
      key: 'Unidentified',
      code: 'Backquote',
      ctrlKey: true,
      target: document,
    }
    keydown(unidentified)
    expect(onRecord).toHaveBeenCalledWith('Mod+[Backquote]')

    const onKeyRecord = vi.fn(),
      keyMode = recorder({
        recordBy: 'key',
        onRecord: onKeyRecord,
        platform: 'linux',
      })
    keyMode.start()
    keydown(unidentified)
    expect(onKeyRecord).not.toHaveBeenCalled()
    expect(keyMode.store.state.isRecording).toBe(true)
    keydown({ key: 'k', code: 'KeyK', ctrlKey: true, target: document })
    expect(onKeyRecord).toHaveBeenCalledWith('Mod+K')
  })
  it('rejects missing codes and AltGraph while ignoring IME', () => {
    const onRecord = vi.fn(),
      onReject = vi.fn(),
      r = recorder({ onRecord, onReject, platform: 'windows' })
    r.start()
    keydown({ key: 's', code: '', target: document })
    expect(onReject).toHaveBeenLastCalledWith(
      expect.objectContaining({ reason: 'missing-code' }),
    )
    keydown({
      key: '@',
      code: 'KeyQ',
      ctrlKey: true,
      altKey: true,
      altGraph: true,
      target: document,
    })
    expect(onReject).toHaveBeenLastCalledWith(
      expect.objectContaining({ reason: 'alt-graph' }),
    )
    keydown({
      key: 'Process',
      code: 'KeyA',
      isComposing: true,
      target: document,
    })
    expect(onReject).toHaveBeenCalledTimes(2)
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)
  })
  // BUG-085: AltGr+Home on Linux fires no hotkey, so `Home` can't be recorded
  it('rejects AltGr that typed nothing new in key mode, and records AltGr characters', () => {
    const onRecord = vi.fn(),
      onReject = vi.fn(),
      r = recorder({ onRecord, onReject, recordBy: 'key', platform: 'linux' })
    r.start()
    keydown({ key: 'Home', code: 'Home', altGraph: true, target: document })
    keydown({ key: 'f', code: 'KeyF', altGraph: true, target: document })
    expect(onReject).toHaveBeenCalledTimes(2)
    expect(onReject).toHaveBeenLastCalledWith({ reason: 'alt-graph' })
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)

    // The same key without AltGr records
    keydown({ key: 'Home', code: 'Home', target: document })
    expect(onRecord).toHaveBeenLastCalledWith('Home')

    keyup({ key: 'Home', code: 'Home', target: document })
    r.start()
    keydown({ key: '@', code: 'KeyQ', altGraph: true, target: document })
    expect(onRecord).toHaveBeenLastCalledWith('@')
  })
  // BUG-087: with Control and CapsLock swapped, the CapsLock key reports ControlLeft
  it('ignores a key on a modifier position in code mode', () => {
    const onRecord = vi.fn(),
      onReject = vi.fn(),
      r = recorder({ onRecord, onReject, platform: 'linux' })
    r.start()
    keydown({ key: 'CapsLock', code: 'ControlLeft', target: document })
    keydown({
      key: 'A',
      code: 'AltRight',
      shiftKey: true,
      target: document,
    })
    expect(onRecord).not.toHaveBeenCalled()
    expect(onReject).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)
    keydown({ key: 'k', code: 'KeyK', ctrlKey: true, target: document })
    expect(onRecord).toHaveBeenCalledWith('Mod+[KeyK]')

    // Key mode records the key the press typed
    const onKeyRecord = vi.fn(),
      keyMode = recorder({
        onRecord: onKeyRecord,
        recordBy: 'key',
        platform: 'linux',
      })
    keyMode.start()
    keydown({ key: 'CapsLock', code: 'ControlLeft', target: document })
    expect(onKeyRecord).toHaveBeenCalledWith('CapsLock')
  })
  it('suppresses recording keydowns, repeats and releases then allows normal use', () => {
    const down = vi.fn(),
      up = vi.fn(),
      manager = HotkeyManager.getInstance()
    manager.register('Alt+[KeyS]', down, { platform: 'mac' })
    manager.register('Alt+[KeyS]', up, {
      eventType: 'keyup',
      conflictBehavior: 'allow',
      platform: 'mac',
    })
    const r = recorder({ onRecord: vi.fn(), platform: 'mac' })
    r.start()
    const altS = { key: 'ß', code: 'KeyS', altKey: true, target: document }
    keydown(altS)
    keydown({ ...altS, repeat: true })
    keyup(altS)
    expect(down).not.toHaveBeenCalled()
    expect(up).not.toHaveBeenCalled()
    keydown(altS)
    keyup(altS)
    expect(down).toHaveBeenCalledOnce()
    expect(up).toHaveBeenCalledOnce()
  })
  it('keeps recording after rejection and clears with only onClear', () => {
    const onRecord = vi.fn(),
      onClear = vi.fn(),
      onReject = vi.fn()
    const r = recorder({
      onRecord,
      onClear,
      onReject,
      validate: (_, { parsedChord }) =>
        parsedChord.modifiers.length > 0 || 'Include a modifier.',
    })
    r.start()
    keydown({ key: 's', code: 'KeyS', target: document })
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'validation',
        message: 'Include a modifier.',
      }),
    )
    expect(r.store.state.isRecording).toBe(true)
    keydown({ key: 'Backspace', code: 'Backspace', target: document })
    expect(onRecord).not.toHaveBeenCalled()
    expect(onClear).toHaveBeenCalledOnce()
    expect(r.store.state.isRecording).toBe(false)
  })
  it('rejects without a message when validate returns false', () => {
    const onReject = vi.fn()
    const r = recorder({ onRecord: vi.fn(), onReject, validate: () => false })
    r.start()
    keydown({ key: 's', code: 'KeyS', target: document })
    expect(onReject).toHaveBeenCalledWith({
      reason: 'validation',
      hotkey: '[KeyS]',
    })
  })
  it('detects physical/logical conflicts from source events and stays active', () => {
    HotkeyManager.getInstance().register('Alt+S', vi.fn(), { platform: 'mac' })
    const onReject = vi.fn(),
      onRecord = vi.fn()
    const r = recorder({
      onRecord,
      onReject,
      detectConflicts: true,
      platform: 'mac',
    })
    r.start()
    keydown({ key: 'ß', code: 'KeyS', altKey: true, target: document })
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({
        reason: 'conflict',
        conflicts: [
          { registration: expect.objectContaining({ kind: 'chord' }) },
        ],
      }),
    )
    expect(onRecord).not.toHaveBeenCalled()
    expect(r.store.state.isRecording).toBe(true)
  })

  it('releases pre-recording reset latches without firing keyup callbacks', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('[KeyS]', callback, {
      requireReset: true,
    })
    keydown({ key: 's', code: 'KeyS', target: document })
    const r = recorder({ onRecord: vi.fn() })
    r.start()
    keyup({ key: 's', code: 'KeyS', target: document })
    r.cancel()
    keydown({ key: 's', code: 'KeyS', target: document })
    expect(callback).toHaveBeenCalledTimes(2)
  })
  it('does not carry sequence progress across a recorded chord', () => {
    const callback = vi.fn()
    const g = { key: 'g', code: 'KeyG', target: document }
    const x = { key: 'x', code: 'KeyX', target: document }
    HotkeyManager.getInstance().register(['[KeyG]', '[KeyG]'], callback)
    keydown(g)
    keyup(g)
    const r = recorder({ onRecord: vi.fn() })
    r.start()
    keydown(x)
    keyup(x)
    keydown(g)
    keyup(g)
    expect(callback).not.toHaveBeenCalled()
    keydown(g)
    expect(callback).toHaveBeenCalledOnce()
  })

  it('ends recording suppression when macOS swallows the main key release', () => {
    const callback = vi.fn()
    HotkeyManager.getInstance().register('Mod+[KeyS]', callback, {
      platform: 'mac',
    })
    const r = recorder({ onRecord: vi.fn(), platform: 'mac' })
    r.start()
    keydown({ key: 'Meta', code: 'MetaLeft', metaKey: true, target: document })
    keydown({ key: 's', code: 'KeyS', metaKey: true, target: document })
    // Command+S may not deliver KeyS's keyup; Command release must end the chord.
    keyup({ key: 'Meta', code: 'MetaLeft', target: document })
    keydown({ key: 's', code: 'KeyS', metaKey: true, target: document })
    expect(callback).toHaveBeenCalledOnce()
  })
})
