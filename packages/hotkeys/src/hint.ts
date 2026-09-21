import { MODIFIER_KEYS, normalizeKeyName } from './constants'
import { parseRegisterableHotkey } from './parse'
import type { CanonicalModifier } from './key.types'
import type { RegisterableHotkey } from './hotkey.types'

export interface HeldModifierOptions {
  /** Resolve Mod for this platform. Defaults to platform detection. */
  platform?: 'mac' | 'windows' | 'linux'
  /** Require every binding modifier to be held. Default: false (nonempty subset). */
  exact?: boolean
}

/**
 * Returns whether held modifiers should reveal a shortcut hint.
 * By default, any nonempty subset of the binding's modifiers qualifies; an
 * unrelated modifier hides the hint. `exact` requires every binding modifier.
 * Nonmodifier keys are ignored. This does not check registration or focus.
 *
 * @example
 * matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt']) // true
 * matchesHeldModifiers('Alt+Shift+[KeyK]', ['Alt', 'Control']) // false
 */
export function matchesHeldModifiers(
  hotkey: RegisterableHotkey,
  heldKeys: ReadonlyArray<string>,
  options: HeldModifierOptions = {},
): boolean {
  // AltGraph (AltGr) types alternate characters such as @ or € on many layouts.
  // It can synthesize Ctrl+Alt; character entry should not reveal shortcut hints.
  if (heldKeys.includes('AltGraph')) return false
  const held = [
    ...new Set(
      heldKeys.map(normalizeKeyName).filter((key) => MODIFIER_KEYS.has(key)),
    ),
  ]
  const { modifiers } = parseRegisterableHotkey(hotkey, options.platform)
  return (
    held.length > 0 &&
    held.every((key) => modifiers.includes(key as CanonicalModifier)) &&
    (!options.exact || held.length === modifiers.length)
  )
}
