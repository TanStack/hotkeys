import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'

/** Reads held logical keys from the shared key tracker. */
export function useHeldKeys(): Array<string>
export function useHeldKeys(slot?: symbol): Array<string> {
  return select(
    getKeyStateTracker().store,
    (state) => state.heldKeys,
    undefined,
    subSlot(slot, 'held-keys'),
  )
}
