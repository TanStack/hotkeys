import { registerDestructor } from '@ember/destroyable'
import { trackedObject } from '@ember/reactive/collections'
import { getHotkeyManager } from '@tanstack/hotkeys'
import { subscribePublishedAppHotkeys } from '@tanstack/hotkeys/adapter'
import type { AppHotkeysStore } from '@tanstack/hotkeys'
import type { Store } from '@tanstack/hotkeys/adapter'

export type MaybeGetter<T> = T | (() => T)

export function read<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export function select<T, TSelected>(
  owner: object,
  store: Pick<Store<T>, 'state' | 'subscribe'>,
  selector: (value: T) => TSelected,
) {
  const state = trackedObject({ snapshot: store.state })
  const subscription = store.subscribe(() => {
    state.snapshot = store.state
  })
  registerDestructor(owner, () => subscription.unsubscribe())
  return {
    get value() {
      return selector(state.snapshot)
    },
  }
}

/**
 * Returns the store published by `provideAppHotkeys`. Reading it tracks app
 * hotkey and custom hotkey changes for the owner's lifetime.
 */
export function trackPublishedAppHotkeys(
  owner: object,
): () => AppHotkeysStore | null {
  const state = trackedObject({ version: 0 })
  registerDestructor(
    owner,
    subscribePublishedAppHotkeys(() => {
      state.version++
    }),
  )
  return () => {
    void state.version
    return getHotkeyManager().appHotkeys.state
  }
}
