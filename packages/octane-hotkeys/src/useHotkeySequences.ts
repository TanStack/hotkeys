import { useLayoutEffect, useRef } from 'octane'
import { createHotkeySequenceBindings } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { splitSlot, subSlot } from './internal'
import type { SequenceOptions } from '@tanstack/hotkeys'
import type { HotkeySequenceDefinition } from '@tanstack/hotkeys/adapter'

/** Registers a changing list of sequences and releases it on unmount. */
export function useHotkeySequences(
  definitions: Array<HotkeySequenceDefinition>,
  options?: SequenceOptions,
): void
export function useHotkeySequences(
  definitions: Array<HotkeySequenceDefinition>,
  ...rest: [options?: SequenceOptions, slot?: symbol]
): void {
  const [args, slot] = splitSlot(rest)
  const defaults = useDefaultHotkeysOptions()
  const options = {
    ...defaults.hotkeySequence,
    ...(args[0] as SequenceOptions | undefined),
  }
  const ref = useRef<ReturnType<typeof createHotkeySequenceBindings> | null>(
    null,
    subSlot(slot, 'bindings'),
  )
  ref.current ??= createHotkeySequenceBindings()
  const bindings = ref.current
  useLayoutEffect(
    () => {
      bindings.update(definitions, options)
    },
    null,
    subSlot(slot, 'update'),
  )
  useLayoutEffect(() => () => bindings.destroy(), [], subSlot(slot, 'cleanup'))
}
