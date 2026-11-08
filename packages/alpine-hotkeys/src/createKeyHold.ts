import { getKeyStateTracker } from '@tanstack/hotkeys'
import { read } from './scope'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'

export function createKeyHold(
  scope: HotkeysScope,
  key: MaybeGetter<IndividualKey>,
) {
  return scope.select(getKeyStateTracker().store, (state) =>
    state.heldKeys.includes(read(key)),
  )
}
