import { computed } from '@angular/core'
import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { injectSelector } from './_injectSelector'
import { runOutsideZone } from './_zone'
import type { Signal } from '@angular/core'
import type { LockKey, MaybeGetter } from '@tanstack/hotkeys'

/**
 * Angular inject-based API that returns a signal of whether a lock key, such
 * as Caps Lock, is on.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. The signal is `null` until the
 * user presses a key, clicks, or moves the mouse, after the window loses
 * focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and iOS.
 *
 * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'` - can be a getter function
 * @returns Signal that is `true` when the lock is on, `false` when it is off, or `null`
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     <label>
 *       Password
 *       <input type="password" />
 *       @if (capsLock()) {
 *         <span role="status">Caps Lock is on</span>
 *       }
 *     </label>
 *   `,
 * })
 * export class PasswordFieldComponent {
 *   capsLock = injectKeyLockState('CapsLock')
 * }
 * ```
 */
export function injectKeyLockState(
  key: MaybeGetter<LockKey>,
): Signal<boolean | null> {
  const tracker = runOutsideZone(getKeyStateTracker)
  const locksSelector = injectSelector(tracker.store, (state) => state.locks)

  return computed(() => locksSelector()[resolveMaybeGetter(key)])
}
