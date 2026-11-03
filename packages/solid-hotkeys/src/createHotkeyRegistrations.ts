import { createStore } from 'solid-js'
import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
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
 * <For each={registrations()}>
 *   {(reg) => <li>{reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}</li>}
 * </For>
 * ```
 */
export function createHotkeyRegistrations(): () => Array<HotkeyRegistrationView> {
  const views = useSelector(getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
  // Views are rebuilt on every change; reconciling them by id keeps each
  // registration's identity, so `<For>` rows update in place.
  const [registrations] = createStore<Array<HotkeyRegistrationView>>(
    () => views(),
    [],
    { key: 'id' },
  )
  return () => registrations
}
