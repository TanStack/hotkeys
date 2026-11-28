import { formatForAria } from '@tanstack/hotkeys'
import { createFormatter } from '@tanstack/hotkeys/adapter'
import { getHotkeysContext } from './HotkeysCtx.js'
import { getKeyboardLayout } from './getKeyboardLayout.svelte.js'

/**
 * Returns `formatForAria` with the provider's `platform` as the default. Use
 * its value for `aria-keyshortcuts`, so screen readers announce the shortcut.
 * It returns `undefined` for a multi-step sequence or no hotkey, so Svelte
 * omits the attribute. Call during component initialization, like `getContext`;
 * the returned function works anywhere and reads the provider's current
 * defaults. An explicit `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded. See
 * `getKeyboardLayout`. A `layoutMap` passed to the returned function wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const appHotkeys = getAppHotkeys()
 *   const formatForAria = getFormatForAria()
 * </script>
 *
 * <button aria-keyshortcuts={formatForAria(appHotkeys.current['search.open'].hotkey)}>
 *   Search
 * </button>
 * ```
 */
export function getFormatForAria(): typeof formatForAria {
  const context = getHotkeysContext()
  const keyboard = getKeyboardLayout()
  // Only a physical key reads the layout, so other values don't render again
  // when it loads.
  return createFormatter(
    formatForAria,
    () => context?.defaultOptions.platform,
    () => keyboard.layout,
  )
}
