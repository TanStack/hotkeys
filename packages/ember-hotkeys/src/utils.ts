import { registerDestructor } from '@ember/destroyable'
import { trackedObject } from '@ember/reactive/collections'
import type { ReadonlyStore } from '@tanstack/store'

export type MaybeGetter<T> = T | (() => T)

export function read<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export function select<T, TSelected>(
  owner: object,
  store: Pick<ReadonlyStore<T>, 'state' | 'subscribe'>,
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
