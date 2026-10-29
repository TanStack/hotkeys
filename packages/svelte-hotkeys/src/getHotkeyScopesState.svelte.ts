import { getHotkeyManager } from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte.js'
import type { HotkeyScopesState } from '@tanstack/hotkeys'

export interface SvelteHotkeyScopesState {
  readonly state: HotkeyScopesState
}

class HotkeyScopesStateReader implements SvelteHotkeyScopesState {
  #store = getHotkeyManager().scopes
  #subscribe = createStoreSubscriber(this.#store)

  get state(): HotkeyScopesState {
    this.#subscribe()
    return this.#store.state
  }
}

/**
 * Svelte function that returns reactive access to the hotkey manager's scope
 * state: the active scopes, the exclusive scope that owns the keyboard, and
 * the scopes it allows or suspends. Updates when scopes activate or release.
 *
 * @returns Object with a reactive `state` property
 *
 * @example
 * ```svelte
 * <script>
 *   import { getHotkeyScopesState } from '@tanstack/svelte-hotkeys'
 *
 *   const scopes = getHotkeyScopesState()
 * </script>
 * {#if scopes.state.exclusive}
 *   <p>Shortcuts belong to {scopes.state.exclusive}</p>
 * {/if}
 * ```
 */
export function getHotkeyScopesState(): SvelteHotkeyScopesState {
  return new HotkeyScopesStateReader()
}
