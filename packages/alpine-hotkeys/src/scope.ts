import { getHotkeyManager } from '@tanstack/hotkeys'
import { subscribePublishedAppHotkeys } from '@tanstack/hotkeys/adapter'
import type Alpine from 'alpinejs'
import type { AppHotkeysStore } from '@tanstack/hotkeys'
import type { Store } from '@tanstack/hotkeys/adapter'
import type { DefaultHotkeysOptions, MaybeGetter } from './types'

type AlpineInstance = typeof Alpine

let pluginAlpine: AlpineInstance | undefined

/** Records the Alpine instance passed to `hotkeysPlugin`. */
export function setAlpine(alpine: AlpineInstance): void {
  pluginAlpine = alpine
}

// Use the page's Alpine instead of importing one. An import would load a
// second copy when Alpine comes from a script tag, and Alpine's module build
// touches the DOM when imported, which breaks importing this package in Node.
function getAlpine(): AlpineInstance {
  const alpine =
    pluginAlpine ?? (globalThis as { Alpine?: AlpineInstance }).Alpine
  if (!alpine) {
    throw new Error(
      '[TanStack Hotkeys] Alpine was not found. Call Alpine.plugin(hotkeysPlugin) before Alpine.start(), or set window.Alpine.',
    )
  }
  return alpine
}

/** The internal scope behind each `createHotkeysScope` owner. */
export const ownerScopes = new WeakMap<object, HotkeysScope>()

/**
 * Returns an owner's scope. Alpine data wraps stored objects in reactive
 * proxies, so `this.hotkeys` can be a proxy of the owner.
 */
export function scopeOf(owner: object): HotkeysScope {
  return ownerScopes.get(getAlpine().raw(owner))!
}

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
    const alpine = getAlpine()
    let error: unknown
    let first = true
    const runner = alpine.effect(() => {
      if (destroyed) return
      try {
        callback()
      } catch (e) {
        // A throw from a re-run would stop Alpine's update queue for the
        // whole page. Only the first run throws, to the caller.
        if (first) error = e
        else reportError(e)
      }
    })
    first = false
    // A failed first run leaves nothing behind, so the effect doesn't re-run.
    if (error) {
      alpine.release(runner)
      throw error
    }
    cleanups.add(() => alpine.release(runner))
  }

  function select<T, TSelected>(
    store: Pick<Store<T>, 'state' | 'subscribe'>,
    selector: (state: T) => TSelected,
  ) {
    assertActive()
    const state = getAlpine().reactive({ snapshot: store.state })
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
      const state = getAlpine().reactive({ version: 0 })
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
