import { onScopeDispose, shallowReadonly, shallowRef } from 'vue'
import type { Ref } from 'vue'
import type { Store } from '@tanstack/hotkeys/adapter'

/**
 * Subscribes to a store until the effect scope is disposed and returns a ref
 * to the selected value, which updates when it changes (by `===`).
 *
 * Does not subscribe during server rendering. Vue never disposes component
 * scopes on the server, so a subscription to a shared store would never be
 * released. The server gets the current value instead.
 */
export function useStoreSelector<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): Readonly<Ref<TSelected>> {
  const selected = shallowRef(selector(store.get()))
  if (typeof document === 'undefined') return selected
  const { unsubscribe } = store.subscribe((state) => {
    selected.value = selector(state)
  })
  onScopeDispose(unsubscribe)
  return shallowReadonly(selected)
}
