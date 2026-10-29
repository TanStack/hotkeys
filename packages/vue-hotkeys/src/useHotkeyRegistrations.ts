import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { useStoreSelector } from './useStoreSelector'
import type { Ref } from 'vue'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

/**
 * Vue composable that reactively reads every hotkey registration, chords and
 * sequences, from the singleton HotkeyManager. Narrow each view with `kind`.
 *
 * This composable does NOT require the HotkeysProvider.
 *
 * @returns A ref of all registrations, without callbacks
 *
 * @example
 * ```vue
 * <script setup>
 * const registrations = useHotkeyRegistrations()
 * </script>
 * <template>
 *   <li v-for="reg in registrations" :key="reg.id">
 *     {{ reg.options.meta?.name }}: {{ formatForDisplay(reg.hotkey) }}
 *   </li>
 * </template>
 * ```
 */
export function useHotkeyRegistrations(): Readonly<
  Ref<Array<HotkeyRegistrationView>>
> {
  return useStoreSelector(getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
}
