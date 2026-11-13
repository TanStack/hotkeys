import { createFormatForDisplay } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import { useKeyboardLayout } from './useKeyboardLayout'
import type { formatForDisplay } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call in `setup`; the returned function
 * works anywhere, and templates update when the provider's platform changes.
 * An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded, and templates update when it arrives. See `useKeyboardLayout`. A
 * `layoutMap` passed to the returned function wins. Firefox and Safari report
 * no layout, so labels there keep the key's US character.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const formatForDisplay = useFormatForDisplay()
 * </script>
 *
 * <template>
 *   <kbd>{{ formatForDisplay('Mod+S') }}</kbd>
 * </template>
 * ```
 */
export function useFormatForDisplay(): typeof formatForDisplay {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const layoutMap = useKeyboardLayout()
  // Only a position's label follows the layout. Other labels don't read it,
  // so they don't render again when it loads.
  return createFormatForDisplay(
    () => defaultOptions().platform,
    () => layoutMap.value,
  )
}
