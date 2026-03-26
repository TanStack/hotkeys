import { describe, expect, it } from 'vitest'
import { normalizeKeyName } from '../src/constants'
import { hotkeyChordFromKeydown } from '../src/recorder-chord'
import {
  isModifierKey,
  normalizeHotkey,
  normalizeHotkeyFromEvent,
  normalizeHotkeyFromParsed,
  normalizeRegisterableHotkey,
  parseHotkey,
  rawHotkeyToParsedHotkey,
} from '../src/parse'
import type { ParsedHotkey } from '../src/hotkey'

describe('parseHotkey', () => {
  describe('single keys', () => {
    it('should parse a single letter key', () => {
      const result = parseHotkey('A')
      expect(result).toEqual({
        key: 'A',
        ctrl: false,
        shift: false,
        alt: false,
        meta: false,
        modifiers: [],
      })
    })

    it('should normalize lowercase letters to uppercase', () => {
      const result = parseHotkey('a')
      expect(result.key).toBe('A')
    })

    it('should parse special keys', () => {
      expect(parseHotkey('Escape').key).toBe('Escape')
      expect(parseHotkey('Enter').key).toBe('Enter')
      expect(parseHotkey('Space').key).toBe('Space')
      expect(parseHotkey('Tab').key).toBe('Tab')
    })

    it('should parse function keys', () => {
      expect(parseHotkey('F1').key).toBe('F1')
      expect(parseHotkey('F12').key).toBe('F12')
      expect(parseHotkey('f5').key).toBe('F5') // Case normalization
    })

    it('should parse arrow keys', () => {
      expect(parseHotkey('ArrowUp').key).toBe('ArrowUp')
      expect(parseHotkey('ArrowDown').key).toBe('ArrowDown')
    })

    it('should handle key aliases', () => {
      expect(parseHotkey('Esc').key).toBe('Escape')
      expect(parseHotkey('Return').key).toBe('Enter')
      expect(parseHotkey('Del').key).toBe('Delete')
    })
  })

  describe('modifier parsing', () => {
    it('should parse Control modifier', () => {
      const result = parseHotkey('Control+A')
      expect(result.ctrl).toBe(true)
      expect(result.modifiers).toContain('Control')
    })

    it('should parse Ctrl alias', () => {
      const result = parseHotkey('Ctrl+A')
      expect(result.ctrl).toBe(true)
      expect(result.modifiers).toContain('Control')
    })

    it('should parse Shift modifier', () => {
      const result = parseHotkey('Shift+A')
      expect(result.shift).toBe(true)
      expect(result.modifiers).toContain('Shift')
    })

    it('should parse Alt modifier', () => {
      const result = parseHotkey('Alt+A')
      expect(result.alt).toBe(true)
      expect(result.modifiers).toContain('Alt')
    })

    it('should parse Option as Alt', () => {
      const result = parseHotkey('Option+A')
      expect(result.alt).toBe(true)
      expect(result.modifiers).toContain('Alt')
    })

    it('should parse Command modifier', () => {
      const result = parseHotkey('Command+A')
      expect(result.meta).toBe(true)
      expect(result.modifiers).toContain('Meta')
    })

    it('should parse Cmd alias', () => {
      const result = parseHotkey('Cmd+A')
      expect(result.meta).toBe(true)
      expect(result.modifiers).toContain('Meta')
    })
  })

  describe('Mod modifier (platform-specific)', () => {
    it('should resolve Mod to Meta on Mac', () => {
      const result = parseHotkey('Mod+S', 'mac')
      expect(result.meta).toBe(true)
      expect(result.ctrl).toBe(false)
      expect(result.modifiers).toContain('Meta')
    })

    it('should resolve Mod to Control on Windows', () => {
      const result = parseHotkey('Mod+S', 'windows')
      expect(result.ctrl).toBe(true)
      expect(result.meta).toBe(false)
      expect(result.modifiers).toContain('Control')
    })

    it('should resolve Mod to Control on Linux', () => {
      const result = parseHotkey('Mod+S', 'linux')
      expect(result.ctrl).toBe(true)
      expect(result.meta).toBe(false)
      expect(result.modifiers).toContain('Control')
    })

    it('should resolve CommandOrControl the same as Mod', () => {
      const macResult = parseHotkey('CommandOrControl+S', 'mac')
      expect(macResult.meta).toBe(true)

      const winResult = parseHotkey('CommandOrControl+S', 'windows')
      expect(winResult.ctrl).toBe(true)
    })
  })

  describe('multiple modifiers', () => {
    it('should parse two modifiers', () => {
      const result = parseHotkey('Control+Shift+A')
      expect(result.ctrl).toBe(true)
      expect(result.shift).toBe(true)
      expect(result.alt).toBe(false)
      expect(result.meta).toBe(false)
      expect(result.key).toBe('A')
    })

    it('should parse three modifiers', () => {
      const result = parseHotkey('Control+Alt+Shift+A')
      expect(result.ctrl).toBe(true)
      expect(result.alt).toBe(true)
      expect(result.shift).toBe(true)
      expect(result.meta).toBe(false)
    })

    it('should parse all four modifiers', () => {
      const result = parseHotkey('Control+Alt+Shift+Command+A')
      expect(result.ctrl).toBe(true)
      expect(result.alt).toBe(true)
      expect(result.shift).toBe(true)
      expect(result.meta).toBe(true)
    })

    it('should maintain canonical modifier order in output', () => {
      // Regardless of input order, output should be Control, Alt, Shift, Meta
      const result = parseHotkey('Shift+Control+A')
      expect(result.modifiers).toEqual(['Control', 'Shift'])
    })
  })

  describe('case insensitivity', () => {
    it('should handle lowercase modifiers', () => {
      const result = parseHotkey('ctrl+shift+a')
      expect(result.ctrl).toBe(true)
      expect(result.shift).toBe(true)
      expect(result.key).toBe('A')
    })

    it('should handle mixed case', () => {
      const result = parseHotkey('CTRL+Shift+a')
      expect(result.ctrl).toBe(true)
      expect(result.shift).toBe(true)
      expect(result.key).toBe('A')
    })
  })
})

