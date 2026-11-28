/** Lock key states for `withKeyLocks`. A missing key reads as off. */
export type KeyLocks = Partial<
  Record<'CapsLock' | 'NumLock' | 'ScrollLock', boolean>
>

/**
 * Makes `event.getModifierState()` report the given lock key states, and
 * marks the event as real user input, since the key state tracker reads lock
 * keys only from trusted events. happy-dom ignores `modifierCapsLock` and the
 * other lock fields in the event init, and its mouse events have no
 * `getModifierState`. Other modifier names keep the event's own behavior.
 * Returns the same event.
 */
export function withKeyLocks<TEvent extends KeyboardEvent | MouseEvent>(
  event: TEvent,
  locks: KeyLocks,
): TEvent {
  const original = (event as { getModifierState?: (key: string) => boolean })
    .getModifierState
  Object.defineProperty(event, 'getModifierState', {
    configurable: true,
    value: (key: string) =>
      Object.hasOwn(LOCK_NAMES, key)
        ? locks[key as keyof KeyLocks] === true
        : (original?.call(event, key) ?? false),
  })
  Object.defineProperty(event, 'isTrusted', { configurable: true, value: true })
  return event
}

const LOCK_NAMES = { CapsLock: 1, NumLock: 1, ScrollLock: 1 }
