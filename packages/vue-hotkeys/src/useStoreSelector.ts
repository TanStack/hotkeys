import { shallowRef } from 'vue'
import { useSelector } from '@tanstack/vue-store'
import type { Ref } from 'vue'

/**
 * `useSelector` that does not subscribe during server rendering. Vue never
 * disposes component scopes on the server, so a subscription to a shared
 * store would never be released. The server gets the current value instead.
 */
export function useStoreSelector<TState, TSelected>(
  source: Parameters<typeof useSelector<TState, TSelected>>[0],
  selector: (state: TState) => TSelected,
): Readonly<Ref<TSelected>> {
  return typeof document === 'undefined'
    ? shallowRef(selector(source.get()))
    : useSelector(source, selector)
}
