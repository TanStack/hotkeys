import { useStore } from '@tanstack/vue-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { Ref } from 'vue'

/**
 * Vue composable that returns a reactive ref of currently held keyboard keys.
 *
 * This composable uses `useStore` from `@tanstack/vue-store` to subscribe
 * to the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @returns Reactive ref containing array of currently held key names
 *
 * @example
 * ```vue
 * <script setup>
 * import { useHeldKeys } from '@tanstack/vue-hotkeys'
 *
 * const heldKeys = useHeldKeys()
 * </script>
 *
 * <template>
 *   <div>
 *     Currently pressed: {{ heldKeys.join(' + ') || 'None' }}
 *   </div>
 * </template>
 * ```
 */
export function useHeldKeys(): Ref<Array<string>> {
  const tracker = getKeyStateTracker()
  return useStore(tracker.store, (state) => state.heldKeys)
}
