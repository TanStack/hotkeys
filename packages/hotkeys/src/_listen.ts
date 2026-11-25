/**
 * Adds a listener with the native method. zone.js runs all the listeners it
 * patches for one type and phase on a node from one native listener, added
 * with the options of the first, so after a passive one `preventDefault`
 * would fail. zone.js keeps the native method under its symbol prefix,
 * `__zone_symbol__` unless the page sets `__Zone_symbol_prefix`, and its
 * patched `removeEventListener` falls back to the native one.
 */
export function listen(
  target: EventTarget,
  type: string,
  listener: EventListener,
  capture: boolean,
): void {
  const native = (target as unknown as Record<string, unknown>)[
    `${(globalThis as { __Zone_symbol_prefix?: string }).__Zone_symbol_prefix ?? '__zone_symbol__'}addEventListener`
  ] as typeof addEventListener | undefined
  ;(native ?? target.addEventListener).call(target, type, listener, capture)
}
