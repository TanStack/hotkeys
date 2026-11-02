import { useLayoutEffect, useRef } from 'octane'
import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import { useHotkeysContext } from './HotkeysProvider'
import { splitSlot, subSlot, useAppHotkeysStore } from './internal'
import type { AdapterHotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type { UseHotkeyCommonOptions, UseHotkeyTarget } from './useHotkey'

/**
 * One hotkey for `useHotkeys`. Chords accept `requireReset`; sequences accept
 * `timeout`; hotkeys of unknown kind accept only shared options.
 */
export type UseHotkeyDefinition = AdapterHotkeyDefinition<UseHotkeyTarget>

/**
 * Registers a changing list of hotkeys (chords, sequences, and app hotkeys)
 * after commit and releases it on unmount. Options merge in this order:
 * provider defaults, app hotkey declaration, common options, per-hotkey
 * options. Unbound app hotkeys and empty sequences register nothing.
 */
export function useHotkeys(
  definitions: ReadonlyArray<UseHotkeyDefinition>,
  options?: UseHotkeyCommonOptions,
): void
export function useHotkeys(
  definitions: ReadonlyArray<UseHotkeyDefinition>,
  ...rest: [options?: UseHotkeyCommonOptions, slot?: symbol]
): void {
  const [args, slot] = splitSlot(rest)
  const context = useHotkeysContext()
  // Re-render when custom hotkeys change so registrations move with them.
  const appHotkeysStore = useAppHotkeysStore(
    context?.appHotkeysStore ?? null,
    subSlot(slot, 'app-hotkeys'),
  )
  const commonOptions = args[0] as UseHotkeyCommonOptions | undefined
  const ref = useRef<ReturnType<typeof createHotkeyBindings> | null>(
    null,
    subSlot(slot, 'bindings'),
  )
  ref.current ??= createHotkeyBindings({ afterDelegatedHandlers: true })
  const bindings = ref.current
  useLayoutEffect(
    () => {
      bindings.update(
        prepareHotkeyDefinitions(definitions, {
          appHotkeysStore,
          defaults: context?.defaultOptions.hotkey,
          commonOptions,
          // A null target skips registration until it is set.
          resolveTarget: (target) => target,
        }),
      )
    },
    null,
    subSlot(slot, 'update'),
  )
  useLayoutEffect(() => () => bindings.destroy(), [], subSlot(slot, 'cleanup'))
}
