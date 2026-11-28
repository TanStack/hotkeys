import { formatForAria } from '@tanstack/hotkeys'
import { useFormatter } from './_useFormatter'

/**
 * Returns `formatForAria` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins. Use its value for `aria-keyshortcuts`, so screen readers announce the
 * shortcut. It returns `undefined` for a multi-step sequence or no hotkey, so
 * Octane omits the attribute. Without a provider platform, server rendering and
 * hydration use 'linux', then the client re-renders with the detected
 * platform.
 *
 * Physical bindings such as `[KeyQ]` name the key the user presses in
 * Chromium browsers, once the keyboard layout has loaded. See
 * `useKeyboardLayout`. A `layoutMap` passed to the returned function wins.
 *
 * Call the hook once at the top of the component; the returned function can
 * be called anywhere. Server-rendered apps should set the provider's
 * `defaultOptions.platform` from the request with `detectPlatform(userAgent)`,
 * so the server HTML matches the user's platform.
 *
 * @example
 * ```tsx
 * function SearchButton() @{
 *   const formatForAria = useFormatForAria()
 *
 *   <button aria-keyshortcuts={formatForAria('Mod+K')}>Search</button>
 * }
 * ```
 */
export function useFormatForAria(): typeof formatForAria
export function useFormatForAria(slot?: symbol): typeof formatForAria {
  return useFormatter(formatForAria, 'aria-', slot)
}
