import {
  isKeyNameShape,
  isModifierCode,
  modifierAlias,
  physicalCodeOf,
  splitChordParts,
} from './_chord'
import { canWarn } from './_dev'
import type { Hotkey } from './hotkey.types'

/** A hotkey to validate: a chord string, a sequence, or untyped input such as saved data. */
export type ValidatableHotkey = Hotkey | (string & {}) | ReadonlyArray<string>

/**
 * Validates a hotkey and returns any warnings or errors.
 * Each issue has a `reason` code, so apps can write their own messages.
 * Issues in a sequence carry the index of their `step`.
 *
 * Checks for:
 * - Valid syntax (modifier+...+key format)
 * - Known modifiers
 * - A key that isn't a modifier
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
 * // { valid: false, warnings: [], errors: [{ reason: 'empty' }] }
 *
 * validateHotkey(['G', 'Foo+H'])
 * // { valid: false, warnings: [], errors: [{ reason: 'unknown-modifier', part: 'Foo', step: 1 }] }
 * ```
 */
export function validateHotkey(hotkey: ValidatableHotkey): ValidationResult {
  if (typeof hotkey !== 'string') {
    if (hotkey.length === 0) return invalid('empty')
    if (hotkey.length === 1) return validateChord(hotkey[0]!)
    const results = hotkey.map(validateChord)
    const withStep = (key: 'warnings' | 'errors') =>
      results.flatMap((result, step) =>
        result[key].map((issue) => ({ ...issue, step })),
      )
    return {
      valid: results.every((result) => result.valid),
      warnings: withStep('warnings'),
      errors: withStep('errors'),
    }
  }
  return validateChord(hotkey)
}

function invalid(reason: HotkeyIssueReason): ValidationResult {
  return { valid: false, warnings: [], errors: [{ reason }] }
}

function validateChord(hotkey: string): ValidationResult {
  const warnings: Array<HotkeyIssue> = []
  const errors: Array<HotkeyIssue> = []

  if (!hotkey || hotkey.trim() === '') return invalid('empty')

  const parts = splitChordParts(hotkey).map((p) => p.trim())

  // Must have at least one part (the key)
  if (parts.length === 0 || parts.some((p) => p === '')) {
    return invalid('empty-part')
  }

  // Validate modifiers (all parts except the last)
  const modifierParts = parts.slice(0, -1)
  const keyPart = parts[parts.length - 1]!

  for (const modifier of modifierParts) {
    if (!modifierAlias(modifier)) {
      errors.push({ reason: 'unknown-modifier', part: modifier })
    }
  }

  const code = physicalCodeOf(keyPart)
  if (
    keyPart.length > 1 &&
    (keyPart.startsWith('[') || keyPart.endsWith(']')) &&
    code === undefined
  ) {
    errors.push({ reason: 'invalid-physical-key', part: keyPart })
  }

  if (code !== undefined ? isModifierCode(code) : modifierAlias(keyPart)) {
    errors.push({ reason: 'modifier-only', part: keyPart })
  }

  // Key names are case-sensitive, so a lowercase name never matches
  if (code === undefined && !isKeyNameShape(keyPart)) {
    warnings.push({ reason: 'unknown-key', part: keyPart })
  }

  return {
    valid: errors.length === 0,
    warnings,
    errors,
  }
}

/** Lists issues for a console message, such as `unknown-modifier 'Ctl'`. */
function describeIssues(issues: Array<HotkeyIssue>): string {
  return issues
    .map(
      ({ reason, part, step }) =>
        (step === undefined ? '' : `step ${step + 1} `) +
        reason +
        (part === undefined ? '' : ` '${part}'`),
    )
    .join(', ')
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
 * assertValidHotkey('') // Throws Error: [hotkeys] Invalid hotkey '': empty
 * ```
 */
export function assertValidHotkey(hotkey: ValidatableHotkey): void {
  const result = validateHotkey(hotkey)
  if (!result.valid) {
    throw new Error(
      `[hotkeys] Invalid hotkey '${String(hotkey)}': ${describeIssues(result.errors)}`,
    )
  }
}

/**
 * Validates a hotkey and logs errors and warnings to the console.
 * Useful for development-time feedback. Logs nothing in production builds, or
 * where `process.env.NODE_ENV` can't be read, such as a page with no bundler.
 * Use `validateHotkey` there.
 *
 * @param hotkey - The hotkey string to validate
 * @returns True if the hotkey is valid (may still have warnings)
 *
 * @example
 * ```ts
 * checkHotkey('Control+escape')
 * // Console: [hotkeys] Hotkey 'Control+escape' may never fire: unknown-key 'escape'
 * // Returns: true
 *
 * checkHotkey('Ctl+K')
 * // Console: [hotkeys] Invalid hotkey 'Ctl+K': unknown-modifier 'Ctl'
 * // Returns: false
 * ```
 */
export function checkHotkey(hotkey: ValidatableHotkey): boolean {
  const result = validateHotkey(hotkey)

  // Dev-only guard: see `canWarn`
  if (canWarn && process.env.NODE_ENV !== 'production') {
    if (result.errors.length > 0) {
      console.error(
        `[hotkeys] Invalid hotkey '${String(hotkey)}': ${describeIssues(result.errors)}`,
      )
    }

    if (result.warnings.length > 0) {
      console.warn(
        `[hotkeys] Hotkey '${String(hotkey)}' may never fire: ${describeIssues(result.warnings)}`,
      )
    }
  }

  return result.valid
}

/**
 * Why a hotkey is invalid or may never fire:
 *
 * - `'empty'`: the hotkey or sequence is empty.
 * - `'empty-part'`: a part between `+` signs is empty or whitespace.
 * - `'unknown-modifier'`: a modifier isn't one the library knows, such as `Ctl`.
 * - `'invalid-physical-key'`: a bracketed key isn't a `KeyboardEvent.code`.
 * - `'modifier-only'`: the key is a modifier, such as `Shift` or `[ShiftLeft]`.
 * - `'unknown-key'` (warning): the key isn't written like a known key name.
 *   Key names are case-sensitive, so `escape` never matches `Escape`.
 */
export type HotkeyIssueReason =
  | 'empty'
  | 'empty-part'
  | 'unknown-modifier'
  | 'invalid-physical-key'
  | 'modifier-only'
  | 'unknown-key'

/** One problem found by `validateHotkey`. */
export interface HotkeyIssue {
  reason: HotkeyIssueReason
  /** The part of the chord with the problem, such as `'Ctl'` in `'Ctl+K'`. */
  part?: string
  /** For a sequence, the index of the step with the problem. */
  step?: number
}

/**
 * Result of validating a hotkey string.
 */
export interface ValidationResult {
  /** Whether the hotkey is valid (can still have warnings) */
  valid: boolean
  /** Problems that may stop the hotkey from firing, such as an unknown key */
  warnings: Array<HotkeyIssue>
  /** Problems that stop the hotkey from registering */
  errors: Array<HotkeyIssue>
}
