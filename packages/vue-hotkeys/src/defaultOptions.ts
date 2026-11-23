import { shallowRef, watch } from 'vue'
import { useHotkeysContext } from './HotkeysProviderContext'
import type { AppHotkeysState, AppHotkeysStore } from '@tanstack/hotkeys'
import type { Ref } from 'vue'

/** Captures the context once and reads current defaults inside reactive computations. */
export function useDefaultHotkeysOptionsSource() {
  const context = useHotkeysContext()
  return () => context?.defaultOptions ?? {}
}

/**
 * The provider's app hotkeys store and a ref that tracks its state, so
 * watchers re-run when app hotkeys or custom hotkeys change. `store` is a
 * getter: a provider creates its store when its app hotkeys arrive, which can
 * be after this is called.
 */
export function useAppHotkeysStoreSource(): {
  readonly store: AppHotkeysStore | null
  state: Readonly<Ref<AppHotkeysState | null>>
} {
  const context = useHotkeysContext()
  const state = shallowRef(context?.appHotkeysStore?.store.get() ?? null)
  // Without a provider there is nothing to track. Vue never disposes
  // component scopes on the server, so nothing subscribes there.
  if (context && typeof document !== 'undefined') {
    // Subscribes to the current store, and again if a store arrives later.
    watch(
      () => context.appHotkeysStore,
      (store, _, onCleanup) => {
        state.value = store?.store.get() ?? null
        if (!store) return
        const { unsubscribe } = store.store.subscribe((value) => {
          state.value = value
        })
        onCleanup(unsubscribe)
      },
      { immediate: true, flush: 'sync' },
    )
  }
  return {
    get store() {
      return context?.appHotkeysStore ?? null
    },
    state,
  }
}
