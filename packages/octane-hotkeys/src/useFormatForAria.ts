import { formatForAria } from '@tanstack/hotkeys'
import { announceLiveHotkeys } from '@tanstack/hotkeys/adapter'
import { useCallback } from 'octane'
import { useFormatter } from './_useFormatter'
import { subSlot } from './internal'
import { useHotkeyRegistrations } from './useHotkeyRegistrations'
import type { HotkeyRegistrationsResult } from './types'

/**
 * Returns `formatForAria` with the platform from `HotkeysProvider`, or the
 * detected platform without one. A `platform` passed to the returned function
 * wins. Use its value for `aria-keyshortcuts`, so screen readers announce the
 * shortcut. It returns `undefined` for a multi-step sequence, no hotkey, or a
 * hotkey that can't fire right now (one that is disabled, in a suspended
 * scope, a suspended character key, or not registered), so Octane omits the
 * attribute. Without a provider platform, server rendering and hydration use
 * 'linux', then the client re-renders with the detected platform.
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
  const format = useFormatter(formatForAria, 'aria-', slot)
  // Re-renders when a registration changes, so the value follows whether the
  // hotkey can fire.
  const { hotkeys } = (
    useHotkeyRegistrations as (slot: symbol) => HotkeyRegistrationsResult
  )(subSlot(slot, 'aria-registrations'))
  return useCallback(
    announceLiveHotkeys(format, () => hotkeys),
    [format, hotkeys],
    subSlot(slot, 'aria-live'),
  )
}
