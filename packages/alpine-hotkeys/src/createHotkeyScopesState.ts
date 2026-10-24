import { getHotkeyManager } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createHotkeyScopesState(scope: HotkeysScope) {
  return scope.select(getHotkeyManager().scopes, (state) => state)
}
