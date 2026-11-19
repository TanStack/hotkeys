import { createSignal, onCleanup } from "solid-js";
import type { Accessor } from "solid-js";
import type { Store } from "@tanstack/hotkeys/adapter";

/**
 * Subscribes to a store until the owner is cleaned up and returns an accessor
 * for the selected value, which updates when it changes (by `===`).
 */
export function useSelector<TState, TSelected>(
  store: Pick<Store<TState>, "get" | "subscribe">,
  selector: (state: TState) => TSelected,
): Accessor<TSelected> {
  // Derived: re-selected from the store's current state when a signal the
  // selector reads changes, and written when the store notifies (from outside
  // the owner, so the signal allows owned writes).
  const [selected, setSelected] = createSignal<TSelected>(() => selector(store.get()), {
    ownedWrite: true,
  });
  const { unsubscribe } = store.subscribe((state) => {
    setSelected(() => selector(state));
  });
  onCleanup(unsubscribe);
  return selected;
}
