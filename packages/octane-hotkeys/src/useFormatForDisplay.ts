import { formatForDisplay } from '@tanstack/hotkeys'
import { useFormatter } from './_useFormatter'

/**
 * Returns `formatForDisplay` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins. Without a provider platform, server rendering and hydration use
 * 'linux', then the client re-renders with the detected platform.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user in Chromium browsers, once the keyboard layout has
 * loaded. See `useKeyboardLayout`. A `layoutMap` passed to the returned
 * function wins. Firefox and Safari report no layout, so labels there keep the
 * key's US character.
 *
 * Call the hook once at the top of the component; the returned function can
 * be called anywhere, such as in a loop or a condition. Server-rendered apps
 * should set the provider's `defaultOptions.platform` from the request with
 * `detectPlatform(userAgent)`, so the server HTML matches the user's platform.
 *
 * @example
 * ```tsx
 * function SaveButton() @{
 *   const formatForDisplay = useFormatForDisplay()
 *
 *   <button>
 *     Save <kbd>{formatForDisplay('Mod+S')}</kbd>
 *   </button>
 * }
 * ```
 */
export function useFormatForDisplay(): typeof formatForDisplay
export function useFormatForDisplay(slot?: symbol): typeof formatForDisplay {
  // Display tags stay unprefixed, as they were before the ARIA formatter.
  return useFormatter(formatForDisplay, '', slot)
}