describe('normalizeHotkey', () => {
  it('should keep Control literal on Mac when Meta is not used', () => {
    expect(normalizeHotkey('ctrl+a', 'mac')).toBe('Control+A')
    expect(normalizeHotkey('Ctrl+Shift+S', 'mac')).toBe('Control+Shift+S')
  })

  it('should use Mod when Control is primary on Windows/Linux', () => {
    expect(normalizeHotkey('ctrl+a', 'windows')).toBe('Mod+A')
    expect(normalizeHotkey('ctrl+a', 'linux')).toBe('Mod+A')
    expect(normalizeHotkey('Ctrl+Shift+S', 'windows')).toBe('Mod+Shift+S')
    expect(normalizeHotkey('Shift+Control+A', 'windows')).toBe('Mod+Shift+A')
  })

  it('should sort non-Mod modifiers in canonical order when Mod ineligible', () => {
    expect(normalizeHotkey('Shift+Control+A', 'mac')).toBe('Control+Shift+A')
    expect(normalizeHotkey('Command+Shift+Alt+Control+A', 'mac')).toBe(
      'Control+Alt+Shift+Meta+A',
    )
  })

  it('should keep Mod in canonical Mod-first output', () => {
    expect(normalizeHotkey('Mod+S', 'mac')).toBe('Mod+S')
    expect(normalizeHotkey('Mod+S', 'windows')).toBe('Mod+S')
  })

  it('should normalize key aliases', () => {
    expect(normalizeHotkey('Ctrl+Esc', 'mac')).toBe('Control+Escape')
    expect(normalizeHotkey('Ctrl+Esc', 'windows')).toBe('Mod+Escape')
    expect(normalizeHotkey('Mod+Return', 'mac')).toBe('Mod+Enter')
  })

  it('should normalize single keys', () => {
    expect(normalizeHotkey('esc')).toBe('Escape')
    expect(normalizeHotkey('a')).toBe('A')
    expect(normalizeHotkey('f1')).toBe('F1')
  })

  it('should normalize shuffled Meta chords to Mod-first on Mac', () => {
    expect(normalizeHotkey('Shift+Meta+E', 'mac')).toBe('Mod+Shift+E')
    expect(normalizeHotkey('Meta+Shift+E', 'mac')).toBe('Mod+Shift+E')
  })

  it('should normalize shuffled Control chords on Windows/Linux', () => {
    expect(normalizeHotkey('Shift+Control+S', 'windows')).toBe('Mod+Shift+S')
    expect(normalizeHotkey('Alt+Control+T', 'linux')).toBe('Mod+Alt+T')
  })

  it('should not collapse when both Control and Meta on Mac', () => {
    expect(normalizeHotkey('Control+Meta+S', 'mac')).toBe('Control+Meta+S')
  })
})

