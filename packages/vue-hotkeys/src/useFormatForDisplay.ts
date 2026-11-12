import { formatForDisplay } from '@tanstack/hotkeys'
import { namesPhysicalKey } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import { useKeyboardLayout } from './useKeyboardLayout'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call in `setup`; the returned function
 * works anywhere, and templates update when the provider's platform changes.
 * An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user, once the browser's keyboard layout has loaded, and
 * templates update when it arrives. See `useKeyboardLayout`. A `layoutMap`
 * passed to the returned function wins.
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
  const layoutMap = useKeyboardLayout()
  return ((hotkey, options) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? defaultOptions().platform,
      // Only a position's label follows the layout. Other labels don't read
      // it, so they don't render again when it loads.
      layoutMap:
        options?.layoutMap ??
        (namesPhysicalKey(hotkey) ? (layoutMap.value ?? undefined) : undefined),
    })) as typeof formatForDisplay
}
