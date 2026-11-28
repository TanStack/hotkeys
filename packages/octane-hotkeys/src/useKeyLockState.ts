import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'
import type { LockKey } from '@tanstack/hotkeys'

/**
 * Reports whether a lock key, such as Caps Lock, is on.
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
 * function PasswordField() @{
 *   const capsLock = useKeyLockState('CapsLock')
 *
 *   <label>
 *     Password
 *     <input type="password" />
 *     @if (capsLock) {
 *       <span role="status">Caps Lock is on</span>
 *     }
 *   </label>
 * }
 * ```
 */
export function useKeyLockState(key: LockKey): boolean | null
export function useKeyLockState(key: LockKey, slot?: symbol): boolean | null {
  return select(
    getKeyStateTracker().store,
    (state) => state.locks[key],
    subSlot(slot, 'key-lock-state'),
  )
}
