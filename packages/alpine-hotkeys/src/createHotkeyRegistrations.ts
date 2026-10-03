import {
  getHotkeyManager,
  getSequenceManager,
  toHotkeyRegistrationView,
} from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createHotkeyRegistrations(scope: HotkeysScope) {
  const hotkeyState = scope.select(getHotkeyManager().registrations, (state) =>
    Array.from(state.values()).map(toHotkeyRegistrationView),
  )
  const sequenceState = scope.select(
    getSequenceManager().registrations,
    (state) => Array.from(state.values()),
  )
  return {
    get hotkeys() {
      return hotkeyState.value
    },
    get sequences() {
      return sequenceState.value
    },
  }
}
