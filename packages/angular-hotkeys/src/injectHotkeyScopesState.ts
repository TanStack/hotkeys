import { getHotkeyManager } from '@tanstack/hotkeys'
import { injectSelector } from './_injectSelector'
import type { HotkeyScopesState } from '@tanstack/hotkeys'
import type { Signal } from '@angular/core'

/**
 * Angular inject-based API that returns a signal of the hotkey manager's
 * scope state: the active scopes, the exclusive scope that owns the keyboard,
 * and the scopes it allows or suspends. Updates when scopes activate or
 * release.
 *
 * @returns Signal of the current scope state
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     @if (scopes().exclusive; as exclusive) {
 *       <p>Shortcuts belong to {{ exclusive }}</p>
 *     }
 *   `,
 * })
 * export class KeyboardOwnerComponent {
 *   scopes = injectHotkeyScopesState()
 * }
 * ```
 */
export function injectHotkeyScopesState(): Signal<HotkeyScopesState> {
  return injectSelector(getHotkeyManager().scopes, (state) => state)
}
