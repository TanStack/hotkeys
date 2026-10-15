import { getKeyStateTracker } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createHeldKeys(scope: HotkeysScope) {
  return scope.select(getKeyStateTracker().store, (state) => state.heldKeys)
}
