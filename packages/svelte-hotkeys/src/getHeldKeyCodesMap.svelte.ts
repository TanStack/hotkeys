import { getKeyStateTracker } from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte'

export interface SvelteHeldKeyCodesMap {
  readonly codes: Record<string, string>
}

class HeldKeyCodesMapState implements SvelteHeldKeyCodesMap {
  #tracker = getKeyStateTracker()
  #subscribe = createStoreSubscriber(this.#tracker.store)

  get codes(): Record<string, string> {
    this.#subscribe()
    return this.#tracker.store.state.heldCodes
  }
}

/**
 * Svelte function that returns reactive access to the map of currently held key names
 * to their physical `event.code` values.
 *
 * This is useful for debugging which physical key was pressed (e.g. distinguishing
 * left vs right Shift via "ShiftLeft" / "ShiftRight").
 *
 * @returns Object with a reactive `codes` property
 *
 * ```svelte
 * <script>
 *   import { getHeldKeyCodesMap } from '@tanstack/svelte-hotkeys'
 *   const heldKeyCodesMap = getHeldKeyCodesMap()
 * </script>
 *
 * <div>
 *   {#each Object.entries(heldKeyCodesMap.codes) as [key, code]}
 *     <kbd>
 *       {key} <small>{code}</small>
 *     </kbd>
 *   {/each}
 *  </div>
 * ```
 */
export function getHeldKeyCodesMap(): SvelteHeldKeyCodesMap {
  return new HeldKeyCodesMapState()
}
