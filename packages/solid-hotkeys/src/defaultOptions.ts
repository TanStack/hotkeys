import { createMemo } from 'solid-js'
import { useHotkeysContext } from './HotkeysProvider'
import { useSelector } from './_useSelector'
import type { AppHotkeysState, AppHotkeysStore } from '@tanstack/hotkeys'

/** Captures the context once and reads current defaults inside reactive computations. */
export function useDefaultHotkeysOptionsSource() {
  const context = useHotkeysContext()
  return () => context?.defaultOptions ?? {}
}

/**
 * The provider's app hotkeys store and an accessor that tracks its state, so
 * computations re-run when app hotkeys or custom hotkeys change. `store` is a
 * getter: a provider creates its store when its app hotkeys arrive, which can
 * be after this is called.
 */
export function useAppHotkeysStoreSource(): {
  readonly store: AppHotkeysStore | null
  state: () => AppHotkeysState | null
} {
  const context = useHotkeysContext()
  // Subscribes to the current store, and again if a store arrives later.
  const state = createMemo(() => {
    const store = context?.appHotkeysStore
    return store ? useSelector(store.store, (value) => value) : null
  })
  return {
    get store() {
      return context?.appHotkeysStore ?? null
    },
    state: () => state()?.() ?? null,
  }
}
