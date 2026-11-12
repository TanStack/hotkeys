import { formatForDisplay } from '@tanstack/hotkeys'
import { namesPhysicalKey } from '@tanstack/hotkeys/adapter'
import { createKeyboardLayout } from './createKeyboardLayout'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call in a component; the returned
 * function works anywhere, and JSX updates when the provider's platform
 * changes. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded, and JSX updates when the layout arrives. See `createKeyboardLayout`.
 * An explicit `layoutMap` option wins. Firefox and Safari report no layout, so
 * labels there keep the key's US character.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const formatForDisplay = createFormatForDisplay()
 *   return <kbd>{formatForDisplay('Mod+S')}</kbd>
 * }
 * ```
 */
export function createFormatForDisplay(): typeof formatForDisplay {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const layoutMap = createKeyboardLayout()
  return ((hotkey, options) =>
    formatForDisplay(hotkey, {
      ...options,
      platform: options?.platform ?? defaultOptions().platform,
      // Only a position's label follows the layout. Other labels don't read
      // it, so they don't render again when it loads.
      layoutMap:
        options?.layoutMap ??
        (namesPhysicalKey(hotkey) ? (layoutMap() ?? undefined) : undefined),
    })) as typeof formatForDisplay
}
