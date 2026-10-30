import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'preact/hooks'
import type { Store } from '@tanstack/hotkeys/adapter'

/**
 * Subscribes to a store and returns the selected value, re-rendering when it
 * changes (by `Object.is`). The selector runs again only when the store's
 * state or the selector itself changes. Preact 10 has no
 * `useSyncExternalStore` outside `preact/compat`, so this follows its approach.
 */
export function useSelector<TState, TSelected>(
  store: Pick<Store<TState>, 'get' | 'subscribe'>,
  selector: (state: TState) => TSelected,
): TSelected {
  const select = useMemo(() => {
    let memo: { state: TState; selected: TSelected } | undefined
    return (state: TState) => {
      if (!memo || !Object.is(memo.state, state)) {
        memo = { state, selected: selector(state) }
      }
      return memo.selected
    }
  }, [selector])
  const selected = useRef<TSelected>(undefined)
  const getSelection = () => {
    const next = select(store.get())
    if (!Object.is(selected.current, next)) selected.current = next
    return selected.current as TSelected
  }

  const value = getSelection()
  const [{ instance }, forceUpdate] = useState({
    instance: { value, getSelection },
  })
  const changed = () => {
    try {
      return !Object.is(instance.value, instance.getSelection())
    } catch {
      return true
    }
  }
  useLayoutEffect(() => {
    instance.value = value
    instance.getSelection = getSelection
    if (changed()) forceUpdate({ instance })
  })
  useEffect(() => {
    if (changed()) forceUpdate({ instance })
    return store.subscribe(() => {
      if (changed()) forceUpdate({ instance })
    }).unsubscribe
  }, [instance, store])
  return value
}
