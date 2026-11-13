import type { CanonicalModifier, ResolvableModifier } from './key.types'

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
export const MODIFIER_KEYS = /* @__PURE__ */ new Set<string>(MODIFIER_ORDER)

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
export const MODIFIER_ALIASES: Record<string, ResolvableModifier> = {
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

/** Whether a key is a single Unicode letter, such as `'a'` or `'é'`. */
export function isSingleLetterKey(key: string): boolean {
  return /^\p{Letter}$/u.test(key)
}

/**
 * Normalizes a key name from a `KeyboardEvent` or a hotkey: single letters
 * become uppercase, and the space character becomes `Space`. Other names are
 * returned as written, because key names are case-sensitive.
 *
 * Turkish dotless `ı` stays `ı`. Its uppercase is ASCII `I`, the uppercase of
 * `i`, so uppercasing it would merge two different letters.
 *
 * @param key - The key name to normalize
 * @returns The canonical key name
 *
 * @example
 * ```ts
 * normalizeKeyName('a') // 'A'
 * normalizeKeyName('ı') // 'ı' (Turkish dotless i)
 * normalizeKeyName(' ') // 'Space'
 * normalizeKeyName('ArrowUp') // 'ArrowUp' (already canonical)
 * ```
 */
export function normalizeKeyName(key: string): string {
  // key can be undefined in rare cases
  // (browser extensions synthesizing key events, accessibility tools, certain OS/browser combinations).
  if (!key) return ''
  if (isSingleLetterKey(key)) {
    if (key === 'ı') return key
    const upper = key.toUpperCase()
    // Some Unicode letters (e.g., 'ß') uppercase to multi-character sequences
    // ('SS'). Avoid changing the string length so the rest of the matching
    // logic can rely on a stable single-character key value.
    return upper.length === 1 ? upper : key
  }

  return key === ' ' ? 'Space' : key
}
