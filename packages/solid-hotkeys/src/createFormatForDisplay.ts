import { formatForDisplay } from '@tanstack/hotkeys'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call in a component; the returned
 * function works anywhere, and JSX updates when the provider's platform
 * changes. An explicit `platform` option wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const format = createFormatForDisplay()
 *   return <kbd>{format('Mod+S')}</kbd>
 * }
 * ```
 */
export function createFormatForDisplay(): typeof formatForDisplay {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  return ((hotkey, options) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? defaultOptions().platform,
    })) as typeof formatForDisplay
}
