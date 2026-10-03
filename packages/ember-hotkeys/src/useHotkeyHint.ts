import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import { read, select } from './utils'
import type { EmberHotkeyState } from './types'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'
import type { MaybeGetter } from './utils'

/** Recomputes for held modifiers and tracked changes to the binding or options. */
export function useHotkeyHint(
  owner: object,
  hotkey: MaybeGetter<RegisterableHotkey>,
  options: MaybeGetter<HeldModifierOptions> = {},
): EmberHotkeyState<boolean> {
  return select(owner, getKeyStateTracker().store, (state) =>
    matchesHeldModifiers(read(hotkey), state.heldKeys, read(options)),
  )
}
