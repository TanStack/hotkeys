import { useSelector } from '@tanstack/vue-store'
import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import type {
  HotkeyRegistrationView,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'
import type { Ref } from 'vue'

/**
 * Return type for useHotkeyRegistrations.
 */
export interface HotkeyRegistrationsResult {
  /** All registered hotkeys (public view, no callbacks) */
  hotkeys: Ref<Array<HotkeyRegistrationView>>
  /** All registered sequences */
  sequences: Ref<Array<SequenceRegistrationView>>
}

/**
 * Vue composable that reactively reads all hotkey and sequence registrations
 * from the singleton managers.
 *
 * This is a standalone composable that does NOT require the HotkeysProvider.
 * It subscribes to both HotkeyManager and SequenceManager stores and
 * triggers reactivity when registrations change.
 *
 * @returns Object with `hotkeys` and `sequences` refs
 */
export function useHotkeyRegistrations(): HotkeyRegistrationsResult {
  const hotkeyManager = getHotkeyManager()
  const sequenceManager = getSequenceManager()

  const hotkeys = useSelector(hotkeyManager.registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )

  const sequences = useSelector(sequenceManager.registrations, (state) =>
    Array.from(state.values()),
  )

  return { hotkeys, sequences }
}
