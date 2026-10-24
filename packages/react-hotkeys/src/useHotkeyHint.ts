import { useSelector } from '@tanstack/react-store'
import {
  getHotkeyManager,
  getKeyStateTracker,
  isAppHotkey,
  matchesHeldModifiers,
  resolveAppHotkey,
} from '@tanstack/hotkeys'
import { useAppHotkeysStoreState } from './_appHotkeysStore'
import type {
  AppHotkey,
  HeldModifierOptions,
  RegisterableHotkey,
} from '@tanstack/hotkeys'

/**
 * Returns a boolean indicating whether held modifiers reveal this shortcut.
 * The hint shows only while the hotkey can fire: some registration of it is
 * enabled and in an active scope. An app hotkey matches its registrations by
 * id and uses its effective hotkey (false while unbound).
 * Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact`
 * requires every modifier. A sequence reveals its hint from its first step.
 * Only visibility changes cause a rerender. This helper does not register a
 * shortcut or check whether its target is focused.
 */
export function useHotkeyHint(
  hotkey: RegisterableHotkey | AppHotkey,
  options: HeldModifierOptions = {},
): boolean {
  const store = useAppHotkeysStoreState()
  const resolved = isAppHotkey(hotkey)
    ? resolveAppHotkey(hotkey, store).hotkey
    : hotkey
  const manager = getHotkeyManager()
  const active = useSelector(
    manager.registrations,
    () => resolved !== null && manager.hasActiveRegistration(hotkey),
  )
  const held = useSelector(
    getKeyStateTracker().store,
    (state) =>
      resolved !== null &&
      matchesHeldModifiers(resolved, state.heldKeys, options),
  )
  return active && held
}
