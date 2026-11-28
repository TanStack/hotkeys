'use client'

import { formatForAria } from '@tanstack/hotkeys'
import { announceLiveHotkeys, createFormatter } from '@tanstack/hotkeys/adapter'
import { useMemo } from 'react'
import { usePlatform } from './_usePlatform'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import { useKeyboardLayout } from './useKeyboardLayout'

/**
 * Returns `formatForAria` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins. Use its value for `aria-keyshortcuts`, so screen readers announce the
 * shortcut. It returns `undefined` for a multi-step sequence, no hotkey, or a
 * hotkey that can't fire right now (one that is disabled, in a suspended
 * scope, a suspended character key, or not registered), so React omits the
 * attribute.
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
  // Re-renders when a registration changes, so the value follows whether
  // the hotkey can fire.
  const registrations = useHotkeyRegistrations()
  return useMemo(
    () =>
      announceLiveHotkeys(
        createFormatter(
          formatForAria,
          () => platform,
          () => layoutMap,
        ),
        () => registrations,
      ),
    [platform, layoutMap, registrations],
  )
}
