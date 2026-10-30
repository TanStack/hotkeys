import { DestroyRef, inject, linkedSignal } from '@angular/core'
import type { Signal } from '@angular/core'
import type { Store } from '@tanstack/hotkeys/adapter'

/**
 * Subscribes to a store until the injection context is destroyed and returns
 * a signal of the selected value, which updates when it changes (by `===`).
 * Must be called in an injection context.
 */
export function injectSelector<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): Signal<TSelected> {
  // Throws outside an injection context before subscribing
  const destroyRef = inject(DestroyRef)
  const selected = linkedSignal(() => selector(store.get()))
  const { unsubscribe } = store.subscribe((state) => {
    selected.set(selector(state))
  })
  destroyRef.onDestroy(unsubscribe)
  return selected.asReadonly()
}
