import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { useSelector } from './_useSelector'
import type { LockKey, MaybeGetter } from '@tanstack/hotkeys'

/**
 * SolidJS primitive that returns whether a lock key, such as Caps Lock, is on.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. It returns `null` until the
 * user presses a key, clicks, or moves the mouse, after the window loses
 * focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and iOS.
 *
 * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'` - can be an accessor function
 * @returns Signal accessor that returns `true` when the lock is on, `false`
 * when it is off, or `null`
 *
 * @example
 * ```tsx
 * function PasswordField() {
 *   const capsLock = createKeyLockState('CapsLock')
 *
 *   return (
 *     <label>
 *       Password
 *       <input type="password" />
 *       <Show when={capsLock()}>
 *         <span role="status">Caps Lock is on</span>
 *       </Show>
 *     </label>
 *   )
 * }
 * ```
 */
export function createKeyLockState(
  key: MaybeGetter<LockKey>,
): () => boolean | null {
  const tracker = getKeyStateTracker()
  // The selector reads the key accessor, so it reruns when the key changes.
  return useSelector(
    tracker.store,
    (state) => state.locks[resolveMaybeGetter(key)],
  )
}
