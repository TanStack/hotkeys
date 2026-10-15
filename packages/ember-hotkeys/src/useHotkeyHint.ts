import {
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { read, select, trackPublishedAppHotkeys } from './utils'
import type { EmberHotkeyState } from './types'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { MaybeGetter } from './utils'

/**
 * Recomputes for held modifiers and tracked changes to the hotkey or options.
 * A sequence reveals its hint from its first step, and an app hotkey uses its
 * effective hotkey (false while unbound).
 */
export function useHotkeyHint(
  owner: object,
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey>,
  options: MaybeGetter<HeldModifierOptions> = {},
): EmberHotkeyState<boolean> {
  const appHotkeys = trackPublishedAppHotkeys(owner)
  return select(owner, getKeyStateTracker().store, (state) => {
    const value = read(hotkey)
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, appHotkeys()).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(resolved, state.heldKeys, read(options))
    )
  })
}
