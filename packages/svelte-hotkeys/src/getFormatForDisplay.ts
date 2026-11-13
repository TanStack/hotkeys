import { createFormatForDisplay } from '@tanstack/hotkeys/adapter'
import { getHotkeysContext } from './HotkeysCtx.js'
import { getKeyboardLayout } from './getKeyboardLayout.svelte.js'
import type { formatForDisplay } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the provider's `platform` as the default,
 * so labels match the user's platform. Call during component initialization,
 * like `getContext`; the returned function works anywhere and reads the
 * provider's current defaults. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded, and markup updates when it arrives. See `getKeyboardLayout`. A
 * `layoutMap` passed to the returned function wins. Firefox and Safari report
 * no layout, so labels there keep the key's US character.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const formatForDisplay = getFormatForDisplay()
 * </script>
 *
 * <kbd>{formatForDisplay('Mod+S')}</kbd>
 * ```
 */
export function getFormatForDisplay(): typeof formatForDisplay {
  const context = getHotkeysContext()
  const keyboard = getKeyboardLayout()
  // Only a position's label reads the layout, so other labels don't render
  // again when it loads.
  return createFormatForDisplay(
    () => context?.defaultOptions.platform,
    () => keyboard.layout,
  )
}
