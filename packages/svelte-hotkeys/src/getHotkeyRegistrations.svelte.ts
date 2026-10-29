import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte.js'
import type { HotkeyRegistrationView } from '@tanstack/hotkeys'

export interface SvelteHotkeyRegistrations {
  /** Every registration, chords and sequences. Narrow each view with `kind`. */
  readonly hotkeys: Array<HotkeyRegistrationView>
}

class HotkeyRegistrationsState implements SvelteHotkeyRegistrations {
  #manager = getHotkeyManager()
  #subscribe = createStoreSubscriber(this.#manager.registrations)

  get hotkeys(): Array<HotkeyRegistrationView> {
    this.#subscribe()
    return Array.from(this.#manager.registrations.state.values()).map(
      toHotkeyRegistrationView,
    )
  }
}

/**
 * Svelte function that returns reactive access to every hotkey registration,
 * chords and sequences, from the singleton HotkeyManager.
 *
 * This function does NOT require the HotkeysProvider.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const registrations = getHotkeyRegistrations()
 * </script>
 *
 * {#each registrations.hotkeys as reg (reg.id)}
 *   <li>{reg.options.meta?.name}: {formatForDisplay(reg.hotkey)}</li>
 * {/each}
 * ```
 */
export function getHotkeyRegistrations(): SvelteHotkeyRegistrations {
  return new HotkeyRegistrationsState()
}
