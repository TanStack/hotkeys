import { describe, expect, it } from 'vitest'
import {
  formatForDisplay,
  formatHotkey,
  formatHotkeySequence,
} from '../src/format'
import type { ParsedHotkey, RegisterableHotkey } from '../src/hotkey.types'

/** Strings that parse correctly but are not in the `Hotkey` template union. */
function hk(s: string): RegisterableHotkey {
  return s as RegisterableHotkey
}

describe('formatHotkeySequence', () => {
  it('should join sequence with spaces', () => {
    expect(formatHotkeySequence(['G', 'G'])).toBe('G G')
    expect(formatHotkeySequence(['D', 'I', 'W'])).toBe('D I W')
  })

  it('should handle single-key sequence', () => {
    expect(formatHotkeySequence(['Escape'])).toBe('Escape')
  })
})

describe('formatHotkey', () => {
  it('should format a simple key', () => {
    const parsed: ParsedHotkey = {
      key: 'A',
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
      modifiers: [],
    }
    expect(formatHotkey(parsed)).toBe('A')
  })

  it('should format with single modifier', () => {
    const parsed: ParsedHotkey = {
      key: 'S',
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      modifiers: ['Control'],
    }
    expect(formatHotkey(parsed)).toBe('Control+S')
  })

  it('should format with multiple modifiers in canonical order', () => {
    const parsed: ParsedHotkey = {
      key: 'S',
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      modifiers: ['Control', 'Shift'],
    }
    expect(formatHotkey(parsed)).toBe('Control+Shift+S')
  })

  it('should format with all modifiers', () => {
    const parsed: ParsedHotkey = {
      key: 'A',
      ctrl: true,
      shift: true,
      alt: true,
      meta: true,
      modifiers: ['Control', 'Alt', 'Shift', 'Meta'],
    }
    expect(formatHotkey(parsed)).toBe('Control+Alt+Shift+Meta+A')
  })

  it('should format special keys', () => {
    const parsed: ParsedHotkey = {
      key: 'Escape',
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
      modifiers: [],
    }
    expect(formatHotkey(parsed)).toBe('Escape')
  })
})

