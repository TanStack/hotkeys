import { createFormatForDisplay as createCoreFormatForDisplay } from '@tanstack/hotkeys/adapter'
import { createKeyboardLayout } from './createKeyboardLayout'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'
import type { formatForDisplay } from '@tanstack/hotkeys'

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
  // Only a position's label reads the layout, so other labels don't render
  // again when it loads.
  return createCoreFormatForDisplay(() => defaultOptions().platform, layoutMap)
}
