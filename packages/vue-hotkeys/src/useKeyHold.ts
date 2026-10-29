import { computed, toValue } from 'vue'
import { useHeldKeys } from './useHeldKeys'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { IndividualKey } from '@tanstack/hotkeys'

/**
 * Vue composable that returns a reactive ref indicating whether a specific key is currently being held.
 *
 * Reads the held keys from the global KeyStateTracker. The key may be a ref
 * or getter; the result follows it without waiting for a key event.
 *
 * @param key - The key to check (e.g., 'Shift', 'Control', 'A')
 * @returns Reactive ref that is true if the key is currently held down
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
export function useKeyHold(key: MaybeRefOrGetter<IndividualKey>): Ref<boolean> {
  const heldKeys = useHeldKeys()
  return computed(() => {
    const target = toValue(key).toLowerCase()
    return heldKeys.value.some((heldKey) => heldKey.toLowerCase() === target)
  })
}
