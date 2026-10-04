import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import { select, subSlot } from './internal'
import type { HotkeyRegistrationsResult } from './types'

/** Reads public registration snapshots from both managers. */
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
  const sequences = select(
    getSequenceManager().registrations,
    (state) => Array.from(state.values()),
    undefined,
    subSlot(slot, 'sequences'),
  )
  return { hotkeys, sequences }
}
