import { afterEach, describe, expect, expectTypeOf, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  formatForDisplay,
  formatHotkey,
  matchesKeyboardEvent,
  normalizeHotkey,
  parseHotkey,
} from '../src'
import type { HotkeySequenceRecorderOptions } from '../src'
import type { LogicalKey, ParsedHotkeyChord } from '../src'

const recorders: Array<HotkeyRecorder> = []
afterEach(() => {
  recorders.splice(0).forEach((recorder) => recorder.destroy())
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

/** Dispatches an actual press or release so input focus and composed paths are observable. */
function dispatch(
  target: EventTarget,
  type: 'keydown' | 'keyup',
  key: string,
  code: string,
) {
  const event = new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    composed: true,
    cancelable: true,
  })
  target.dispatchEvent(event)
  return event
}

it('releases requireReset after a callback focuses an input', () => {
  const input = document.createElement('input')
  document.body.append(input)
  const callback = vi.fn(() => input.focus())
  HotkeyManager.getInstance().register('[KeyS]', callback, {
    requireReset: true,
  })
  dispatch(document, 'keydown', 's', 'KeyS')
  dispatch(input, 'keyup', 's', 'KeyS')
  input.blur()
  dispatch(document, 'keydown', 's', 'KeyS')
  expect(callback).toHaveBeenCalledTimes(2)
})

it('releases requireReset while a registration is disabled', () => {
  const callback = vi.fn()
  const handle = HotkeyManager.getInstance().register('[KeyS]', callback, {
    requireReset: true,
  })
  dispatch(document, 'keydown', 's', 'KeyS')
  handle.setOptions({ enabled: false })
  dispatch(document, 'keyup', 's', 'KeyS')
  handle.setOptions({ enabled: true })
  dispatch(document, 'keydown', 's', 'KeyS')
  expect(callback).toHaveBeenCalledTimes(2)
})

describe.each([1, Infinity])(
  'HotkeyRecorder (maxSteps: %s) shadow inputs',
  (maxSteps) => {
    const multi = maxSteps > 1
    const createRecorder = (
      options: Omit<HotkeySequenceRecorderOptions, 'maxSteps'>,
    ) => new HotkeyRecorder({ ...options, maxSteps })
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
        recorders.push(recorder)
        recorder.start()
        expect(dispatch(input, 'keydown', 's', 'KeyS').defaultPrevented).toBe(
          false,
        )
        expect(onRecord).not.toHaveBeenCalled()
        expect(recorder.store.state.isRecording).toBe(true)
        expect(recorder.store.state.steps).toEqual([])
        dispatch(input, 'keydown', 'Escape', 'Escape')
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
      recorders.push(recorder)
      recorder.start()
      dispatch(input, 'keydown', 's', 'KeyS')
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
        recorders.push(recorder)
        recorder.start()
        const event = new KeyboardEvent('keydown', {
          key,
          code: 'KeyE',
          ctrlKey: true,
          altKey: true,
          shiftKey: true,
          bubbles: true,
        })
        Object.defineProperty(event, 'getModifierState', {
          value: (name: string) => name === 'AltGraph',
        })
        document.dispatchEvent(event)
        if (multi) recorder.commit()
        const binding = onRecord.mock.calls[0]![0]
        expect(binding).toBe(`Shift+${key}`)
        expect(matchesKeyboardEvent(event, binding, 'windows')).toBe(true)
      },
    )
  },
)

it('rejects physical tokens in raw and parsed logical fields without changing Unicode support', () => {
  expectTypeOf<Extract<LogicalKey, `[${string}]`>>().toBeNever()
  for (const key of ['[KeyS]', ' [Enter] ', '[UnknownCode]']) {
    const raw = { key, mod: true }
    expect(() => parseHotkey(raw)).toThrow('code field')
    expect(() => normalizeHotkey(raw)).toThrow('code field')
    expect(() => formatForDisplay(raw)).toThrow('code field')
    const manager = HotkeyManager.getInstance()
    expect(() => manager.register(raw, vi.fn())).toThrow('code field')
    expect(manager.registrations.state.size).toBe(0)
    const parsed: ParsedHotkeyChord = {
      key,
      ctrl: false,
      alt: false,
      shift: false,
      meta: false,
      modifiers: [],
    }
    expect(() => formatHotkey(parsed)).toThrow('code field')
    expect(() => normalizeHotkey(parsed)).toThrow('code field')
    expect(() => formatForDisplay(parsed)).toThrow('code field')
  }
  for (const key of ['[', ']', 'ß', 'Ę', '字', 'é']) {
    const raw = { key }
    expect(parseHotkey(normalizeHotkey(raw))).toEqual(parseHotkey(raw))
  }
  expect(parseHotkey('Mod+[KeyS]', 'mac')).toEqual(
    parseHotkey({ code: 'KeyS', mod: true }, 'mac'),
  )
})
