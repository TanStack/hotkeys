import { PUNCTUATION_CODE_MAP, normalizeKeyName } from './constants'
import type { NormalizedKeyboardEvent } from './key.types'

/** Normalizes Unicode key names and modifier flags while retaining physical code and IME state. */
export function normalizeKeyboardEvent(
  event: KeyboardEvent,
  platform?: 'mac' | 'windows' | 'linux',
): NormalizedKeyboardEvent {
  let altGraph = false
  try {
    // WebKit reports AltGraph for Option on some macOS keyboard layouts. Option
    // remains a normal Alt shortcut modifier there, so only use this signal on
    // Windows/Linux where AltGraph synthesizes Control+Alt.
    altGraph =
      platform !== 'mac' &&
      typeof event.getModifierState === 'function' &&
      event.getModifierState('AltGraph')
  } catch {
    // Synthetic events and older browsers may not implement this reliably.
  }

  const key = (event.key || '').normalize('NFC')
  return {
    key: normalizeKeyName(key),
    code: event.code || '',
    ctrl: Boolean(event.ctrlKey),
    shift: Boolean(event.shiftKey),
    alt: Boolean(event.altKey),
    meta: Boolean(event.metaKey),
    altGraph,
    location: event.location,
    isComposing:
      Boolean(event.isComposing) || key === 'Process' || key === 'Unidentified',
  }
}

/**
 * Maps familiar positions to compatibility fallback keys for the logical matcher.
 * This assumes conventional positions, not the active layout; never use it to
 * turn recorded physical bindings into logical bindings or display labels.
 */
export function codeToLogicalKey(code: string): string | undefined {
  if (/^Key[A-Z]$/i.test(code)) return code.slice(3).toUpperCase()
  if (/^Digit[0-9]$/i.test(code)) return code.slice(5)
  if (/^Numpad[0-9]$/i.test(code)) return code.slice(6)

  const punctuation = PUNCTUATION_CODE_MAP[code]
  if (punctuation) return punctuation

  const named: Record<string, string> = {
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadDecimal: '.',
    NumpadEnter: 'Enter',
    Space: 'Space',
  }
  return named[code]
}

/** Tests for one Unicode code point, including characters represented by a surrogate pair. */
export function isPrintableKey(key: string): boolean {
  return key !== '' && Array.from(key).length === 1
}

/** Splits modifier tokens while retaining a trailing literal plus: `Control++` → `['Control', '+']`. */
export function splitHotkeyParts(hotkey: string): Array<string> {
  if (!hotkey.endsWith('+')) return hotkey.split('+')
  const parts = hotkey.slice(0, -1).split('+')
  if (parts.at(-1) === '') parts.pop()
  parts.push('+')
  return parts
}

/** Identifies ASCII letters whose layout-produced value takes precedence over positional fallbacks. */
export function isAsciiLetter(key: string): boolean {
  return /^[A-Za-z]$/.test(key)
}

/** Identifies a single Latin-script character, including accented letters. */
export function isLatinLetter(key: string): boolean {
  return /^\p{Script_Extensions=Latin}$/u.test(key)
}

/** Compares letters without case, preserving accents and avoiding expansions such as ß → SS. */
export function keysEqual(left: string, right: string): boolean {
  if (/^\p{Letter}$/u.test(left) && /^\p{Letter}$/u.test(right)) {
    return left.localeCompare(right, undefined, { sensitivity: 'accent' }) === 0
  }
  return left === right
}

/** Rejects reserved physical-token syntax in logical object fields while allowing Unicode characters. */
export function assertLogicalKey(key: string): void {
  if (/^\[.*\]$/s.test(key.trim())) {
    throw new Error(
      'Logical key must not contain a bracketed physical code. Use the code field instead.',
    )
  }
}
