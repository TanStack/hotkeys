import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'
import type { HotkeyRegistrationsResult } from './types'

/** Reads public snapshots of every registration, chords and sequences. */
export function useHotkeyRegistrations(): HotkeyRegistrationsResult
export function useHotkeyRegistrations(
  slot?: symbol,
): HotkeyRegistrationsResult {
  const hotkeys = select(
    getHotkeyManager().registrations,
    (state) => Array.from(state.values()).map(toHotkeyRegistrationView),
    undefined,
    subSlot(slot, 'hotkeys'),
  )
  return { hotkeys }
}
