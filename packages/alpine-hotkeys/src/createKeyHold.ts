import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import type { IndividualKey, MaybeGetter } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createKeyHold(
  scope: HotkeysScope,
  key: MaybeGetter<IndividualKey>,
) {
  const tracker = getKeyStateTracker()
  return scope.select(tracker.store, () =>
    tracker.isKeyHeld(resolveMaybeGetter(key)),
  )
}
