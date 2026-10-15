import { useSelector } from '@tanstack/react-store'
import {
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
 * Only visibility changes from held-key updates cause a rerender.
 * Uses the nonempty-subset/AltGr rules of `matchesHeldModifiers`; `exact` requires
 * every modifier. A sequence reveals its hint from its first step, and an app
 * hotkey uses its effective hotkey (false while unbound). Combine with the
 * action's enabled state before showing a badge. This helper does not register
 * a shortcut or check whether its target is focused.
 */
export function useHotkeyHint(
  hotkey: RegisterableHotkey | AppHotkey,
  options: HeldModifierOptions = {},
): boolean {
  const store = useAppHotkeysStoreState()
  const resolved = isAppHotkey(hotkey)
    ? resolveAppHotkey(hotkey, store).hotkey
    : hotkey
  return useSelector(
    getKeyStateTracker().store,
    (state) =>
      resolved !== null &&
      matchesHeldModifiers(resolved, state.heldKeys, options),
  )
}
