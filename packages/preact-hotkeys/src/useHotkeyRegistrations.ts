import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import { useSelector } from './_useSelector'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

/**
 * Preact hook that reactively reads every hotkey registration, chords and
 * sequences, from the singleton HotkeyManager. Narrow each view with `kind`.
 *
 * This hook does NOT require the HotkeysProvider. It re-renders when
 * registrations change, including trigger counts and sequence progress.
 *
 * @returns All registrations, without callbacks
 *
 * @example
 * ```tsx
 * function ShortcutPalette() {
 *   const formatForDisplay = useFormatForDisplay()
 *   const registrations = useHotkeyRegistrations()
 *
 *   return (
 *     <ul>
 *       {registrations.map((reg) => (
 *         <li key={reg.id}>
 *           {reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}
 *         </li>
 *       ))}
 *     </ul>
 *   )
 * }
 * ```
 */
export function useHotkeyRegistrations(): Array<HotkeyRegistrationView> {
  return useSelector(getHotkeyManager().registrations, (state) =>
    getHotkeyRegistrationViews(state),
  )
}
