import { getKeyStateTracker } from '@tanstack/hotkeys'
import { computed, onScopeDispose, shallowRef, toValue } from 'vue'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { ComputedRef, MaybeRefOrGetter } from 'vue'

/**
 * Vue composable that returns a reactive ref indicating whether a specific key is currently being held.
 *
 * Reads the held keys from the global KeyStateTracker. The key may be a ref
 * or getter; the result follows it without waiting for a key event. Pressing
 * or releasing another key doesn't notify anything that reads the ref.
 *
 * @param key - The key to check (e.g., 'Shift', 'Control', 'A')
 * @returns Read-only reactive ref that is true if the key is currently held down
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKeyHold } from '@tanstack/vue-hotkeys'
 *
 * const isShiftHeld = useKeyHold('Shift')
 * </script>
 *
 * <template>
 *   <div :style="{ opacity: isShiftHeld ? 1 : 0.5 }">
 *     {{ isShiftHeld ? 'Shift is pressed!' : 'Press Shift' }}
 *   </div>
 * </template>
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { useKeyHold } from '@tanstack/vue-hotkeys'
 *
 * const ctrl = useKeyHold('Control')
 * const shift = useKeyHold('Shift')
 * const alt = useKeyHold('Alt')
 * </script>
 *
 * <template>
 *   <div>
 *     <span :style="{ opacity: ctrl ? 1 : 0.3 }">Ctrl</span>
 *     <span :style="{ opacity: shift ? 1 : 0.3 }">Shift</span>
 *     <span :style="{ opacity: alt ? 1 : 0.3 }">Alt</span>
 *   </div>
 * </template>
 * ```
 */
export function useKeyHold(
  key: MaybeRefOrGetter<IndividualKey>,
): ComputedRef<boolean> {
  const tracker = getKeyStateTracker()
  const isHeld = () => tracker.isKeyHeld(toValue(key))
  // Counts the key events that changed the answer. A Vue 3.3 computed
  // notifies its readers whenever a dependency changes, even when it returns
  // the same value, so it must not depend on every held key.
  const changes = shallowRef(0)
  let last = isHeld()
  // Vue never disposes component scopes on the server, so don't subscribe.
  if (typeof document !== 'undefined') {
    const { unsubscribe } = tracker.store.subscribe(() => {
      if (isHeld() !== last) changes.value++
    })
    onScopeDispose(unsubscribe)
  }
  return computed(() => {
    void changes.value
    return (last = isHeld())
  })
}
