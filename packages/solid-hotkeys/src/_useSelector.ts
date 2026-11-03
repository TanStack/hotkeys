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
  const initial = selector(store.get())
  // The store writes from outside the owner, so the signal allows owned
  // writes. A function value is wrapped so it is stored, not computed.
  const [selected, setSelected] = createSignal<TSelected>(
    (typeof initial === 'function' ? () => initial : initial) as never,
    { ownedWrite: true },
  )
  const { unsubscribe } = store.subscribe((state) => {
    setSelected(() => selector(state))
  })
  onCleanup(unsubscribe)
  return selected
}
