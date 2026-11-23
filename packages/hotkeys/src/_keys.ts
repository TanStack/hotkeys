import { isSingleLetterKey } from './constants'

// Classifies and compares key values: the characters and names that
// `KeyboardEvent.key` reports and that hotkeys are written with.

/**
 * Reads a table's own property only, so names such as `toString` or
 * `constructor` never read Object.prototype.
 */
export function ownValue<T>(
  table: Readonly<Record<string, T>> | undefined,
  name: string,
): T | undefined {
  return table && Object.hasOwn(table, name) ? table[name] : undefined
}

/** Tests for one Unicode code point, including characters represented by a surrogate pair. */
export function isPrintableKey(key: string): boolean {
  return key !== '' && Array.from(key).length === 1
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
  if (isSingleLetterKey(left) && isSingleLetterKey(right)) {
    // One collator is much cheaper than localeCompare on every key press.
    collator ??= new Intl.Collator(undefined, { sensitivity: 'accent' })
    return collator.compare(left, right) === 0
  }
  return false
}
