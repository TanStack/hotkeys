import { NON_TYPING_KEY, NUMPAD_KEY_VALUES } from './_constants'
import { canWarn } from './_dev'
import { codeToLogicalKey, isTypedText } from './_keyboard-event'
import { ownValue } from './_keys'
import type { ConflictBehavior, ParsedHotkeyChord } from './hotkey.types'

/**
 * Merges option layers left to right. A key set to `undefined` keeps the
 * earlier layer's value, so an unset option keeps its default. Getters are
 * read once.
 */
export function definedOptions<T extends object>(
  ...layers: ReadonlyArray<object | undefined>
): T {
  const result: Record<string, unknown> = {}
  for (const layer of layers) {
    if (!layer) continue
    for (const key of Object.keys(layer)) {
      const value = (layer as Record<string, unknown>)[key]
      if (value !== undefined) result[key] = value
    }
  }
  return result as T
}

/**
 * Merges options over defaults for an API whose `setOptions` treats
 * `undefined` as "clear". An unset option takes its default, or stays
 * `undefined` to clear an earlier value when it has no default.
 */
export function withDefaults<T extends object>(
  defaults: object | undefined,
  options: T | undefined,
): T {
  return { ...options, ...definedOptions<T>(defaults, options) }
}

/**
 * Resolves `ignoreInputs: 'auto'` from the hotkey (the first step of a sequence).
 * Ctrl/Meta shortcuts, Escape, function keys, and media keys fire in inputs,
 * with any modifiers. Other single keys and Shift/Alt combos are ignored.
 */
export function getDefaultIgnoreInputs(
  parsedChord: ParsedHotkeyChord,
): boolean {
  if (parsedChord.ctrl || parsedChord.meta) return false // Mod+S, Ctrl+C, etc.
  const key = parsedChord.key ?? parsedChord.code
  if (key === 'Escape') return false // Close modal, etc.
  if (NON_TYPING_KEY.test(key)) return false // F5, Shift+F10, MediaPlayPause
  return true // Single keys, Shift+key, Alt+key
}

/** Whether a key, or the key at a physical position, types a character. */
function typesCharacter(chord: ParsedHotkeyChord): boolean {
  // The extra ISO and JIS keys type characters, such as `\` and `¥`.
  if (chord.code?.startsWith('Intl')) return true
  const key =
    chord.code === undefined
      ? chord.key
      : (codeToLogicalKey(chord.code) ??
        ownValue(NUMPAD_KEY_VALUES, chord.code))
  return key === 'Space' || (key !== undefined && isTypedText(key))
}

/**
 * Whether a hotkey is a character key shortcut in the WCAG 2.1.4 sense: every
 * step is a key that types a character (a letter, digit, punctuation mark, or
 * symbol, or the space bar), alone or with Shift. Control, Alt, and Meta make
 * a chord a modifier shortcut, and keys such as Escape, Enter, arrows, and F1
 * type nothing.
 */
export function isCharacterKeyShortcut(
  steps: ReadonlyArray<ParsedHotkeyChord>,
): boolean {
  return steps.every(
    (chord) =>
      !chord.ctrl && !chord.alt && !chord.meta && typesCharacter(chord),
  )
}

/**
 * Handles a registration that duplicates an existing one, based on conflict
 * behavior. Both registrations stay unless `'error'` throws.
 *
 * @param keyDisplay - Display string for the conflicting key/sequence (for error messages)
 * @param conflictBehavior - How to handle the conflict
 */
export function handleConflict(
  keyDisplay: string,
  conflictBehavior: ConflictBehavior,
): void {
  if (conflictBehavior === 'warn') {
    // Dev-only guard: see `canWarn`
    if (canWarn && process.env.NODE_ENV !== 'production') {
      console.warn(`[hotkeys] '${keyDisplay}' is already registered`)
    }
    return
  }

  if (conflictBehavior === 'error') {
    throw new Error(`[hotkeys] '${keyDisplay}' is already registered`)
  }
}

/**
 * Compare updates without publishing unchanged options. A component can pass
 * `meta` inline: its primitive fields compare by value, and its object and
 * function fields, such as arrays, elements and callbacks, by kind only:
 * array, function, or other object.
 * Frameworks rebuild those on every render, and publishing them would
 * re-render registration lists, which render the caller again and loop. The
 * registration still keeps the newest ones.
 */
export function optionsEqual(left: object, right: object): boolean {
  return recordsEqual(left, right, (key, a, b) =>
    key === 'meta' && isReference(a) && isReference(b)
      ? recordsEqual(a, b, (_, x, y) => Object.is(x, y) || sameKind(x, y))
      : Object.is(a, b),
  )
}

function recordsEqual(
  a: object,
  b: object,
  equal: (key: string, a: unknown, b: unknown) => boolean,
): boolean {
  const keys = Object.keys(a)
  return (
    keys.length === Object.keys(b).length &&
    keys.every(
      (key) =>
        Object.hasOwn(b, key) &&
        equal(
          key,
          (a as Record<string, unknown>)[key],
          (b as Record<string, unknown>)[key],
        ),
    )
  )
}

function isReference(value: unknown): value is object {
  return (
    (typeof value === 'object' && value !== null) || typeof value === 'function'
  )
}

function sameKind(a: unknown, b: unknown): boolean {
  return (
    isReference(a) &&
    isReference(b) &&
    typeof a === typeof b &&
    Array.isArray(a) === Array.isArray(b)
  )
}
