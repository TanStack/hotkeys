import { ALL_KEYS, MODIFIER_ALIASES, normalizeKeyName } from './constants'
import { splitHotkeyParts } from './_keyboard-event'
import type { Hotkey } from './hotkey.types'

/**
 * Validates a hotkey string and returns any warnings or errors.
 *
 * Checks for:
 * - Valid syntax (modifier+...+key format)
 * - Known modifiers
 * - Known keys
 *
 * @param hotkey - The hotkey string to validate
 * @returns A ValidationResult with validity status, warnings, and errors
 *
 * @example
 * ```ts
 * validateHotkey('Mod+S')
 * // { valid: true, warnings: [], errors: [] }
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

  const parts = splitHotkeyParts(hotkey).map((p) => p.trim())

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

  if (
    keyPart.length > 1 &&
    (keyPart.startsWith('[') || keyPart.endsWith(']')) &&
    !/^\[[A-Za-z][A-Za-z0-9]*\]$/.test(keyPart)
  ) {
    errors.push(
      'Invalid physical key: use a bracketed KeyboardEvent.code, such as [KeyS]',
    )
  }

  // Check if key is known
  const normalizedKey = normalizeKeyName(keyPart)
  if (!isKnownKey(normalizedKey) && !isKnownKey(keyPart)) {
    warnings.push(
      `Unknown key: '${keyPart}'. This may still work but won't have type-safe autocomplete.`,
    )
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

/**
 * Checks if a key is in the known keys set.
 */
function isKnownKey(key: string): boolean {
  if (/^\[[A-Za-z][A-Za-z0-9]*\]$/.test(key)) return true
  if (Array.from(key).length === 1) return true
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

/**
 * Result of validating a hotkey string.
 */
export interface ValidationResult {
  /** Whether the hotkey is valid (can still have warnings) */
  valid: boolean
  /** Warning messages about potential issues */
  warnings: Array<string>
  /** Error messages about invalid syntax */
  errors: Array<string>
}
