import { expect, expectTypeOf, it } from 'vitest'
import {
  ALL_KEYS,
  FUNCTION_KEYS,
  formatForDisplay,
  matchesKeyboardEvent,
  normalizeKeyName,
  parseHotkey,
  validateHotkey,
} from '../src'
import { LOGICAL_ONLY_NAMED_KEYS, SHARED_NAMED_KEYS } from '../src/_named-keys'
import { hotkeyChordFromKeydown } from '../src/_recorder-chord'
import type { FunctionKey, Hotkey, NamedKey, PhysicalKeyCode } from '../src'

it('types corresponding logical and physical names without conflating their spellings', () => {
  expectTypeOf<`Mod+${FunctionKey}`>().toExtend<Hotkey>()
  expectTypeOf<`Mod+[${FunctionKey}]`>().toExtend<Hotkey>()
  expectTypeOf<`Mod+${NamedKey}`>().toExtend<Hotkey>()
  expectTypeOf<(typeof SHARED_NAMED_KEYS)[number]>().toExtend<PhysicalKeyCode>()
  expectTypeOf<
    Extract<
      'F25' | 'Mod+NumpadEnter' | 'Mod+LaunchApp1' | 'Mod+[LaunchApplication1]',
      Hotkey
    >
  >().toBeNever()
})

it.each([...FUNCTION_KEYS, ...SHARED_NAMED_KEYS])(
  'validates, records, and matches both identities for %s',
  (key) => {
    const logical: Hotkey = `Alt+${key}`
    const physical: Hotkey = `Alt+[${key}]`
    const event = new KeyboardEvent('keydown', { key, code: key, altKey: true })
    expect(ALL_KEYS.has(key)).toBe(true)
    expect(normalizeKeyName(key.toLowerCase())).toBe(key)
    expect(parseHotkey(logical.toLowerCase()).key).toBe(key)
    expect(validateHotkey(logical.toLowerCase())).toEqual({
      valid: true,
      warnings: [],
      errors: [],
    })
    expect(validateHotkey(physical)).toEqual({
      valid: true,
      warnings: [],
      errors: [],
    })
    expect(hotkeyChordFromKeydown(event, 'mac', 'key')).toBe(logical)
    expect(hotkeyChordFromKeydown(event, 'mac', 'code')).toBe(physical)
    expect(matchesKeyboardEvent(event, logical, 'mac')).toBe(true)
    expect(matchesKeyboardEvent(event, physical, 'mac')).toBe(true)
    expect(
      matchesKeyboardEvent(
        new KeyboardEvent('keydown', { key, code: 'KeyA', altKey: true }),
        physical,
        'windows',
      ),
    ).toBe(false)
    expect(
      formatForDisplay(logical, { platform: 'windows', useSymbols: false }),
    ).toBe(`Alt+${key}`)
  },
)

it.each(LOGICAL_ONLY_NAMED_KEYS)(
  'recognizes the distinct logical name %s',
  (key) => {
    expect(validateHotkey(key.toLowerCase())).toEqual({
      valid: true,
      warnings: [],
      errors: [],
    })
    expect(normalizeKeyName(key.toLowerCase())).toBe(key)
  },
)

it('keeps differently named logical and physical bindings distinct', () => {
  const event = new KeyboardEvent('keydown', {
    key: 'LaunchApplication1',
    code: 'LaunchApp1',
  })
  expect(hotkeyChordFromKeydown(event, 'mac', 'key')).toBe('LaunchApplication1')
  expect(hotkeyChordFromKeydown(event, 'mac', 'code')).toBe('[LaunchApp1]')
  expect(matchesKeyboardEvent(event, 'LaunchApplication1')).toBe(true)
  expect(matchesKeyboardEvent(event, '[LaunchApp1]')).toBe(true)
})
