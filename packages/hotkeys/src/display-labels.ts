import type { CanonicalModifier } from './key.types'

// =============================================================================
// Display Symbols
// =============================================================================

/**
 * Modifier key symbols for macOS display.
 *
 * Used by formatting functions to display hotkeys with macOS-style symbols
 * (e.g., ⌘ for Command, ⌃ for Control) instead of text labels. This provides
 * a native macOS look and feel in hotkey displays.
 *
 * @example
 * ```ts
 * MAC_MODIFIER_SYMBOLS['Meta'] // '⌘'
 * MAC_MODIFIER_SYMBOLS['Control'] // '⌃'
 * MAC_MODIFIER_SYMBOLS['Alt'] // '⌥'
 * MAC_MODIFIER_SYMBOLS['Shift'] // '⇧'
 * ```
 */
export const MAC_MODIFIER_SYMBOLS: Record<CanonicalModifier | 'Mod', string> = {
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Meta: '⌘',
  Mod: '⌘',
}

/**
 * Modifier key labels for macOS display.
 *
 * Used by formatting functions to display hotkeys with macOS-style text labels
 * (e.g., 'Control' for Control, 'Option' for Alt, 'Cmd' for Meta) instead of symbols.
 * This provides a familiar macOS look and feel in hotkey displays.
 *
 * @example
 * ```ts
 * MAC_MODIFIER_LABELS['Control'] // 'control'
 * MAC_MODIFIER_LABELS['Alt'] // 'option'
 * MAC_MODIFIER_LABELS['Shift'] // 'shift'
 * MAC_MODIFIER_LABELS['Meta'] // 'cmd'
 * ```
 */
export const MAC_MODIFIER_LABELS: Record<CanonicalModifier | 'Mod', string> = {
  Control: 'Control',
  Alt: 'Option',
  Shift: 'Shift',
  Meta: 'Cmd',
  Mod: 'Cmd',
}

/**
 * Modifier key labels for Windows/Linux display.
 *
 * Used by formatting functions to display hotkeys with standard text labels
 * (e.g., 'Ctrl' for Control, 'Win' for Meta/Windows key) instead of symbols.
 * This provides a familiar Windows/Linux look and feel in hotkey displays.
 *
 * @example
 * ```ts
 * STANDARD_MODIFIER_LABELS['Control'] // 'Ctrl'
 * STANDARD_MODIFIER_LABELS['Meta'] // 'Win'
 * STANDARD_MODIFIER_LABELS['Alt'] // 'Alt'
 * STANDARD_MODIFIER_LABELS['Shift'] // 'Shift'
 * ```
 */
export const WINDOWS_MODIFIER_LABELS: Record<
  CanonicalModifier | 'Mod',
  string
> = {
  Control: 'Ctrl',
  Alt: 'Alt',
  Shift: 'Shift',
  Meta: 'Win',
  Mod: 'Ctrl',
}

export const LINUX_MODIFIER_LABELS: Record<CanonicalModifier | 'Mod', string> =
  {
    ...WINDOWS_MODIFIER_LABELS,
    Meta: 'Super',
  }

export const PUNCTUATION_KEY_DISPLAY_LABELS = {
  '`': 'Backquote',
  '\\': 'Backslash',
  '[': 'Left Bracket',
  ']': 'Right Bracket',
  ',': 'Comma',
  '=': 'Equal',
  '-': 'Minus',
  '.': 'Period',
  ';': 'Semicolon',
} as const satisfies Record<string, string>

/**
 * Special key symbols for display formatting.
 *
 * Maps certain keys to their visual symbols for better readability in hotkey displays.
 * Used by formatting functions to show symbols like ↑ for ArrowUp or ↵ for Enter
 * instead of text labels.
 *
 * @example
 * ```ts
 * KEY_DISPLAY_SYMBOLS['ArrowUp'] // '↑'
 * KEY_DISPLAY_SYMBOLS['Enter'] // '↵'
 * KEY_DISPLAY_SYMBOLS['Escape'] // 'Esc'
 * KEY_DISPLAY_SYMBOLS['Space'] // '␣'
 * ```
 */
export const KEY_DISPLAY_SYMBOLS = {
  ArrowUp: '↑',
  ArrowDown: '↓',
  ArrowLeft: '←',
  ArrowRight: '→',
  Enter: '↵',
  Escape: 'Esc',
  Backspace: '⌫',
  Delete: '⌦',
  Tab: '⇥',
  Space: '␣',
} as const satisfies Record<string, string>
