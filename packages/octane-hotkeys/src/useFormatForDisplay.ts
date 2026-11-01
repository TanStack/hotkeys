import { useCallback, useSyncExternalStore } from 'octane'
import { detectPlatform, formatForDisplay } from '@tanstack/hotkeys'
import { getServerPlatformSnapshot } from '@tanstack/hotkeys/adapter'
import { useDefaultHotkeysOptions } from './HotkeysProvider'
import { subSlot } from './internal'
import type { DisplayHotkey, FormatDisplayOptions } from '@tanstack/hotkeys'

const subscribe = () => () => {}

/**
 * Returns `formatForDisplay` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins. Without a provider platform, server rendering and hydration use
 * 'linux', then the client re-renders with the detected platform.
 *
 * Call the hook once at the top of the component; the returned function can
 * be called anywhere, such as in a loop or a condition. Server-rendered apps
 * should set the provider's `defaultOptions.platform` from the request with
 * `detectPlatform(userAgent)`, so the server HTML matches the user's platform.
 *
 * @example
 * ```tsx
 * function SaveButton() @{
 *   const format = useFormatForDisplay()
 *
 *   <button>
 *     Save <kbd>{format('Mod+S')}</kbd>
 *   </button>
 * }
 * ```
 */
export function useFormatForDisplay(): typeof formatForDisplay
export function useFormatForDisplay(slot?: symbol): typeof formatForDisplay {
  const provided = useDefaultHotkeysOptions().platform
  // The provider's platform also goes in the server snapshot, so a server
  // render with a platform does not warn.
  const platform = useSyncExternalStore(
    subscribe,
    () => provided ?? detectPlatform(),
    () => provided ?? getServerPlatformSnapshot(),
    subSlot(slot, 'platform'),
  )
  return useCallback(
    (hotkey: DisplayHotkey, options?: FormatDisplayOptions) =>
      formatForDisplay(hotkey, {
        ...options,
        platform: options?.platform ?? platform,
      }),
    [platform],
    subSlot(slot, 'format'),
  ) as typeof formatForDisplay
}
