'use client'

import { useCallback } from 'react'
import { formatForDisplay } from '@tanstack/hotkeys'
import { usePlatform } from './_usePlatform'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins.
 *
 * Call the hook once at the top of the component; the returned function can
 * be called anywhere, such as in a loop or a condition. Server-rendered apps
 * should set the provider's `defaultOptions.platform` from the request with
 * `detectPlatform(userAgent)`, so the server HTML matches the user's platform.
 *
 * @example
 * ```tsx
 * function SaveButton() {
 *   const format = useFormatForDisplay()
 *
 *   return (
 *     <button>
 *       Save <kbd>{format('Mod+S')}</kbd>
 *     </button>
 *   )
 * }
 * ```
 */
export function useFormatForDisplay(): typeof formatForDisplay {
  const platform = usePlatform()
  return useCallback(
    (hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
      formatForDisplay(hotkey, {
        ...options,
        platform: options?.platform ?? platform,
      }),
    [platform],
  ) as typeof formatForDisplay
}
