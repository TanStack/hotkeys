import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import { select } from './utils'
import type { IndividualKey, MaybeGetter } from '@tanstack/hotkeys'
import type { EmberHotkeyState } from './types'

/** Getter arguments can read changing tracked component properties. */
export function useKeyHold(
  owner: object,
  key: MaybeGetter<IndividualKey>,
): EmberHotkeyState<boolean> {
  const tracker = getKeyStateTracker()
  return select(owner, tracker.store, () =>
    tracker.isKeyHeld(resolveMaybeGetter(key)),
  )
}
