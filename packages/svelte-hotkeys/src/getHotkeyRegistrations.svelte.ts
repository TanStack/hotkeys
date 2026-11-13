import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import { createStoreSubscriber } from './internal.svelte.js'
import type {
  HotkeyRegistrationView,
  HotkeyRegistrationsResult,
} from '@tanstack/hotkeys'

export interface SvelteHotkeyRegistrations extends HotkeyRegistrationsResult {}

class HotkeyRegistrationsState implements SvelteHotkeyRegistrations {
  #manager = getHotkeyManager()
  #subscribe = createStoreSubscriber(this.#manager.registrations)

  get hotkeys(): Array<HotkeyRegistrationView> {
    this.#subscribe()
    return getHotkeyRegistrationViews(this.#manager.registrations.state)
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
 *   const formatForDisplay = getFormatForDisplay()
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
