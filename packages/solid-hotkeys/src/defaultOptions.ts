import { Store, useSelector } from '@tanstack/solid-store'
import { useHotkeysContext } from './HotkeysProvider'
import type { AppHotkeysState, AppHotkeysStore } from '@tanstack/hotkeys'

/** Captures the context once and reads current defaults inside reactive computations. */
export function useDefaultHotkeysOptionsSource() {
  const context = useHotkeysContext()
  return () => context?.defaultOptions ?? {}
}

const NO_APP_HOTKEYS = new Store<AppHotkeysState | null>(null)

/**
 * The provider's app hotkeys store and an accessor that tracks its state, so
 * computations re-run when app hotkeys or custom hotkeys change.
 */
export function useAppHotkeysStoreSource(): {
  store: AppHotkeysStore | null
  state: () => AppHotkeysState | null
} {
  const store = useHotkeysContext()?.appHotkeysStore ?? null
  const state = useSelector(store?.store ?? NO_APP_HOTKEYS, (value) => value)
  return { store, state }
}
