import {
  DestroyRef,
  ElementRef,
  NgZone,
  effect,
  inject,
  untracked,
} from '@angular/core'
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
 * A target may be an element, an `ElementRef`, or a signal of either, such
 * as `viewChild('panel')`. A `null` target, or a signal of `undefined`, skips
 * registration until the element exists.
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
  const zone = inject(NgZone)
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
        // Reading a signal here tracks it. A missing target skips
        // registration until the element exists.
        resolveTarget: (target) => {
          const value = typeof target === 'function' ? target() : target
          return (
            (value instanceof ElementRef ? value.nativeElement : value) ?? null
          )
        },
      },
    )
    // Callbacks run in the zone, so their changes update the view.
    for (const definition of definitions) {
      const callback = definition.callback
      definition.callback = (...args) => zone.run(callback, null, args)
    }
    // Listeners attached outside the zone don't run change detection on
    // every keystroke.
    untracked(() => zone.runOutsideAngular(() => bindings.update(definitions)))
  })
}
