import { useStore } from '@tanstack/vue-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { Ref } from 'vue'

/**
 * Vue composable that returns a reactive ref mapping currently held key names to their physical `event.code` values.
 *
 * This is useful for debugging which physical key was pressed (e.g. distinguishing
 * left vs right Shift via "ShiftLeft" / "ShiftRight").
 *
 * @returns Reactive ref containing record mapping normalized key names to their `event.code` values
 *
 * @example
 * ```vue
 * <script setup>
 * import { useHeldKeys, useHeldKeyCodes } from '@tanstack/vue-hotkeys'
 *
 * const heldKeys = useHeldKeys()
 * const heldCodes = useHeldKeyCodes()
 * </script>
 *
 * <template>
 *   <div>
 *     <kbd v-for="key in heldKeys" :key="key">
 *       {{ key }} <small>{{ heldCodes[key] }}</small>
 *     </kbd>
 *   </div>
 * </template>
 * ```
 */
export function useHeldKeyCodes(): Ref<Record<string, string>> {
  const tracker = getKeyStateTracker()
  return useStore(tracker.store, (state) => state.heldCodes)
}
