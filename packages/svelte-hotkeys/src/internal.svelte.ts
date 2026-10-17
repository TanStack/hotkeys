import { createSubscriber } from 'svelte/reactivity'
import { activateHotkeysProviderScope } from '@tanstack/hotkeys/adapter'
import type { AppHotkeysStore } from '@tanstack/hotkeys'

export type MaybeGetter<T> = T | (() => T)

interface SubscribableStore<TState> {
  state: TState
  subscribe: (
    listener: () => void,
  ) => (() => void) | { unsubscribe: () => void }
}

export function resolveMaybeGetter<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export function createStoreSubscriber<TState>(
  store: SubscribableStore<TState>,
): () => void {
  return createSubscriber((update) => {
    const subscription = store.subscribe(update)

    return typeof subscription === 'function'
      ? subscription
      : () => subscription.unsubscribe()
  })
}

const noop = () => {}

/**
 * Returns a function that subscribes the current reactive consumer to an app
 * hotkeys store, so it re-runs when app hotkeys or custom hotkeys change.
 */
export function createAppHotkeysSubscriber(
  store: AppHotkeysStore | null,
): () => void {
  return store ? createStoreSubscriber(store.store) : noop
}

/**
 * Activates a provider's scope while the component is mounted, and again
 * whenever the key from `getHotkeysProviderScopeKey` changes.
 */
export function activateScopeWhileMounted(getKey: () => string | null): void {
  const key = $derived(getKey())
  $effect(() => (key ? activateHotkeysProviderScope(key) : undefined))
}
