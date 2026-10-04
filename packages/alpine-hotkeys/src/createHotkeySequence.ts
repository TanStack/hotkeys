import { createHotkeySequences } from './createHotkeySequences'
import { read } from './scope'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'
import type {
  HotkeyCallback,
  HotkeySequence,
  SequenceOptions,
} from '@tanstack/hotkeys'

export function createHotkeySequence(
  scope: HotkeysScope,
  sequence: MaybeGetter<HotkeySequence>,
  callback: HotkeyCallback,
  options: MaybeGetter<SequenceOptions> = {},
) {
  createHotkeySequences(
    scope,
    () => [{ sequence: read(sequence), callback }],
    options,
  )
}
