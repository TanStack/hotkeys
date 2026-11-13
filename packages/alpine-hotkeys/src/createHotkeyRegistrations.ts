import { getHotkeyManager } from '@tanstack/hotkeys'
import { getHotkeyRegistrationViews } from '@tanstack/hotkeys/adapter'
import type { HotkeyRegistrationsResult } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createHotkeyRegistrations(
  scope: HotkeysScope,
): HotkeyRegistrationsResult {
  const state = scope.select(getHotkeyManager().registrations, (value) =>
    getHotkeyRegistrationViews(value),
  )
  return {
    get hotkeys() {
      return state.value
    },
  }
}
