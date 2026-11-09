const ALT_GRAPH = Symbol.for('@tanstack/hotkeys-test-utils/altGraph')
const PATCHED = Symbol.for('@tanstack/hotkeys-test-utils/altGraphPatched')

/** Marks an event as having AltGraph (AltGr) held. Returns the same event. */
export function withAltGraph<TEvent extends KeyboardEvent>(
  event: TEvent,
  altGraph = true,
): TEvent {
  Object.defineProperty(event, ALT_GRAPH, {
    configurable: true,
    value: altGraph,
  })
  return event
}

/**
 * Makes `getModifierState('AltGraph')` behave like a browser. happy-dom 21
 * returns `altKey` there, so every Alt chord would look like AltGr. After
 * this, AltGraph is held only when the event was created with
 * `modifierAltGraph: true` (the standard init field, which happy-dom
 * ignores) or marked with `withAltGraph`. Other modifier names keep
 * happy-dom's behavior.
 */
export function patchAltGraph(): void {
  const Original = window.KeyboardEvent
  if (Object.hasOwn(Original, PATCHED)) return

  const proto = Original.prototype
  const original = proto.getModifierState
  Object.defineProperty(proto, 'getModifierState', {
    configurable: true,
    writable: true,
    value: function getModifierState(this: KeyboardEvent, key: string) {
      if (arguments.length > 0 && String(key).toLowerCase() === 'altgraph') {
        return (this as { [ALT_GRAPH]?: boolean })[ALT_GRAPH] === true
      }
      return original.call(this, key)
    },
  })

  // Reads `modifierAltGraph` from the init object. Events made by the
  // original constructor, such as Testing Library's, still pass instanceof.
  class KeyboardEvent extends Original {
    constructor(type: string, init?: KeyboardEventInit) {
      super(type, init)
      if (init?.modifierAltGraph) withAltGraph(this)
    }

    static override [Symbol.hasInstance](value: unknown): boolean {
      return value instanceof Original
    }
  }
  Object.defineProperty(KeyboardEvent, PATCHED, { value: true })
  window.KeyboardEvent = KeyboardEvent
}
