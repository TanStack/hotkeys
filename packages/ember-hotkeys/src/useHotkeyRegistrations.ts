import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import { select } from './utils'
import type { HotkeyRegistrationsResult } from './types'

/** Reads public snapshots of every registration, chords and sequences. */
export function useHotkeyRegistrations(
  owner: object,
): HotkeyRegistrationsResult {
  const hotkeys = select(owner, getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
  return {
    get hotkeys() {
      return hotkeys.value
    },
  }
}
