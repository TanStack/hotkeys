import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select } from './utils'
import type { EmberHotkeyState } from './types'

/** Reads physical key codes through Ember autotracking. */
export function useHeldKeyCodes(
  owner: object,
): EmberHotkeyState<Record<string, string>> {
  return select(owner, getKeyStateTracker().store, (state) => state.heldCodes)
}
