import {
  MODIFIER_ALIASES,
  PUNCTUATION_CODE_MAP,
  normalizeKeyName,
} from './constants'
import type { CanonicalModifier, NormalizedKeyboardEvent } from './key.types'

/** Normalizes Unicode key names and modifier flags while retaining physical code and IME state. */
export function normalizeKeyboardEvent(
  event: KeyboardEvent,
  platform?: 'mac' | 'windows' | 'linux',
): NormalizedKeyboardEvent {
  let altGraph = false
  try {
    // WebKit reports AltGraph for Option on some macOS keyboard layouts. Option
    // remains a normal Alt shortcut modifier there, so only use this signal on
    // Windows/Linux, where it means AltGr is held.
    altGraph =
      platform !== 'mac' &&
      typeof event.getModifierState === 'function' &&
      event.getModifierState('AltGraph')
  } catch {
    // Synthetic events and older browsers may not implement this reliably.
  }

  const key = (event.key || '').normalize('NFC')
  const normalizedKey = normalizeKeyName(key)
  // Windows reports AltGr as Control+Alt. When AltGr+key typed no new
  // character (AltGr+Home, or AltGr+F typing `f`), treat it as that shortcut.
  const controlAlt =
    platform === 'windows' &&
    altGraph &&
    !altGraphTypedCharacter({ key: normalizedKey, altGraph })
  return {
    key: normalizedKey,
    code: event.code || '',
    ctrl: controlAlt || Boolean(event.ctrlKey),
    shift: Boolean(event.shiftKey),
    alt: controlAlt || Boolean(event.altKey),
    meta: Boolean(event.metaKey),
    altGraph: altGraph && !controlAlt,
    location: event.location,
    // Safari sends the Enter that commits a composition after compositionend,
    // with isComposing false but keyCode 229.
    isComposing:
      Boolean(event.isComposing) ||
      event.keyCode === 229 ||
      key === 'Process' ||
      key === 'Unidentified',
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

  // Own properties only, so codes such as `toString` never read Object.prototype
  if (Object.hasOwn(PUNCTUATION_CODE_MAP, code))
    return PUNCTUATION_CODE_MAP[code]

  const named: Record<string, string> = {
    NumpadAdd: '+',
    NumpadSubtract: '-',
    NumpadMultiply: '*',
    NumpadDivide: '/',
    NumpadDecimal: '.',
    NumpadEnter: 'Enter',
    Space: 'Space',
  }
  return Object.hasOwn(named, code) ? named[code] : undefined
}

/**
 * Whether AltGr changed what a key typed, as in AltGr+Q typing `@`. False when
 * AltGr is not held, or when the key typed its plain value: a named key such
 * as Home, or an ASCII letter or digit (AltGr+F typing `f` on layouts with
 * nothing on that key).
 */
export function altGraphTypedCharacter(
  event: Pick<NormalizedKeyboardEvent, 'key' | 'altGraph'>,
): boolean {
  if (!event.altGraph) return false
  // A dead key starts a composed character such as `ẽ`.
  if (event.key === 'Dead') return true
  return isPrintableKey(event.key) && !/^[A-Za-z0-9]$/.test(event.key)
}

/** Tests for one Unicode code point, including characters represented by a surrogate pair. */
export function isPrintableKey(key: string): boolean {
  return key !== '' && Array.from(key).length === 1
}

/**
 * Resolves a modifier token or alias case-insensitively: `ctrl` → `Control`,
 * `cmd` → `Meta`, `mod` → `Mod`. Returns undefined for anything else.
 */
export function modifierAlias(
  token: string,
): CanonicalModifier | 'Mod' | undefined {
  // Every alias has a lowercase entry. hasOwn keeps out names like 'constructor'.
  const lower = token.toLowerCase()
  return Object.hasOwn(MODIFIER_ALIASES, lower)
    ? MODIFIER_ALIASES[lower]
    : undefined
}

/** Whether a string has the shape of a `KeyboardEvent.code`, such as `KeyS`. */
export function isCodeName(code: string): boolean {
  return /^[A-Za-z][A-Za-z0-9]*$/.test(code)
}

/** The code inside a physical token: `[KeyS]` → `KeyS`. Undefined for anything else. */
export function physicalCodeOf(token: string): string | undefined {
  return token.startsWith('[') &&
    token.endsWith(']') &&
    isCodeName(token.slice(1, -1))
    ? token.slice(1, -1)
    : undefined
}

/** Splits modifier tokens while retaining a trailing literal plus: `Control++` → `['Control', '+']`. */
export function splitChordParts(hotkey: string): Array<string> {
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

let collator: Intl.Collator | undefined

/** Compares letters without case, preserving accents and avoiding expansions such as ß → SS. */
export function keysEqual(left: string, right: string): boolean {
  if (left === right) return true
  if (/^\p{Letter}$/u.test(left) && /^\p{Letter}$/u.test(right)) {
    // One collator is much cheaper than localeCompare on every key press.
    collator ??= new Intl.Collator(undefined, { sensitivity: 'accent' })
    return collator.compare(left, right) === 0
  }
  return false
}

/** Rejects reserved physical-token syntax in logical object fields while allowing Unicode characters. */
export function assertLogicalKey(key: string): void {
  if (/^\[.*\]$/s.test(key.trim())) {
    throw new Error(
      'Logical key must not contain a bracketed physical code. Use the code field instead.',
    )
  }
}

/**
 * Whether a key is written like a key the library knows: one character,
 * F1-F24, or a capitalized name such as `Escape`. Key names are
 * case-sensitive, so `escape` and `f1` don't qualify.
 */
export function isKeyNameShape(key: string): boolean {
  return /^(?:.|F(?:[1-9]|1\d|2[0-4])|[A-Z][a-z][A-Za-z\d]*)$/su.test(key)
}
