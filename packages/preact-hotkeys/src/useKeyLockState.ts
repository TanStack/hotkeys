import { getKeyStateTracker } from '@tanstack/hotkeys'
import { useSelector } from './_useSelector'
import type { LockKey } from '@tanstack/hotkeys'

/**
 * Preact hook that returns whether a lock key, such as Caps Lock, is on.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. It returns `null` until the
 * user presses a key, clicks, or moves the mouse, after the window loses
 * focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and iOS.
 *
 * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`
 * @returns `true` when the lock is on, `false` when it is off, or `null`
 *
 * @example
 * ```tsx
 * function PasswordField() {
 *   const capsLock = useKeyLockState('CapsLock')
 *
 *   return (
 *     <label>
 *       Password
 *       <input type="password" />
 *       {capsLock && <span role="status">Caps Lock is on</span>}
 *     </label>
 *   )
 * }
 * ```
 */
export function useKeyLockState(key: LockKey): boolean | null {
  const tracker = getKeyStateTracker()
  return useSelector(tracker.store, (state) => state.locks[key])
}
