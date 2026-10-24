import { getHotkeyManager } from '@tanstack/hotkeys'
import { select } from './utils'
import type { HotkeyScopesState } from '@tanstack/hotkeys'
import type { EmberHotkeyState } from './types'

/**
 * Reads the hotkey manager's scope state: the active scopes, the exclusive
 * scope that owns the keyboard, and the scopes it allows or suspends. Pass the
 * containing component as owner to release the subscription on destruction.
 */
export function useHotkeyScopesState(
  owner: object,
): EmberHotkeyState<HotkeyScopesState> {
  return select(owner, getHotkeyManager().scopes, (state) => state)
}
