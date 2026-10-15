import { LOGICAL_ONLY_NAMED_KEYS, SHARED_NAMED_KEYS } from './_named-keys'
import type {
  CanonicalModifier,
  EditingKey,
  FunctionKey,
  LetterKey,
  NavigationKey,
  NumberKey,
  PunctuationKey,
} from './key.types'

/**
 * Canonical order for modifiers in normalized hotkey strings.
 *
 * Defines the standard order in which modifiers should appear when formatting
 * hotkeys. This ensures consistent, predictable output across the library.
 *
 * Order: Control → Alt → Shift → Meta
 *
 * @example
 * ```ts
 * // Input: 'Shift+Control+Meta+S'
 * // Normalized: 'Control+Alt+Shift+Meta+S' (following MODIFIER_ORDER)
 * ```
 */
export const MODIFIER_ORDER: Array<CanonicalModifier> = [
  'Control',
  'Alt',
  'Shift',
  'Meta',
]

/**
 * Set of canonical modifier key names for fast lookup.
 *
 * Derived from `MODIFIER_ORDER` to ensure consistency. Used to detect when
 * a modifier is released so we can clear non-modifier keys whose keyup events
 * may have been swallowed by the OS (e.g. macOS Cmd+key combos).
 */
export const MODIFIER_KEYS = new Set<string>(MODIFIER_ORDER)

/**
 * Maps modifier key aliases to their canonical form or platform-adaptive 'Mod'.
 *
 * This map allows users to write hotkeys using various aliases (e.g., 'Ctrl', 'Cmd', 'Option')
 * which are then normalized to canonical names ('Control', 'Meta', 'Alt') or the
 * platform-adaptive 'Mod' token.
 *
 * The 'Mod' and 'CommandOrControl' aliases are resolved at runtime via `resolveModifier()`
 * based on the detected platform (Command on Mac, Control elsewhere).
 *
 * @remarks Case-insensitive lookups are supported via lowercase variants
 *
 * @example
 * ```ts
 * MODIFIER_ALIASES['Ctrl'] // 'Control'
 * MODIFIER_ALIASES['Cmd'] // 'Meta'
 * MODIFIER_ALIASES['Mod'] // 'Mod' (resolved at runtime)
 * ```
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

  // DOM `KeyboardEvent.key` spellings for the meta / Windows key
  OS: 'Meta',
  os: 'Meta',
  Win: 'Meta',
  win: 'Meta',

  // Platform-adaptive (resolved at runtime)
  CommandOrControl: 'Mod',
  Mod: 'Mod',
  commandorcontrol: 'Mod',
  mod: 'Mod',
}

/**
 * Set of all valid letter keys (A-Z).
 *
 * Used for validation and type checking. Letter keys are matched case-insensitively
 * in hotkey matching, but normalized to uppercase in canonical form.
 */
