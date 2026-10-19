import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  HotkeyManager,
  HotkeyRecorder,
  matchesKeyboardEvent,
  normalizeHotkey,
  parseKeyboardEvent,
} from '../src'
import type { HotkeyChord, HotkeyChordRecorderOptions } from '../src'

/**
 * Event shapes for AltGr held. Linux shapes match what Chromium and Firefox
 * report for real xkb key presses (see e2e/layouts). Windows browsers may also
 * set Control and Alt, so both Windows shapes are covered.
 */
const shapes = [
  ['Windows, Control+Alt flags', 'windows', { ctrlKey: true, altKey: true }],
  ['Windows, AltGraph only', 'windows', {}],
  ['Linux', 'linux', {}],
] as const

const windowsShapes = shapes.filter(([, platform]) => platform === 'windows')

function keyEvent(
  key: string,
  code: string,
  flags: KeyboardEventInit = {},
  altGraph = false,
  type: 'keydown' | 'keyup' = 'keydown',
): KeyboardEvent {
  const event = new KeyboardEvent(type, {
    key,
    code,
    bubbles: true,
    cancelable: true,
    ...flags,
  })
  Object.defineProperty(event, 'getModifierState', {
    value: (name: string) => altGraph && name === 'AltGraph',
  })
  return event
}

const recorders: Array<HotkeyRecorder> = []
function recorder(options: HotkeyChordRecorderOptions) {
  const value = new HotkeyRecorder(options)
  recorders.push(value)
  value.start()
  return value
}

afterEach(() => {
  recorders.splice(0).forEach((r) => r.destroy())
  window.dispatchEvent(new Event('blur'))
  HotkeyManager.resetInstance()
})

function altGrFor(flags: KeyboardEventInit) {
  return (key: string, code: string, extra: KeyboardEventInit = {}) =>
    keyEvent(key, code, { ...flags, ...extra }, true)
}

function matchesFor(platform: 'windows' | 'linux') {
  return (event: KeyboardEvent, hotkey: string) =>
    matchesKeyboardEvent(event, hotkey as HotkeyChord, platform)
}

describe.each(shapes)('AltGr held (%s)', (_, platform, flags) => {
  const altGr = altGrFor(flags)
  const matches = matchesFor(platform)

  it.each([
    // [what the key typed, code, binding without Control+Alt]
    ['f', 'KeyF', 'F'],
    ['f', 'KeyF', '[KeyF]'],
    ['7', 'Digit7', '7'],
    ['Home', 'Home', 'Home'],
    ['End', 'End', 'End'],
    ['Home', 'Home', '[Home]'],
    ['F5', 'F5', 'F5'],
    ['Enter', 'Enter', 'Enter'],
    [' ', 'Space', 'Space'],
    ['ArrowLeft', 'ArrowLeft', 'ArrowLeft'],
    ['Escape', 'Escape', 'Escape'],
  ])(
    'AltGr+%s (%s) typing its plain value does not fire %s',
    (key, code, hotkey) => {
      expect(matches(altGr(key, code), hotkey)).toBe(false)
    },
  )

  it('AltGr+Shift+F typing F does not fire Shift+F', () => {
    expect(matches(altGr('F', 'KeyF', { shiftKey: true }), 'Shift+F')).toBe(
      false,
    )
  })

  it('characters typed with AltGr still match as before', () => {
    expect(matches(altGr('@', 'KeyQ'), '@')).toBe(true)
    expect(matches(altGr('€', 'KeyE'), '€')).toBe(true)
    expect(matches(altGr('{', 'Digit7'), '{')).toBe(true)
    expect(matches(altGr('µ', 'KeyM'), 'M')).toBe(false)
  })

  it('characters typed with AltGr never fire Control+Alt chords', () => {
    expect(matches(altGr('@', 'KeyQ'), 'Control+Alt+Q')).toBe(false)
    expect(matches(altGr('@', 'KeyQ'), 'Control+Alt+[KeyQ]')).toBe(false)
    expect(matches(altGr('đ', 'KeyF'), 'Control+Alt+F')).toBe(false)
  })

  it('parses character entry as the character', () => {
    expect(
      normalizeHotkey(
        parseKeyboardEvent(altGr('@', 'KeyQ'), platform),
        platform,
      ),
    ).toBe('@')
  })

  it('rejects AltGr character entry when recording in code mode', () => {
    const onRecord = vi.fn()
    const onReject = vi.fn()
    recorder({ onRecord, onReject, platform })
    document.dispatchEvent(altGr('@', 'KeyQ'))
    expect(onReject).toHaveBeenCalledWith(
      expect.objectContaining({ reason: 'alt-graph' }),
    )
    expect(onRecord).not.toHaveBeenCalled()
  })
})

