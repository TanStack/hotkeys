import { createEffect, onCleanup } from 'solid-js'
import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import {
  useAppHotkeysStoreSource,
  useDefaultHotkeysOptionsSource,
} from './defaultOptions'
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
 * that support it. Unbound app hotkeys and empty sequences register nothing.
 * A `null` target skips registration until it is set.
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
  hotkeys:
    | ReadonlyArray<CreateHotkeyDefinition>
    | (() => ReadonlyArray<CreateHotkeyDefinition>),
  commonOptions:
    CreateHotkeyCommonOptions | (() => CreateHotkeyCommonOptions) = {},
): void {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const appHotkeys = useAppHotkeysStoreSource()
  const bindings = createHotkeyBindings()

  // Clean up only when this owner disposes, not before every effect re-run.
  onCleanup(() => bindings.destroy())

  createEffect(
    () => {
      // Track app hotkeys so registrations move with custom hotkeys.
      appHotkeys.state()
      return prepareHotkeyDefinitions(
        typeof hotkeys === 'function' ? hotkeys() : hotkeys,
        {
          appHotkeysStore: appHotkeys.store,
          defaults: defaultOptions().hotkey,
          commonOptions:
            typeof commonOptions === 'function'
              ? commonOptions()
              : commonOptions,
          // A null target skips registration until the element exists.
          resolveTarget: (target) => target,
        },
      )
    },
    // The effect half is untracked, so registration writes do not re-run it.
    (definitions) => bindings.update(definitions),
  )
}
