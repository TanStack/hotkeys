import { getKeyStateTracker } from '@tanstack/hotkeys'
import { read } from './scope'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'

export function createKeyHold(
  scope: HotkeysScope,
  key: MaybeGetter<IndividualKey>,
) {
  const tracker = getKeyStateTracker()
  return scope.select(tracker.store, () => tracker.isKeyHeld(read(key)))
}
