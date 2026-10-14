import Alpine from 'alpinejs'
import { getHotkeyManager } from '@tanstack/hotkeys'
import { subscribePublishedAppHotkeys } from '@tanstack/hotkeys/adapter'
import type { AppHotkeysStore } from '@tanstack/hotkeys'
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

  let appHotkeysState: { version: number } | undefined
  /**
   * Returns the store published by `provideAppHotkeys`. Reading it inside an
   * effect or reactive getter tracks app hotkey and custom hotkey changes.
   */
  function appHotkeys(): AppHotkeysStore | null {
    if (!appHotkeysState) {
      const state = Alpine.reactive({ version: 0 })
      appHotkeysState = state
      cleanups.add(subscribePublishedAppHotkeys(() => state.version++))
    }
    void appHotkeysState.version
    return getHotkeyManager().appHotkeys.state
  }

  return {
    assertActive,
    effect,
    select,
    appHotkeys,
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
