import { getKeyStateTracker } from '@tanstack/hotkeys'
import { injectStore } from '@tanstack/angular-store'
import type { Signal } from '@angular/core'

/**
 * Angular inject-based API that returns a signal of currently held keyboard keys.
 *
 * Subscribes to the global KeyStateTracker and updates whenever keys are
 * pressed or released.
 *
 * @returns Signal of array of currently held key names
 *
 * @example
 * ```ts
 * @Component({
 *   template: `<div>Currently pressed: {{ heldKeys().join(' + ') || 'None' }}</div>`,
 * })
 * export class KeyDisplayComponent {
 *   heldKeys = injectHeldKeys()
 * }
 * ```
 */
export function injectHeldKeys(): Signal<Array<string>> {
  const tracker = getKeyStateTracker()
  return injectStore(tracker.store, (state) => state.heldKeys)
}
