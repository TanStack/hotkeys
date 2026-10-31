import type { ConflictBehavior, ParsedHotkeyChord } from './hotkey.types'

/** The scope of hotkeys that do not name one. It is always active unless an exclusive scope is active. */
export const GLOBAL_SCOPE = 'global'

/**
 * Default options for hotkey/sequence registration.
 * Omitted: platform, target (resolved at registration), requireReset (HotkeyManager only).
 */
export const defaultHotkeyOptions = {
  capture: false,
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown' as const,
  enabled: true,
  ignoreInputs: 'auto' as const,
  conflictBehavior: 'warn' as ConflictBehavior,
  scope: GLOBAL_SCOPE as string,
}

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

/** Whether a parsed chord has a key. An empty one would match key-less events. */
export function chordHasKey(chord: ParsedHotkeyChord): boolean {
  return !!(chord.code || chord.key)
}

/**
 * Resolves `ignoreInputs: 'auto'` from the hotkey (the first step of a sequence).
 * Ctrl/Meta shortcuts and Escape fire in inputs; single keys and Shift/Alt combos are ignored.
 */
export function getDefaultIgnoreInputs(
  parsedChord: ParsedHotkeyChord,
): boolean {
  if (parsedChord.ctrl || parsedChord.meta) return false // Mod+S, Ctrl+C, etc.
  if (parsedChord.key === 'Escape' || parsedChord.code === 'Escape')
    return false // Close modal, etc.
  return true // Single keys, Shift+key, Alt+key
}

/**
 * Handles conflicts between registrations based on conflict behavior.
 *
 * @param conflictingId - The ID of the conflicting registration
 * @param keyDisplay - Display string for the conflicting key/sequence (for error messages)
 * @param conflictBehavior - How to handle the conflict
 * @param unregister - Function to unregister by ID
 */
export function handleConflict(
  conflictingId: string,
  keyDisplay: string,
  conflictBehavior: ConflictBehavior,
  unregister: (id: string) => void,
): void {
  if (conflictBehavior === 'allow') {
    return
  }

  if (conflictBehavior === 'warn') {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(
        `'${keyDisplay}' is already registered. Multiple handlers may be triggered. ` +
          `Use conflictBehavior: 'replace' to replace the existing handler, ` +
          `or conflictBehavior: 'allow' to suppress this warning.`,
      )
    }
    return
  }

  if (conflictBehavior === 'error') {
    throw new Error(
      `'${keyDisplay}' is already registered. ` +
        `Use conflictBehavior: 'replace' to replace the existing handler, ` +
        `or conflictBehavior: 'allow' to allow multiple registrations.`,
    )
  }

  // At this point, conflictBehavior must be 'replace'
  unregister(conflictingId)
}

/** Compare updates without publishing unchanged options, including fresh metadata objects. */
export function optionsEqual(left: object, right: object): boolean {
  const a = left as Record<string, unknown>
  const b = right as Record<string, unknown>
  const keys = Object.keys(a)
  return (
    keys.length === Object.keys(b).length &&
    keys.every((key) =>
      key === 'meta' && a[key] && b[key]
        ? optionsEqual(a[key], b[key])
        : Object.is(a[key], b[key]),
    )
  )
}