describe('formatForDisplay', () => {
  describe('macOS format', () => {
    it('should use symbols for modifiers with spaces between segments', () => {
      expect(formatForDisplay('Control+A', { platform: 'mac' })).toBe('⌃ A')
      expect(formatForDisplay('Shift+A', { platform: 'mac' })).toBe('⇧ A')
      expect(formatForDisplay('Alt+A', { platform: 'mac' })).toBe('⌥ A')
      expect(formatForDisplay(hk('Command+A'), { platform: 'mac' })).toBe('⌘ A')
    })

    it('should combine multiple modifier symbols', () => {
      expect(formatForDisplay('Control+Shift+A', { platform: 'mac' })).toBe(
        '⌃ ⇧ A',
      )
      expect(formatForDisplay(hk('Command+Shift+S'), { platform: 'mac' })).toBe(
        '⌘ ⇧ S',
      )
    })

    it('should allow customizing the separator token', () => {
      expect(
        formatForDisplay('Mod+Shift+S', {
          platform: 'mac',
          separatorToken: '',
        }),
      ).toBe('⌘⇧S')
      expect(
        formatForDisplay('Mod+Shift+S', {
          platform: 'mac',
          separatorToken: ' + ',
        }),
      ).toBe('⌘ + ⇧ + S')
      expect(
        formatForDisplay('Mod+Shift+S', {
          platform: 'mac',
          separatorToken: null,
        }),
      ).toBe('⌘ ⇧ S')
    })

    it('should resolve Mod to Command symbol', () => {
      expect(formatForDisplay('Mod+S', { platform: 'mac' })).toBe('⌘ S')
      expect(formatForDisplay('Mod+Shift+S', { platform: 'mac' })).toBe('⌘ ⇧ S')
    })

    it('should use symbols for special keys', () => {
      expect(formatForDisplay('Escape', { platform: 'mac' })).toBe('Esc')
      expect(formatForDisplay('Enter', { platform: 'mac' })).toBe('↵')
      expect(formatForDisplay('Backspace', { platform: 'mac' })).toBe('⌫')
      expect(formatForDisplay('ArrowUp', { platform: 'mac' })).toBe('↑')
    })
  })

  describe('Windows/Linux format', () => {
    it('should use text labels with + separator', () => {
      expect(formatForDisplay('Control+A', { platform: 'windows' })).toBe(
        'Ctrl+A',
      )
      expect(formatForDisplay('Shift+A', { platform: 'windows' })).toBe(
        'Shift+A',
      )
      expect(formatForDisplay('Alt+A', { platform: 'windows' })).toBe('Alt+A')
    })

    it('should combine multiple modifiers', () => {
      expect(formatForDisplay('Control+Shift+A', { platform: 'windows' })).toBe(
        'Ctrl+Shift+A',
      )
    })

    it('should allow customizing the separator token', () => {
      expect(
        formatForDisplay('Control+Shift+A', {
          platform: 'windows',
          separatorToken: '',
        }),
      ).toBe('CtrlShiftA')
      expect(
        formatForDisplay('Control+Shift+A', {
          platform: 'windows',
          separatorToken: ' + ',
        }),
      ).toBe('Ctrl + Shift + A')
      expect(
        formatForDisplay('Control+Shift+A', {
          platform: 'windows',
          separatorToken: null,
        }),
      ).toBe('Ctrl+Shift+A')
    })

    it('should resolve Mod to Ctrl', () => {
      expect(formatForDisplay('Mod+S', { platform: 'windows' })).toBe('Ctrl+S')
      expect(formatForDisplay('Mod+S', { platform: 'linux' })).toBe('Ctrl+S')
    })

    it('should use short names for special keys', () => {
      expect(formatForDisplay('Escape', { platform: 'windows' })).toBe('Esc')
      expect(formatForDisplay('ArrowUp', { platform: 'windows' })).toBe('↑')
    })
  })

  describe('with ParsedHotkey input', () => {
    it('should accept ParsedHotkey objects', () => {
      const parsed: ParsedHotkey = {
        key: 'S',
        ctrl: false,
        shift: true,
        alt: false,
        meta: true,
        modifiers: ['Shift', 'Meta'],
      }
      expect(formatForDisplay(parsed, { platform: 'mac' })).toBe('⌘ ⇧ S')
      expect(
        formatForDisplay(parsed, { platform: 'mac', useSymbols: false }),
      ).toBe('Cmd+Shift+S')
    })
  })

  describe('useSymbols: false (text labels)', () => {
    it('should use readable labels on Mac', () => {
      expect(
        formatForDisplay(hk('Command+S'), {
          platform: 'mac',
          useSymbols: false,
        }),
      ).toBe('Cmd+S')
      expect(
        formatForDisplay('Alt+A', { platform: 'mac', useSymbols: false }),
      ).toBe('Option+A')
      expect(
        formatForDisplay('Control+C', { platform: 'mac', useSymbols: false }),
      ).toBe('Control+C')
    })

    it('should use readable labels on Windows', () => {
      expect(
        formatForDisplay('Control+S', {
          platform: 'windows',
          useSymbols: false,
        }),
      ).toBe('Ctrl+S')
      expect(
        formatForDisplay('Alt+A', { platform: 'windows', useSymbols: false }),
      ).toBe('Alt+A')
      expect(
        formatForDisplay('Meta+A', {
          platform: 'windows',
          useSymbols: false,
        }),
      ).toBe('Win+A')
    })

    it('should resolve Mod appropriately', () => {
      expect(
        formatForDisplay('Mod+S', { platform: 'mac', useSymbols: false }),
      ).toBe('Cmd+S')
      expect(
        formatForDisplay('Mod+S', { platform: 'windows', useSymbols: false }),
      ).toBe('Ctrl+S')
    })

    it('should handle multiple modifiers in canonical order (Mod first)', () => {
      expect(
        formatForDisplay('Mod+Shift+S', {
          platform: 'mac',
          useSymbols: false,
        }),
      ).toBe('Cmd+Shift+S')
      expect(
        formatForDisplay('Mod+Shift+S', {
          platform: 'windows',
          useSymbols: false,
        }),
      ).toBe('Ctrl+Shift+S')
    })
  })
})

