import { formatForDisplay } from '@tanstack/hotkeys'
import { getHotkeysContext } from './HotkeysCtx.js'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call during component initialization,
 * like `getContext`; the returned function works anywhere and reads the
 * provider's current defaults. An explicit `platform` option wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const format = getFormatForDisplay()
 * </script>
 *
 * <kbd>{format('Mod+S')}</kbd>
 * ```
 */
export function getFormatForDisplay(): typeof formatForDisplay {
  const context = getHotkeysContext()
  return ((hotkey, options) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? context?.defaultOptions.platform,
    })) as typeof formatForDisplay
}
