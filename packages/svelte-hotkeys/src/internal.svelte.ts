import { publishAppHotkeysStore } from '@tanstack/hotkeys'
import { activateHotkeysProviderScope } from '@tanstack/hotkeys/adapter'
import { createSubscriber } from 'svelte/reactivity'
import type {
  AppHotkeys,
  AppHotkeysStore,
  CustomHotkeys,
  HotkeyPlatform,
} from '@tanstack/hotkeys'

export type { MaybeGetter } from '@tanstack/hotkeys'
export { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'

interface SubscribableStore<TState> {
  state: TState
  subscribe: (
    listener: () => void,
  ) => (() => void) | { unsubscribe: () => void }
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

/**
 * The nearest provider's app hotkeys store, read from the context each time.
 * A provider creates its store when its app hotkeys arrive, which can be after
 * a hotkey is created. `subscribe` makes the current reactive consumer re-run
 * when app hotkeys or custom hotkeys change.
 */
export function createAppHotkeysSource(
  context: { readonly appHotkeysStore: AppHotkeysStore | null } | null,
): { readonly store: AppHotkeysStore | null; subscribe: () => void } {
  const subscribers = new WeakMap<AppHotkeysStore, () => void>()
  return {
    get store() {
      return context?.appHotkeysStore ?? null
    },
    subscribe() {
      const store = context?.appHotkeysStore
      if (!store) return
      let subscribe = subscribers.get(store)
      if (!subscribe) {
        subscribe = createStoreSubscriber(store.store)
        subscribers.set(store, subscribe)
      }
      subscribe()
    },
  }
}

/**
 * Keeps a provider's own app hotkeys store current while the component is
 * mounted: publishes it for devtools, and applies changed declarations, saved
 * custom hotkeys and platform.
 */
export function syncAppHotkeysStore(
  getStore: () => AppHotkeysStore | null,
  getOptions: () => {
    appHotkeys?: AppHotkeys
    customHotkeys?: CustomHotkeys | null
    platform?: HotkeyPlatform
  },
): void {
  // Derived, so an effect runs again only when its own value changes, not for
  // every option the getters read.
  const store = $derived(getStore())
  const appHotkeys = $derived(getOptions().appHotkeys)
  const customHotkeys = $derived(getOptions().customHotkeys)
  const platform = $derived(getOptions().platform)
  // Publish the store so devtools can list declared hotkeys.
  $effect(() => (store ? publishAppHotkeysStore(store) : undefined))
  // Keep declarations current (for example after hot module replacement).
  $effect(() => {
    if (appHotkeys) store?.setAppHotkeys(appHotkeys)
  })
  // Apply the platform and saved custom hotkeys whose value changes, such as
  // data that loads after the first render.
  $effect(() => {
    store?.setOptions({ customHotkeys, platform })
  })
}

/**
 * Activates a provider's scope while the component is mounted, and again
 * whenever the key from `getHotkeysProviderScopeKey` changes.
 */
export function activateScopeWhileMounted(getKey: () => string | null): void {
  const key = $derived(getKey())
  $effect(() => (key ? activateHotkeysProviderScope(key) : undefined))
}
