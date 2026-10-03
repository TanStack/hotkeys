import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import { read } from './scope'
import type { HotkeyOptions } from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'

export function createHotkeys(
  scope: HotkeysScope,
  definitions: MaybeGetter<Array<HotkeyDefinition>>,
  options: MaybeGetter<HotkeyOptions> = {},
) {
  scope.assertActive()
  const bindings = createHotkeyBindings()
  scope.addCleanup(bindings.destroy)
  scope.effect(() =>
    bindings.update(read(definitions), {
      ...scope.defaultOptions().hotkey,
      ...read(options),
    }),
  )
}
