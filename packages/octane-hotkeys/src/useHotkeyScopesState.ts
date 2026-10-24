import { getHotkeyManager } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'
import type { HotkeyScopesState } from '@tanstack/hotkeys'

/**
 * Reads the hotkey manager's scope state: the active scopes, the exclusive
 * scope that owns the keyboard, and the scopes it allows or suspends.
 */
export function useHotkeyScopesState(): HotkeyScopesState
export function useHotkeyScopesState(slot?: symbol): HotkeyScopesState {
  return select(
    getHotkeyManager().scopes,
    (state) => state,
    undefined,
    subSlot(slot, 'hotkey-scopes-state'),
  )
}
