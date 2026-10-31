import {
  getHotkeyManager,
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
 * The hint shows only while the hotkey can fire: some registration of it is
 * enabled and in an active scope. A sequence reveals its hint from its first
 * step, and an app hotkey matches its registrations by id and uses its
 * effective hotkey (false while unbound). No hotkey (`undefined`, `null`, or
 * `''`) returns false. A hotkey on an element counts only while focus is inside it.
 */
export function useHotkeyHint(
  owner: object,
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  options: MaybeGetter<HeldModifierOptions> = {},
): EmberHotkeyState<boolean> {
  const appHotkeys = trackPublishedAppHotkeys(owner)
  const manager = getHotkeyManager()
  // Tracks registration, enabled, and scope changes.
  const registrations = select(owner, manager.registrations, (state) => state)
  return select(owner, getKeyStateTracker().store, (state) => {
    const value = read(hotkey)
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, appHotkeys()).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(resolved, state.heldKeys, read(options)) &&
      registrations.value.size > 0 &&
      manager.hasActiveRegistration(value)
    )
  })
}
