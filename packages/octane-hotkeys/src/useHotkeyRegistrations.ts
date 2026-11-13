import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import { select, subSlot } from './internal'
import type { HotkeyRegistrationsResult } from './types'

/** Reads public snapshots of every registration, chords and sequences. */
export function useHotkeyRegistrations(): HotkeyRegistrationsResult
export function useHotkeyRegistrations(
  slot?: symbol,
): HotkeyRegistrationsResult {
  const hotkeys = select(
    getHotkeyManager().registrations,
    getHotkeyRegistrationViews,
    subSlot(slot, 'hotkeys'),
  )
  return { hotkeys }
}
