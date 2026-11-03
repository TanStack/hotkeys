import { formatForDisplay } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call in `setup`; the returned function
 * works anywhere, and templates update when the provider's platform changes.
 * An explicit `platform` option wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const format = useFormatForDisplay()
 * </script>
 *
 * <template>
 *   <kbd>{{ format('Mod+S') }}</kbd>
 * </template>
 * ```
 */
export function useFormatForDisplay(): typeof formatForDisplay {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  return ((hotkey, options) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? defaultOptions().platform,
    })) as typeof formatForDisplay
}
