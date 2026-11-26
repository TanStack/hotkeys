import {
  mergeHotkeysProviderDefaults,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import { classDefaults } from './bindings'
import { OnHotkey } from './onHotkey'
import { OnHotkeys } from './onHotkeys'
import { UseHotkey } from './useHotkey'
import { UseHotkeys } from './useHotkeys'
import { scopeDefaults } from './utils'
import type { MaybeGetter } from '@tanstack/hotkeys'
import type { DefaultHotkeysOptions } from './types'

/**
 * Helpers and modifiers with shared defaults. Owners retain their own cleanup.
 * Pass the scope to `useHotkeyRecorder` to apply its recorder defaults, to
 * `useFormatForDisplay` to apply its `platform` and `keyboardLayout`, and to
 * `useKeyboardLayout` to apply its `keyboardLayout`.
 */
export interface EmberHotkeysScope {
  onHotkey: typeof OnHotkey
  onHotkeys: typeof OnHotkeys
  useHotkey: typeof UseHotkey
  useHotkeys: typeof UseHotkeys
}

/**
 * Creates contextual helpers and modifiers with shared, optionally reactive defaults.
 * Pass the scope to child components through arguments to share configuration.
 */
export function createHotkeysScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions> = {},
): EmberHotkeysScope {
  // Puts `platform` into the hotkey and recorder defaults.
  const defaults = () =>
    mergeHotkeysProviderDefaults(
      undefined,
      resolveMaybeGetter(defaultOptions),
      undefined,
    )
  const scope: EmberHotkeysScope = {
    onHotkey: class extends OnHotkey {},
    onHotkeys: class extends OnHotkeys {},
    useHotkey: class extends UseHotkey {},
    useHotkeys: class extends UseHotkeys {},
  }
  const hotkeyDefaults = () => defaults().hotkey
  for (const helper of Object.values(scope)) {
    classDefaults.set(helper, hotkeyDefaults)
  }
  scopeDefaults.set(scope, defaults)
  return scope
}
