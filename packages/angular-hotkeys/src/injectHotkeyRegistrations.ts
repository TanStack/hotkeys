import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { injectSelector } from './_injectSelector'
import type { Signal } from '@angular/core'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

/**
 * Angular inject-based API that reactively reads every hotkey registration,
 * chords and sequences, from the singleton HotkeyManager. Narrow each view
 * with `kind`.
 *
 * This does NOT require `provideHotkeys`.
 *
 * @returns A signal of all registrations, without callbacks
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     @for (reg of registrations(); track reg.id) {
 *       <li>{{ reg.options.meta?.name }}</li>
 *     }
 *   `,
 * })
 * export class ShortcutPalette {
 *   registrations = injectHotkeyRegistrations()
 * }
 * ```
 */
export function injectHotkeyRegistrations(): Signal<
  Array<HotkeyRegistrationView>
> {
  return injectSelector(getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
}
