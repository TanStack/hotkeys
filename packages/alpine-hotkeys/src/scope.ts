import Alpine from 'alpinejs'
import type { ReadonlyStore } from '@tanstack/store'
import type { DefaultHotkeysOptions, MaybeGetter } from './types'

export function read<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}

export function createScope(
  defaultOptions: MaybeGetter<DefaultHotkeysOptions>,
) {
  const cleanups = new Set<() => void>()
  let destroyed = false

  function assertActive() {
    if (destroyed) throw new Error('Cannot use a destroyed hotkeys scope')
  }

  function effect(callback: () => void) {
    assertActive()
    const runner = Alpine.effect(() => {
      if (!destroyed) callback()
    })
    cleanups.add(() => Alpine.release(runner))
  }

  function select<T, TSelected>(
    store: Pick<ReadonlyStore<T>, 'state' | 'subscribe'>,
    selector: (state: T) => TSelected,
  ) {
    assertActive()
    const state = Alpine.reactive({ snapshot: store.state })
    const subscription = store.subscribe(() => {
      state.snapshot = store.state
    })
    cleanups.add(() => subscription.unsubscribe())
    return {
      get value() {
        return selector(state.snapshot)
      },
    }
  }

  return {
    assertActive,
    effect,
    select,
    defaultOptions: () => read(defaultOptions),
    addCleanup: (cleanup: () => void) => cleanups.add(cleanup),
    get destroyed() {
      return destroyed
    },
    destroy() {
      if (destroyed) return
      destroyed = true
      for (const cleanup of [...cleanups].reverse()) cleanup()
      cleanups.clear()
    },
  }
}

export type HotkeysScope = ReturnType<typeof createScope>
