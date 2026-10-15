import { getHotkeyManager, toHotkeyRegistrationView } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { HotkeyRegistrationsResult } from './types'

export function createHotkeyRegistrations(
  scope: HotkeysScope,
): HotkeyRegistrationsResult {
  const state = scope.select(getHotkeyManager().registrations, (value) =>
    Array.from(value.values()).map(toHotkeyRegistrationView),
  )
  return {
    get hotkeys() {
      return state.value
    },
  }
}
