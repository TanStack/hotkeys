import { getKeyStateTracker } from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte'
import type { HeldKey } from '@tanstack/hotkeys'

export interface SvelteHeldKeyState {
  readonly held: boolean
}

class HeldKeyState implements SvelteHeldKeyState {
  #tracker = getKeyStateTracker()
  #normalizedKey: string
  #subscribe = createStoreSubscriber(this.#tracker.store)

  constructor(key: HeldKey) {
    this.#normalizedKey = key.toLowerCase()
  }

  get held(): boolean {
    this.#subscribe()
    return this.#tracker.store.state.heldKeys.some(
      (heldKey) => heldKey.toLowerCase() === this.#normalizedKey,
    )
  }
}

/**
 * Svelte function that returns reactive access to whether a specific key is currently being held.
 *
 * This function uses the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @param key - The key to check (e.g., 'Shift', 'Control', 'A')
 * @returns Object with a reactive `held` property
 *
 * @example
 * ```svelte
 * <script>
 *   import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'
 *
 *   const isShiftHeld = getIsKeyHeld('Shift')
 * </script>
 *
 * <div>
 *   {isShiftHeld.held ? 'Shift is pressed!' : 'Press Shift'}
 * </div>
 * ```
 *
 * @example
 * ```svelte
 * <script>
 *   import { getIsKeyHeld } from '@tanstack/svelte-hotkeys'
 *
 *   const isCtrlHeld = getIsKeyHeld('Control')
 *   const isShiftHeld = getIsKeyHeld('Shift')
 *   const isAltHeld = getIsKeyHeld('Alt')
 * </script>
 *
 * <div>
 *   <span style:opacity={isCtrlHeld.held ? 1 : 0.3}>Ctrl</span>
 *   <span style:opacity={isShiftHeld.held ? 1 : 0.3}>Shift</span>
 *   <span style:opacity={isAltHeld.held ? 1 : 0.3}>Alt</span>
 * </div>
 * ```
 */

export function getIsKeyHeld(key: HeldKey): SvelteHeldKeyState {
  return new HeldKeyState(key)
}
