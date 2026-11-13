import type { MaybeGetter } from './hotkey.types'

/** Calls a getter, or returns a plain value. */
export function resolveMaybeGetter<T>(value: MaybeGetter<T>): T {
  return typeof value === 'function' ? (value as () => T)() : value
}
