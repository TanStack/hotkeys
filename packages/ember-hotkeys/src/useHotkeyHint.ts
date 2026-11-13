import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
} from '@tanstack/hotkeys'
import {
  isHotkeyHintVisible,
  resolveMaybeGetter,
} from '@tanstack/hotkeys/adapter'
import { select, trackPublishedAppHotkeys } from './utils'
import type {
  AppHotkey,
  HeldModifierOptions,
  MaybeGetter,
  RegisterableHotkey,
} from '@tanstack/hotkeys'
import type { EmberHotkeyState } from './types'

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
  // Tracks registration, enabled, and scope changes, but invalidates only
  // when this hotkey's result changes (firing any hotkey publishes too).
  const active = select(owner, manager.registrations, () =>
    manager.hasActiveRegistration(resolveMaybeGetter(hotkey)),
  )
  return select(owner, getKeyStateTracker().store, (state) => {
    // Read it first, so a render that returns false still tracks it. A
    // hotkey registered while its modifier is held then shows.
    void active.value
    const value = resolveMaybeGetter(hotkey)
    // Only app hotkeys read, and so track, the published store.
    return isHotkeyHintVisible(
      value,
      state.heldKeys,
      resolveMaybeGetter(options),
      isAppHotkey(value) ? appHotkeys() : null,
    )
  })
}
