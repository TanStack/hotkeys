import { createSubscriber } from 'svelte/reactivity'

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
