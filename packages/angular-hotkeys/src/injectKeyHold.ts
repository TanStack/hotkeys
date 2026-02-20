import { computed } from '@angular/core'
import { injectStore } from '@tanstack/angular-store'
import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { HeldKey } from '@tanstack/hotkeys'
import type { Signal } from '@angular/core'

/**
 * Angular inject-based API that returns a signal that is true when the given key is held.
 *
 * Subscribes to the global KeyStateTracker and uses a computed to determine
 * if the specified key is held.
 *
 * @param key - The key to check (e.g. 'Shift', 'Control', 'Space') - can be a getter function
 * @returns Signal that returns true if the key is currently held down
 *
 * @example
 * ```ts
 * @Component({
 *   template: `{{ isShiftHeld() ? 'Shift is pressed!' : 'Press Shift' }}`,
 * })
 * export class ShiftIndicatorComponent {
 *   isShiftHeld = injectKeyHold('Shift')
 * }
 * ```
 *
 * @example
 * ```ts
 * @Component({
 *   template: `
 *     <span [style.opacity]="ctrl() ? 1 : 0.3">Ctrl</span>
 *     <span [style.opacity]="shift() ? 1 : 0.3">Shift</span>
 *   `,
 * })
 * export class ModifierIndicatorsComponent {
 *   ctrl = injectKeyHold('Control')
 *   shift = injectKeyHold('Shift')
 * }
 * ```
 */
export function injectKeyHold(key: HeldKey | (() => HeldKey)): Signal<boolean> {
  const tracker = getKeyStateTracker()
  const heldKeysSelector = injectStore(tracker.store, (state) => state.heldKeys)

  return computed(() => {
    const resolvedKey = typeof key === 'function' ? key() : key

    const normalizedKey = resolvedKey.toLowerCase()
    return heldKeysSelector().some(
      (heldKey) => heldKey.toLowerCase() === normalizedKey,
    )
  })
}
