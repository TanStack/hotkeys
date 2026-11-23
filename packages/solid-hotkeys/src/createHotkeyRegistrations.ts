import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import { createProjection } from 'solid-js'
import { useSelector } from './_useSelector'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

/**
 * Solid primitive that reactively reads every hotkey registration, chords and
 * sequences, from the singleton HotkeyManager. Narrow each view with `kind`.
 *
 * This primitive does NOT require the HotkeysProvider.
 *
 * @returns An accessor for all registrations, without callbacks
 *
 * @example
 * ```tsx
 * const registrations = createHotkeyRegistrations()
 * const formatForDisplay = createFormatForDisplay()
 * <For each={registrations()}>
 *   {(reg) => <li>{reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}</li>}
 * </For>
 * ```
 */
export function createHotkeyRegistrations(): () => Array<HotkeyRegistrationView> {
  const views = useSelector(
    getHotkeyManager().registrations,
    getHotkeyRegistrationViews,
  )
  // Views are rebuilt on every change. Reconciling them by id keeps each
  // registration's identity, so `<For>` rows update in place.
  const registrations = createProjection<Array<HotkeyRegistrationView>>(
    () => views(),
    [],
    { key: 'id' },
  )
  return () => registrations
}
