import { getKeyStateTracker } from '@tanstack/hotkeys'
import { resolveMaybeGetter } from '@tanstack/hotkeys/adapter'
import type { LockKey, MaybeGetter } from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createKeyLockState(
  scope: HotkeysScope,
  key: MaybeGetter<LockKey>,
) {
  const tracker = getKeyStateTracker()
  return scope.select(
    tracker.store,
    (state) => state.locks[resolveMaybeGetter(key)],
  )
}
