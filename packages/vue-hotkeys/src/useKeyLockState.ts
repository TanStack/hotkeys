import { getKeyStateTracker } from '@tanstack/hotkeys'
import { computed, onScopeDispose, shallowRef, toValue } from 'vue'
import type { LockKey } from '@tanstack/hotkeys'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'

/**
 * Vue composable that returns a reactive ref telling whether a lock key, such
 * as Caps Lock, is on.
 *
 * Lock keys toggle instead of being held, so this reads the lock state that
 * the browser reports on key and mouse events. It is `null` until the user
 * presses a key, clicks, or moves the mouse, after the window loses focus or the page is hidden,
 * and always for Num Lock and Scroll Lock on macOS and iOS. The key may be a
 * ref or getter; the result follows it without waiting for an event.
 * Pressing or releasing a key that doesn't change the lock state doesn't
 * notify anything that reads the ref.
 *
 * @param key - `'CapsLock'`, `'NumLock'`, or `'ScrollLock'`
 * @returns Read-only reactive ref that is `true` when the lock is on, `false`
 * when it is off, or `null`
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKeyLockState } from '@tanstack/vue-hotkeys'
 *
 * const capsLock = useKeyLockState('CapsLock')
 * </script>
 *
 * <template>
 *   <label>
 *     Password
 *     <input type="password" />
 *     <span v-if="capsLock" role="status">Caps Lock is on</span>
 *   </label>
 * </template>
 * ```
 */
export function useKeyLockState(
  key: MaybeRefOrGetter<LockKey>,
): ComputedRef<boolean | null> {
  const tracker = getKeyStateTracker()
  const read = () => tracker.store.state.locks[toValue(key)]
  // Counts the events that changed the answer. A Vue 3.3 computed notifies
  // its readers whenever a dependency changes, even when it returns the same
  // value, so it must not depend on the whole key state.
  const changes = shallowRef(0)
  let last = read()
  // Vue never disposes component scopes on the server, so don't subscribe.
  if (typeof document !== 'undefined') {
    const { unsubscribe } = tracker.store.subscribe(() => {
      if (read() !== last) changes.value++
    })
    onScopeDispose(unsubscribe)
  }
  return computed(() => {
    void changes.value
    return (last = read())
  })
}
