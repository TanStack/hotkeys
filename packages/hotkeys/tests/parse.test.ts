import { describe, expect, it } from 'vitest'
import {
  isModifier,
  normalizeHotkey,
  parseHotkey,
  rawHotkeyToParsedHotkey,
} from '../src/parse'

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
  it('should normalize to canonical form', () => {
    expect(normalizeHotkey('ctrl+a')).toBe('Control+A')
    expect(normalizeHotkey('Ctrl+Shift+S')).toBe('Control+Shift+S')
  })

  it('should sort modifiers in canonical order', () => {
    expect(normalizeHotkey('Shift+Control+A')).toBe('Control+Shift+A')
    expect(normalizeHotkey('Command+Shift+Alt+Control+A')).toBe(
      'Control+Alt+Shift+Meta+A',
    )
  })

  it('should resolve Mod based on platform', () => {
    expect(normalizeHotkey('Mod+S', 'mac')).toBe('Meta+S')
    expect(normalizeHotkey('Mod+S', 'windows')).toBe('Control+S')
  })

  it('should normalize key aliases', () => {
    expect(normalizeHotkey('Ctrl+Esc')).toBe('Control+Escape')
    expect(normalizeHotkey('Mod+Return', 'mac')).toBe('Meta+Enter')
  })

  it('should normalize single keys', () => {
    expect(normalizeHotkey('esc')).toBe('Escape')
    expect(normalizeHotkey('a')).toBe('A')
    expect(normalizeHotkey('f1')).toBe('F1')
  })
})

describe('isModifier', () => {
  it('should return true for modifier keys', () => {
    expect(isModifier('Control')).toBe(true)
    expect(isModifier('Ctrl')).toBe(true)
    expect(isModifier('Shift')).toBe(true)
    expect(isModifier('Alt')).toBe(true)
    expect(isModifier('Option')).toBe(true)
    expect(isModifier('Command')).toBe(true)
    expect(isModifier('Cmd')).toBe(true)
    expect(isModifier('Mod')).toBe(true)
    expect(isModifier('CommandOrControl')).toBe(true)
  })

  it('should return true for lowercase modifiers', () => {
    expect(isModifier('control')).toBe(true)
    expect(isModifier('ctrl')).toBe(true)
    expect(isModifier('shift')).toBe(true)
  })

  it('should return false for non-modifier keys', () => {
    expect(isModifier('A')).toBe(false)
    expect(isModifier('Enter')).toBe(false)
    expect(isModifier('F1')).toBe(false)
    expect(isModifier('Space')).toBe(false)
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
    const result = rawHotkeyToParsedHotkey({ key: 'S', ctrl: true, shift: true })
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
