import { shallowRef } from 'vue'
import { useHotkeysContext } from './HotkeysProviderContext'
import { useStoreSelector } from './useStoreSelector'
import type { Ref } from 'vue'
import type { AppHotkeysState, AppHotkeysStore } from '@tanstack/hotkeys'

/** Captures the context once and reads current defaults inside reactive computations. */
export function useDefaultHotkeysOptionsSource() {
  const context = useHotkeysContext()
  return () => context?.defaultOptions ?? {}
}

/**
 * The provider's app hotkeys store and a ref that tracks its state, so
 * watchers re-run when app hotkeys or custom hotkeys change.
 */
export function useAppHotkeysStoreSource(): {
  store: AppHotkeysStore | null
  state: Readonly<Ref<AppHotkeysState | null>>
} {
  const store = useHotkeysContext()?.appHotkeysStore ?? null
  // Without a provider there is nothing to track.
  const state = store
    ? useStoreSelector(store.store, (value) => value)
    : shallowRef(null)
  return { store, state }
}
