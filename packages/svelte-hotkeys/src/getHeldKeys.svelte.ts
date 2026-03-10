import { getKeyStateTracker } from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte'

export interface SvelteHeldKeys {
  readonly keys: Array<string>
}

class HeldKeysState implements SvelteHeldKeys {
  #tracker = getKeyStateTracker()
  #subscribe = createStoreSubscriber(this.#tracker.store)

  get keys(): Array<string> {
    this.#subscribe()
    return this.#tracker.store.state.heldKeys
  }
}

/**
 * Svelte function that returns reactive access to currently held keyboard keys.
 *
 * This function uses the global KeyStateTracker and updates whenever keys are pressed
 * or released.
 *
 * @returns Object with a reactive `keys` property
 *
 * @example
 * ```svelte
 * <script>
 *   import { getHeldKeys } from '@tanstack/svelte-hotkeys'
 *
 *   const heldKeys = getHeldKeys()
 * </script>
 * <div>
 *   Currently pressed: {heldKeys.keys.join(' + ') || 'None'}
 * </div>
 * ```
 */
export function getHeldKeys(): SvelteHeldKeys {
  return new HeldKeysState()
}
