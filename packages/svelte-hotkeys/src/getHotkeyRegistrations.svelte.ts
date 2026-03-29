import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import { createStoreSubscriber } from './internal.svelte'
import type {
  HotkeyRegistrationView,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

export interface SvelteHotkeyRegistrations {
  readonly hotkeys: Array<HotkeyRegistrationView>
  readonly sequences: Array<SequenceRegistrationView>
}

class HotkeyRegistrationsState implements SvelteHotkeyRegistrations {
  #hotkeyManager = getHotkeyManager()
  #sequenceManager = getSequenceManager()
  #subscribeHotkeys = createStoreSubscriber(this.#hotkeyManager.registrations)
  #subscribeSequences = createStoreSubscriber(
    this.#sequenceManager.registrations,
  )

  get hotkeys(): Array<HotkeyRegistrationView> {
    this.#subscribeHotkeys()
    return Array.from(this.#hotkeyManager.registrations.state.values()).map(
      toHotkeyRegistrationView,
    )
  }

  get sequences(): Array<SequenceRegistrationView> {
    this.#subscribeSequences()
    return Array.from(this.#sequenceManager.registrations.state.values())
  }
}

/**
 * Svelte function that returns reactive access to all hotkey and sequence
 * registrations from the singleton managers.
 *
 * This is a standalone function that does NOT require the HotkeysProvider.
 *
 * @returns Object with reactive `hotkeys` and `sequences` properties
 *
 * @example
 * ```svelte
 * <script>
 *   import { getHotkeyRegistrations } from '@tanstack/svelte-hotkeys'
 *
 *   const registrations = getHotkeyRegistrations()
 * </script>
 * {#each registrations.hotkeys as reg}
 *   <div>{reg.options.meta?.name} — {reg.triggerCount} triggers</div>
 * {/each}
 * ```
 */
export function getHotkeyRegistrations(): SvelteHotkeyRegistrations {
  return new HotkeyRegistrationsState()
}
