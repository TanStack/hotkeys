import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  AppHotkeysStore,
  HotkeyManager,
  HotkeyRecorder,
  defineAppHotkeys,
  formatForDisplay,
  getHotkeyManager,
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

  it('are dropped from saved custom hotkeys with a warning', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const appHotkeys = defineAppHotkeys({ 'doc.save': { hotkey: 'Mod+S' } })
    const saved = JSON.parse(
      '{"__proto__": {"polluted": true}, "toString": "Mod+T", "constructor": "Mod+C", "doc.save": "Mod+Shift+S"}',
    )
    const store = new AppHotkeysStore(appHotkeys, { customHotkeys: saved })
    expect(Object.keys(store.store.state.customHotkeys)).toEqual(['doc.save'])
    expect(warn).toHaveBeenCalledTimes(3)
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
      reason: 'invalid',
      message: 'Whitespace keys cannot be recorded',
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
      "Unknown key 'escape' in 'G escape'. Key names are case-sensitive, such as 'Escape' and 'F1', so this hotkey may never fire.",
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
