import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'

/** Reads held physical key codes from the shared key tracker. */
export function useHeldKeyCodes(): Record<string, string>
export function useHeldKeyCodes(slot?: symbol): Record<string, string> {
  return select(
    getKeyStateTracker().store,
    (state) => state.heldCodes,
    undefined,
    subSlot(slot, 'held-codes'),
  )
}
