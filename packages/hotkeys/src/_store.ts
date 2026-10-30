import type { Store as TanStackStore } from '@tanstack/store'

/**
 * The part of TanStack Store's `Store` that TanStack Hotkeys uses. Its stores
 * work with TanStack Store's framework adapters, such as `useSelector` from
 * `@tanstack/react-store`.
 */
export type Store<T> = Pick<
  TanStackStore<T>,
  'state' | 'get' | 'setState' | 'subscribe'
>

type Listener = () => void

// One queue for every store, like TanStack Store. An update made by a
// listener runs the queue right away, including listeners still waiting from
// the outer update. A listener queued more than once runs once, with the
// latest state. If a listener throws, the rest run on the next update.
const queue = new Set<Listener>()

function notify(listeners: Set<Listener>): void {
  for (const listener of listeners) queue.add(listener)
  for (const listener of queue) {
    queue.delete(listener)
    listener()
  }
}

/**
 * Creates a store. Listeners run synchronously after each change, and an
 * update to an equal value (by `Object.is`) notifies no one.
 */
export function createStore<T>(initialState: T): Store<T> {
  let state = initialState
  const listeners = new Set<Listener>()
  return {
    get state() {
      return state
    },
    get: () => state,
    setState(updater) {
      const next = updater(state)
      if (Object.is(state, next)) return
      state = next
      notify(listeners)
    },
    subscribe(observerOrFn) {
      const listener = () => {
        if (typeof observerOrFn === 'function') observerOrFn(state)
        else observerOrFn.next?.(state)
      }
      listeners.add(listener)
      return {
        unsubscribe() {
          listeners.delete(listener)
          queue.delete(listener)
        },
      }
    },
  }
}
