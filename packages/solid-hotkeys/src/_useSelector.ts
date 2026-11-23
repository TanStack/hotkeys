import { createMemo, createSignal, onCleanup } from 'solid-js'
import type { Store } from '@tanstack/hotkeys/adapter'
import type { Accessor } from 'solid-js'

/**
 * Subscribes to a store until the owner is cleaned up and returns an accessor
 * for the selected value, which updates when it changes (by `===`).
 *
 * Works like `useSelector` from `@tanstack/solid-store`: the store state is
 * held in a signal and the selection is derived from it, so each run tracks
 * the signals the selector reads for the current state.
 */
export function useSelector<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): Accessor<TSelected> {
  // Boxed, so every store change is a new value even when the state object is
  // reused. Store updates arrive from outside the owner, so the signal allows
  // owned writes.
  const [snapshot, setSnapshot] = createSignal(
    { value: store.get() },
    { ownedWrite: true },
  )
  const selection = createMemo(() => ({ value: selector(snapshot().value) }), {
    equals: (a, b) => a.value === b.value,
    sync: true,
  })
  const { unsubscribe } = store.subscribe((value) => {
    setSnapshot({ value })
  })
  onCleanup(unsubscribe)
  return () => selection().value
}
