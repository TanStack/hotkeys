import { registerDestructor } from '@ember/destroyable'
import { trackedObject } from '@ember/reactive/collections'
import { getHotkeyManager } from '@tanstack/hotkeys'
import { subscribePublishedAppHotkeys } from '@tanstack/hotkeys/adapter'
import type { AppHotkeysStore } from '@tanstack/hotkeys'
import type { Store } from '@tanstack/hotkeys/adapter'
import type { DefaultHotkeysOptions } from './types'

export type MaybeGetter<T> = T | (() => T)

/** The defaults behind each `createHotkeysScope` result. */
export const scopeDefaults = new WeakMap<
  object,
  MaybeGetter<DefaultHotkeysOptions>
>()

export function read<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export function select<T, TSelected>(
  owner: object,
  store: Pick<Store<T>, 'state' | 'subscribe'>,
  selector: (value: T) => TSelected,
) {
  const state = trackedObject({ version: 0 })
  let last: TSelected | undefined
  // Invalidate consumers only when the selected value changes. The getter
  // still runs the selector while tracking, so getter inputs stay tracked.
  const subscription = store.subscribe(() => {
    const next = selector(store.state)
    if (!Object.is(next, last)) {
      last = next
      state.version++
    }
  })
  registerDestructor(owner, () => subscription.unsubscribe())
  return {
    get value() {
      void state.version
      return (last = selector(store.state))
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
