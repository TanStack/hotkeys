import { useLayoutEffect, useRef } from 'preact/hooks'
import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
} from '@tanstack/hotkeys/adapter'
import { useHotkeysContext } from './HotkeysProvider'
import { useAppHotkeysStoreState } from './_appHotkeysStore'
import { resolveTarget } from './utils'
import type { AdapterHotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type { UseHotkeyCommonOptions, UseHotkeyTarget } from './useHotkey'

/**
 * One hotkey for `useHotkeys`. Chords accept `requireReset`; sequences accept
 * `timeout`; hotkeys of unknown kind accept only shared options.
 */
export type UseHotkeyDefinition = AdapterHotkeyDefinition<UseHotkeyTarget>

/**
 * Preact hook for registering several hotkeys at once: chords, sequences, and
 * app hotkeys. Accepts a dynamic array, so it is safe to use with
 * variable-length lists without violating the rules of hooks.
 *
 * Options merge in this order: provider defaults, app hotkey declaration,
 * commonOptions, per-hotkey options. Each option applies only to the kinds
 * that support it. Callbacks and options sync on every render.
 *
 * Per-row `enabled: false` keeps that registration (visible in devtools) and
 * only suppresses firing. Unbound app hotkeys and empty sequences register nothing.
 *
 * @param hotkeys - Hotkeys to register
 * @param commonOptions - Options applied to every hotkey (overridden by per-hotkey options)
 *
 * @example
 * ```tsx
 * function Editor() {
 *   useHotkeys([
 *     { hotkey: 'Mod+S', callback: () => save() },
 *     { hotkey: ['G', 'G'], callback: () => scrollToTop(), options: { timeout: 500 } },
 *     { hotkey: 'Escape', callback: () => close() },
 *   ])
 * }
 * ```
 *
 * @example
 * ```tsx
 * function MenuShortcuts({ items }) {
 *   // Dynamic hotkeys from data -- safe because it's a single hook call
 *   useHotkeys(
 *     items.map((item) => ({
 *       hotkey: item.shortcut,
 *       callback: item.action,
 *       options: { enabled: item.enabled },
 *     })),
 *     { preventDefault: true },
 *   )
 * }
 * ```
 */
export function useHotkeys(
  hotkeys: ReadonlyArray<UseHotkeyDefinition>,
  commonOptions: UseHotkeyCommonOptions = {},
): void {
  const defaults = useHotkeysContext()?.defaultOptions.hotkey
  // Re-render when custom hotkeys change so registrations move with them.
  const appHotkeysStore = useAppHotkeysStoreState()

  const latestRef = useRef({
    hotkeys,
    commonOptions,
    defaults,
    appHotkeysStore,
  })
  latestRef.current = { hotkeys, commonOptions, defaults, appHotkeysStore }
  const bindingsRef = useRef<ReturnType<typeof createHotkeyBindings> | null>(
    null,
  )

  // Publish registrations, callbacks, and options in the commit, never during
  // render. Refs resolve here, after they attach. Layout effects run before
  // the next event; Preact runs plain effects after paint.
  useLayoutEffect(() => {
    bindingsRef.current ??= createHotkeyBindings()
    const { hotkeys, ...context } = latestRef.current
    bindingsRef.current.update(
      prepareHotkeyDefinitions(hotkeys, { ...context, resolveTarget }),
    )
  })

  useLayoutEffect(() => {
    return () => {
      bindingsRef.current?.destroy()
      bindingsRef.current = null
    }
  }, [])
}
