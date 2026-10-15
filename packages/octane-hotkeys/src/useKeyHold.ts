import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'
import type { IndividualKey } from '@tanstack/hotkeys'

/** Reports whether a logical key is held. */
export function useKeyHold(key: IndividualKey): boolean
export function useKeyHold(key: IndividualKey, slot?: symbol): boolean {
  return select(
    getKeyStateTracker().store,
    (state) => state.heldKeys.includes(key),
    undefined,
    subSlot(slot, 'key-hold'),
  )
}
