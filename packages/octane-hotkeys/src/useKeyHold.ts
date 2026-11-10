import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select, subSlot } from './internal'
import type { IndividualKey } from '@tanstack/hotkeys'

/** Reports whether a logical key is held. */
export function useKeyHold(key: IndividualKey): boolean
export function useKeyHold(key: IndividualKey, slot?: symbol): boolean {
  const tracker = getKeyStateTracker()
  return select(
    tracker.store,
    () => tracker.isKeyHeld(key),
    subSlot(slot, 'key-hold'),
  )
}
