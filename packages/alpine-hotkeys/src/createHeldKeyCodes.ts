import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createHeldKeyCodes(scope: HotkeysScope) {
  return scope.select(getKeyStateTracker().store, (state) => state.heldCodes)
}
