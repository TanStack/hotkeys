import { DestroyRef, effect, inject, untracked } from '@angular/core'
import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import { injectHotkeysContext } from './hotkeys-provider'
import type { AdapterHotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type {
  InjectHotkeyCommonOptions,
  InjectHotkeyTarget,
} from './injectHotkey'

/**
 * One hotkey for `injectHotkeys`. Chords accept `requireReset`; sequences
 * accept `timeout`; hotkeys of unknown kind accept only shared options.
 */
export type InjectHotkeyDefinition = AdapterHotkeyDefinition<InjectHotkeyTarget>

/**
 * Angular inject-based API for registering several hotkeys at once: chords,
 * sequences, and app hotkeys. Pass a getter for a reactive list.
 *
 * Options merge in this order: provider defaults, app hotkey declaration,
 * commonOptions, per-hotkey options. Each option applies only to the kinds
 * that support it. Unbound app hotkeys and empty sequences register nothing.
 * A `null` target skips registration until it is set.
 *
 * @example
 * ```ts
 * injectHotkeys([
 *   { hotkey: 'Mod+S', callback: () => this.save() },
 *   { hotkey: ['G', 'G'], callback: () => this.scrollToTop(), options: { timeout: 500 } },
 * ])
 * ```
 */
export function injectHotkeys(
  hotkeys:
    | ReadonlyArray<InjectHotkeyDefinition>
    | (() => ReadonlyArray<InjectHotkeyDefinition>),
  commonOptions:
    InjectHotkeyCommonOptions | (() => InjectHotkeyCommonOptions) = {},
): void {
  const context = injectHotkeysContext()
  const bindings = createHotkeyBindings()
  inject(DestroyRef).onDestroy(() => bindings.destroy())

  effect(() => {
    // Track app hotkeys so registrations move with custom hotkeys.
    context.appHotkeysState()
    const definitions = prepareHotkeyDefinitions(
      typeof hotkeys === 'function' ? hotkeys() : hotkeys,
      {
        appHotkeysStore: context.appHotkeysStore,
        defaults: context.defaultOptions.hotkey,
        commonOptions:
          typeof commonOptions === 'function' ? commonOptions() : commonOptions,
        // A null target skips registration until the element exists.
        resolveTarget: (target) => target,
      },
    )
    untracked(() => bindings.update(definitions))
  })
}
