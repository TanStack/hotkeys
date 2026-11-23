/** A reactive value for component props. Raw, so specs keep their identity. */
export function cell<T>(initial: T): { value: T } {
  let value = $state.raw(initial)
  return {
    get value() {
      return value
    },
    set value(next) {
      value = next
    },
  }
}
