'use client'

import {
  createHotkeyBindings,
  prepareHotkeyDefinitions,
  resolveRefTarget,
} from '@tanstack/hotkeys/adapter'
import { useRef, useState } from 'react'
import { useHotkeysContext } from './HotkeysProvider'
import { useAppHotkeysStoreState } from './_appHotkeysStore'
import { useCommitEffect } from './_useCommitEffect'
import type { AdapterHotkeyDefinition } from '@tanstack/hotkeys/adapter'
import type { UseHotkeyCommonOptions, UseHotkeyTarget } from './useHotkey'

/**
 * One hotkey for `useHotkeys`. Chords accept `requireReset`; sequences accept
 * `timeout`; hotkeys of unknown kind accept only shared options.
 */
export type UseHotkeyDefinition = AdapterHotkeyDefinition<UseHotkeyTarget>

/**
 * React hook for registering several hotkeys at once: chords, sequences, and
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
  // An error from the ref retry, rethrown during render for error boundaries.
  const [retryError, setRetryError] = useState<{ error: unknown }>()
  if (retryError) throw retryError.error

  // Publish registrations, callbacks, and options in the commit, never during
  // render. Returns whether a ref target was still unset.
  const update = (): boolean => {
    let waiting = false
    const { hotkeys, ...context } = latestRef.current
    bindingsRef.current?.update(
      prepareHotkeyDefinitions(hotkeys, {
        ...context,
        resolveTarget: (target) => {
          const resolved = resolveRefTarget(target)
          if (resolved == null) waiting = true
          return resolved
        },
      }),
    )
    return waiting
  }
  useCommitEffect(() => {
    const bindings = (bindingsRef.current ??= createHotkeyBindings({
      afterDelegatedHandlers: true,
    }))
    // React attaches a ref on an ancestor element after this component's
    // layout effects, on mount and when Suspense shows hidden content again.
    // Resolve again once the commit has attached every ref, unless these
    // bindings were destroyed by then.
    if (update()) {
      queueMicrotask(() => {
        if (bindingsRef.current !== bindings) return
        try {
          update()
        } catch (error) {
          setRetryError({ error })
        }
      })
    }
  })

  useCommitEffect(() => {
    return () => {
      bindingsRef.current?.destroy()
      bindingsRef.current = null
    }
  }, [])
}
