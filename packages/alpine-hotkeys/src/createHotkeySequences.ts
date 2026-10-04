import { createHotkeySequenceBindings } from '@tanstack/hotkeys/adapter'
import { read } from './scope'
import type { SequenceOptions } from '@tanstack/hotkeys'
import type { HotkeySequenceDefinition } from '@tanstack/hotkeys/adapter'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'

export function createHotkeySequences(
  scope: HotkeysScope,
  definitions: MaybeGetter<Array<HotkeySequenceDefinition>>,
  options: MaybeGetter<SequenceOptions> = {},
) {
  scope.assertActive()
  const bindings = createHotkeySequenceBindings()
  scope.addCleanup(bindings.destroy)
  scope.effect(() =>
    bindings.update(read(definitions), {
      ...scope.defaultOptions().hotkeySequence,
      ...read(options),
    }),
  )
}
