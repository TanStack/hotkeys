import {
  ALL_KEYS,
  LETTER_KEYS,
  MODIFIER_ALIASES,
  NUMBER_KEYS,
} from './constants'
import { parseHotkey } from './parse'
import type { Hotkey, ValidationResult } from './hotkey'

/**
 * Validates a hotkey string and returns any warnings or errors.
 *
 * Checks for:
 * - Valid syntax (modifier+...+key format)
 * - Known modifiers
 * - Known keys
 * - Potential issues like Alt+letter on macOS or Shift+number
 *
 * @param hotkey - The hotkey string to validate
 * @returns A ValidationResult with validity status, warnings, and errors
 *
 * @example
 * ```ts
 * validateHotkey('Mod+S')
 * // { valid: true, warnings: [], errors: [] }
 *
 * validateHotkey('Alt+C')
 * // { valid: true, warnings: ['Alt+letter shortcuts may not work reliably on macOS...'], errors: [] }
 *
 * validateHotkey('Shift+1')
 * // { valid: true, warnings: ['Shift+number produces different characters on different keyboard layouts...'], errors: [] }
 *
 * validateHotkey('')
 * // { valid: false, warnings: [], errors: ['Hotkey cannot be empty'] }
 * ```
 */
export function validateHotkey(
  hotkey: Hotkey | (string & {}),
): ValidationResult {
  const warnings: Array<string> = []
  const errors: Array<string> = []

  // Check for empty string
  if (!hotkey || hotkey.trim() === '') {
    return {
      valid: false,
      warnings: [],
      errors: ['Hotkey cannot be empty'],
    }
  }

  const parts = hotkey.split('+').map((p) => p.trim())

  // Must have at least one part (the key)
  if (parts.length === 0 || parts.some((p) => p === '')) {
    return {
      valid: false,
      warnings: [],
      errors: ['Invalid hotkey format: empty parts detected'],
    }
  }

  // Validate modifiers (all parts except the last)
  const modifierParts = parts.slice(0, -1)
  const keyPart = parts[parts.length - 1]!

  // Check for unknown modifiers
  for (const modifier of modifierParts) {
    const normalized =
      MODIFIER_ALIASES[modifier] ?? MODIFIER_ALIASES[modifier.toLowerCase()]
    if (!normalized) {
      errors.push(`Unknown modifier: '${modifier}'`)
    }
  }

  // Check if key is known
  const normalizedKey = normalizeKeyForValidation(keyPart)
  if (!isKnownKey(normalizedKey) && !isKnownKey(keyPart)) {
    warnings.push(
      `Unknown key: '${keyPart}'. This may still work but won't have type-safe autocomplete.`,
    )
  }

  // Parse to check for specific issues
  const parsed = parseHotkey(hotkey)

  // Warn about Alt+letter on macOS
  if (parsed.alt && isLetterKey(parsed.key)) {
    warnings.push(
      `Alt+${parsed.key} may not work reliably on macOS because the Option key modifies the character. ` +
        `Consider using Control or Command instead.`,
    )
  }

  // Warn about Shift+number
  if (parsed.shift && isNumberKey(parsed.key)) {
    warnings.push(
      `Shift+${parsed.key} produces different characters on different keyboard layouts ` +
        `(e.g., Shift+2 is '@' on US keyboards but '"' on UK keyboards). ` +
        `Consider using a letter key or the resulting symbol directly.`,
    )
  }

  // Warn about Alt+Shift combinations with letters
  if (parsed.alt && parsed.shift && isLetterKey(parsed.key)) {
    warnings.push(
      `Alt+Shift+${parsed.key} may produce unexpected characters on various keyboard layouts. ` +
        `Consider using a different modifier combination.`,
    )
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

/**
 * Normalizes a key for validation checking.
 */
function normalizeKeyForValidation(key: string): string {
  // Single letter to uppercase
  if (key.length === 1 && /^[a-zA-Z]$/.test(key)) {
    return key.toUpperCase()
  }

  // Function keys to uppercase
  if (/^f([1-9]|1[0-2])$/i.test(key)) {
    return key.toUpperCase()
  }

  return key
}

/**
 * Checks if a key is in the known keys set.
 */
function isKnownKey(key: string): boolean {
  // Check direct match
  if (ALL_KEYS.has(key as any)) {
    return true
  }

  // Check uppercase version for letters
  if (key.length === 1 && ALL_KEYS.has(key.toUpperCase() as any)) {
    return true
  }

  // Check common aliases
  const aliases: Record<string, boolean> = {
    Esc: true,
    Return: true,
    Space: true,
    ' ': true,
    Del: true,
    Up: true,
    Down: true,
    Left: true,
    Right: true,
  }

  return key in aliases
}

/**
 * Checks if a key is a letter key (A-Z).
 */
function isLetterKey(key: string): boolean {
  return LETTER_KEYS.has(key.toUpperCase() as any)
}

/**
 * Checks if a key is a number key (0-9).
 */
function isNumberKey(key: string): boolean {
  return NUMBER_KEYS.has(key as any)
}

/**
 * Validates a hotkey and throws an error if invalid.
 * Useful for development-time validation.
 *
 * @param hotkey - The hotkey string to validate
 * @throws Error if the hotkey is invalid
 *
 * @example
 * ```ts
 * assertValidHotkey('Mod+S') // OK
 * assertValidHotkey('') // Throws Error: Invalid hotkey: Hotkey cannot be empty
 * ```
 */
export function assertValidHotkey(hotkey: Hotkey | (string & {})): void {
  const result = validateHotkey(hotkey)
  if (!result.valid) {
    throw new Error(`Invalid hotkey '${hotkey}': ${result.errors.join(', ')}`)
  }
}

/**
 * Validates a hotkey and logs warnings to the console.
 * Useful for development-time feedback.
 *
 * @param hotkey - The hotkey string to validate
 * @returns True if the hotkey is valid (may still have warnings)
 *
 * @example
 * ```ts
 * checkHotkey('Alt+C')
 * // Console: Warning: Alt+C may not work reliably on macOS...
 * // Returns: true
 * ```
 */
export function checkHotkey(hotkey: Hotkey | (string & {})): boolean {
  const result = validateHotkey(hotkey)

  if (result.errors.length > 0) {
    console.error(`Hotkey '${hotkey}' errors:`, result.errors.join('; '))
  }

  if (result.warnings.length > 0) {
    console.warn(`Hotkey '${hotkey}' warnings:`, result.warnings.join('; '))
  }

  return result.valid
}
