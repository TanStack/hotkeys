import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AppHotkeysStore,
  HotkeyManager,
  HotkeyRecorder,
  defineAppHotkeys,
  formatForDisplay,
  getHotkeyManager,
  matchesKeyboardEvent,
  parseHotkey,
} from '../src'
import { codeToLogicalKey } from '../src/_keyboard-event'
import type { HotkeyChord } from '../src'

// Names that exist on Object.prototype
const PROTOTYPE_NAMES = ['toString', 'constructor', 'hasOwnProperty']

afterEach(() => {
  vi.restoreAllMocks()
  HotkeyManager.resetInstance()
  document.body.replaceChildren()
})

describe('names that exist on Object.prototype', () => {
  it('display as written instead of reading Object.prototype', () => {
    for (const name of PROTOTYPE_NAMES) {
      expect(formatForDisplay(name as HotkeyChord)).toBe(name)
      expect(formatForDisplay(`[${name}]` as HotkeyChord)).toBe(name)
      expect(formatForDisplay('[KeyA]', { keyLabels: {} })).toBe('A')
    }
  })

  it('are not physical codes with a logical key', () => {
    for (const name of [...PROTOTYPE_NAMES, '__proto__'])
      expect(codeToLogicalKey(name)).toBeUndefined()
  })

  it('are silently dropped from saved custom hotkeys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const appHotkeys = defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S' } })
    const saved = JSON.parse(
      '{"__proto__": {"polluted": true}, "toString": "Mod+T", "constructor": "Mod+C", "doc.save": "Mod+Shift+S"}',
    )
    const store = new AppHotkeysStore(appHotkeys, { customHotkeys: saved })
    expect(Object.keys(store.store.state.customHotkeys)).toEqual(['doc.save'])
    expect(warn).not.toHaveBeenCalled()
    expect(({} as Record<string, unknown>).polluted).toBeUndefined()
  })

  it('are not app hotkey ids', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const store = new AppHotkeysStore(
      defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S' } }),
    )
    for (const name of PROTOTYPE_NAMES) {
      expect(store.get(name)).toBeUndefined()
      expect(store.findConflicts(name as never, 'Mod+K')).toEqual([])
      expect(store.setCustomHotkey(name as never, 'Mod+K')).toEqual([])
    }
    expect(store.store.state.customHotkeys).toEqual({})
  })
})

describe('recording whitespace', () => {
  function record(key: string) {
    const onRecord = vi.fn()
    const onReject = vi.fn()
    const recorder = new HotkeyRecorder({
      platform: 'mac',
      recordBy: 'key',
      maxSteps: 1,
      onRecord,
      onReject,
    })
    recorder.start()
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', {
        key,
        altKey: true,
        bubbles: true,
        cancelable: true,
      }),
    )
    recorder.destroy()
    return { onRecord, onReject }
  }

  it('rejects whitespace characters, such as Option+Space on macOS', () => {
    const { onRecord, onReject } = record(' ')
    expect(onRecord).not.toHaveBeenCalled()
    expect(onReject).toHaveBeenCalledWith({
      reason: 'whitespace',
      hotkey: 'Alt+ ',
    })
  })

  it('records the plus key and the space bar', () => {
    expect(record('+').onRecord).toHaveBeenCalledWith('Alt++')
    expect(record(' ').onRecord).toHaveBeenCalledWith('Alt+Space')
  })
})

describe('registering a hotkey with an unknown key name', () => {
  it('warns in development that it may never fire', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    getHotkeyManager().register(['G', 'escape'] as never, () => {})
    expect(warn).toHaveBeenCalledWith(
      "[hotkeys] Unknown key 'escape' in 'G escape' (names are case-sensitive)",
    )
  })

  it('does not warn for typed hotkeys', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const manager = getHotkeyManager()
    for (const hotkey of [
      'Mod+Escape',
      'F24',
      'Shift+MediaPlayPause',
      'Alt+[KeyA]',
      'Mod++',
      'é',
    ] as Array<HotkeyChord>)
      manager.register(hotkey, () => {})
    expect(warn).not.toHaveBeenCalled()
  })
})

describe('hotkeys without a usable key', () => {
  // TypeScript rejects all of these, but untyped input can still pass them.
  const UNUSABLE: Array<[string, unknown]> = [
    ['an unknown modifier', 'Ctl+K'],
    ['an unknown modifier after a known one', 'Shift+Ctl+K'],
    ['only modifiers', 'Shift+Alt+Mod'],
    ['a lone modifier', 'Shift'],
    ['a modifier code', '[ShiftLeft]'],
    ['a modifier code after its modifier', 'Shift+[ShiftLeft]'],
    ['a chord object with a modifier key', { key: 'Shift', shift: true }],
    ['a chord object with a modifier code', { code: 'MetaLeft' }],
    ['a sequence with an unknown modifier', ['G', 'Ctl+K']],
    ['a sequence with a modifier step', ['G', 'Shift']],
  ]

  // Key presses that the hotkeys above used to match
  function pressAll() {
    for (const type of ['keydown', 'keyup']) {
      for (const init of [
        { key: 'k', code: 'KeyK' },
        { key: 'g', code: 'KeyG' },
        { key: 'Shift', code: 'ShiftLeft', shiftKey: type === 'keydown' },
        { key: 'Meta', code: 'MetaLeft', metaKey: type === 'keydown' },
      ]) {
        document.dispatchEvent(new KeyboardEvent(type, init))
      }
    }
  }

  it.each(UNUSABLE)('register nothing for %s', (_, hotkey) => {
    const callback = vi.fn()
    for (const eventType of ['keydown', 'keyup'] as const) {
      const handle = getHotkeyManager().register(hotkey as never, callback, {
        eventType,
      })
      expect(handle.isActive).toBe(false)
    }
    expect(getHotkeyManager().registrations.state.size).toBe(0)
    pressAll()
    expect(callback).not.toHaveBeenCalled()
  })

  it('an unknown modifier leaves the chord without a key', () => {
    expect(parseHotkey('Ctl+K' as never)).toMatchObject({
      key: '',
      ctrl: false,
    })
    const k = new KeyboardEvent('keydown', { key: 'k', code: 'KeyK' })
    expect(matchesKeyboardEvent(k, 'Ctl+K' as never)).toBe(false)
  })

  it('a modifier-only chord matches no key press', () => {
    const shiftUp = new KeyboardEvent('keyup', {
      key: 'Shift',
      code: 'ShiftLeft',
    })
    expect(matchesKeyboardEvent(shiftUp, '[ShiftLeft]' as never)).toBe(false)
    expect(matchesKeyboardEvent(shiftUp, 'Shift' as never)).toBe(false)
  })
})
