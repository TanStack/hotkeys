import { useSelector } from '@tanstack/solid-store'
import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
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
 * <For each={registrations()}>
 *   {(reg) => <li>{reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}</li>}
 * </For>
 * ```
 */
export function createHotkeyRegistrations(): () => Array<HotkeyRegistrationView> {
  return useSelector(getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
}
