import type { ConflictBehavior, ParsedHotkey } from './hotkey.types'

/**
 * Default options for hotkey/sequence registration.
 * Omitted: platform, target (resolved at registration), requireReset (HotkeyManager only).
 */
export const defaultHotkeyOptions = {
  preventDefault: true,
  stopPropagation: true,
  eventType: 'keydown' as const,
  enabled: true,
  ignoreInputs: true,
  conflictBehavior: 'warn' as ConflictBehavior,
}

/**
 * Computes the default ignoreInputs value based on the hotkey.
 * Ctrl/Meta shortcuts and Escape fire in inputs; single keys and Shift/Alt combos are ignored.
 */
export function getDefaultIgnoreInputs(parsedHotkey: ParsedHotkey): boolean {
  if (parsedHotkey.ctrl || parsedHotkey.meta) return false // Mod+S, Ctrl+C, etc.
  if (parsedHotkey.key === 'Escape' || parsedHotkey.code === 'Escape')
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
    console.warn(
      `'${keyDisplay}' is already registered. Multiple handlers will be triggered. ` +
        `Use conflictBehavior: 'replace' to replace the existing handler, ` +
        `or conflictBehavior: 'allow' to suppress this warning.`,
    )
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
        ? optionsEqual(a[key] as object, b[key] as object)
        : Object.is(a[key], b[key]),
    )
  )
}
