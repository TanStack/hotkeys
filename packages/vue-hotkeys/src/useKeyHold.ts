import { useStore } from '@tanstack/vue-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'
import { unref } from 'vue'
import type { MaybeRefOrGetter, Ref } from 'vue'
import type { HeldKey } from '@tanstack/hotkeys'

/**
 * Vue composable that returns a reactive ref indicating whether a specific key is currently being held.
 *
 * This composable uses `useStore` from `@tanstack/vue-store` to subscribe
 * to the global KeyStateTracker and uses a selector to determine if
 * the specified key is held.
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
export function useKeyHold(key: MaybeRefOrGetter<HeldKey>): Ref<boolean> {
  const tracker = getKeyStateTracker()

  const isHeld = useStore(tracker.store, (state) => {
    const keyValue = unref(key)
    const normalizedKey = (
      typeof keyValue === 'string' ? keyValue : String(keyValue)
    ).toLowerCase()
    return state.heldKeys.some(
      (heldKey) => heldKey.toLowerCase() === normalizedKey,
    )
  })

  return isHeld as Ref<boolean>
}
