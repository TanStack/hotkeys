import { formatForAria } from '@tanstack/hotkeys'
import { announceLiveHotkeys, createFormatter } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import { useKeyboardLayout } from './useKeyboardLayout'

/**
 * Returns `formatForAria` with the provider's `platform` as the default. Use
 * its value for `aria-keyshortcuts`, so screen readers announce the shortcut.
 * It returns `undefined` for a multi-step sequence, no hotkey, or a hotkey
 * that can't fire right now (one that is disabled, in a suspended scope, a
 * suspended character key, or not registered), so Vue omits the attribute.
 * Call in `setup`; the returned function works anywhere, and templates update
 * when the provider's platform changes. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded. See
 * `useKeyboardLayout`. A `layoutMap` passed to the returned function wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const appHotkeys = useAppHotkeys()
 * const formatForAria = useFormatForAria()
 * </script>
 *
 * <template>
 *   <button :aria-keyshortcuts="formatForAria(appHotkeys['search.open'].hotkey)">
 *     Search
 *   </button>
 * </template>
 * ```
 */
export function useFormatForAria(): typeof formatForAria {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const layoutMap = useKeyboardLayout()
  const registrations = useHotkeyRegistrations()
  // Only a physical key reads the layout, so other values don't render again
  // when it loads. Every value reads the registrations, so it follows whether
  // the hotkey can fire.
  return announceLiveHotkeys(
    createFormatter(
      formatForAria,
      () => defaultOptions().platform,
      () => layoutMap.value,
    ),
    () => registrations.value,
  )
}
