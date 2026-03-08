import { getKeyStateTracker } from '@tanstack/hotkeys'
import { injectStore } from '@tanstack/angular-store'
import type { Signal } from '@angular/core'

/**
 * Angular inject-based API that returns a signal of a map from held key names to their physical `event.code` values.
 *
 * Useful for debugging which physical key was pressed (e.g. distinguishing
 * left vs right Shift via "ShiftLeft" / "ShiftRight").
 *
 * @returns Signal of record mapping normalized key names to their `event.code` values
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     @for (key of heldKeys(); track key) {
 *       <kbd>{{ key }} <small>{{ heldCodes()[key] }}</small></kbd>
 *     }
 *   `,
 * })
 * export class KeyDebugComponent {
 *   heldKeys = injectHeldKeys()
 *   heldCodes = injectHeldKeyCodes()
 * }
 * ```
 */
export function injectHeldKeyCodes(): Signal<Record<string, string>> {
  const tracker = getKeyStateTracker()
  return injectStore(tracker.store, (state) => state.heldCodes)
}
