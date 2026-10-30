'use client'

import { useCallback, useRef, useSyncExternalStore } from 'react'
import type { Store } from '@tanstack/hotkeys/adapter'

/**
 * Subscribes to a store and returns the selected value, re-rendering when it
 * changes (by `Object.is`). The selector runs again only when the store's
 * state or the selector itself changes.
 */
export function useSelector<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): TSelected {
  const subscribe = useCallback(
    (onChange: () => void) => store.subscribe(onChange).unsubscribe,
    [store],
  )
  const memo = useRef<{
    state: TState
    selector: (state: TState) => TSelected
    selected: TSelected
  }>(null)
  const getSelection = () => {
    const state = store.get()
    const last = memo.current
    if (last && last.selector === selector && Object.is(last.state, state)) {
      return last.selected
    }
    memo.current = { state, selector, selected: selector(state) }
    return memo.current.selected
  }
  return useSyncExternalStore(subscribe, getSelection, getSelection)
}
