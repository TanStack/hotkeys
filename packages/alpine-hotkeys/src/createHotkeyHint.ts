import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { read } from './scope'
import type { HotkeysScope } from './scope'
import type { MaybeGetter } from './types'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

export function createHotkeyHint(
  scope: HotkeysScope,
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey>,
  options: MaybeGetter<HeldModifierOptions> = {},
) {
  const manager = getHotkeyManager()
  // Tracks registration, enabled, and scope changes.
  const registrations = scope.select(manager.registrations, (state) => state)
  return scope.select(getKeyStateTracker().store, (state) => {
    const value = read(hotkey)
    // App hotkeys use their effective hotkey; a sequence uses its first step.
    const resolved = isAppHotkey(value)
      ? resolveAppHotkey(value, scope.appHotkeys()).hotkey
      : value
    return (
      resolved !== null &&
      matchesHeldModifiers(resolved, state.heldKeys, read(options)) &&
      registrations.value.size > 0 &&
      manager.hasActiveRegistration(value)
    )
  })
}
