import { useEffect, useRef, useState } from 'preact/hooks'

type Unsubscribe = { unsubscribe: () => void } | (() => void)

interface CompatibleStore<TState> {
  state: TState
  subscribe: (listener: (...args: Array<unknown>) => void) => Unsubscribe
}

/**
 * Lightweight store subscription helper compatible with the store API
 * exposed by @tanstack/hotkeys.
 */
export function useStoreState<TState, TSelected = TState>(
  store: CompatibleStore<TState>,
  selector: (state: TState) => TSelected = (state) =>
    state as unknown as TSelected,
): TSelected {
  const selectorRef = useRef(selector)
  selectorRef.current = selector

  const [selected, setSelected] = useState<TSelected>(() =>
    selectorRef.current(store.state),
  )
  const selectedRef = useRef(selected)
  selectedRef.current = selected

  useEffect(() => {
    const updateSelected = () => {
      const nextSelected = selectorRef.current(store.state)
      if (!Object.is(selectedRef.current, nextSelected)) {
        selectedRef.current = nextSelected
        setSelected(nextSelected)
      }
    }

    updateSelected()

    const subscription = store.subscribe(updateSelected)

    return typeof subscription === 'function'
      ? subscription
      : () => subscription.unsubscribe()
  }, [store])

  return selected
}
