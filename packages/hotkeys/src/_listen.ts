/**
 * Adds a listener with the native method. zone.js runs all the listeners it
 * patches for one type and phase on a node from one native listener, added
 * with the options of the first, so after a passive one `preventDefault`
 * would fail. zone.js keeps the native method under this name, and its
 * patched `removeEventListener` falls back to the native one.
 */
export function listen(
  target: EventTarget,
  type: string,
  listener: EventListener,
  capture: boolean,
): void {
  ;(
    (target as { __zone_symbol__addEventListener?: typeof addEventListener })
      .__zone_symbol__addEventListener ?? target.addEventListener
  ).call(target, type, listener, capture)
}
