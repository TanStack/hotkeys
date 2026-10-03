import { getKeyStateTracker } from '@tanstack/hotkeys'
import { select } from './utils'
import type { EmberHotkeyState } from './types'

/** Pass the containing component as owner to release the subscription on destruction. */
export function useHeldKeys(owner: object): EmberHotkeyState<Array<string>> {
  return select(owner, getKeyStateTracker().store, (state) => state.heldKeys)
}
