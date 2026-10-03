import { useLayoutEffect, useRef } from 'octane'
import { createHotkeyBindings } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { splitSlot, subSlot } from './internal'
import type { HotkeyOptions } from '@tanstack/hotkeys'
import type { HotkeyDefinition } from '@tanstack/hotkeys/adapter'

/** Registers a changing list of shortcuts after commit and releases it on unmount. */
export function useHotkeys(
  definitions: Array<HotkeyDefinition>,
  options?: HotkeyOptions,
): void
export function useHotkeys(
  definitions: Array<HotkeyDefinition>,
  ...rest: [options?: HotkeyOptions, slot?: symbol]
): void {
  const [args, slot] = splitSlot(rest)
  const defaults = useDefaultHotkeysOptions()
  const options = {
    ...defaults.hotkey,
    ...(args[0] as HotkeyOptions | undefined),
  }
  const ref = useRef<ReturnType<typeof createHotkeyBindings> | null>(
    null,
    subSlot(slot, 'bindings'),
  )
  ref.current ??= createHotkeyBindings()
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