describe('physical display labels', () => {
  it.each([
    ['KeyS', 'S'],
    ['Digit2', '2'],
    ['ArrowUp', 'ArrowUp'],
    ['Enter', 'Enter'],
    ['Slash', '/'],
    ['BracketLeft', '['],
    ['Minus', '-'],
  ] as const)('formats %s like its logical label %s', (code, key) => {
    for (const platform of ['mac', 'windows', 'linux'] as const) {
      for (const useSymbols of [
        true,
        false,
        { modifiers: false, keys: true },
      ]) {
        const options = { platform, useSymbols }
        expect(formatForDisplay({ code, mod: true }, options)).toBe(
          formatForDisplay({ key, mod: true }, options),
        )
        expect(
          formatForDisplay(`Mod+[${code}]`, { ...options, parts: true }),
        ).toEqual(
          formatForDisplay({ key, mod: true }, { ...options, parts: true }),
        )
      }
    }
  })

  it('keeps numpad labels distinct and readable', () => {
    expect(formatForDisplay('[Numpad2]')).toBe('Numpad 2')
    expect(formatForDisplay('[NumpadEnter]')).toBe('Numpad ↵')
    expect(formatForDisplay('[NumpadEnter]', { useSymbols: false })).toBe(
      'Numpad Enter',
    )
    expect(formatForDisplay('[NumpadMemoryAdd]')).toBe('Numpad Memory Add')
  })

  it('only strips exact letter and digit code patterns', () => {
    expect(formatForDisplay('[Keyboard]')).toBe('Keyboard')
    expect(formatForDisplay('[Digit10]')).toBe('Digit10')
    expect(formatForDisplay('Key11')).toBe('Key11')
  })

  it('preserves overrides, separators, and serialized physical identity', () => {
    expect(
      formatForDisplay('Alt+[KeyQ]', {
        keyLabels: { KeyQ: 'A' },
        platform: 'mac',
      }),
    ).toBe('⌥ A')
    expect(
      formatForDisplay('Mod+[Digit2]', {
        platform: 'windows',
        separatorToken: ' · ',
      }),
    ).toBe('Ctrl · 2')
    const physical: ParsedHotkey = {
      code: 'KeyQ',
      ctrl: false,
      alt: true,
      shift: false,
      meta: false,
      modifiers: ['Alt'],
    }
    expect(formatForDisplay(physical, { platform: 'mac' })).toBe('⌥ Q')
    expect(formatHotkey(physical)).toBe('Alt+[KeyQ]')
    expect(physical).not.toHaveProperty('key')
  })
})

describe('layoutMap display labels', () => {
  const layoutMap = new Map([
    ['KeyQ', 'a'],
    ['Digit2', 'é'],
    ['Slash', '-'],
  ])

  it('formats mapped values in string, raw, and parsed physical bindings', () => {
    const parsed: ParsedHotkey = {
      code: 'KeyQ',
      ctrl: false,
      alt: true,
      shift: false,
      meta: false,
      modifiers: ['Alt'],
    }
    for (const hotkey of ['Alt+[KeyQ]', { code: 'KeyQ', alt: true }, parsed]) {
      expect(formatForDisplay(hotkey, { layoutMap, platform: 'mac' })).toBe(
        '⌥ A',
      )
      expect(
        formatForDisplay(hotkey, { layoutMap, platform: 'mac', parts: true }),
      ).toEqual(['⌥', 'A'])
    }
    expect(formatHotkey(parsed)).toBe('Alt+[KeyQ]')
    expect(formatForDisplay('[Digit2]', { layoutMap })).toBe('É')
  })

  it('applies existing symbol settings to mapped punctuation and named keys', () => {
    expect(formatForDisplay('[Slash]', { layoutMap })).toBe('-')
    expect(formatForDisplay('[Slash]', { layoutMap, useSymbols: false })).toBe(
      'Minus',
    )
    expect(
      formatForDisplay('[KeyQ]', { layoutMap: new Map([['KeyQ', 'ArrowUp']]) }),
    ).toBe('↑')
    expect(
      formatForDisplay('[KeyQ]', { layoutMap: new Map([['KeyQ', 'ß']]) }),
    ).toBe('ß')
  })

  it('uses exact explicit labels before looking up the map', () => {
    const map = {
      get: () => {
        throw new Error('Should not be called')
      },
    }
    expect(
      formatForDisplay('[KeyQ]', {
        layoutMap: map,
        keyLabels: { KeyQ: 'custom' },
      }),
    ).toBe('custom')
    expect(
      formatForDisplay('[KeyQ]', { layoutMap: map, keyLabels: { KeyQ: '' } }),
    ).toBe('')
    expect(formatForDisplay('Q', { layoutMap: map })).toBe('Q')
  })

  it('falls back for missing or empty entries and preserves numpad identity', () => {
    expect(formatForDisplay('[KeyS]', { layoutMap })).toBe('S')
    expect(
      formatForDisplay('[KeyS]', { layoutMap: new Map([['KeyS', '']]) }),
    ).toBe('S')
    expect(
      formatForDisplay('[NumpadEnter]', {
        layoutMap: new Map([['NumpadEnter', 'Enter']]),
      }),
    ).toBe('Numpad ↵')
  })

  it('accepts a resolved readonly map and reflects replacement labels', () => {
    const first: ReadonlyMap<string, string> = new Map([['KeyQ', 'a']])
    const next: ReadonlyMap<string, string> = new Map([['KeyQ', 'q']])
    expect(formatForDisplay('[KeyQ]', { layoutMap: first })).toBe('A')
    expect(formatForDisplay('[KeyQ]', { layoutMap: next })).toBe('Q')
  })
})