describe('isModifierKey', () => {
  it('should return true for modifier keys', () => {
    expect(isModifierKey('Control')).toBe(true)
    expect(isModifierKey('Ctrl')).toBe(true)
    expect(isModifierKey('Shift')).toBe(true)
    expect(isModifierKey('Alt')).toBe(true)
    expect(isModifierKey('Option')).toBe(true)
    expect(isModifierKey('Command')).toBe(true)
    expect(isModifierKey('Cmd')).toBe(true)
    expect(isModifierKey('Mod')).toBe(true)
    expect(isModifierKey('CommandOrControl')).toBe(true)
    expect(isModifierKey('OS')).toBe(true)
    expect(isModifierKey('Win')).toBe(true)
  })

  it('should return true for lowercase modifiers', () => {
    expect(isModifierKey('control')).toBe(true)
    expect(isModifierKey('ctrl')).toBe(true)
    expect(isModifierKey('shift')).toBe(true)
  })

  it('should return false for non-modifier keys', () => {
    expect(isModifierKey('A')).toBe(false)
    expect(isModifierKey('Enter')).toBe(false)
    expect(isModifierKey('F1')).toBe(false)
    expect(isModifierKey('Space')).toBe(false)
  })

  it('should match DOM modifier key names after normalizeKeyName', () => {
    expect(isModifierKey(normalizeKeyName('OS'))).toBe(true)
    expect(isModifierKey(normalizeKeyName('Win'))).toBe(true)
  })
})

describe('rawHotkeyToParsedHotkey', () => {
  it('should convert minimal RawHotkey (key only)', () => {
    const result = rawHotkeyToParsedHotkey({ key: 'Escape' })
    expect(result).toEqual({
      key: 'Escape',
      ctrl: false,
      shift: false,
      alt: false,
      meta: false,
      modifiers: [],
    })
  })

  it('should convert RawHotkey with modifiers', () => {
    const result = rawHotkeyToParsedHotkey({
      key: 'S',
      ctrl: true,
      shift: true,
    })
    expect(result).toEqual({
      key: 'S',
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      modifiers: ['Control', 'Shift'],
    })
  })

  it('should default optional booleans to false', () => {
    const result = rawHotkeyToParsedHotkey({ key: 'A', meta: true })
    expect(result).toEqual({
      key: 'A',
      ctrl: false,
      shift: false,
      alt: false,
      meta: true,
      modifiers: ['Meta'],
    })
  })

  it('should resolve mod to Meta on Mac', () => {
    const result = rawHotkeyToParsedHotkey({ key: 'S', mod: true }, 'mac')
    expect(result).toEqual({
      key: 'S',
      ctrl: false,
      shift: false,
      alt: false,
      meta: true,
      modifiers: ['Meta'],
    })
  })

  it('should resolve mod to Control on Windows/Linux', () => {
    const result = rawHotkeyToParsedHotkey({ key: 'S', mod: true }, 'windows')
    expect(result).toEqual({
      key: 'S',
      ctrl: true,
      shift: false,
      alt: false,
      meta: false,
      modifiers: ['Control'],
    })
  })

  it('should resolve mod+shift to Mod+Shift+S', () => {
    const macResult = rawHotkeyToParsedHotkey(
      { key: 'S', mod: true, shift: true },
      'mac',
    )
    expect(macResult.modifiers).toEqual(['Shift', 'Meta'])

    const winResult = rawHotkeyToParsedHotkey(
      { key: 'S', mod: true, shift: true },
      'windows',
    )
    expect(winResult.modifiers).toEqual(['Control', 'Shift'])
  })
})

