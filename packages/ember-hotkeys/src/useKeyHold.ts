import { getKeyStateTracker } from '@tanstack/hotkeys'
import { read, select } from './utils'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { EmberHotkeyState } from './types'
import type { MaybeGetter } from './utils'

/** Getter arguments can read changing tracked component properties. */
export function useKeyHold(
  owner: object,
  key: MaybeGetter<IndividualKey>,
): EmberHotkeyState<boolean> {
  const tracker = getKeyStateTracker()
  return select(owner, tracker.store, () => tracker.isKeyHeld(read(key)))
}
