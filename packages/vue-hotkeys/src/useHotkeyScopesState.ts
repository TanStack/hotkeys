import { getHotkeyManager } from '@tanstack/hotkeys'
import { useStoreSelector } from './useStoreSelector'
import type { HotkeyScopesState } from '@tanstack/hotkeys'
import type { Ref } from 'vue'

/**
 * Vue composable that returns a ref of the hotkey manager's scope state: the
 * active scopes, the exclusive scope that owns the keyboard, and the scopes
 * it allows or suspends. Updates when scopes activate or release.
 *
 * @returns Reactive ref of the current scope state
 *
 * @example
 * ```vue
 * <script setup>
 * import { useHotkeyScopesState } from '@tanstack/vue-hotkeys'
 *
 * const scopes = useHotkeyScopesState()
 * </script>
 *
 * <template>
 *   <p v-if="scopes.exclusive">Shortcuts belong to {{ scopes.exclusive }}</p>
 * </template>
 * ```
 */
export function useHotkeyScopesState(): Ref<HotkeyScopesState> {
  return useStoreSelector(getHotkeyManager().scopes, (state) => state)
}
