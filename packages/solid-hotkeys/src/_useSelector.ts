import { createSignal, onCleanup } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { Store } from '@tanstack/hotkeys/adapter'

/**
 * Subscribes to a store until the owner is cleaned up and returns an accessor
 * for the selected value, which updates when it changes (by `===`).
 */
export function useSelector<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): Accessor<TSelected> {
  const [selected, setSelected] = createSignal(selector(store.get()))
  const { unsubscribe } = store.subscribe((state) => {
    setSelected(() => selector(state))
  })
  onCleanup(unsubscribe)
  return selected
}