describe('normalizeHotkeyFromParsed', () => {
  it('should use Mod-first order on Mac (Cmd+Shift+E)', () => {
    const parsed: ParsedHotkey = {
      key: 'E',
      ctrl: false,
      shift: true,
      alt: false,
      meta: true,
      modifiers: ['Shift', 'Meta'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'mac')).toBe('Mod+Shift+E')
  })

  it('should format Mod+Alt+T on Mac', () => {
    const parsed: ParsedHotkey = {
      key: 'T',
      ctrl: false,
      shift: false,
      alt: true,
      meta: true,
      modifiers: ['Alt', 'Meta'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'mac')).toBe('Mod+Alt+T')
  })

  it('should format Mod+Alt+Shift+K on Mac', () => {
    const parsed: ParsedHotkey = {
      key: 'K',
      ctrl: false,
      shift: true,
      alt: true,
      meta: true,
      modifiers: ['Alt', 'Shift', 'Meta'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'mac')).toBe('Mod+Alt+Shift+K')
  })

  it('should format Mod+E on Mac', () => {
    const parsed: ParsedHotkey = {
      key: 'E',
      ctrl: false,
      shift: false,
      alt: false,
      meta: true,
      modifiers: ['Meta'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'mac')).toBe('Mod+E')
  })

  it('should use Mod-first order on Windows (Ctrl+Shift+S)', () => {
    const parsed: ParsedHotkey = {
      key: 'S',
      ctrl: true,
      shift: true,
      alt: false,
      meta: false,
      modifiers: ['Control', 'Shift'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'windows')).toBe('Mod+Shift+S')
  })

  it('should format Mod+Alt+T on Linux', () => {
    const parsed: ParsedHotkey = {
      key: 'T',
      ctrl: true,
      shift: false,
      alt: true,
      meta: false,
      modifiers: ['Control', 'Alt'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'linux')).toBe('Mod+Alt+T')
  })

  it('should not collapse to Mod when both Control and Meta are set', () => {
    const parsed: ParsedHotkey = {
      key: 'A',
      ctrl: true,
      shift: true,
      alt: true,
      meta: true,
      modifiers: ['Control', 'Alt', 'Shift', 'Meta'],
    }
    expect(normalizeHotkeyFromParsed(parsed, 'mac')).toBe(
      'Control+Alt+Shift+Meta+A',
    )
  })
})

describe('normalizeRegisterableHotkey', () => {
  it('should match normalizeHotkey for strings', () => {
    expect(normalizeRegisterableHotkey('Shift+Meta+E', 'mac')).toBe(
      'Mod+Shift+E',
    )
  })

  it('should match normalizeHotkeyFromParsed for RawHotkey objects', () => {
    expect(
      normalizeRegisterableHotkey({ key: 'S', mod: true, shift: true }, 'mac'),
    ).toBe('Mod+Shift+S')
    expect(
      normalizeRegisterableHotkey({ key: 's', mod: true }, 'windows'),
    ).toBe('Mod+S')
  })
})

describe('normalizeHotkeyFromEvent', () => {
  it('should match hotkeyChordFromKeydown for Cmd+Shift+E on Mac', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'e',
      metaKey: true,
      shiftKey: true,
    })
    expect(normalizeHotkeyFromEvent(event, 'mac')).toBe('Mod+Shift+E')
  })
})

describe('hotkeyChordFromKeydown', () => {
  it('should return Mod+Shift+E for Cmd+Shift+E on Mac', () => {
    const event = new KeyboardEvent('keydown', {
      key: 'e',
      metaKey: true,
      shiftKey: true,
    })
    expect(hotkeyChordFromKeydown(event, 'mac')).toBe('Mod+Shift+E')
  })

  it('should return Mod+Shift+S for Ctrl+Shift+S on Windows', () => {
    const event = new KeyboardEvent('keydown', {
      key: 's',
      ctrlKey: true,
      shiftKey: true,
    })
    expect(hotkeyChordFromKeydown(event, 'windows')).toBe('Mod+Shift+S')
  })

  it('should return null for modifier-only keydown', () => {
    const event = new KeyboardEvent('keydown', { key: 'Shift' })
    expect(hotkeyChordFromKeydown(event, 'mac')).toBe(null)
  })

  it('should return null for OS / Win meta key keydown', () => {
    expect(
      hotkeyChordFromKeydown(
        new KeyboardEvent('keydown', { key: 'OS' }),
        'windows',
      ),
    ).toBe(null)
    expect(
      hotkeyChordFromKeydown(
        new KeyboardEvent('keydown', { key: 'Win' }),
        'windows',
      ),
    ).toBe(null)
  })
})
