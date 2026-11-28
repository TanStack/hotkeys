import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { select } from './utils'
import type { LockKey, MaybeGetter } from '@tanstack/hotkeys'
import type { EmberHotkeyState } from './types'

/**
 * Returns whether a lock key, such as Caps Lock, is on. Pass the containing
 * component as owner to release the subscription on destruction. Getter
 * arguments can read changing tracked component properties.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. Its value is `null` until the
 * user presses a key, clicks, or moves the mouse, after the window loses
 * focus or the page is hidden, and always for Num Lock and Scroll Lock on macOS and iOS.
 *
 * @param owner - The component that owns the subscription
 * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`
 * @returns A state whose `value` is `true` when the lock is on, `false` when
 * it is off, or `null`
 *
 * @example
 * ```gts
 * class PasswordField extends Component {
 *   capsLock = useKeyLockState(this, 'CapsLock')
 *
 *   <template>
 *     <label>
 *       Password
 *       <input type="password" />
 *       {{#if this.capsLock.value}}
 *         <span role="status">Caps Lock is on</span>
 *       {{/if}}
 *     </label>
 *   </template>
 * }
 * ```
 */
export function useKeyLockState(
  owner: object,
  key: MaybeGetter<LockKey>,
): EmberHotkeyState<boolean | null> {
  return select(
    owner,
    getKeyStateTracker().store,
    (state) => state.locks[resolveMaybeGetter(key)],
  )
}
