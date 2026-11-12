import { formatForDisplay } from '@tanstack/hotkeys'
import { useCallback } from 'preact/hooks'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { useKeyboardLayout } from './useKeyboardLayout'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'

/**
 * Returns `formatForDisplay` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins.
 *
 * Physical bindings such as `[KeyQ]` are labeled with the character the key
 * types for this user, once the browser's keyboard layout has loaded. See
 * `useKeyboardLayout`. A `layoutMap` passed to the returned function wins.
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
  // Without a provider platform, formatForDisplay detects it.
  const platform = useDefaultHotkeysOptions().platform
  const layoutMap = useKeyboardLayout()
  return useCallback(
    (hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
      formatForDisplay(hotkey, {
        ...options,
        platform: options?.platform ?? platform,
        layoutMap: options?.layoutMap ?? layoutMap ?? undefined,
      }),
    [platform, layoutMap],
  ) as typeof formatForDisplay
}
