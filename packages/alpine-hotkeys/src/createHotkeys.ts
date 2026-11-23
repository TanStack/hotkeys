import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import type { MaybeGetter } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { AlpineHotkeyCommonOptions, AlpineHotkeyDefinition } from './types'

export function createHotkeys(
  scope: HotkeysScope,
  definitions: MaybeGetter<ReadonlyArray<AlpineHotkeyDefinition>>,
  options: MaybeGetter<AlpineHotkeyCommonOptions> = {},
) {
  scope.assertActive()
  const bindings = createHotkeyBindings()
  scope.addCleanup(bindings.destroy)
  try {
    scope.effect(() =>
      bindings.update(
        prepareHotkeyDefinitions(resolveMaybeGetter(definitions), {
          appHotkeysStore: scope.appHotkeys(),
          defaults: scope.defaultOptions().hotkey,
          commonOptions: resolveMaybeGetter(options),
          // An unset target skips registration until it is set.
          resolveTarget: (target) => target,
        }),
      ),
    )
  } catch (error) {
    // A failed first run removes the hotkeys it registered before failing.
    bindings.destroy()
    throw error
  }
}
