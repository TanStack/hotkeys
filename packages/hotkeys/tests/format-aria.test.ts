import { describe, expect, it } from 'vitest'
import { formatForAria } from '../src/format'
import { parseHotkey } from '../src/parse'
import { detectPlatform } from '../src/platform'
import type { RegisterableHotkey } from '../src/hotkey.types'

/** Strings that parse correctly but are not in the `HotkeyChord` template union. */
function hk(s: string): RegisterableHotkey {
  return s as RegisterableHotkey
}

describe('formatForAria', () => {
  it('resolves Mod for the platform', () => {
    expect(formatForAria('Mod+K', { platform: 'mac' })).toBe('Meta+K')
    expect(formatForAria('Mod+K', { platform: 'windows' })).toBe('Control+K')
    expect(formatForAria('Mod+K', { platform: 'linux' })).toBe('Control+K')
  })

  it('writes modifiers with their ARIA names, before the key', () => {
    expect(formatForAria(hk('Cmd+Option+Shift+P'), { platform: 'mac' })).toBe(
      'Alt+Shift+Meta+P',
    )
    expect(formatForAria(hk('ctrl+alt+.'), { platform: 'windows' })).toBe(
      'Control+Alt+.',
    )
    expect(
      formatForAria({ key: 's', mod: true, shift: true }, { platform: 'mac' }),
    ).toBe('Shift+Meta+S')
  })

  it('keeps key values as written', () => {
    expect(formatForAria('Escape', { platform: 'mac' })).toBe('Escape')
    expect(formatForAria('Shift+ArrowUp', { platform: 'mac' })).toBe(
      'Shift+ArrowUp',
    )
    expect(formatForAria('F1', { platform: 'mac' })).toBe('F1')
    expect(formatForAria('/', { platform: 'mac' })).toBe('/')
    expect(formatForAria(hk('a'), { platform: 'mac' })).toBe('A')
  })

  it('names the space bar Space and the plus key Plus', () => {
    expect(formatForAria('Shift+Space', { platform: 'mac' })).toBe(
      'Shift+Space',
    )
    expect(formatForAria({ key: ' ' }, { platform: 'mac' })).toBe('Space')
    expect(formatForAria('Mod++', { platform: 'windows' })).toBe('Control+Plus')
    expect(formatForAria('[NumpadAdd]', { platform: 'windows' })).toBe('Plus')
  })

  it('formats a parsed chord', () => {
    expect(
      formatForAria(parseHotkey('Mod+Shift+S', 'mac'), { platform: 'mac' }),
    ).toBe('Shift+Meta+S')
  })

  it('names the key a physical binding presses', () => {
    expect(formatForAria('Mod+[KeyS]', { platform: 'mac' })).toBe('Meta+S')
    expect(formatForAria('Shift+[Digit5]', { platform: 'mac' })).toBe('Shift+5')
    expect(formatForAria('[Slash]', { platform: 'mac' })).toBe('/')
    expect(formatForAria('[Enter]', { platform: 'mac' })).toBe('Enter')
    expect(formatForAria('[ArrowLeft]', { platform: 'mac' })).toBe('ArrowLeft')
    expect(formatForAria('[F5]', { platform: 'mac' })).toBe('F5')
    expect(formatForAria('[Space]', { platform: 'mac' })).toBe('Space')
    expect(formatForAria('[IntlYen]', { platform: 'mac' })).toBe('¥')
    expect(formatForAria('[Numpad7]', { platform: 'mac' })).toBe('7')
    expect(formatForAria('[NumpadEnter]', { platform: 'mac' })).toBe('Enter')
    expect(formatForAria('[NumpadParenLeft]', { platform: 'mac' })).toBe('(')
  })

  it("names a physical binding's key from the layout map", () => {
    const azerty = new Map([
      ['KeyQ', 'a'],
      ['Digit1', '&'],
      ['Equal', '+'],
    ])
    expect(
      formatForAria('Mod+[KeyQ]', { platform: 'mac', layoutMap: azerty }),
    ).toBe('Meta+A')
    expect(
      formatForAria('[Digit1]', { platform: 'mac', layoutMap: azerty }),
    ).toBe('&')
    expect(
      formatForAria('[Equal]', { platform: 'mac', layoutMap: azerty }),
    ).toBe('Plus')
    // A missing or empty entry uses the conventional key.
    expect(
      formatForAria('[KeyW]', {
        platform: 'mac',
        layoutMap: new Map([['KeyW', '']]),
      }),
    ).toBe('W')
  })

  it('ignores the layout map for logical keys', () => {
    expect(
      formatForAria('Q', {
        platform: 'mac',
        layoutMap: new Map([['KeyQ', 'a']]),
      }),
    ).toBe('Q')
  })

  it('returns undefined for a code with no key value', () => {
    expect(formatForAria('[NumpadMemoryAdd]', { platform: 'mac' })).toBe(
      undefined,
    )
    expect(formatForAria('[Lang1]', { platform: 'mac' })).toBe(undefined)
    expect(formatForAria('Mod+[Turbo]', { platform: 'mac' })).toBe(undefined)
  })

  it('returns undefined for a sequence', () => {
    expect(formatForAria(['G', 'H'], { platform: 'mac' })).toBe(undefined)
    expect(formatForAria([], { platform: 'mac' })).toBe(undefined)
  })

  it('formats a one-step sequence like its chord', () => {
    expect(formatForAria(['Mod+K'], { platform: 'mac' })).toBe('Meta+K')
  })

  it('returns undefined for a modifier alone', () => {
    expect(formatForAria('Shift', { platform: 'mac' })).toBe(undefined)
    expect(formatForAria(hk('Control+Shift'), { platform: 'mac' })).toBe(
      undefined,
    )
  })

  it('returns undefined for no hotkey', () => {
    expect(formatForAria(null)).toBe(undefined)
    expect(formatForAria(undefined)).toBe(undefined)
    expect(formatForAria('' as RegisterableHotkey)).toBe(undefined)
  })

  it('uses the detected platform without a platform option', () => {
    expect(formatForAria('Mod+K')).toBe(
      formatForAria('Mod+K', { platform: detectPlatform() }),
    )
  })
})
