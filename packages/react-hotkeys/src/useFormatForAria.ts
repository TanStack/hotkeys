'use client'

import { formatForAria } from '@tanstack/hotkeys'
import { createFormatter } from '@tanstack/hotkeys/adapter'
import { useMemo } from 'react'
import { usePlatform } from './_usePlatform'
import { useKeyboardLayout } from './useKeyboardLayout'

/**
 * Returns `formatForAria` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins. Use its value for `aria-keyshortcuts`, so screen readers announce the
 * shortcut. It returns `undefined` for a multi-step sequence or no hotkey, so
 * React omits the attribute.
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
 * function SearchButton() {
 *   const appHotkeys = useAppHotkeys()
 *   const formatForAria = useFormatForAria()
 *   const formatForDisplay = useFormatForDisplay()
 *   const { hotkey } = appHotkeys['search.open']
 *
 *   return (
 *     <button aria-keyshortcuts={formatForAria(hotkey)}>
 *       Search {hotkey && <kbd>{formatForDisplay(hotkey)}</kbd>}
 *     </button>
 *   )
 * }
 * ```
 */
export function useFormatForAria(): typeof formatForAria {
  const platform = usePlatform()
  const layoutMap = useKeyboardLayout()
  return useMemo(
    () =>
      createFormatter(
        formatForAria,
        () => platform,
        () => layoutMap,
      ),
    [platform, layoutMap],
  )
}
