import { getKeyStateTracker } from '@tanstack/hotkeys'
import { read, select } from './utils'
import type { EmberHotkeyState } from './types'
import type { IndividualKey } from '@tanstack/hotkeys'
import type { MaybeGetter } from './utils'

/** Getter arguments can read changing tracked component properties. */
export function useKeyHold(
  owner: object,
  key: MaybeGetter<IndividualKey>,
): EmberHotkeyState<boolean> {
  return select(owner, getKeyStateTracker().store, (state) =>
    state.heldKeys.includes(read(key)),
  )
}
