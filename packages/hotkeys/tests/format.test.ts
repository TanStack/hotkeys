import { describe, expect, it } from 'vitest'
import {
  formatForDisplay,
  formatHotkey,
  formatHotkeySequence,
} from '../src/format'
import type { ParsedHotkey, RegisterableHotkey } from '../src/hotkey'

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
