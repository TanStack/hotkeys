import { formatForAria } from '@tanstack/hotkeys'
import { createFormatter } from '@tanstack/hotkeys/adapter'
import { createKeyboardLayout } from './createKeyboardLayout'
import { useDefaultHotkeysOptionsSource } from './defaultOptions'

/**
 * Returns `formatForAria` with the provider's `platform` as the default. Use
 * its value for `aria-keyshortcuts`, so screen readers announce the shortcut.
 * It returns `undefined` for a multi-step sequence or no hotkey, so Solid
 * omits the attribute. Call in a component; the returned function works anywhere,
 * and JSX updates when the provider's platform changes. An explicit
 * `platform` option wins.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded. See
 * `createKeyboardLayout`. An explicit `layoutMap` option wins.
 *
 * Server-rendered apps should set the provider's `defaultOptions.platform`
 * from the request user agent with `detectPlatform(userAgent)`.
 *
 * @example
 * ```tsx
 * function SearchButton() {
 *   const appHotkeys = useAppHotkeys()
 *   const formatForAria = createFormatForAria()
 *   return (
 *     <button aria-keyshortcuts={formatForAria(appHotkeys()['search.open'].hotkey)}>
 *       Search
 *     </button>
 *   )
 * }
 * ```
 */
export function createFormatForAria(): typeof formatForAria {
  const defaultOptions = useDefaultHotkeysOptionsSource()
  const layoutMap = createKeyboardLayout()
  // Only a physical key reads the layout, so other values don't render again
  // when it loads.
  return createFormatter(
    formatForAria,
    () => defaultOptions().platform,
    layoutMap,
  )
}
