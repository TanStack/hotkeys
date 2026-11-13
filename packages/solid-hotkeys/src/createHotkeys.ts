import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import { createEffect, onCleanup, untrack } from 'solid-js'
import { delegateEvents } from 'solid-js/web'
import {
  useAppHotkeysStoreSource,
  useDefaultHotkeysOptionsSource,
} from './defaultOptions'
import type { MaybeGetter } from '@tanstack/hotkeys'
import type { AdapterHotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type {
  CreateHotkeyCommonOptions,
  CreateHotkeyTarget,
} from './createHotkey'

/**
 * One hotkey for `createHotkeys`. Chords accept `requireReset`; sequences
 * accept `timeout`; hotkeys of unknown kind accept only shared options.
 */
export type CreateHotkeyDefinition = AdapterHotkeyDefinition<CreateHotkeyTarget>

/**
 * Solid primitive for registering several hotkeys at once: chords, sequences,
 * and app hotkeys. Pass an accessor for a reactive list.
 *
 * Options merge in this order: provider defaults, app hotkey declaration,
 * commonOptions, per-hotkey options. Each option applies only to the kinds
 * that support it. Unbound app hotkeys, empty sequences, and `undefined`,
 * `null`, or `''` hotkeys register nothing.
 * A `null` or `undefined` target skips registration until it is set.
 *
 * @example
 * ```tsx
 * createHotkeys([
 *   { hotkey: 'Mod+S', callback: () => save() },
 *   { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
 * ])
 * ```
 */
export function createHotkeys(
  hotkeys: MaybeGetter<ReadonlyArray<CreateHotkeyDefinition>>,
  commonOptions: MaybeGetter<CreateHotkeyCommonOptions> = {},
): void {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const appHotkeys = useAppHotkeysStoreSource()
  const bindings = createHotkeyBindings({ afterDelegatedHandlers: true })

  // Clean up only when this owner disposes, not before every effect re-run.
  onCleanup(() => bindings.destroy())

  createEffect(() => {
    // Track app hotkeys so registrations move with custom hotkeys.
    appHotkeys.state()
    const definitions = prepareHotkeyDefinitions(resolveMaybeGetter(hotkeys), {
      appHotkeysStore: appHotkeys.store,
      defaults: defaultOptions().hotkey,
      commonOptions: resolveMaybeGetter(commonOptions),
      // An unset target skips registration until the element exists.
      resolveTarget: (target) => target,
    })
    // Solid's onKeyDown listener on the document must come before the
    // hotkeys' listener there, even when the first module that uses
    // onKeyDown loads later. This runs only in the browser.
    delegateEvents(['keydown', 'keyup'])
    // Untrack store writes so registrations do not re-trigger this effect.
    untrack(() => bindings.update(definitions))
  })
}
