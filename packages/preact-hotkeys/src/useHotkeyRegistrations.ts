import { useMemo } from 'preact/hooks'
import { useSelector } from '@tanstack/preact-store'
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
 * Return type for useHotkeyRegistrations.
 */
export interface HotkeyRegistrationsResult {
  /** All registered hotkeys (public view, no callbacks) */
  hotkeys: Array<HotkeyRegistrationView>
  /** All registered sequences */
  sequences: Array<SequenceRegistrationView>
}

/**
 * Preact hook that reactively reads all hotkey and sequence registrations
 * from the singleton managers.
 *
 * This is a standalone hook that does NOT require the HotkeysProvider.
 * It subscribes to both HotkeyManager and SequenceManager stores and
 * re-renders when registrations change.
 *
 * @returns Object with `hotkeys` and `sequences` arrays
 */
export function useHotkeyRegistrations(): HotkeyRegistrationsResult {
  const hotkeyManager = getHotkeyManager()
  const sequenceManager = getSequenceManager()

  // Select stable store snapshots before deriving arrays; fresh selector arrays
  // make Preact's external-store subscription render continuously.
  const hotkeyState = useSelector(hotkeyManager.registrations)
  const sequenceState = useSelector(sequenceManager.registrations)
  const hotkeys = useMemo(
    () => Array.from(hotkeyState.values()).map(toHotkeyRegistrationView),
    [hotkeyState],
  )
  const sequences = useMemo(
    () => Array.from(sequenceState.values()),
    [sequenceState],
  )

  return { hotkeys, sequences }
}
