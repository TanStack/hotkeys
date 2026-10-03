import { getKeyStateTracker, matchesHeldModifiers } from '@tanstack/hotkeys'
import { read } from './scope'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'
import type { HeldModifierOptions, RegisterableHotkey } from '@tanstack/hotkeys'

export function createHotkeyHint(
  scope: HotkeysScope,
  hotkey: MaybeGetter<RegisterableHotkey>,
  options: MaybeGetter<HeldModifierOptions> = {},
) {
  return scope.select(getKeyStateTracker().store, (state) =>
    matchesHeldModifiers(read(hotkey), state.heldKeys, read(options)),
  )
}
