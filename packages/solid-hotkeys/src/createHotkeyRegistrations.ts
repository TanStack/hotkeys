import { useSelector } from '@tanstack/solid-store'
import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import type {
  HotkeyRegistrationView,
  SequenceRegistrationView,
} from '@tanstack/hotkeys'

/**
 * Return type for createHotkeyRegistrations.
 */
export interface HotkeyRegistrationsResult {
  /** Accessor for all registered hotkeys (public view, no callbacks) */
  hotkeys: () => Array<HotkeyRegistrationView>
  /** Accessor for all registered sequences */
  sequences: () => Array<SequenceRegistrationView>
}

/**
 * Solid primitive that reactively reads all hotkey and sequence registrations
 * from the singleton managers.
 *
 * This is a standalone primitive that does NOT require the HotkeysProvider.
 * It subscribes to both HotkeyManager and SequenceManager stores and
 * triggers reactivity when registrations change.
 *
 * @returns Object with `hotkeys` and `sequences` signal accessors
 */
export function createHotkeyRegistrations(): HotkeyRegistrationsResult {
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
