import { useCallback, useRef, useSyncExternalStore } from 'octane'
import { createStore } from '@tanstack/hotkeys/adapter'
import type { AppHotkeysState, AppHotkeysStore } from '@tanstack/hotkeys'
import type { Store } from '@tanstack/hotkeys/adapter'

// Slot mechanics for the binding's plain-`.ts` hooks. Octane injects a
// per-call-site Symbol into calls made by compiled components; the binding
// forwards that symbol and derives a distinct sub-slot for each hook it
// composes.
const subSlotCache = new Map<symbol, Map<string, symbol>>()
const bareTagCache = new Map<string, symbol>()

export function subSlot(slot: symbol | undefined, tag: string): symbol {
  if (slot === undefined) {
    let bare = bareTagCache.get(tag)
    if (bare === undefined) {
      bare = Symbol.for(`@tanstack/octane-hotkeys:${tag}`)
      bareTagCache.set(tag, bare)
    }
    return bare
  }

  let byTag = subSlotCache.get(slot)
  if (byTag === undefined) {
    byTag = new Map()
    subSlotCache.set(slot, byTag)
  }

  let child = byTag.get(tag)
  if (child === undefined) {
    child = Symbol.for(`${slot.description ?? ''}:${tag}`)
    byTag.set(tag, child)
  }
  return child
}

export function splitSlot(
  args: Array<unknown>,
): [Array<unknown>, symbol | undefined] {
  const tail = args[args.length - 1]
  const slot = typeof tail === 'symbol' ? tail : undefined
  return [slot === undefined ? args : args.slice(0, -1), slot]
}

/**
 * Subscribes to a store and returns the selected value, re-rendering when it
 * changes (by `Object.is`). The selector runs again only when the store's
 * state or the selector itself changes.
 */
export function select<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
  slot: symbol,
): TSelected {
  const subscribe = useCallback(
    (onChange: () => void) => store.subscribe(onChange).unsubscribe,
    [store],
    subSlot(slot, 'select:subscribe'),
  )
  const memo = useRef<{
    state: TState
    selector: (state: TState) => TSelected
    selected: TSelected
  } | null>(null, subSlot(slot, 'select:memo'))
  const getSelection = () => {
    const state = store.get()
    const last = memo.current
    if (last && last.selector === selector && Object.is(last.state, state)) {
      return last.selected
    }
    memo.current = { state, selector, selected: selector(state) }
    return memo.current.selected
  }
  return useSyncExternalStore(
    subscribe,
    getSelection,
    getSelection,
    subSlot(slot, 'select:store'),
  )
}

const NO_APP_HOTKEYS = createStore<AppHotkeysState | null>(null)

/**
 * Re-renders when the provider's app hotkeys or custom hotkeys change and
 * returns the provider's store.
 */
export function useAppHotkeysStore(
  store: AppHotkeysStore | null,
  slot: symbol,
): AppHotkeysStore | null {
  select(store?.store ?? NO_APP_HOTKEYS, (value) => value, slot)
  return store
}
