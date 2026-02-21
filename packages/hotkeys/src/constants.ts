import type {
  CanonicalModifier,
  EditingKey,
  FunctionKey,
  LetterKey,
  NavigationKey,
  NumberKey,
  PunctuationKey,
} from './hotkey'

// =============================================================================
// Platform Detection
// =============================================================================

/**
 * Detects the current platform based on browser navigator properties.
 *
 * Used internally to resolve platform-adaptive modifiers like 'Mod' (Command on Mac,
 * Control elsewhere) and for platform-specific hotkey formatting.
 *
 * @returns The detected platform: 'mac', 'windows', or 'linux'
 * @remarks Defaults to 'linux' in SSR environments where navigator is undefined
 *
 * @example
 * ```ts
 * const platform = detectPlatform() // 'mac' | 'windows' | 'linux'
 * const modifier = resolveModifier('Mod', platform) // 'Meta' on Mac, 'Control' elsewhere
 * ```
 */
export function detectPlatform(): 'mac' | 'windows' | 'linux' {
  if (typeof navigator === 'undefined') {
    return 'linux' // Default for SSR
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const platform = navigator.platform?.toLowerCase() ?? ''
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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

  // Platform-adaptive (resolved at runtime)
  CommandOrControl: 'Mod',
  Mod: 'Mod',
  commandorcontrol: 'Mod',
  mod: 'Mod',
}

/**
 * Resolves the platform-adaptive 'Mod' modifier to the appropriate canonical modifier.
 *
 * The 'Mod' token represents the "primary modifier" on each platform:
 * - macOS: 'Meta' (Command key ⌘)
 * - Windows/Linux: 'Control' (Ctrl key)
 *
 * This enables cross-platform hotkey definitions like 'Mod+S' that automatically
 * map to Command+S on Mac and Ctrl+S on Windows/Linux.
 *
 * @param modifier - The modifier to resolve. If 'Mod', resolves based on platform.
 * @param platform - The target platform. Defaults to auto-detection.
 * @returns The canonical modifier name ('Control', 'Shift', 'Alt', or 'Meta')
 *
 * @example
 * ```ts
 * resolveModifier('Mod', 'mac') // 'Meta'
 * resolveModifier('Mod', 'windows') // 'Control'
 * resolveModifier('Control', 'mac') // 'Control' (unchanged)
 * ```
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
 * Set of all valid function keys (F1-F12).
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
  '?',
  '[',
  ']',
  '\\',
  '=',
  '-',
  ',',
  '.',
  '`',
])

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
])

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
export const MAC_MODIFIER_SYMBOLS: Record<CanonicalModifier, string> = {
  Control: '⌃',
  Alt: '⌥',
  Shift: '⇧',
  Meta: '⌘',
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
export const STANDARD_MODIFIER_LABELS: Record<CanonicalModifier, string> = {
  Control: 'Ctrl',
  Alt: 'Alt',
  Shift: 'Shift',
  Meta: 'Win',
}

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
