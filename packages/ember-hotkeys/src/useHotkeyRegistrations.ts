import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import { select } from './utils'
import type { HotkeyRegistrationsResult } from './types'

/** Reads public snapshots of hotkey and sequence registrations. */
export function useHotkeyRegistrations(
  owner: object,
): HotkeyRegistrationsResult {
  const hotkeys = select(owner, getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
  const sequences = select(owner, getSequenceManager().registrations, (state) =>
    Array.from(state.values()),
  )
  return {
    get hotkeys() {
      return hotkeys.value
    },
    get sequences() {
      return sequences.value
    },
  }
}