export const LETTER_KEYS = new Set<LetterKey>([
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
 * Set of all valid number keys (0-9).
 *
 * Note: Number keys are affected by Shift (Shift+1 → '!' on US layout),
 * so they're excluded from Shift-based hotkey combinations to avoid
 * layout-dependent behavior.
 */
export const NUMBER_KEYS = new Set<NumberKey>([
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
 * Set of all valid function keys (F1-F24).
 *
 * Function keys are commonly used for system shortcuts (e.g., F12 for DevTools,
 * Alt+F4 to close windows) and application-specific commands.
 */
export const FUNCTION_KEYS = new Set<FunctionKey>([
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
  'F13',
  'F14',
  'F15',
  'F16',
  'F17',
  'F18',
  'F19',
  'F20',
  'F21',
  'F22',
  'F23',
  'F24',
])

/**
 * Set of all valid navigation keys for cursor movement and document navigation.
 *
 * Includes arrow keys, Home/End (line navigation), and PageUp/PageDown (page navigation).
 * These keys are commonly combined with modifiers for selection (Shift+ArrowUp) or
 * navigation shortcuts (Alt+ArrowLeft for back).
 */
export const NAVIGATION_KEYS = new Set<NavigationKey>([
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
 * Set of all valid editing and special keys.
 *
 * Includes keys commonly used for text editing (Enter, Backspace, Delete, Tab) and
 * special actions (Escape, Space). These keys are frequently combined with modifiers
 * for editor shortcuts (Mod+Enter to submit, Shift+Tab to go back).
 */
export const EDITING_KEYS = new Set<EditingKey>([
  'Enter',
  'Escape',
  'Space',
  'Tab',
  'Backspace',
  'Delete',
])

/**
 * Set of all valid punctuation keys commonly used in keyboard shortcuts.
 *
 * These are the literal characters as they appear in `KeyboardEvent.key` (layout-dependent,
 * typically US keyboard layout). Common shortcuts include:
 * - `Mod+/` - Toggle comment
 * - `Mod+[` / `Mod+]` - Indent/outdent
 * - `Mod+=` / `Mod+-` - Zoom in/out
 *
 * Note: Punctuation keys are affected by Shift (Shift+',' → '<' on US layout),
 * so they're excluded from Shift-based hotkey combinations to avoid layout-dependent behavior.
 */
export const PUNCTUATION_KEYS = new Set<PunctuationKey>([
  '/',
  '[',
  ']',
  '\\',
  '=',
  '-',
  ',',
  '.',
  ';',
  '`',
  "'",
  '+',
  '?',
  '!',
  '@',
  '#',
  '$',
  '%',
  '^',
  '&',
  '*',
  '(',
  ')',
  '_',
  '{',
  '}',
  '|',
  ':',
  '"',
  '<',
  '>',
  '~',
])

/**
 * Maps `KeyboardEvent.code` values for punctuation keys to their canonical characters.
 *
 * On macOS, holding the Option (Alt) key transforms punctuation keys into special characters
 * (e.g., Option+Minus → en-dash '–'), causing `event.key` to differ from the expected character.
 * However, `event.code` still reports the physical key (e.g., 'Minus'). This map enables
 * falling back to `event.code` for punctuation keys, similar to the existing `Key*`/`Digit*`
 * fallbacks for letters and digits.
 */
export const PUNCTUATION_CODE_MAP: Record<string, string> = {
  Backquote: '`',
  Backslash: '\\',
  BracketLeft: '[',
  BracketRight: ']',
  Comma: ',',
  Equal: '=',
  Minus: '-',
  Period: '.',
  Quote: "'",
  Semicolon: ';',
  Slash: '/',
}

/**
 * Set of all valid non-modifier keys.
 *
 * This is the union of all key type sets (letters, numbers, function keys, navigation,
 * editing, and punctuation). Used primarily for validation to check if a key string
 * is recognized and will have type-safe autocomplete support.
 *
 * @see {@link LETTER_KEYS}
 * @see {@link NUMBER_KEYS}
 * @see {@link FUNCTION_KEYS}
 * @see {@link NAVIGATION_KEYS}
 * @see {@link EDITING_KEYS}
 * @see {@link PUNCTUATION_KEYS}
 */
export const ALL_KEYS = new Set([
  ...LETTER_KEYS,
  ...NUMBER_KEYS,
  ...FUNCTION_KEYS,
  ...NAVIGATION_KEYS,
  ...EDITING_KEYS,
  ...PUNCTUATION_KEYS,
  ...SHARED_NAMED_KEYS,
  ...LOGICAL_ONLY_NAMED_KEYS,
])

// Share canonical spellings with validation, including newly supported named keys.
const CANONICAL_KEY_NAMES = new Map<string, string>(
  Array.from(ALL_KEYS, (key) => [key.toLowerCase(), key]),
)

/**
 * Maps key name aliases to their canonical form.
 *
 * Handles common variations and alternative names for keys to provide a more
 * forgiving API. For example, users can write 'Esc', 'esc', or 'escape' and
 * they'll all normalize to 'Escape'.
 *
 * This map is used internally by `normalizeKeyName()` to convert user input
 * into the canonical key names used throughout the library.
 *
 * @remarks Case-insensitive lookups are supported via lowercase variants
 *
 * @example
 * ```ts
 * KEY_ALIASES['Esc'] // 'Escape'
 * KEY_ALIASES['Del'] // 'Delete'
 * KEY_ALIASES['Up'] // 'ArrowUp'
 * ```
 */
const KEY_ALIASES: Record<string, string> = {
  Plus: '+',
  plus: '+',
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
 *
 * Converts various key name formats (aliases, case variations) into the standard
 * canonical names used throughout the library. This enables a more forgiving API
 * where users can write keys in different ways and still get correct behavior.
 *
 * Normalization rules:
 * 1. Check aliases first (e.g., 'Esc' → 'Escape', 'Del' → 'Delete')
 * 2. Single letters → uppercase (e.g., 'a' → 'A', 's' → 'S')
 * 3. Function keys → uppercase (e.g., 'f1' → 'F1', 'F12' → 'F12')
 * 4. Other keys → returned as-is (already canonical or unknown)
 *
 * @param key - The key name to normalize (can be an alias, lowercase, etc.)
 * @returns The canonical key name
 *
 * @example
 * ```ts
 * normalizeKeyName('esc') // 'Escape'
 * normalizeKeyName('a') // 'A'
 * normalizeKeyName('f1') // 'F1'
 * normalizeKeyName('ArrowUp') // 'ArrowUp' (already canonical)
 * ```
 */
export function isSingleLetterKey(key: string): boolean {
  return /^\p{Letter}$/u.test(key)
}

/**
 * Normalizes a key name to its canonical form.
 *
 * @param key - The key name to normalize (can be an alias, lowercase, etc.)
 * @returns The canonical key name
 *
 * @example
 * ```ts
 * normalizeKeyName('esc') // 'Escape'
 * normalizeKeyName('a') // 'A'
 * normalizeKeyName('f1') // 'F1'
 * normalizeKeyName('ArrowUp') // 'ArrowUp' (already canonical)
 * ```
 */
export function normalizeKeyName(key: string): string {
  // key can be undefined in rare cases
  // (browser extensions synthesizing key events, accessibility tools, certain OS/browser combinations).
  if (!key) return ''
  // Check aliases first
  if (key in KEY_ALIASES) {
    return KEY_ALIASES[key]!
  }

  if (isSingleLetterKey(key)) {
    const upper = key.toUpperCase()
    // Some Unicode letters (e.g., 'ß') uppercase to multi-character sequences
    // ('SS'). Avoid changing the string length so the rest of the matching
    // logic can rely on a stable single-character key value.
    return upper.length === 1 ? upper : key
  }

  return CANONICAL_KEY_NAMES.get(key.toLowerCase()) ?? key
}
