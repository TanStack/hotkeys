import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import { select } from './utils'
import type { HotkeyRegistrationsResult } from '@tanstack/hotkeys'

/** Reads public snapshots of every registration, chords and sequences. */
export function useHotkeyRegistrations(
  owner: object,
): HotkeyRegistrationsResult {
  const hotkeys = select(owner, getHotkeyManager().registrations, (state) =>
    getHotkeyRegistrationViews(state),
  )
  return {
    get hotkeys() {
      return hotkeys.value
    },
  }
}