// Windows reports AltGr as Control+Alt, and native apps treat it that way.
describe.each(windowsShapes)('AltGr held (%s)', (_, platform, flags) => {
  const altGr = altGrFor(flags)
  const matches = matchesFor(platform)

  it.each([
    ['Home', 'Home', 'Control+Alt+Home'],
    ['Home', 'Home', 'Mod+Alt+Home'],
    ['Home', 'Home', 'Control+Alt+[Home]'],
    ['End', 'End', 'Control+Alt+End'],
    ['f', 'KeyF', 'Control+Alt+F'],
    ['f', 'KeyF', 'Control+Alt+[KeyF]'],
  ])('AltGr+%s (%s) fires %s', (key, code, hotkey) => {
    expect(matches(altGr(key, code), hotkey)).toBe(true)
  })

  it('AltGr+Shift+F fires Control+Alt+Shift+F', () => {
    const shifted = altGr('F', 'KeyF', { shiftKey: true })
    expect(matches(shifted, 'Control+Alt+Shift+F')).toBe(true)
    expect(matches(shifted, 'Control+Alt+F')).toBe(false)
  })

  it('parses AltGr with a plain key as Control+Alt', () => {
    expect(
      normalizeHotkey(
        parseKeyboardEvent(altGr('Home', 'Home'), platform),
        platform,
      ),
    ).toBe('Mod+Alt+Home')
  })

  it('fires only the Control+Alt registration in the manager', () => {
    const manager = HotkeyManager.getInstance()
    const plain = vi.fn()
    const controlAlt = vi.fn()
    manager.register('F', plain, { platform })
    manager.register('Control+Alt+F', controlAlt, { platform })

    document.dispatchEvent(altGr('f', 'KeyF'))
    expect(controlAlt).toHaveBeenCalledOnce()
    expect(plain).not.toHaveBeenCalled()

    document.dispatchEvent(keyEvent('f', 'KeyF', flags, true, 'keyup'))
    document.dispatchEvent(keyEvent('f', 'KeyF'))
    expect(plain).toHaveBeenCalledOnce()
  })

  it.each([
    ['code', 'Home', 'Home', 'Mod+Alt+[Home]'],
    ['code', 'Backspace', 'Backspace', 'Mod+Alt+[Backspace]'],
    ['key', 'Home', 'Home', 'Mod+Alt+Home'],
    ['key', 'f', 'KeyF', 'Mod+Alt+F'],
  ] as const)(
    'records AltGr+%s in %s mode as %s and replays it',
    (recordBy, key, code, expected) => {
      const onRecord = vi.fn()
      recorder({ onRecord, platform, recordBy })
      const event = altGr(key, code)
      document.dispatchEvent(event)
      expect(onRecord).toHaveBeenCalledWith(expected)
      expect(matches(event, expected)).toBe(true)
    },
  )
})

describe('AltGr held on Linux', () => {
  const altGr = altGrFor({})
  const matches = matchesFor('linux')

  it('is not Control+Alt', () => {
    expect(matches(altGr('Home', 'Home'), 'Control+Alt+Home')).toBe(false)
    expect(matches(altGr('f', 'KeyF'), 'Control+Alt+F')).toBe(false)
  })

  it('left Control+Alt still fires Control+Alt chords', () => {
    const event = keyEvent('Home', 'Home', { ctrlKey: true, altKey: true })
    expect(matches(event, 'Control+Alt+Home')).toBe(true)
  })

  it('fires no registration for AltGr+F typing f', () => {
    const plain = vi.fn()
    HotkeyManager.getInstance().register('F', plain, { platform: 'linux' })
    document.dispatchEvent(altGr('f', 'KeyF'))
    expect(plain).not.toHaveBeenCalled()
  })
})

describe('Option reporting AltGraph on macOS', () => {
  it('stays a normal Alt modifier', () => {
    const option = keyEvent('Home', 'Home', { altKey: true }, true)
    expect(matchesKeyboardEvent(option, 'Alt+Home', 'mac')).toBe(true)
    expect(matchesKeyboardEvent(option, 'Control+Alt+Home', 'mac')).toBe(false)
  })
})
