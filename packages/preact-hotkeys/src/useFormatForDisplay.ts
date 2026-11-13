import { createFormatForDisplay } from '@tanstack/hotkeys/adapter'
import { useMemo } from 'preact/hooks'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { useKeyboardLayout } from './useKeyboardLayout'
import type { formatForDisplay } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins.
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
 * function SaveButton() {
 *   const formatForDisplay = useFormatForDisplay()
 *
 *   return (
 *     <button>
 *       Save <kbd>{formatForDisplay('Mod+S')}</kbd>
 *     </button>
 *   )
 * }
 * ```
 */
export function useFormatForDisplay(): typeof formatForDisplay {
  // Without a provider platform, formatForDisplay detects it.
  const platform = useDefaultHotkeysOptions().platform
  const layoutMap = useKeyboardLayout()
  return useMemo(
    () =>
      createFormatForDisplay(
        () => platform,
        () => layoutMap,
      ),
    [platform, layoutMap],
  )
}
