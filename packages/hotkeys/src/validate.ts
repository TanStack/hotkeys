import { ALL_KEYS, MODIFIER_ALIASES, normalizeKeyName } from './constants'
import { splitHotkeyParts } from './_keyboard-event'
import type { Hotkey } from './hotkey.types'

/** A hotkey to validate: a chord string, a sequence, or untyped input such as saved data. */
export type ValidatableHotkey = Hotkey | (string & {}) | ReadonlyArray<string>

/**
 * Validates a hotkey and returns any warnings or errors.
 * Sequences are validated step by step, and messages name the failing step.
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
 *
 * validateHotkey(['G', 'Foo+H'])
 * // { valid: false, warnings: [], errors: ["Step 2: Unknown modifier: 'Foo'"] }
 * ```
 */
export function validateHotkey(hotkey: ValidatableHotkey): ValidationResult {
  if (typeof hotkey !== 'string') {
    if (hotkey.length === 0) {
      return {
        valid: false,
        warnings: [],
        errors: ['Sequence cannot be empty'],
      }
    }
    if (hotkey.length === 1) return validateChord(hotkey[0]!)
    const results = hotkey.map(validateChord)
    const prefixed = (key: 'warnings' | 'errors') =>
      results.flatMap((result, i) =>
        result[key].map((message) => `Step ${i + 1}: ${message}`),
      )
    return {
      valid: results.every((result) => result.valid),
      warnings: prefixed('warnings'),
      errors: prefixed('errors'),
    }
  }
  return validateChord(hotkey)
}

function validateChord(hotkey: string): ValidationResult {
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
export function assertValidHotkey(hotkey: ValidatableHotkey): void {
  const result = validateHotkey(hotkey)
  if (!result.valid) {
    throw new Error(
      `Invalid hotkey '${String(hotkey)}': ${result.errors.join(', ')}`,
    )
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
export function checkHotkey(hotkey: ValidatableHotkey): boolean {
  const result = validateHotkey(hotkey)

  if (result.errors.length > 0) {
    console.error(
      `Hotkey '${String(hotkey)}' errors:`,
      result.errors.join('; '),
    )
  }

  if (result.warnings.length > 0) {
    console.warn(
      `Hotkey '${String(hotkey)}' warnings:`,
      result.warnings.join('; '),
    )
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
