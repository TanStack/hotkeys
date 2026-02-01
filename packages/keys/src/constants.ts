import type { CanonicalModifier, Key } from './types'

// =============================================================================
// Platform Detection
// =============================================================================

/**
 * Detect the current platform.
 * Returns 'mac', 'windows', or 'linux'.
 */
export function detectPlatform(): 'mac' | 'windows' | 'linux' {
  if (typeof navigator === 'undefined') {
    return 'linux' // Default for SSR
  }

  const platform = navigator.platform?.toLowerCase() ?? ''
  const userAgent = navigator.userAgent?.toLowerCase() ?? ''

  if (platform.includes('mac') || userAgent.includes('mac')) {
    return 'mac'
  }
  if (platform.includes('win') || userAgent.includes('win')) {
    return 'windows'
  }
  return 'linux'
}

// =============================================================================
// Modifier Aliases
// =============================================================================

/**
 * Maps modifier aliases to their canonical form.
 * Note: 'Mod' and 'CommandOrControl' are resolved at runtime based on platform.
 */
export const MODIFIER_ALIASES: Record<string, CanonicalModifier | 'Mod'> = {
  // Control variants
  Control: 'Control',
  Ctrl: 'Control',
  control: 'Control',
  ctrl: 'Control',

  // Shift variants
  Shift: 'Shift',
  shift: 'Shift',

  // Alt variants
  Alt: 'Alt',
  Option: 'Alt',
  alt: 'Alt',
  option: 'Alt',

  // Meta/Command variants
  Command: 'Meta',
  Cmd: 'Meta',
  Meta: 'Meta',
  command: 'Meta',
  cmd: 'Meta',
  meta: 'Meta',

  // Platform-adaptive (resolved at runtime)
  CommandOrControl: 'Mod',
  Mod: 'Mod',
  commandorcontrol: 'Mod',
  mod: 'Mod',
}

/**
 * Resolves the 'Mod' modifier to the appropriate canonical modifier
 * based on the current platform.
 */
export function resolveModifier(
  modifier: CanonicalModifier | 'Mod',
  platform: 'mac' | 'windows' | 'linux' = detectPlatform(),
): CanonicalModifier {
  if (modifier === 'Mod') {
    return platform === 'mac' ? 'Meta' : 'Control'
  }
  return modifier
}

// =============================================================================
// Valid Keys
// =============================================================================

/**
 * Set of all valid letter keys.
 */
export const LETTER_KEYS = new Set<Key>([
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
])

/**
 * Set of all valid number keys.
 */
export const NUMBER_KEYS = new Set<Key>([
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
])

/**
 * Set of all valid function keys.
 */
export const FUNCTION_KEYS = new Set<Key>([
  'F1',
  'F2',
  'F3',
  'F4',
  'F5',
  'F6',
  'F7',
  'F8',
  'F9',
  'F10',
  'F11',
  'F12',
])

/**
 * Set of all valid navigation keys.
 */
export const NAVIGATION_KEYS = new Set<Key>([
  'ArrowUp',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'Home',
  'End',
  'PageUp',
  'PageDown',
])

/**
 * Set of all valid editing keys.
 */
export const EDITING_KEYS = new Set<Key>([
  'Enter',
  'Escape',
  'Space',
  'Tab',
  'Backspace',
  'Delete',
])

/**
 * Set of all valid keys.
 */
export const ALL_KEYS = new Set<Key>([
  ...LETTER_KEYS,
  ...NUMBER_KEYS,
  ...FUNCTION_KEYS,
  ...NAVIGATION_KEYS,
  ...EDITING_KEYS,
])

/**
 * Maps key aliases to their canonical form.
 * This handles common variations like 'Esc' for 'Escape'.
 */
const KEY_ALIASES: Record<string, string> = {
  // Escape variants
  Esc: 'Escape',
  esc: 'Escape',
  escape: 'Escape',

  // Enter variants
  Return: 'Enter',
  return: 'Enter',
  enter: 'Enter',

  // Space variants
  ' ': 'Space',
  space: 'Space',
  Spacebar: 'Space',
  spacebar: 'Space',

  // Tab variants
  tab: 'Tab',

  // Backspace variants
  backspace: 'Backspace',

  // Delete variants
  Del: 'Delete',
  del: 'Delete',
  delete: 'Delete',

  // Arrow key variants
  Up: 'ArrowUp',
  up: 'ArrowUp',
  arrowup: 'ArrowUp',
  Down: 'ArrowDown',
  down: 'ArrowDown',
  arrowdown: 'ArrowDown',
  Left: 'ArrowLeft',
  left: 'ArrowLeft',
  arrowleft: 'ArrowLeft',
  Right: 'ArrowRight',
  right: 'ArrowRight',
  arrowright: 'ArrowRight',

  // Navigation variants
  home: 'Home',
  end: 'End',
  pageup: 'PageUp',
  pagedown: 'PageDown',
  PgUp: 'PageUp',
  PgDn: 'PageDown',
  pgup: 'PageUp',
  pgdn: 'PageDown',
}

/**
 * Normalizes a key name to its canonical form.
 */
export function normalizeKeyName(key: string): string {
  // Check aliases first
  if (key in KEY_ALIASES) {
    return KEY_ALIASES[key]!
  }

  // Check if it's a single letter (normalize to uppercase)
  if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
    return key.toUpperCase()
  }

  // Check if it's a function key (normalize case)
  const upperKey = key.toUpperCase()
  if (/^F([1-9]|1[0-2])$/.test(upperKey)) {
    return upperKey
  }

  return key
}

// =============================================================================
// Display Symbols
// =============================================================================

/**
 * Modifier symbols for macOS display.
 */
export const MAC_MODIFIER_SYMBOLS: Record<CanonicalModifier, string> = {
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Meta: '⌘',
}

/**
 * Modifier labels for Windows/Linux display.
 */
export const STANDARD_MODIFIER_LABELS: Record<CanonicalModifier, string> = {
  Control: 'Ctrl',
  Alt: 'Alt',
  Shift: 'Shift',
  Meta: 'Win',
}

/**
 * Special key symbols for display.
 */
export const KEY_DISPLAY_SYMBOLS: Record<string, string> = {
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
}

/**
 * Canonical order for modifiers in normalized strings.
 * This ensures consistent output: Control+Alt+Shift+Meta+Key
 */
export const MODIFIER_ORDER: Array<CanonicalModifier> = [
  'Control',
  'Alt',
  'Shift',
  'Meta',
]
