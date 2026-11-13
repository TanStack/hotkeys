import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
} from '@tanstack/hotkeys'
import {
  isHotkeyHintVisible,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import type {
  AppHotkey,
  HeldModifierOptions,
  MaybeGetter,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { HotkeysScope } from './scope'

export function createHotkeyHint(
  scope: HotkeysScope,
  hotkey: MaybeGetter<RegisterableHotkey | AppHotkey | null | undefined>,
  options: MaybeGetter<HeldModifierOptions> = {},
) {
  const manager = getHotkeyManager()
  // Tracks registration, enabled, and scope changes.
  const registrations = scope.select(manager.registrations, (state) => state)
  return scope.select(getKeyStateTracker().store, (state) => {
    const value = resolveMaybeGetter(hotkey)
    // Read the reactive sources first, so Alpine tracks them. Only app hotkeys
    // read the published store.
    void registrations.value
    const appHotkeysStore = isAppHotkey(value) ? scope.appHotkeys() : null
    // App hotkeys use their effective hotkey; a sequence uses its first step.
    return isHotkeyHintVisible(
      value,
      state.heldKeys,
      resolveMaybeGetter(options),
      appHotkeysStore,
    )
  })
}
