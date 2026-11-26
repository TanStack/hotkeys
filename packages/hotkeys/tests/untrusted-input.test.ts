import { keyEvent, keydown, keyup } from '@tanstack/hotkeys-test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
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
    keydown({ key, altKey: true, cancelable: true, target: document.body })
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
    expect(record('+').onRecord).toHaveBeenCalledWith(
      'Alt++',
      expect.anything(),
    )
    expect(record(' ').onRecord).toHaveBeenCalledWith(
      'Alt+Space',
      expect.anything(),
    )
  })
})

// Chrome autofill and some extensions send a plain `Event` named keydown,
// with neither `key` nor `code`
describe('recording a key event without key or code', () => {
  it.each([1, 3])('ignores it with maxSteps %i', (maxSteps) => {
    const onRecord = vi.fn()
    const onReject = vi.fn()
    const recorder = new HotkeyRecorder({ maxSteps, onRecord, onReject })
    recorder.start()
    expect(() =>
      document.body.dispatchEvent(
        new Event('keydown', { bubbles: true, cancelable: true }),
      ),
    ).not.toThrow()
    expect(recorder.store.state.steps).toEqual([])
    expect(onReject).toHaveBeenCalledWith({ reason: 'missing-code' })
    // Recording carries on
    keydown({ key: 'k', code: 'KeyK', target: document.body })
    recorder.commit()
    expect(onRecord).toHaveBeenCalledWith('K', expect.anything())
    recorder.destroy()
  })
})

describe('a key event without key or code between sequence steps', () => {
  // Clears keys an earlier recording still holds
  beforeEach(() => window.dispatchEvent(new Event('blur')))
  afterEach(() => HotkeyManager.resetInstance())

  it('keeps the sequence in progress', () => {
    const callback = vi.fn()
    getHotkeyManager().register(['G', 'G'], callback)
    const g = { key: 'g', code: 'KeyG', target: document.body }
    keydown(g)
    keyup(g)
    // Autofill fills a field between the two presses
    document.body.dispatchEvent(new Event('keydown', { bubbles: true }))
    document.body.dispatchEvent(new Event('keyup', { bubbles: true }))
    keydown(g)
    expect(callback).toHaveBeenCalledOnce()
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

  // macOS reports Cmd+Shift+1 as `1`, so `Mod+!` never sees `!` there
  it('warns that Mod with a shifted digit, `<` or `>` does not fire on a US Mac', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const manager = getHotkeyManager()
    manager.register('Mod+!', () => {}, { platform: 'mac' })
    expect(warn).toHaveBeenCalledWith(
      "[hotkeys] 'Mod+!' does not fire on a US Mac keyboard, where Command+Shift+1 reports '1'. Register it with Shift and that key too.",
    )
    warn.mockClear()
    // Once per hotkey, so re-registering on every render stays quiet
    manager.register('Mod+!', () => {}, {
      platform: 'mac',
      conflictBehavior: 'allow',
    })
    expect(warn).not.toHaveBeenCalled()
    for (const hotkey of ['Mod+@', 'Mod+)', 'Mod+<'] as Array<HotkeyChord>)
      manager.register(hotkey, () => {}, { platform: 'mac' })
    expect(warn).toHaveBeenCalledTimes(3)
    expect(warn).toHaveBeenLastCalledWith(
      "[hotkeys] 'Mod+<' does not fire on a US Mac keyboard, where Command+Shift+, reports ','. Register it with Shift and that key too.",
    )
    warn.mockClear()
    // The matcher maps the other symbols back, elsewhere the character
    // arrives, and with Option it comes from the Option layer
    for (const hotkey of ['Mod++', 'Mod+?', 'Mod+:'] as Array<HotkeyChord>)
      manager.register(hotkey, () => {}, { platform: 'mac' })
    manager.register('Mod+!', () => {}, { platform: 'windows' })
    manager.register('Mod+Alt+!', () => {}, { platform: 'mac' })
    manager.register('Mod+1', () => {}, { platform: 'mac' })
    expect(warn).not.toHaveBeenCalled()
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
    for (const type of ['keydown', 'keyup'] as const) {
      for (const init of [
        { key: 'k', code: 'KeyK' },
        { key: 'g', code: 'KeyG' },
        { key: 'Shift', code: 'ShiftLeft', shiftKey: type === 'keydown' },
        { key: 'Meta', code: 'MetaLeft', metaKey: type === 'keydown' },
      ]) {
        keyEvent(type, { ...init, target: document })
      }
    }
  }

  it.each(UNUSABLE)('register nothing for %s', (_, hotkey) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
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

  it.each([
    ['Ctl+K', '"Ctl+K"'],
    ['ctrl+k ctrl+c', '"ctrl+k ctrl+c"'],
    ['Shift', '"Shift"'],
    [['G', 'Ctl+K'], '["G","Ctl+K"]'],
    [{ code: 'MetaLeft' }, '{"code":"MetaLeft"}'],
    [{ key: '' }, '{"key":""}'],
  ])('warn in development that %j was not registered', (hotkey, text) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    getHotkeyManager().register(hotkey as never, () => {})
    expect(warn.mock.calls).toEqual([
      [`[hotkeys] Invalid hotkey ${text} was not registered`],
    ])
  })

  // These mean "no hotkey", as an unbound custom hotkey does
  it.each([[''], [null], [undefined], [[]]])('stay silent for %j', (hotkey) => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    getHotkeyManager().register(hotkey as never, () => {})
    expect(warn).not.toHaveBeenCalled()
  })

  it('an unknown modifier leaves the chord without a key', () => {
    expect(parseHotkey('Ctl+K' as never)).toMatchObject({
      key: '',
      ctrl: false,
    })
    const k = keydown({ key: 'k', code: 'KeyK' })
    expect(matchesKeyboardEvent(k, 'Ctl+K' as never)).toBe(false)
  })

  it('a modifier-only chord matches no key press', () => {
    const shiftUp = keyup({ key: 'Shift', code: 'ShiftLeft' })
    expect(matchesKeyboardEvent(shiftUp, '[ShiftLeft]' as never)).toBe(false)
    expect(matchesKeyboardEvent(shiftUp, 'Shift' as never)).toBe(false)
  })
})
